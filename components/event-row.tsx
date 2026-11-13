"use client";

import Link from "next/link";
import { UrgencyChip } from "@/components/chips";
import { FlyerFrame } from "@/components/flyer-image";
import { Icon } from "@/components/icons";
import { eventParams, track, type CtaPlacement } from "@/lib/analytics";
import { getDateRail } from "@/lib/dates";
import { getEventCity } from "@/lib/event-seo";
import type { EventRecord } from "@/types/event";

/**
 * Fila compacta de agenda: flyer, fecha, artistas, venue · ciudad y horario, siempre en el
 * mismo orden. Ocho fechas son ocho filas, no ocho pantallas de scroll.
 *
 * Abre el detalle, no Bombo: dispara `select_date` con su `placement`.
 */
export function EventRow({ event, placement }: { event: EventRecord; placement: CtaPlacement }) {
  const rail = getDateRail(event.starts_at);
  const soldOut = Boolean(event.sold_out);
  const place = [event.venue_name, getEventCity(event)].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/eventos/${event.slug}`}
      onClick={() => track("select_date", { ...eventParams(event), cta_placement: placement })}
      className="card-hov t150 vidrio flex items-center gap-3 rounded-card p-[10px]"
    >
      <FlyerFrame
        src={event.flyer_url}
        alt=""
        sizes="56px"
        ratio={event.flyer_ratio}
        maxRatio={1.25}
        className={`w-14 flex-none rounded-[12px] ${soldOut ? "opacity-45" : ""}`}
      />

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={`font-mono text-[11.5px] font-bold uppercase leading-none tracking-[0.06em] ${
            soldOut ? "text-white/70" : "text-cta"
          }`}
        >
          {rail.weekday} {Number(rail.day)} {rail.month} · {rail.time}
        </span>
        <span className="truncate text-[16px] font-extrabold uppercase leading-[1.15]">{event.title}</span>
        {place ? <span className="truncate text-[12.5px] font-medium leading-[1.2] text-white/70">{place}</span> : null}
        {soldOut ? (
          <span className="mt-[2px] self-start rounded-lg border border-white/30 px-2 py-[3px] text-[11px] font-extrabold uppercase leading-none tracking-[0.08em] text-white/80">
            Agotado
          </span>
        ) : event.last_tickets ? (
          <span className="mt-[2px] flex">
            <UrgencyChip size="sm" />
          </span>
        ) : null}
      </span>

      <Icon name="arrow" size={18} className="flex-none text-white/70" />
    </Link>
  );
}
