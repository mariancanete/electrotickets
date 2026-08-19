import { Chip, UrgencyChip } from "@/components/chips";
import { CardCta, SoldOutCta } from "@/components/cta";
import { Flyer } from "@/components/flyer-image";
import { Icon } from "@/components/icons";
import type { CtaPlacement } from "@/lib/analytics";
import { getDateRail } from "@/lib/dates";
import type { EventRecord } from "@/types/event";

/**
 * Card de fecha — el componente que más se repite en la app.
 *
 * Es **una sola card** para el listado, la búsqueda, el estado vacío y mis entradas. La
 * pantalla 08 en particular no tiene card propia: una card de resultado que se ve distinta a
 * una card de agenda obliga al usuario a releer la misma información dos veces con dos
 * formas distintas.
 *
 * Estructura fija: riel de 66px a la izquierda con la fecha en mono sobre ultramar tramado, y
 * el cuerpo con flyer, título, venue, lineup, chips y el CTA que cierra la card. **Ninguna
 * card queda sin acción**: si la fecha está agotada, el CTA se muestra deshabilitado en lugar
 * de desaparecer, porque una card sin botón se lee como un error de carga.
 *
 * La card conserva su alto natural y nunca se comprime: el listado scrollea.
 */
export function DateCard({
  event,
  placement,
  showFlyer = true,
  railBottom = "time",
  badge,
  action = "cta",
  priority = false
}: {
  event: EventRecord;
  placement: CtaPlacement;
  showFlyer?: boolean;
  /** `time` para fechas de la agenda; `month` cuando la fecha está lejos y el mes importa más. */
  railBottom?: "time" | "month";
  /** Sello a la derecha del título. Hoy solo lo usa "Guardada" en Mis entradas. */
  badge?: React.ReactNode;
  /** `none` para las cards que no ofrecen acción propia (la card entera ya es el link). */
  action?: "cta" | "none";
  priority?: boolean;
}) {
  const rail = getDateRail(event.starts_at);
  const soldOut = Boolean(event.sold_out);
  const lineup = event.lineup?.filter(Boolean) ?? [];
  const venue = [event.venue_name, event.city].filter(Boolean).join(" · ");

  return (
    <article
      className={`card-hov t150 grid grid-cols-[66px_1fr] overflow-hidden rounded-card border border-white/10 bg-surface lg:grid-cols-[78px_1fr] ${
        soldOut ? "opacity-55" : ""
      }`}
    >
      {/* Riel de fecha. Agotada pierde la trama y baja a surface-alt: el bloque de marca no
          se le presta a una fecha que ya no se puede comprar. */}
      <div
        className={`flex flex-col items-center justify-center gap-[3px] font-mono ${
          soldOut ? "bg-surface-alt text-white/50" : "trama-fuerte"
        }`}
      >
        <span className="text-[9px] font-bold uppercase leading-none tracking-[0.18em] text-white/85">
          {rail.weekday}
        </span>
        <span className="text-[26px] font-extrabold leading-none tabular-nums lg:text-[29px]">{rail.day}</span>
        <span className="text-[9px] font-bold uppercase leading-none tracking-[0.14em] text-white/85">
          {railBottom === "month" ? rail.month : rail.time}
        </span>
      </div>

      <div className="flex flex-col gap-[10px] p-[13px] lg:gap-3 lg:px-[18px] lg:py-4">
        <div className="flex gap-[11px]">
          {showFlyer ? (
            <div className="relative h-[78px] w-[62px] flex-none overflow-hidden rounded-[10px]">
              <Flyer
                src={event.flyer_url}
                alt={`Flyer de ${event.title}`}
                sizes="62px"
                priority={priority}
              />
            </div>
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
            <div className="flex items-start justify-between gap-[10px]">
              <h3 className="text-[18px] font-bold leading-[1.05] tracking-[-0.02em] lg:text-[20px] lg:tracking-[-0.025em]">
                {event.title}
              </h3>
              {badge}
            </div>

            {venue ? (
              <p className="flex items-center gap-[5px] text-[11.5px] leading-none text-white/[0.58]">
                <Icon name="pin" size={12} />
                <span className="truncate">{venue}</span>
              </p>
            ) : null}

            {lineup.length ? (
              <p className="line-clamp-2 text-[11.5px] leading-[1.35] text-white/[0.42]">{lineup.join(" · ")}</p>
            ) : null}

            {/* Sold out y últimas entradas nunca conviven: una fecha agotada no puede estar
                además por agotarse. */}
            {!soldOut && (event.last_tickets || event.genre) ? (
              <div className="mt-[2px] flex flex-wrap gap-[6px]">
                {event.last_tickets ? <UrgencyChip size="sm" /> : null}
                {event.genre ? (
                  <Chip size="sm" className="!border-white/[0.16] !text-white/60">
                    {event.genre}
                  </Chip>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {action === "none" ? null : soldOut ? (
          <SoldOutCta compact />
        ) : (
          <CardCta event={event} placement={placement} />
        )}
      </div>
    </article>
  );
}

/** Sello gris de Mis entradas. No afirma que la compra se completó, porque no lo sabemos. */
export function SavedBadge() {
  return (
    <span className="flex-none rounded-full border border-white/[0.22] px-[9px] py-[6px] text-[10px] font-semibold leading-none text-white/60">
      Guardada
    </span>
  );
}
