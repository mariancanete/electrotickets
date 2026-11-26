import { NextResponse } from "next/server";
import { isSessionConfigured, setAdminSessionCookie, verifyAdminPassword } from "@/lib/admin-auth";
import {
  FAILURE_DELAY_MS,
  clearFailures,
  clientIp,
  registerFailure,
  retryAfterSeconds
} from "@/lib/login-throttle";

export const runtime = "nodejs";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Login del panel. Los errores devuelven un `code` y el formulario elige el texto: acá no se
 * arma copy para el usuario.
 *
 *   `throttled`      demasiados intentos desde esta IP (429, con `Retry-After`).
 *   `invalid`        contraseña incorrecta (401).
 *   `not_configured` falta `ADMIN_SESSION_SECRET` en el servidor (503).
 */
export async function POST(request: Request) {
  const ip = clientIp(request);

  const retryAfter = retryAfterSeconds(ip);
  if (retryAfter > 0) {
    return NextResponse.json(
      { error: "throttled", retryAfter },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  if (!isSessionConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let password: string | undefined;
  try {
    ({ password } = (await request.json()) as { password?: string });
  } catch {
    password = undefined;
  }

  if (!password || !verifyAdminPassword(password)) {
    registerFailure(ip);
    await wait(FAILURE_DELAY_MS);
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  clearFailures(ip);
  await setAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
