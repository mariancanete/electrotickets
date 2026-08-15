import { getDayKey } from "@/lib/dates";
import type { EventRecord } from "@/types/event";

const TIME_ZONE = "America/Argentina/Buenos_Aires";
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Los tres días del finde: viernes, sábado y domingo.
 *
 * El cálculo se hace sobre la fecha **calendario argentina**, no sobre UTC. Si se usara
 * `getDay()` del servidor, a la noche de Buenos Aires el server ya estaría en el día
 * siguiente y el selector mostraría el finde equivocado justo en el horario en que la gente
 * entra a decidir qué hacer esa noche.
 *
 * Cuando el finde ya arrancó (sábado o domingo) la ventana **no se corre** al finde que
 * viene: sigue mostrando viernes-sábado-domingo del finde en curso. El viernes que ya pasó
 * queda sin fechas próximas y el selector lo dibuja solo, en su estado "sin fechas", que es
 * exactamente lo que hay que comunicar.
 */
export function getWeekendDays(reference: Date = new Date()): Date[] {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(reference);

  // Mediodía UTC sobre esa fecha calendario: queda lejos de cualquier borde de horario de
  // verano, así que sumar días nunca corre la fecha de lugar.
  const base = new Date(`${today}T12:00:00Z`);
  const weekday = base.getUTCDay(); // 0 = domingo … 6 = sábado
  const offsetToFriday = weekday === 0 ? -2 : 5 - weekday;
  const friday = new Date(base.getTime() + offsetToFriday * DAY_MS);

  return [0, 1, 2].map((step) => new Date(friday.getTime() + step * DAY_MS));
}

/** Eventos que caen en los tres días del finde, agrupados por día calendario argentino. */
export function groupByDay<T extends Pick<EventRecord, "starts_at">>(events: T[]) {
  const groups = new Map<string, T[]>();

  for (const event of events) {
    const key = getDayKey(event.starts_at);
    const bucket = groups.get(key);
    if (bucket) bucket.push(event);
    else groups.set(key, [event]);
  }

  return groups;
}
