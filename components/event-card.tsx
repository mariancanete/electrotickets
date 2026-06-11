import Link from "next/link";
import type { EventRecord } from "@/types/event";
import { formatEventDate, getDayBadge } from "@/lib/dates";

type EventCardProps = {
  event: EventRecord;
  priority?: boolean;
  showDetailsLink?: boolean;
};

export function EventCard({ event, priority = false, showDetailsLink = true }: EventCardProps) {
  const badge = getDayBadge(event.starts_at);
  const hasLastTickets = Boolean(event.last_tickets);

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/25 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]">
      <Link href={`/eventos/${event.slug}`} className="block" aria-label={`Ver detalles de ${event.title}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
          {event.flyer_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.flyer_url}
              alt={`Flyer de ${event.title}`}
              loading={priority ? "eager" : "lazy"}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center bg-gradient-to-br from-violet-500/30 via-cyan-500/10 to-white/5 text-4xl font-black">
              ET
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
          <div className="absolute left-4 top-4 rounded-2xl bg-black/65 px-3 py-2 text-center backdrop-blur">
            <p className="text-xl font-black leading-none">{badge.day}</p>
            <p className="text-xs uppercase text-white/60">{badge.month}</p>
          </div>
          <div className="absolute right-4 top-4 flex max-w-[calc(100%-7.5rem)] flex-col items-end gap-2">
            {hasLastTickets ? (
              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white shadow-lg shadow-red-950/35">
                Últimas entradas
              </span>
            ) : null}
            {event.featured ? (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
                Destacado
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-sm text-violet-200/80">{event.genre || "Electrónica"}</p>
          <Link href={`/eventos/${event.slug}`} className="block">
            <h2 className="mt-1 line-clamp-2 text-2xl font-bold tracking-tight transition group-hover:text-white/90">{event.title}</h2>
          </Link>
        </div>
        <div className="space-y-2 text-sm text-white/60">
          <p>{formatEventDate(event.starts_at)}</p>
          <p>{event.venue_name || "Venue a confirmar"}{event.city ? ` · ${event.city}` : ""}</p>
        </div>
        <div className="flex items-center justify-between gap-3 pt-2">
          {showDetailsLink ? (
            <Link href={`/eventos/${event.slug}`} className="text-sm text-white/50 transition hover:text-white">
              Ver detalles
            </Link>
          ) : (
            <span className="text-sm text-white/40">Compra oficial</span>
          )}
          <Link
            href={`/go/${event.slug}`}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white hover:text-black"
          >
            Comprar
          </Link>
        </div>
      </div>
    </article>
  );
}
