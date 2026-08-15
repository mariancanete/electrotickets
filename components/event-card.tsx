import Link from "next/link";
import { BuyButton } from "@/components/buy-button";
import { CalendarBlank, Fire, MapPin, ProhibitInset, Ticket } from "@phosphor-icons/react/dist/ssr";
import { FlyerFallback, FlyerImage } from "@/components/flyer-image";
import { WhatsappLink } from "@/components/whatsapp-link";
import type { CtaPlacement } from "@/lib/analytics";
import { formatEventDate, getDayBadge } from "@/lib/dates";
import { buildWaitlistWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";
import type { EventRecord } from "@/types/event";

type EventCardProps = {
  event: EventRecord;
  placement: CtaPlacement;
  priority?: boolean;
  showDetailsLink?: boolean;
};

export function EventCard({ event, placement, priority = false, showDetailsLink = true }: EventCardProps) {
  const badge = getDayBadge(event.starts_at);
  const isSoldOut = Boolean(event.sold_out);
  const hasLastTickets = Boolean(event.last_tickets) && !isSoldOut;
  const ctaClass =
    "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-white/10 px-4 text-center text-sm font-bold transition hover:bg-white hover:text-black";

  return (
    <article className="group overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/25 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]">
      <Link href={`/eventos/${event.slug}`} className="block" aria-label={`Ver detalles de ${event.title}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
          {event.flyer_url ? (
            <FlyerImage
              src={event.flyer_url}
              alt={`Flyer de ${event.title}`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <FlyerFallback />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
          {/* Mismo tratamiento de fecha que EventRow: la tarjeta y la fila son el mismo
              objeto en dos densidades, no dos lenguajes distintos. */}
          <div className="absolute left-4 top-4 rounded-[12px] border border-white/10 bg-black/70 px-3 py-2 text-center">
            <p className="tabular text-[10px] uppercase tracking-[0.2em] text-white/62">{badge.month}</p>
            <p className="tabular mt-1 text-xl font-medium leading-none text-white">{badge.day}</p>
          </div>
          <div className="absolute right-4 top-4 flex max-w-[calc(100%-7.5rem)] flex-col items-end gap-2">
            {isSoldOut ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-700 px-3 py-1 text-xs font-black text-white shadow-lg shadow-red-950/40">
                <ProhibitInset size={13} weight="fill" aria-hidden="true" />
                Sold Out
              </span>
            ) : hasLastTickets ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white shadow-lg shadow-red-950/35">
                <Fire size={13} weight="fill" aria-hidden="true" />
                Últimas entradas
              </span>
            ) : null}
            {event.featured ? (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">Destacado</span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-[13px] text-violet-200/80">{event.genre || "Electrónica"}</p>
          <Link href={`/eventos/${event.slug}`} className="block">
            <h2 className="font-display mt-1 line-clamp-2 text-2xl font-black leading-tight tracking-[-0.02em] transition group-hover:text-white/78">
              {event.title}
            </h2>
          </Link>
        </div>
        <div className="space-y-2 text-[13px] text-white/62">
          <p className="flex items-center gap-1.5">
            <CalendarBlank size={14} weight="bold" aria-hidden="true" />
            <span className="tabular">{formatEventDate(event.starts_at)}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin size={14} weight="fill" aria-hidden="true" />
            {event.venue_name || "Venue a confirmar"}
            {event.city ? ` · ${event.city}` : ""}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 pt-2">
          {showDetailsLink ? (
            <Link href={`/eventos/${event.slug}`} className="text-sm text-white/62 transition hover:text-white">
              Ver detalles
            </Link>
          ) : (
            <span className="text-sm text-white/48">Link oficial</span>
          )}
          {isSoldOut ? (
            <WhatsappLink
              href={whatsappUrlOrGroup(buildWaitlistWhatsappMessage(event.title))}
              source="soldout"
              eventSlug={event.slug}
              className={ctaClass}
            >
              Avisame si se libera
            </WhatsappLink>
          ) : (
            <BuyButton event={event} placement={placement} className={ctaClass}>
              <Ticket size={15} weight="fill" aria-hidden="true" />
              Comprar en Bombo
            </BuyButton>
          )}
        </div>
      </div>
    </article>
  );
}
