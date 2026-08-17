/**
 * "Mis entradas" — persistencia local, sin cuenta.
 *
 * Decisión de producto: esta lista **no** tiene tabla, ni ruta de API, ni cookie de
 * identidad, ni un solo dato personal. Vive entera en `localStorage` del dispositivo.
 *
 * El motivo es que el ticket real con QR está en la cuenta de Bombo: acá no se guarda una
 * compra, se guarda un recordatorio de qué fecha fuiste a comprar. Pedir un registro para
 * sostener un recordatorio costaría más conversión de la que devuelve, y además nos
 * convertiría en responsables de datos personales que hoy no tocamos.
 *
 * Consecuencia asumida: si el usuario cambia de teléfono o limpia el navegador, la lista se
 * pierde. Es aceptable porque el dato que importa —la entrada— nunca estuvo acá.
 */

const STORAGE_KEY = "et_fechas_guardadas";

/** Aviso interno para que las pantallas abiertas se enteren de un guardado en la misma pestaña. */
const CHANGE_EVENT = "et:fechas-guardadas";

export type SavedDate = {
  slug: string;
  /** Se guarda para poder descartar fechas pasadas sin depender de la base. */
  starts_at: string;
  guardado_en: string;
};

function isSavedDate(value: unknown): value is SavedDate {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.slug === "string" && typeof item.starts_at === "string";
}

/**
 * Lee la lista cruda. Devuelve `[]` en servidor y ante cualquier dato corrupto: una lista
 * ilegible no puede romper la pantalla, y como el contenido es descartable no vale la pena
 * intentar recuperarla.
 */
export function readSavedDates(): SavedDate[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isSavedDate);
  } catch {
    return [];
  }
}

/**
 * Guarda una fecha. Se llama al tocar "Comprar en Bombo", **antes** de navegar.
 *
 * Es idempotente: volver a comprar la misma fecha refresca `guardado_en` en lugar de
 * duplicar la fila.
 */
export function saveDate(slug: string, startsAt: string) {
  if (typeof window === "undefined") return;

  try {
    const current = readSavedDates().filter((item) => item.slug !== slug);
    const next: SavedDate[] = [
      ...current,
      { slug, starts_at: startsAt, guardado_en: new Date().toISOString() }
    ];

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Modo privado de Safari, cuota llena, storage bloqueado: se pierde el guardado, pero
    // la navegación a Bombo tiene que seguir. Nunca romper la compra por el recordatorio.
  }
}

export function subscribeToSavedDates(listener: () => void) {
  if (typeof window === "undefined") return () => {};

  // `storage` cubre las otras pestañas; el evento propio cubre la pestaña actual, que es la
  // que guarda y donde `storage` no dispara.
  window.addEventListener("storage", listener);
  window.addEventListener(CHANGE_EVENT, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}
