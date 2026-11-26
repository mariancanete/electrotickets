import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const isProduction = process.env.NODE_ENV === "production";

/**
 * En producción la cookie lleva el prefijo `__Host-`: el navegador solo la acepta si viene
 * por HTTPS, con `Path=/` y sin `Domain`, así que ningún subdominio ni conexión sin cifrar la
 * puede pisar. En desarrollo local (http) va sin prefijo, porque `__Host-` exige `Secure`.
 *
 * El nombre cambió respecto de `et_admin_session`: la sesión abierta con el nombre viejo deja
 * de valer y hay que volver a entrar una vez.
 */
const COOKIE_NAME = isProduction ? "__Host-et_admin_session" : "et_admin_session";
const SESSION_DAYS = 7;

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProduction,
  path: "/"
};

/**
 * Secreto con el que se firma la sesión. Sale **solo** de `ADMIN_SESSION_SECRET`.
 *
 * Antes caía a la contraseña del panel (y, sin ninguna de las dos, a "dev-secret"). Firmar con
 * la contraseña permitía, a quien consiguiera una cookie, probar contraseñas sin conexión
 * hasta dar con la que reproduce la firma. Ahora, si la variable falta en producción, nadie
 * puede entrar: se cierra, no se abre. En desarrollo local sigue habiendo un valor de prueba.
 */
function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  return isProduction ? null : "dev-secret";
}

export function isSessionConfigured() {
  return getSecret() !== null;
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createSessionToken() {
  const secret = getSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET no está configurado");

  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token?: string) {
  const secret = getSecret();
  if (!token || !secret) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;
  if (Number(expiresAt) < Date.now()) return false;

  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(sign(expiresAt, secret));

  if (receivedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionToken(), {
    ...cookieOptions,
    maxAge: SESSION_DAYS * 24 * 60 * 60
  });
}

/**
 * Se borra reescribiéndola vencida con los mismos atributos: una cookie `__Host-` solo se
 * puede pisar con `Secure` y `Path=/`, y `cookies().delete()` no los manda.
 */
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
}

/**
 * Compara contra `ELECTROTICKETS_ADMIN_PASSWORD` en tiempo constante. Se comparan los hashes
 * y no los textos: así la comparación tampoco revela el largo de la contraseña.
 */
export function verifyAdminPassword(password: string) {
  const expected = process.env.ELECTROTICKETS_ADMIN_PASSWORD;
  if (!expected) return false;

  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(password), digest(expected));
}
