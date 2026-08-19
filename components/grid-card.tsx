import Link from "next/link";
import { Chip, UrgencyChip } from "@/components/chips";
import { CardCta, SoldOutCta } from "@/components/cta";
import { Flyer } from "@/components/flyer-image";
import { Icon } from "@/components/icons";
import type { CtaPlacement } from "@/lib/analytics";
import { getDateRail } from "@/lib/dates";
import type { EventRecord } from "@/types/event";

/**
 * Card de grilla — la card de fecha de la §5 **reflowada**, no un componente nuevo.
 *
 * Es la misma jerarquía y son los mismos tokens que la card horizontal de mobile: lo único
 * que cambia es que el flyer pasa de miniatura de 62×78 a bloque 4:5 arriba, y el riel de
 * fecha se convierte en un chip ultramar con la misma trama de 7px, apoyado sobre el flyer.
 * El cuerpo conserva título, venue con pin, lineup, chips y el CTA compacto cerrando la card.
 *
 * **Ninguna card queda sin acción**: la agotada muestra el CTA deshabilitado en lugar de
 * perderlo, igual que en mobile.
 *
 * Toda la card lleva al detalle, sin anidar un link dentro de otro: el título estira su área
 * de clic sobre la card entera con un pseudo-elemento, y el CTA compacto se apoya por encima
 * para capturar su propio clic y disparar su propia medición.
 */
export function GridCard({
  event,
  placement,
  priority = false
}: {
  event: EventRecord;
  placement: CtaPlacement;
  priority?: boolean;
}) {
  const rail = getDateRail(event.starts_at);
  const soldOut = Boolean(event.sold_out);
  const lineup = event.lineup?.filter(Boolean) ?? [];
  const venue = [event.venue_name, event.city].filter(Boolean).join(" · ");

  return (
    <article
      className={`card-hov t150 relative flex flex-col overflow-hidden rounded-card border border-white/10 bg-surface ${
        soldOut ? "opacity-55" : ""
      }`}
    >
      <div className="relative aspect-4/5 overflow-hidden">
        <div className="card-flyer t150 absolute inset-0">
          <Flyer src={event.flyer_url} alt={`Flyer de ${event.title}`} sizes="(min-width:1440px) 320px, 380px" priority={priority} large />
        </div>

        {/* El riel de fecha, convertido en chip. Agotada pierde la trama y baja a surface-alt:
            el bloque de marca no se le presta a una fecha que ya no se puede comprar. */}
        <span
          className={`absolute left-3 top-3 flex flex-col items-center gap-[2px] rounded-xl px-3 py-[9px] font-mono ${
            soldOut ? "bg-surface-alt text-white/50" : "trama-fuerte"
          }`}
        >
          <span className="text-[9px] font-bold uppercase leading-none tracking-[0.18em] text-white/85">
            {rail.weekday}
          </span>
          <span className="text-[21px] font-extrabold leading-none tabular-nums">{rail.day}</span>
          <span className="text-[8.6px] font-bold leading-none tracking-[0.12em] text-white/85">{rail.time}</span>
        </span>

        {event.last_tickets && !soldOut ? (
          <span className="absolute right-3 top-3">
            <UrgencyChip size="sm" />
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-[9px] p-4">
        <h3 className="text-[20px] font-bold leading-[1.05] tracking-[-0.025em]">
          <Link href={`/eventos/${event.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {event.title}
          </Link>
        </h3>

        {venue ? (
          <p className="flex items-center gap-[6px] text-[12.5px] leading-none text-white/[0.58]">
            <Icon name="pin" size={13} />
            <span className="truncate">{venue}</span>
          </p>
        ) : null}

        {lineup.length ? (
          <p className="line-clamp-2 text-[12.5px] leading-[1.4] text-white/[0.42]">{lineup.join(" · ")}</p>
        ) : null}

        {!soldOut && event.genre ? (
          <div className="flex flex-wrap gap-[6px]">
            <Chip size="sm" className="!border-white/[0.16] !text-white/60">
              {event.genre}
            </Chip>
          </div>
        ) : null}

        <div className="relative z-10 mt-auto pt-[6px]">
          {soldOut ? <SoldOutCta compact /> : <CardCta event={event} placement={placement} />}
        </div>
      </div>
    </article>
  );
}

/**
 * Card de fecha responsive: horizontal en mobile, de grilla en desktop.
 *
 * Existe para no repetir el par en cada pantalla. Las dos variantes se alternan por CSS, así
 * que en cada ancho hay exactamente una en el árbol de accesibilidad.
 */
export function ResponsiveDateCard({
  event,
  placement,
  priority = false,
  mobile
}: {
  event: EventRecord;
  placement: CtaPlacement;
  priority?: boolean;
  mobile: React.ReactNode;
}) {
  return (
    <>
      <div className="lg:hidden">{mobile}</div>
      <div className="hidden lg:block">
        <GridCard event={event} placement={placement} priority={priority} />
      </div>
    </>
  );
}
