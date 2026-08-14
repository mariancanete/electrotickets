import type { EventRecord } from "@/types/event";

/**
 * Helpers de fecha puros, sin dependencias de Supabase.
 *
 * Viven aparte de `lib/events.ts` porque el panel de administración los necesita del lado
 * del cliente, y ese módulo arrastra el cliente de Supabase al importarse.
 */

/**
 * Una fiesta que empieza a las 23:59 se sigue vendiendo esa madrugada. Cortar en
 * `starts_at` sacaba el evento del sitio justo la noche en que la gente lo busca.
 */
const DEFAULT_DURATION_HOURS = 8;

/** Cuánto tiempo se mantiene un evento pasado como landing indexable antes de archivarlo. */
export const PAST_EVENT_WINDOW_DAYS = 120;

type EventDates = Pick<EventRecord, "starts_at" | "end_at">;

export function getEventEndTime(event: EventDates) {
  if (event.end_at) {
    const endsAt = new Date(event.end_at).getTime();
    if (!Number.isNaN(endsAt)) return endsAt;
  }

  const startsAt = new Date(event.starts_at).getTime();
  if (Number.isNaN(startsAt)) return Number.NaN;

  return startsAt + DEFAULT_DURATION_HOURS * 60 * 60 * 1000;
}

export function isUpcomingEvent(event: EventDates) {
  if (!event.starts_at) return false;

  const endTime = getEventEndTime(event);
  if (Number.isNaN(endTime)) return false;

  return endTime > Date.now();
}

export function isPastEvent(event: EventDates) {
  return Boolean(event.starts_at) && !isUpcomingEvent(event);
}
