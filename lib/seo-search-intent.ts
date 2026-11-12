import { formatTime, getDayKeyIso } from "@/lib/dates";
import {
  formatSeoDate,
  getEventCity,
  getEventCountry,
  getEventPrimaryPlace,
  getEventYear,
  getHeadliners,
  joinList
} from "@/lib/event-seo";
import type { EventFaqItem, EventRecord } from "@/types/event";

/**
 * Experimento de SEO "por búsqueda real" (noviembre 2026).
 *
 * Hoy el título se arma con el título del evento y el venue: "SOLOMUN NYE en Teatro Griego
 * Frank Romero Day, Mendoza 2026 | Entradas". Son 70 caracteres. Google lo descartó y armó uno
 * propio con el h1 ("SOLOMUN NYEen Teatro Griego…"), y la fecha quedó lejos.
 *
 * Search Console de octubre muestra que esa fecha se busca de una sola manera: "solomun
 * mendoza" (629 impresiones, posición 8), "solomun mendoza entradas", "solomun mendoza 2026",
 * "solomun mendoza año nuevo". Nadie buscó "NYE" ni "Teatro Griego". Este experimento arma
 * el título, el h1, la descripción y el FAQ con las palabras que la gente escribe:
 *
 *   SOLOMUN en Mendoza · Año Nuevo 2026 | Entradas      (46 caracteres)
 *
 * Arranca con una sola fecha, la de peor rendimiento. Si en 2–3 semanas mejora en Search
 * Console, se suman los demás slugs a esta lista; las reglas ya son genéricas.
 */
const EXPERIMENT_SLUGS = new Set(["solomun-nye-2026-12-31"]);

/** Google corta el título visible alrededor de los 60 caracteres. */
const TITLE_MAX = 60;

export function usesSearchIntentSeo(event: Pick<EventRecord, "slug">) {
  return EXPERIMENT_SLUGS.has(event.slug);
}

/**
 * Noche de Año Nuevo: la fecha arranca la noche del 31/12 (una de las 00:30 del 1/1 también
 * cuenta, por la misma corrección de noche que agrupa la agenda). Se busca "año nuevo", no
 * "NYE".
 */
export function isNewYearsEve(event: Pick<EventRecord, "starts_at">) {
  return getDayKeyIso(event.starts_at).endsWith("-12-31");
}

/** "SOLOMUN", o "MASSANO y KEVIN DE VRIES". Es como se busca: por artista, no por el nombre de la fiesta. */
function getArtistName(event: EventRecord) {
  const headliners = getHeadliners(event);
  return headliners.length ? joinList(headliners) : event.title;
}

/** "SOLOMUN en Mendoza". La ciudad, no el venue: es la palabra de la búsqueda. */
export function getSearchLabel(event: EventRecord) {
  const city = getEventCity(event) || getEventPrimaryPlace(event);
  return city ? `${getArtistName(event)} en ${city}` : getArtistName(event);
}

/** "SOLOMUN en Mendoza · Año Nuevo 2026 | Entradas". Suma el venue al final solo si entra. */
export function buildSearchIntentTitle(event: EventRecord) {
  const year = getEventYear(event.starts_at);
  const occasion = isNewYearsEve(event) ? " · Año Nuevo" : "";
  const title = `${getSearchLabel(event)}${occasion} ${year} | Entradas`;
  const venue = event.venue_name?.trim();

  if (venue && !isNewYearsEve(event) && `${title} · ${venue}`.length <= TITLE_MAX) return `${title} · ${venue}`;
  return title;
}

/**
 * "Entradas para SOLOMUN en Mendoza: Año Nuevo 2026 en Teatro Griego Frank Romero Day, el
 * jueves 31 de diciembre a las 23:59. Link oficial de Bombo y mesas VIP." Empieza con la
 * búsqueda tal cual: Google la resalta en negrita, y es lo que decide el clic.
 */
export function buildSearchIntentDescription(event: EventRecord) {
  const venue = event.venue_name?.trim();
  const occasion = isNewYearsEve(event) ? `: Año Nuevo ${getEventYear(event.starts_at)}` : "";
  const when = formatSeoDate(event.starts_at).replace(/ de \d{4}$/, "");

  return `Entradas para ${getSearchLabel(event)}${occasion}${venue ? ` en ${venue}` : ""}, el ${when} a las ${formatTime(event.starts_at)}. Link oficial de Bombo y mesas VIP.`;
}

/** Bajada del h1: "Año Nuevo en Mendoza". El venue va en la fila de lugar, justo debajo. */
export function buildSearchIntentPlaceLine(event: EventRecord) {
  const city = getEventCity(event) || getEventPrimaryPlace(event);
  if (!city) return [];
  return [`${isNewYearsEve(event) ? "Año Nuevo " : ""}en ${city}`];
}

/** Primer párrafo: es el que Google usa de fragmento cuando no le sirve la descripción. */
export function buildSearchIntentAbout(event: EventRecord, { official }: { official: boolean }) {
  const venue = event.venue_name?.trim();
  const occasion = isNewYearsEve(event) ? `: Año Nuevo ${getEventYear(event.starts_at)}` : "";
  const intro = `${getSearchLabel(event)}${occasion}${venue ? ` en ${venue}` : ""}.`;
  const when = ` ${event.title} es el ${formatSeoDate(event.starts_at)}, con puertas a las ${formatTime(event.starts_at)}${event.genre ? `: una noche de ${event.genre}` : ""}.`;
  const close = official
    ? ` Somos RRPP oficial de ${venue}: acá tenés el link oficial de Bombo para comprar tus entradas.`
    : " Acá tenés la fecha, la ubicación y el link oficial de Bombo para comprar tus entradas.";

  return `${intro}${when}${close}`;
}

/**
 * Preguntas escritas como las búsquedas: "¿Dónde comprar entradas para SOLOMUN en Mendoza?"
 * ("solomun mendoza entradas"), "¿Dónde toca SOLOMUN en Mendoza?" (búsqueda literal de
 * octubre) y, en Año Nuevo, "¿Dónde pasar Año Nuevo con SOLOMUN?".
 */
export function buildSearchIntentFaq(
  event: EventRecord,
  {
    buyAnswer,
    address,
    artistItems
  }: {
    buyAnswer: string;
    address: string;
    artistItems: EventFaqItem[];
  }
): EventFaqItem[] {
  const artist = getArtistName(event);
  const city = getEventCity(event) || getEventPrimaryPlace(event) || getEventCountry(event);
  const venue = event.venue_name?.trim() || "venue a confirmar";
  const when = `el ${formatSeoDate(event.starts_at)}, con puertas a las ${formatTime(event.starts_at)}`;
  const where = `${venue}${address ? ` (${address})` : ""}`;

  const items: EventFaqItem[] = [
    { question: `¿Dónde comprar entradas para ${getSearchLabel(event)}?`, answer: buyAnswer },
    { question: `¿Dónde toca ${artist} en ${city}?`, answer: `En ${where}, ${when}.` }
  ];

  if (isNewYearsEve(event)) {
    items.push({
      question: `¿Dónde pasar Año Nuevo con ${artist}?`,
      answer: `En ${venue}, ${city}: ${event.title} es ${when}. Las entradas se compran desde esta página, con el link oficial de Bombo.`
    });
  }

  return [
    ...items,
    ...artistItems,
    {
      question: "¿ElectroTickets procesa el pago?",
      answer:
        "No. ElectroTickets es una agenda especializada que centraliza la información y te lleva al link oficial de compra. El pago y la emisión del ticket se completan en Bombo."
    },
    {
      question: "¿Puedo consultar por mesas VIP o cortesías?",
      answer:
        "Sí. Escribinos por WhatsApp y te pasamos disponibilidad y condiciones de mesas y cortesías para la fecha."
    }
  ];
}
