"use client";

import { useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { NavSpacer } from "@/components/bottom-nav";
import { UrgencyChip } from "@/components/chips";
import { BuyCta, SoldOutCta } from "@/components/cta";
import { DateCard } from "@/components/date-card";
import { Flyer } from "@/components/flyer-image";
import { Icon } from "@/components/icons";
import { track } from "@/lib/analytics";
import { formatDato, getDateRail } from "@/lib/dates";
import type { EventRecord } from "@/types/event";

export type DayTile = {
  key: string;
  weekday: string;
  day: string;
  count: number;
};

/**
 * Pantalla 01 (Home / descubrimiento) y pantalla 05 (estado vacío).
 *
 * Son la misma ruta y comparten el header de marca: el vacío **no es un error**, es la misma
 * agenda cuando todavía no hay fechas cargadas para el finde. Por eso conserva la marca
 * intacta, ofrece siempre una fecha confirmada y una forma de que le avisemos, en lugar de
 * mostrar un cartel de "no hay nada".
 */
export function AgendaScreen({
  days,
  eventsByDay,
  emptyRange,
  nextEvent,
  alertsHref
}: {
  days: DayTile[];
  eventsByDay: Record<string, EventRecord[]>;
  emptyRange: string;
  nextEvent: EventRecord | null;
  alertsHref: string;
}) {
  // Arranca en el primer día con fechas: abrir en un día vacío desperdicia la pantalla que
  // más tráfico recibe.
  const firstWithEvents = days.find((day) => day.count > 0) ?? days[0];
  const [activeKey, setActiveKey] = useState(firstWithEvents?.key ?? "");

  const activeEvents = eventsByDay[activeKey] ?? [];
  const hasWeekend = days.some((day) => day.count > 0);

  // La fecha destacada es la marcada como `featured` del día activo; si no hay ninguna, la
  // primera del día. Nunca una fecha agotada: destacar algo que no se puede comprar gasta el
  // mejor espacio de la app.
  const featured =
    activeEvents.find((event) => event.featured && !event.sold_out) ??
    activeEvents.find((event) => !event.sold_out) ??
    activeEvents[0] ??
    null;
  const rest = activeEvents.filter((event) => event.id !== featured?.id);
  const activeDay = days.find((day) => day.key === activeKey);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        title={
          <>
            Qué suena
            <br />
            este finde
          </>
        }
        showAlerts={hasWeekend}
        showCredential={hasWeekend}
      />

      {hasWeekend ? (
        <div className="flex flex-1 flex-col">
          <DaySelector days={days} activeKey={activeKey} onSelect={setActiveKey} />

          {featured ? <FeaturedDate event={featured} /> : null}

          {rest.length ? (
            <>
              <div className="flex flex-none items-baseline justify-between px-[18px] pt-5">
                <h2 className="text-[17px] font-bold leading-none tracking-[-0.02em]">
                  {activeDay ? `${dayName(activeDay.weekday)} ${activeDay.day}` : "Más fechas"}
                </h2>
                {/* Va en blanco y no en chartreuse: lleva al listado, no a comprar. */}
                <Link href="/eventos" className="font-mono text-[11px] font-bold uppercase text-white/70">
                  Ver las {activeEvents.length}
                </Link>
              </div>

              <div className="flex flex-col gap-[11px] px-[18px] pt-3">
                {rest.map((event) => (
                  <AgendaRow key={event.id} event={event} />
                ))}
              </div>
            </>
          ) : null}

          <NavSpacer />
        </div>
      ) : (
        <EmptyWeekend range={emptyRange} nextEvent={nextEvent} alertsHref={alertsHref} />
      )}
    </div>
  );
}

/**
 * Selector de tres días.
 *
 * El día activo usa **blanco sobre ink**, nunca chartreuse: seleccionar un día no es comprar,
 * y si el selector se pintara del color de compra el usuario dejaría de poder leer el
 * chartreuse como señal.
 */
function DaySelector({
  days,
  activeKey,
  onSelect
}: {
  days: DayTile[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="grid flex-none grid-cols-3 gap-[9px] px-[18px] pt-4">
      {days.map((day) => {
        const active = day.key === activeKey;
        const empty = day.count === 0;

        return (
          <button
            key={day.key}
            type="button"
            onClick={() => {
              if (empty) return;
              onSelect(day.key);
              track("select_day", { day: day.key, results: day.count });
            }}
            aria-pressed={active}
            disabled={empty}
            className={`rounded-[14px] px-1 py-[11px] text-center ${
              active ? "bg-white text-ink" : "border border-white/10 bg-surface"
            } ${empty ? "opacity-50" : ""}`}
          >
            <span
              className={`block font-mono text-[10px] font-bold uppercase leading-none tracking-[0.18em] ${
                active ? "" : "text-white/50"
              }`}
            >
              {day.weekday}
            </span>
            <span
              className={`mt-[5px] block font-mono text-[25px] font-extrabold leading-none tabular-nums ${
                active ? "" : "text-white/85"
              }`}
            >
              {day.day}
            </span>
            <span className={`mt-[6px] block text-[11px] leading-none ${active ? "font-bold" : "text-white/50"}`}>
              {empty ? "—" : day.count === 1 ? "1 fecha" : `${day.count} fechas`}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Fecha destacada. Es el único CTA primario de la pantalla y tiene que quedar **visible sin
 * scroll en 390×844**, así que el alto del flyer está calzado contra ese presupuesto: header
 * + selector + flyer + datos + botón entran justo arriba del pliegue.
 */
function FeaturedDate({ event }: { event: EventRecord }) {
  const lineup = event.lineup?.filter(Boolean) ?? [];
  const venue = [event.venue_name, event.city].filter(Boolean).join(" · ");
  const soldOut = Boolean(event.sold_out);

  return (
    <div className="flex-none px-[18px] pt-[18px]">
      <div className="overflow-hidden rounded-block border border-white/10 bg-surface">
        <Link href={`/eventos/${event.slug}`} className="relative block h-[206px]">
          <Flyer src={event.flyer_url} alt={`Flyer de ${event.title}`} sizes="354px" priority large />
          {event.last_tickets && !soldOut ? (
            <span className="absolute left-3 top-3">
              <UrgencyChip size="md" label="Últimas entradas" />
            </span>
          ) : null}
        </Link>

        <div className="p-4">
          {/* La fecha en mono chartreuse es el dato firma del sistema tipográfico. */}
          <p className="font-mono text-[12px] font-bold uppercase leading-none tracking-[0.05em] text-cta">
            {formatDato(event.starts_at)}
          </p>
          <h2 className="display mt-[9px] text-[27px] leading-[0.98] tracking-[-0.035em]">{event.title}</h2>
          {venue ? (
            <p className="mt-[9px] flex items-center gap-[6px] text-[13px] leading-none text-white/60">
              <Icon name="pin" size={14} />
              <span className="truncate">{venue}</span>
            </p>
          ) : null}
          {lineup.length ? (
            <p className="mt-[6px] line-clamp-2 text-[12.5px] leading-[1.4] text-white/45">{lineup.join(" · ")}</p>
          ) : null}

          {soldOut ? (
            <SoldOutCta className="mt-[15px]" />
          ) : (
            <BuyCta event={event} placement="home_destacado" className="mt-[15px] !h-[52px]" />
          )}
        </div>
      </div>
    </div>
  );
}

/** Fila compacta del día activo: el riel tramado con la hora reemplaza al flyer. */
function AgendaRow({ event }: { event: EventRecord }) {
  const rail = getDateRail(event.starts_at);
  const lineup = event.lineup?.filter(Boolean) ?? [];
  const venue = [event.venue_name, event.city].filter(Boolean).join(" · ");
  const [hour, minute] = rail.time.split(":");

  return (
    <Link
      href={`/eventos/${event.slug}`}
      onClick={() => track("select_date", { event_slug: event.slug, cta_placement: "home_agenda" })}
      className={`flex items-center gap-[11px] ${event.sold_out ? "opacity-55" : ""}`}
    >
      <span className="trama-fuerte flex h-[58px] w-[58px] flex-none flex-col items-center justify-center rounded-xl font-mono">
        <span className="text-[19px] font-extrabold leading-none tabular-nums">{hour}</span>
        <span className="mt-[3px] text-[8px] font-bold leading-none tracking-[0.14em]">:{minute}</span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-bold leading-[1.1] tracking-[-0.02em]">{event.title}</span>
        {venue ? <span className="mt-[5px] block truncate text-[12px] leading-none text-white/55">{venue}</span> : null}
        {lineup.length ? (
          <span className="mt-1 block truncate text-[11.5px] leading-none text-white/40">{lineup.join(" · ")}</span>
        ) : null}
      </span>

      {event.sold_out ? (
        <span className="grid h-9 w-9 flex-none place-items-center rounded-full border border-white/10 bg-surface-alt text-white/[0.34]">
          <Icon name="x" size={15} />
        </span>
      ) : (
        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-cta text-ink">
          <Icon name="arrow" size={17} />
        </span>
      )}
    </Link>
  );
}

/**
 * Pantalla 05 — el finde sin fechas.
 *
 * Nunca es un callejón: adelanta la próxima fecha confirmada con su CTA y ofrece la alerta.
 * El único chartreuse de la pantalla es el CTA de esa fecha; "Activar alertas" va delineado
 * porque no lleva a comprar.
 */
function EmptyWeekend({
  range,
  nextEvent,
  alertsHref
}: {
  range: string;
  nextEvent: EventRecord | null;
  alertsHref: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-[14px] px-[18px] pt-4">
      <div className="flex flex-none flex-col items-center gap-[11px] rounded-block border border-dashed border-white/20 p-5 text-center">
        <span className="flex items-center gap-2 text-white/45">
          <Icon name="cal" size={16} />
          <span className="font-mono text-[11px] font-bold uppercase leading-none tracking-[0.16em]">{range}</span>
        </span>
        <h2 className="text-[22px] font-bold leading-[1.15] tracking-[-0.025em]">
          Todavía no hay fechas confirmadas
        </h2>
        <p className="text-[13.5px] leading-[1.55] text-white/55">
          Publicamos los jueves. Cuando entra algo, aparece acá primero.
        </p>
      </div>

      {nextEvent ? (
        <>
          <p className="dato-seccion flex-none">Lo próximo confirmado</p>
          <div className="flex-none">
            <DateCard event={nextEvent} placement="vacio_proxima" showFlyer={false} railBottom="month" />
          </div>
        </>
      ) : null}

      <div className="trama flex flex-none flex-col gap-3 rounded-block p-4">
        <div className="flex items-start gap-[11px]">
          <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[11px] bg-ink/35 text-white">
            <Icon name="bell" size={20} />
          </span>
          <span>
            <span className="block text-[17px] font-bold leading-[1.15] tracking-[-0.02em]">
              ¿Te aviso apenas confirme?
            </span>
            <span className="mt-[6px] block text-[12.5px] leading-[1.5] text-white/80">
              Nuevas fechas, preventas y últimas entradas. Solo lo importante.
            </span>
          </span>
        </div>
        <a
          href={alertsHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("click_whatsapp_group", { wa_source: "home_alerts" })}
          className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/40 text-white"
        >
          <Icon name="bell" size={16} />
          <span className="text-[14px] font-bold leading-none">Activar alertas</span>
        </a>
      </div>

      <NavSpacer />
    </div>
  );
}

function dayName(weekday: string) {
  const names: Record<string, string> = {
    VIE: "Viernes",
    SÁB: "Sábado",
    SAB: "Sábado",
    DOM: "Domingo"
  };
  return names[weekday] ?? weekday;
}
