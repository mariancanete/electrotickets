import { demoEvents } from "@/lib/demo-events";
import { isPastEvent, isUpcomingEvent, PAST_EVENT_WINDOW_DAYS } from "@/lib/event-dates";
import { normalizeText } from "@/lib/slugify";
import { getSupabaseAdminClient, getSupabasePublicClient, isSupabasePublicConfigured } from "@/lib/supabase";
import type { EventRecord } from "@/types/event";

const eventSelect = "*";

export { isPastEvent, isUpcomingEvent, PAST_EVENT_WINDOW_DAYS } from "@/lib/event-dates";

export function filterUpcomingEvents<T extends Pick<EventRecord, "starts_at" | "end_at">>(events: T[]) {
  return events.filter(isUpcomingEvent);
}

/** Eventos ya terminados pero todavía recientes: sus URLs conservan tráfico y backlinks. */
export function filterRecentPastEvents<T extends Pick<EventRecord, "starts_at" | "end_at">>(events: T[]) {
  const cutoff = Date.now() - PAST_EVENT_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  return events
    .filter((event) => isPastEvent(event) && new Date(event.starts_at).getTime() > cutoff)
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
}

export async function getPublishedEvents(): Promise<EventRecord[]> {
  if (!isSupabasePublicConfigured) {
    return demoEvents.filter((event) => event.published).sort(sortEvents);
  }

  const supabase = getSupabasePublicClient();
  if (!supabase) return demoEvents.filter((event) => event.published).sort(sortEvents);

  const { data, error } = await supabase
    .from("events")
    .select(eventSelect)
    .eq("published", true)
    .order("starts_at", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error loading public events", error);
    return demoEvents.filter((event) => event.published).sort(sortEvents);
  }

  return (data || []) as EventRecord[];
}

export async function getUpcomingPublishedEvents(): Promise<EventRecord[]> {
  const events = await getPublishedEvents();
  return filterUpcomingEvents(events);
}

export async function getRecentPastPublishedEvents(): Promise<EventRecord[]> {
  const events = await getPublishedEvents();
  return filterRecentPastEvents(events);
}

export async function getEventBySlug(slug: string, includeUnpublished = false): Promise<EventRecord | null> {
  if (!isSupabasePublicConfigured) {
    return demoEvents.find((event) => event.slug === slug && (includeUnpublished || event.published)) || null;
  }

  const supabase = includeUnpublished ? getSupabaseAdminClient() : getSupabasePublicClient();
  if (!supabase) return null;

  let query = supabase.from("events").select(eventSelect).eq("slug", slug).limit(1).single();
  if (!includeUnpublished) {
    query = supabase.from("events").select(eventSelect).eq("slug", slug).eq("published", true).limit(1).single();
  }

  const { data, error } = await query;

  if (error) return null;
  return data as EventRecord;
}

export async function getAdminEvents(): Promise<EventRecord[]> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("events")
      .select(eventSelect)
      .order("starts_at", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as EventRecord[];
  } catch (error) {
    console.error("Admin events fallback", error);
    return demoEvents.sort(sortEvents);
  }
}

/**
 * Eventos sugeridos al pie de una fecha. Antes la página de evento era un callejón sin
 * salida: quien no compraba se iba del sitio.
 *
 * Prioriza mismo género, después mismo venue, después cercanía de fecha. Un evento que
 * comparte género y venue puntúa más alto que uno que solo comparte fecha.
 */
export function getRelatedEvents(event: EventRecord, candidates: EventRecord[], limit = 3) {
  const normalize = normalizeText;
  const genre = normalize(event.genre);
  const venue = normalize(event.venue_name);
  const city = normalize(event.city);
  const startsAt = new Date(event.starts_at).getTime();
  const lineup = new Set((event.lineup || []).map(normalize).filter(Boolean));

  return candidates
    .filter((candidate) => candidate.id !== event.id)
    .map((candidate) => {
      let score = 0;

      if (genre && normalize(candidate.genre) === genre) score += 40;
      if (venue && normalize(candidate.venue_name) === venue) score += 25;
      if (city && normalize(candidate.city) === city) score += 10;
      if ((candidate.lineup || []).some((artist) => lineup.has(normalize(artist)))) score += 35;

      const daysApart = Math.abs(new Date(candidate.starts_at).getTime() - startsAt) / (24 * 60 * 60 * 1000);
      if (daysApart <= 7) score += 20;
      else if (daysApart <= 21) score += 12;
      else if (daysApart <= 45) score += 5;

      if (candidate.featured) score += 8;
      if (candidate.sold_out) score -= 15;

      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score || new Date(a.candidate.starts_at).getTime() - new Date(b.candidate.starts_at).getTime())
    .slice(0, limit)
    .map((item) => item.candidate);
}

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Argentina/Buenos_Aires",
  weekday: "short"
});

/**
 * Agrupaciones comerciales de la agenda. Solo dos, deliberadamente: con más secciones, la
 * mayoría quedaría vacía con el inventario actual y una sección vacía se ve peor que
 * ninguna.
 */
export function getWeekendEvents(events: EventRecord[]) {
  const horizon = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const weekendDays = new Set(["Fri", "Sat", "Sun"]);

  return events.filter((event) => {
    const startsAt = new Date(event.starts_at).getTime();
    if (Number.isNaN(startsAt) || startsAt > horizon) return false;

    return weekendDays.has(weekdayFormatter.format(new Date(event.starts_at)));
  });
}

export function getLastTicketsEvents(events: EventRecord[]) {
  return events.filter((event) => event.last_tickets && !event.sold_out);
}

function sortEvents(a: EventRecord, b: EventRecord) {
  return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
}
