import { filterUpcomingEvents, getPublishedEvents, getUpcomingPublishedEvents, isPastEvent } from "@/lib/events";
import { artistSlug, getEventArtists } from "@/lib/event-seo";
import { normalizeText } from "@/lib/slugify";
import type { EventRecord } from "@/types/event";

/**
 * Páginas de artista (`/artistas/[slug]`).
 *
 * Cada fecha nueva es una URL nueva que arranca de cero en Google, mientras la anterior del
 * mismo artista ya tiene historia: por eso "kevin de vries entradas" traía primero la fecha
 * finalizada. La página de artista es una URL que no cambia y que siempre muestra las fechas
 * vigentes, así que el posicionamiento se acumula de una fecha a la siguiente. Apunta a las
 * búsquedas sin venue: "solomun argentina", "miss monique argentina 2026", "camelphat
 * entradas".
 *
 * No hay tabla de artistas: salen del `lineup` de los eventos publicados.
 */

export type Artist = {
  name: string;
  slug: string;
  upcoming: EventRecord[];
  past: EventRecord[];
};

/** Cuántas fechas pasadas se listan: son contexto y links internos, no la agenda. */
const PAST_LIMIT = 6;

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  const events = await getPublishedEvents();
  const matches = events.filter((event) => getEventArtists(event).some((name) => artistSlug(name) === slug));
  if (!matches.length) return null;

  const upcoming = filterUpcomingEvents(matches).sort(byDate);
  const past = matches
    .filter(isPastEvent)
    .sort((a, b) => byDate(b, a))
    .slice(0, PAST_LIMIT);

  // El nombre como está cargado en la fecha más próxima (o la última), que es la más
  // probable de estar bien escrita.
  const reference = upcoming[0] || past[0] || matches[0];
  const name = getEventArtists(reference).find((artist) => artistSlug(artist) === slug) || slug;

  return { name, slug, upcoming, past };
}

/** Artistas con al menos una fecha vigente. Alimenta el sitemap y la generación estática. */
export async function getUpcomingArtists() {
  const events = await getUpcomingPublishedEvents();
  const artists = new Map<string, { name: string; slug: string; lastModified: number }>();

  for (const event of events) {
    const modified = new Date(event.updated_at || event.created_at || event.starts_at).getTime();
    for (const name of getEventArtists(event)) {
      const slug = artistSlug(name);
      if (!slug) continue;
      const current = artists.get(slug);
      if (!current || modified > current.lastModified) artists.set(slug, { name, slug, lastModified: modified });
    }
  }

  return Array.from(artists.values());
}

/** Otras fechas vigentes de un artista, para el FAQ del detalle ("¿Cuándo toca X en Argentina?"). */
export function getArtistUpcomingEvents(name: string, upcoming: EventRecord[]) {
  const key = normalizeText(name);
  return upcoming
    .filter((event) => getEventArtists(event).some((artist) => normalizeText(artist) === key))
    .sort(byDate);
}

function byDate(a: EventRecord, b: EventRecord) {
  return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
}
