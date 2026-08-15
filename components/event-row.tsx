import Link from "next/link";
import { BuyButton } from "@/components/buy-button";
import { Fire, MapPin, ProhibitInset, Ticket } from "@phosphor-icons/react/dist/ssr";
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
 *
 * El riel de fecha vive a la izquierda **en las dos densidades**. Antes el bloque en mono
 * —el elemento más distintivo del sitio— era `hidden sm:block`, así que en mobile, que es de
 * donde entra la mayoría del tráfico, la firma de la marca simplemente no existía: se
 * reemplazaba por un badge negro chico encima del flyer, apilado con los chips de estado.
 * Ahora el riel es la columna que ordena la agenta en cualquier ancho, y es también donde
 * cae el troquelado que se repite en tarjeta y detalle.
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
    "inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-brand min-h-11 px-4 text-center text-xs font-black text-brand-ink sm:min-h-0 sm:py-2.5 shadow-[0_8px_24px_-10px_rgba(61,232,245,0.45)] transition hover:bg-brand-strong sm:w-[170px]";
  const chipClass =
    "whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] sm:px-2 sm:text-[10px]";

  return (
    <div className="ticket-elev">
      <article className="ticket-cut group grid w-full max-w-full grid-cols-[84px_minmax(0,1fr)] overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.035] transition duration-300 hover:border-brand/25 hover:bg-white/[0.06] sm:grid-cols-[84px_100px_minmax(0,1fr)_auto] sm:items-center">
        <DateRail badge={badge} time={eventTime} />

        <Link
          href={`/eventos/${event.slug}`}
          className="flyer-glow-sm relative m-3 h-28 overflow-hidden rounded-[12px] bg-white/5 sm:my-4 sm:ml-4 sm:mr-0 sm:h-[112px] lg:h-[118px]"
        >
          {event.flyer_url ? (
            <FlyerImage
              src={event.flyer_url}
              alt={`Flyer de ${event.title}`}
              sizes="(max-width: 640px) 70vw, 100px"
              priority={priority}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <FlyerFallback size="text-2xl" />
          )}
          {/* Solo mobile: en desktop estos badges duplicarían el chip de la columna de texto
              y, con el flyer más chico, taparían el arte entero. */}
          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-2 sm:hidden">
            {event.featured ? (
              <span className="rounded-full bg-brand px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-brand-ink">
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
        </Link>

        <div className="col-start-2 min-w-0 px-3 pb-3 sm:col-start-auto sm:px-4 sm:py-4">
          <Link href={`/eventos/${event.slug}`}>
            {/* En desktop el nombre entra completo y, si alguno fuera muy largo, baja a una
                segunda línea. En mobile ahora hay ancho suficiente para dos líneas. */}
            <h3 className="font-display line-clamp-2 text-lg font-black leading-tight tracking-[-0.02em] text-white sm:text-xl">
              {event.title}
            </h3>
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-white/62">
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin size={14} weight="fill" aria-hidden="true" />
              <span className="min-w-0 break-words sm:truncate">{event.venue_name || "Venue a confirmar"}</span>
            </span>
          </div>
          {/* En una sola línea en desktop: al envolver, unas filas quedaban más altas que
              otras y los botones dejaban de alinearse. */}
          <div className="mt-3 flex flex-wrap gap-2 sm:mt-2 sm:flex-nowrap sm:gap-1.5">
            {isSoldOut ? (
              <span className={`${chipClass} inline-flex items-center gap-1 border-red-300/30 bg-red-600/25 font-bold text-red-50`}>
                <ProhibitInset size={12} weight="fill" aria-hidden="true" />
                Sold Out
              </span>
            ) : hasLastTickets ? (
              <span className={`${chipClass} inline-flex items-center gap-1 border-red-300/20 bg-red-500/15 font-bold text-red-100`}>
                <Fire size={12} weight="fill" aria-hidden="true" />
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

        <div className="col-start-2 flex min-w-0 px-3 pb-3 sm:col-start-auto sm:justify-end sm:px-4 sm:pb-0">
          {isSoldOut ? (
            <WhatsappLink
              href={whatsappUrlOrGroup(buildWaitlistWhatsappMessage(event.title))}
              source="soldout"
              eventSlug={event.slug}
              className={`${ctaClass} !bg-emerald-400 !text-black shadow-none hover:!bg-emerald-300`}
            >
              Avisame si se libera
            </WhatsappLink>
          ) : (
            <BuyButton event={event} placement={placement} className={ctaClass}>
              <Ticket size={16} weight="fill" aria-hidden="true" />
              Comprar en Bombo
            </BuyButton>
          )}
        </div>
      </article>
    </div>
  );
}

/**
 * Riel de fecha: el elemento firma del sitio.
 *
 * Se lee como una grilla de horarios impresa —día de la semana, número, mes, hora— en mono
 * con cifras tabulares, así que la columna alinea verticalmente entre filas y la agenda se
 * escanea de un vistazo. Es lo único que se repite idéntico en fila, tarjeta y detalle, y
 * por eso es donde vive la identidad.
 */
function DateRail({
  badge,
  time
}: {
  badge: { day: string; month: string; weekday: string };
  time: string;
}) {
  return (
    <div className="ticket-perf row-span-3 flex h-full flex-col items-center justify-start bg-black/25 bg-right px-2 py-5 text-center sm:row-span-1 sm:justify-center sm:py-4">
      <p className="tabular text-[9px] uppercase tracking-[0.24em] text-brand">{badge.weekday}</p>
      <p className="tabular mt-1 text-[30px] font-medium leading-none text-white">{badge.day}</p>
      <p className="tabular mt-1 text-[10px] uppercase tracking-[0.2em] text-white/62">{badge.month}</p>
      <span className="mt-2.5 block h-px w-5 bg-white/20" aria-hidden="true" />
      <p className="tabular mt-2 text-[11px] leading-none text-white/48">{time}</p>
    </div>
  );
}

function formatEventTime(date: string) {
  return timeFormatter.format(new Date(date)).replace(/[^\d:]/g, "").padStart(5, "0");
}
