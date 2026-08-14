import Link from "next/link";
import { BuyButton } from "@/components/buy-button";
import { FlyerFallback, FlyerImage } from "@/components/flyer-image";
import { WhatsappLink } from "@/components/whatsapp-link";
import type { CtaPlacement } from "@/lib/analytics";
import { getDayBadge } from "@/lib/dates";
import { buildWaitlistWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";
import type { EventRecord } from "@/types/event";

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23"
});

/**
 * Fila compacta de evento.
 *
 * Es el formato denso de la agenda: en mobile, una card con flyer en 4/5 ocupa casi una
 * pantalla entera, así que ver ocho fechas eran ocho pantallas de scroll. Esta fila muestra
 * la misma información en una fracción del alto, y se reutiliza en el hero, en la agenda de
 * la home y en los eventos relacionados.
 */
export function EventRow({
  event,
  placement,
  priority = false
}: {
  event: EventRecord;
  placement: CtaPlacement;
  priority?: boolean;
}) {
  const badge = getDayBadge(event.starts_at);
  const eventTime = formatEventTime(event.starts_at);
  const tags = [event.genre, event.city].filter(Boolean).slice(0, 2) as string[];
  const isSoldOut = Boolean(event.sold_out);
  const hasLastTickets = Boolean(event.last_tickets) && !isSoldOut;
  // Ancho fijo en desktop para que los botones de todas las filas queden alineados en
  // columna aunque cambie el texto ("Comprar en Bombo" vs "Avisame si se libera").
  const ctaClass =
    "inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-center text-xs font-black text-white shadow-[0_14px_30px_rgba(91,33,182,0.28)] transition hover:from-violet-500 hover:to-blue-500 sm:w-[170px]";
  const chipClass =
    "whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] sm:px-2 sm:text-[10px]";

  return (
    <article className="group w-full max-w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/15 backdrop-blur transition duration-300 hover:border-violet-300/30 hover:bg-white/[0.06]">
      {/* El flyer ocupaba 210px de una columna de ~700px, así que al título le quedaban unos
          190px y se cortaba. A 100px el título recibe ~304px y entra completo, y de paso el
          recorte deja de ser una franja horizontal sobre un flyer vertical.
          Todo el grid vive en sm: y superiores: mobile mantiene el apilado actual. */}
      <div className="flex min-w-0 flex-col gap-3 p-3 sm:grid sm:min-h-[139px] sm:grid-cols-[92px_48px_minmax(0,1fr)_auto] sm:items-center sm:gap-4 lg:grid-cols-[96px_52px_minmax(0,1fr)_auto] xl:grid-cols-[100px_56px_minmax(0,1fr)_auto]">
        <Link
          href={`/eventos/${event.slug}`}
          className="relative h-32 w-full overflow-hidden rounded-2xl bg-white/5 sm:h-[115px] sm:w-full lg:h-[120px] xl:h-[125px]"
        >
          {event.flyer_url ? (
            <FlyerImage
              src={event.flyer_url}
              alt={`Flyer de ${event.title}`}
              sizes="(max-width: 640px) 100vw, 100px"
              priority={priority}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <FlyerFallback size="text-2xl" />
          )}
          {/* Solo mobile: en desktop estos badges duplicaban el chip de la columna de texto y,
              con el flyer más chico, taparían el arte entero. */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:hidden">
            {event.featured ? (
              <span className="rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                Destacado
              </span>
            ) : null}
            {isSoldOut ? (
              <span className="rounded-full bg-red-700 px-2.5 py-1 text-[10px] font-black text-white shadow-lg shadow-red-950/40">
                Sold Out
              </span>
            ) : hasLastTickets ? (
              <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black text-white shadow-lg shadow-red-950/30">
                Últimas entradas
              </span>
            ) : null}
          </div>
          <span
            className={`absolute left-3 ${
              event.featured || isSoldOut || hasLastTickets ? "top-12" : "top-3"
            } grid min-w-9 place-items-center rounded-xl border border-white/10 bg-black/70 px-2 py-1.5 text-center shadow-lg shadow-black/25 backdrop-blur sm:hidden`}
          >
            <span className="text-lg font-black leading-none text-white">{badge.day}</span>
            <span className="mt-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-white/65">{badge.month}</span>
          </span>
        </Link>

        <div className="hidden text-center sm:block">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">{badge.month}</p>
          <p className="mt-1 text-3xl font-black leading-none text-white/78">{badge.day}</p>
        </div>

        <div className="min-w-0 px-1 sm:px-0">
          <Link href={`/eventos/${event.slug}`}>
            {/* Mobile conserva `truncate` tal cual está hoy. En desktop el nombre entra
                completo y, si alguno fuera muy largo, baja a una segunda línea. */}
            <h3 className="truncate text-lg font-black leading-tight tracking-tight text-white sm:line-clamp-2 sm:whitespace-normal sm:text-xl">
              {event.title}
            </h3>
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/52">
            <span className="inline-flex items-center gap-1">
              <ClockIcon />
              {eventTime} hs
            </span>
            <span className="inline-flex min-w-0 items-center gap-1">
              <PinIcon />
              <span className="min-w-0 break-words sm:truncate">{event.venue_name || "Venue a confirmar"}</span>
            </span>
          </div>
          {/* En una sola línea en desktop: al envolver, unas filas quedaban más altas que
              otras y los botones dejaban de alinearse. */}
          <div className="mt-3 flex flex-wrap gap-2 sm:mt-2 sm:flex-nowrap sm:gap-1.5">
            {isSoldOut ? (
              <span className={`${chipClass} border-red-300/30 bg-red-600/25 font-bold text-red-50`}>Sold Out</span>
            ) : hasLastTickets ? (
              <span className={`${chipClass} border-red-300/20 bg-red-500/15 font-bold text-red-100`}>
                Últimas entradas
              </span>
            ) : null}
            {tags.map((tag) => (
              <span
                key={tag}
                className={`${chipClass} border-violet-300/15 bg-violet-500/10 font-medium text-violet-100/80`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 px-1 sm:justify-end sm:px-0">
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
              Comprar en Bombo
              <span aria-hidden="true">→</span>
            </BuyButton>
          )}
        </div>
      </div>
    </article>
  );
}

function formatEventTime(date: string) {
  return timeFormatter.format(new Date(date)).replace(/[^\d:]/g, "").padStart(5, "0");
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5V12l3 1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" aria-hidden="true">
      <path d="M12 21s6-5.15 6-11a6 6 0 1 0-12 0c0 5.85 6 11 6 11Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
