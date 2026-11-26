/**
 * Freno de intentos del login del panel, en código.
 *
 * **Es la segunda capa, no la principal.** En Vercel cada instancia de la función tiene su
 * propia memoria y las instancias se crean y se descartan solas, así que este contador no es
 * global: alguien que reparte intentos entre instancias lo esquiva en parte. La capa principal
 * es la regla de Rate Limit del Firewall de Vercel sobre `/api/admin/login`, que sí cuenta por
 * IP para todo el proyecto. Esto sirve igual mientras esa regla no exista, en desarrollo
 * local y como red si se borra.
 *
 * Además, cada intento fallido tarda un poco más en responder (`FAILURE_DELAY_MS`): no se nota
 * al equivocarse una vez y multiplica el tiempo de probar contraseñas en serie.
 */

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
export const FAILURE_DELAY_MS = 800;

/** Tope de IPs recordadas, para que el mapa no crezca sin límite. */
const MAX_TRACKED = 5000;

type Entry = { failures: number; resetAt: number };
const attempts = new Map<string, Entry>();

/** IP del cliente. En Vercel `x-forwarded-for` lo arma la plataforma y su primer valor es el real. */
export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "desconocida";
}

function current(ip: string, now: number) {
  const entry = attempts.get(ip);
  if (entry && entry.resetAt <= now) {
    attempts.delete(ip);
    return undefined;
  }
  return entry;
}

/** Segundos que faltan para poder volver a intentar, o 0 si puede intentar ya. */
export function retryAfterSeconds(ip: string) {
  const now = Date.now();
  const entry = current(ip, now);
  if (!entry || entry.failures < MAX_FAILURES) return 0;
  return Math.ceil((entry.resetAt - now) / 1000);
}

export function registerFailure(ip: string) {
  const now = Date.now();
  const entry = current(ip, now);

  if (entry) {
    entry.failures += 1;
    return;
  }

  if (attempts.size >= MAX_TRACKED) {
    for (const [key, value] of attempts) {
      if (value.resetAt <= now) attempts.delete(key);
    }
    if (attempts.size >= MAX_TRACKED) {
      const oldest = attempts.keys().next().value;
      if (oldest !== undefined) attempts.delete(oldest);
    }
  }

  attempts.set(ip, { failures: 1, resetAt: now + WINDOW_MS });
}

export function clearFailures(ip: string) {
  attempts.delete(ip);
}
