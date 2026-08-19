import { formatDayLabel, getDayKey, getDayKeyIso, getHour } from "@/lib/dates";
import { normalizeText } from "@/lib/slugify";
import { getWeekendDays } from "@/lib/weekend";
import type { EventRecord } from "@/types/event";

/**
 * Filtros de la agenda y de la búsqueda.
 *
 * Viven acá y no dentro del componente porque los comparten dos pantallas: el listado (02)
 * los muestra como chips aplicados y la búsqueda (08) los edita. Si la lógica estuviera en
 * el componente de búsqueda, el listado tendría que reimplementarla y las dos pantallas se
 * desincronizarían apenas se agregara un filtro.
 *
 * **Todos los filtros viven en la URL.** Es lo que permite compartir un resultado por
 * WhatsApp ("mirá lo que hay en Mandarine este finde") y que el botón atrás devuelva a la
 * pantalla anterior en vez de a un estado intermedio.
 *
 * Ningún filtro necesita una columna nueva: el género sale de `genre`, la zona de
 * `venue_name` y el finde de `starts_at`.
 */

export type Filters = {
  q: string;
  genero: string;
  zona: string;
  cuando: string;
  /** Día puntual, en ISO (`2026-08-21`). Sale del sidebar de desktop. */
  dia: string;
  /** `temprano` antes de las 2, `tarde` de las 2 en adelante. */
  horario: string;
};

export const EMPTY_FILTERS: Filters = { q: "", genero: "", zona: "", cuando: "", dia: "", horario: "" };

/** Corte de la madrugada. Las 2 es donde la noche se parte en la práctica. */
const HORA_CORTE = 2;

export const HORARIOS = [
  { value: "temprano", label: "Antes de las 2" },
  { value: "tarde", label: "Después de las 2" }
] as const;

/** El único valor de `cuando` por ahora. Se nombra para no repetir el string suelto. */
export const WEEKEND = "finde";

export function parseFilters(params: {
  q?: string | string[];
  genero?: string | string[];
  zona?: string | string[];
  cuando?: string | string[];
  dia?: string | string[];
  horario?: string | string[];
}): Filters {
  const one = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value) || "";

  return {
    q: one(params.q).trim(),
    genero: one(params.genero).trim(),
    zona: one(params.zona).trim(),
    cuando: one(params.cuando).trim(),
    dia: one(params.dia).trim(),
    horario: one(params.horario).trim()
  };
}

/** Cuántos filtros están aplicados. La query no cuenta: tiene su propio campo en pantalla. */
export function countActiveFilters(filters: Filters) {
  return [filters.genero, filters.zona, filters.cuando, filters.dia, filters.horario].filter(Boolean).length;
}

export function hasAnyFilter(filters: Filters) {
  return Boolean(filters.q) || countActiveFilters(filters) > 0;
}

export function filtersToParams(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.genero) params.set("genero", filters.genero);
  if (filters.zona) params.set("zona", filters.zona);
  if (filters.cuando) params.set("cuando", filters.cuando);
  if (filters.dia) params.set("dia", filters.dia);
  if (filters.horario) params.set("horario", filters.horario);
  return params;
}

/**
 * Géneros normalizados de los eventos publicados.
 *
 * La base todavía puede tener variantes como "Progressive House" y "Progressive house", y con
 * comparación exacta cada variante aparecía como una opción distinta que además dejaba afuera
 * a la otra mitad de los eventos. Se compara normalizado y se muestra la primera grafía real.
 */
export function getGenres(events: EventRecord[]) {
  return collect(events, (event) => event.genre);
}

/** Días disponibles, para el sidebar. Devuelve `{ iso, label }` ya ordenados. */
export function getDias(events: EventRecord[]) {
  const seen = new Map<string, string>();

  for (const event of events) {
    const iso = getDayKeyIso(event.starts_at);
    if (!seen.has(iso)) seen.set(iso, formatDayLabel(event.starts_at));
  }

  return Array.from(seen.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([iso, label]) => ({ iso, label }));
}

/**
 * Zonas. Salen de `venue_name` y no de `city`, que en la práctica viene cargado como
 * "Buenos Aires" en casi todas las filas: una fila de chips donde todos dicen lo mismo no
 * filtra nada. El venue es además lo que la gente nombra cuando decide ("¿qué hay en
 * Mandarine?"), así que es el corte que realmente usa.
 */
export function getZones(events: EventRecord[]) {
  return collect(events, (event) => event.venue_name);
}

function collect(events: EventRecord[], pick: (event: EventRecord) => string | null) {
  const seen = new Map<string, string>();

  for (const event of events) {
    const raw = pick(event);
    if (!raw) continue;
    const key = normalizeText(raw);
    if (key && !seen.has(key)) seen.set(key, raw.trim());
  }

  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, "es"));
}

export function applyFilters(events: EventRecord[], filters: Filters) {
  const query = normalizeText(filters.q);
  const genre = normalizeText(filters.genero);
  const zone = normalizeText(filters.zona);
  const weekendKeys = filters.cuando === WEEKEND ? new Set(getWeekendDays().map(dayKeyOf)) : null;

  return events.filter((event) => {
    if (genre && normalizeText(event.genre) !== genre) return false;
    if (zone && normalizeText(event.venue_name) !== zone) return false;
    if (weekendKeys && !weekendKeys.has(getDayKey(event.starts_at))) return false;
    if (filters.dia && getDayKeyIso(event.starts_at) !== filters.dia) return false;

    if (filters.horario) {
      // Una fecha que arranca 23:00 es "antes de las 2"; una que arranca 03:00, "después".
      // El corte se lee sobre la hora local: de mediodía en adelante todavía es la noche que
      // arranca, y de 00:00 a 01:59 sigue siendo temprano dentro de esa misma noche.
      const hora = getHour(event.starts_at);
      const antesDeLasDos = hora >= 12 || hora < HORA_CORTE;
      if (filters.horario === "temprano" && !antesDeLasDos) return false;
      if (filters.horario === "tarde" && antesDeLasDos) return false;
    }

    if (!query) return true;

    const haystack = normalizeText(
      [event.title, event.venue_name, event.city, event.genre, event.lineup?.join(" ")].filter(Boolean).join(" ")
    );

    return haystack.includes(query);
  });
}

function dayKeyOf(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}
