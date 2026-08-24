"use client";

import { useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { NavSpacer } from "@/components/bottom-nav";
import { Chip, UrgencyChip } from "@/components/chips";
import { BuyCta, SoldOutCta } from "@/components/cta";
import { DateCard } from "@/components/date-card";
import { Flyer } from "@/components/flyer-image";
import { GridCard } from "@/components/grid-card";
import { WhatsappIconButton } from "@/components/cta";
import { Icon } from "@/components/icons";
import { track } from "@/lib/analytics";
import { formatDato, getDateRail } from "@/lib/dates";
import { buildPriceWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";
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
  nextEvents,
  alertsHref
}: {
  days: DayTile[];
  eventsByDay: Record<string, EventRecord[]>;
  emptyRange: string;
  nextEvents: EventRecord[];
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
    <div className="app-shell flex min-h-screen flex-col">
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
        // En desktop el selector viaja adentro del campo ultramar, a la derecha del titular.
        // Se renderiza también cuando el finde está vacío: los tiles en "—" son parte del
        // mensaje, dicen qué días se miraron.
        aside={<DaySelector days={days} activeKey={activeKey} onSelect={setActiveKey} variant="desktop" />}
      />

      {hasWeekend ? (
        <div className="flex flex-1 flex-col">
          <DaySelector days={days} activeKey={activeKey} onSelect={setActiveKey} />

          {featured ? <FeaturedDate event={featured} /> : null}

          {rest.length ? (
            <>
              {/* Mobile: el día activo como título. Desktop: encabezado mono con el rango del
                  finde, porque la grilla ya no es "el día activo" sino todo lo que queda. */}
              <div className="gutter flex flex-none items-baseline justify-between pt-5 lg:hidden">
                <h2 className="text-[17px] font-bold leading-none tracking-[-0.02em]">
                  {activeDay ? `${dayName(activeDay.weekday)} ${activeDay.day}` : "Más fechas"}
                </h2>
                {/* Va en blanco y no en chartreuse: lleva al listado, no a comprar. */}
                <Link href="/eventos" className="font-mono text-[11px] font-bold uppercase text-white/70">
                  Ver las {activeEvents.length}
                </Link>
              </div>

              <div className="gutter hidden flex-none items-center gap-[14px] pt-[38px] lg:flex">
                <h2 className="dato-seccion !text-[11.5px]">También este finde</h2>
                <span className="h-px flex-1 bg-white/10" />
                <Link href="/eventos" className="t150 text-[12px] font-semibold text-white/50 hover:text-white">
                  Ver toda la agenda
                </Link>
              </div>

              <div className="gutter flex flex-col gap-[11px] pt-3 lg:hidden">
                {rest.map((event) => (
                  <AgendaRow key={event.id} event={event} />
                ))}
              </div>

              <div className="grilla-cards gutter hidden pb-[46px] pt-5">
                {rest.map((event) => (
                  <GridCard key={event.id} event={event} placement="listado_card" />
                ))}
              </div>
            </>
          ) : null}

          <NavSpacer />
        </div>
      ) : (
        <EmptyWeekend range={emptyRange} nextEvents={nextEvents} alertsHref={alertsHref} />
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
  onSelect,
  variant = "mobile"
}: {
  days: DayTile[];
  activeKey: string;
  onSelect: (key: string) => void;
  /**
   * `desktop` es el que va adentro del campo ultramar del hero: tiles de 112px sobre un
   * fondo que ya es azul, así que el inactivo se dibuja con borde claro en vez de con la
   * superficie oscura de las cards.
   */
  variant?: "mobile" | "desktop";
}) {
  const desktop = variant === "desktop";

  return (
    <div
      className={
        desktop ? "flex flex-none gap-3" : "gutter grid flex-none grid-cols-3 gap-[9px] pt-4 lg:hidden"
      }
    >
      {days.map((day) => {
        const empty = day.count === 0;
        // Un día sin fechas nunca se dibuja como activo: en el finde vacío los tres tiles
        // quedan en "—" y ninguno se enciende, que es lo que dice el estado.
        const active = day.key === activeKey && !empty;

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
            className={`t150 text-center ${
              desktop ? "w-28 rounded-2xl px-[6px] py-4" : "rounded-[14px] px-1 py-[11px]"
            } ${
              active
                ? "bg-white text-ink"
                : desktop
                  ? "border border-white/[0.28] bg-ink/[0.28] text-white"
                  : "border border-white/10 bg-surface"
            } ${empty ? (desktop ? "opacity-60" : "opacity-50") : ""}`}
          >
            <span
              className={`block font-mono font-bold uppercase leading-none tracking-[0.18em] ${
                desktop ? "text-[11px]" : "text-[10px]"
              } ${active ? "" : desktop ? "text-white/75" : "text-white/50"}`}
            >
              {day.weekday}
            </span>
            <span
              className={`block font-mono font-extrabold leading-none tabular-nums ${
                desktop ? "mt-2 text-[34px]" : "mt-[5px] text-[25px]"
              } ${active ? "" : desktop ? "" : "text-white/85"}`}
            >
              {day.day}
            </span>
            <span
              className={`block leading-none ${desktop ? "mt-[9px] text-[12px]" : "mt-[6px] text-[11px]"} ${
                active ? "font-bold" : desktop ? "font-semibold text-white/70" : "text-white/50"
              }`}
            >
              {empty ? "—" : day.count === 1 ? "1 fecha" : `${day.count} fechas`}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Fecha destacada.
 *
 * Es el único CTA primario de la pantalla y tiene que quedar visible sin scroll en los dos
 * anchos de referencia: **390×844 en mobile y 1280×800 en desktop**. En mobile el alto del
 * flyer está calzado contra ese presupuesto; en desktop la fecha pasa a dos columnas, que es
 * lo que permite que el flyer crezca a 400px sin empujar el botón abajo del pliegue.
 */
function FeaturedDate({ event }: { event: EventRecord }) {
  const lineup = event.lineup?.filter(Boolean) ?? [];
  const venue = [event.venue_name, event.city].filter(Boolean).join(" · ");
  const soldOut = Boolean(event.sold_out);

  return (
    <div className="gutter flex-none pt-[18px] lg:pt-8">
      <div className="destacada overflow-hidden rounded-block border border-white/10 bg-surface lg:grid lg:items-stretch lg:gap-8 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent">
        <Link
          href={`/eventos/${event.slug}`}
          className="relative block h-[206px] lg:aspect-4/5 lg:h-auto lg:self-start lg:overflow-hidden lg:rounded-block lg:border lg:border-white/10"
        >
          <Flyer src={event.flyer_url} alt={`Flyer de ${event.title}`} sizes="(min-width:1024px) 460px, 354px" priority large />
          {event.last_tickets && !soldOut ? (
            <span className="absolute left-3 top-3 lg:left-4 lg:top-4">
              <UrgencyChip size="md" label="Últimas entradas" />
            </span>
          ) : null}
        </Link>

        <div className="flex flex-col p-4 lg:p-0 lg:py-[6px]">
          {/* La fecha en mono chartreuse es el dato firma del sistema tipográfico. */}
          <p className="font-mono text-[12px] font-bold uppercase leading-none tracking-[0.05em] text-cta lg:text-[12.5px]">
            {formatDato(event.starts_at)}
          </p>
          <h2 className="display mt-[9px] text-[27px] leading-[0.98] tracking-[-0.035em] lg:mt-4 lg:text-[52px] lg:leading-[0.94]">
            {event.title}
          </h2>
          {venue ? (
            <p className="mt-[9px] flex items-center gap-[6px] text-[13px] leading-none text-white/60 lg:mt-[18px] lg:gap-2 lg:text-[15px]">
              <Icon name="pin" size={14} className="lg:hidden" />
              <Icon name="pin" size={16} className="hidden lg:block" />
              <span className="truncate">{venue}</span>
            </p>
          ) : null}
          {lineup.length ? (
            <p className="mt-[6px] line-clamp-2 text-[12.5px] leading-[1.4] text-white/45 lg:hidden">
              {lineup.join(" · ")}
            </p>
          ) : null}

          {/* En desktop hay lugar para la descripción cargada desde el admin; si la fecha no
              la tiene, cae al lineup para no dejar el bloque mudo. */}
          <p className="mt-[6px] hidden max-w-[520px] text-[14.5px] leading-[1.6] text-white/55 lg:mt-[14px] lg:block">
            {event.description?.trim() || lineup.join(" · ")}
          </p>

          {event.genre ? (
            <div className="mt-3 hidden gap-2 lg:mt-[18px] lg:flex">
              <Chip size="sm" className="!border-white/[0.16] !text-white/60">
                {event.genre}
              </Chip>
            </div>
          ) : null}

          {soldOut ? (
            <SoldOutCta className="mt-[15px] lg:mt-auto lg:max-w-[520px] lg:pt-7" />
          ) : (
            <div className="mt-[15px] flex gap-3 lg:mt-auto lg:max-w-[520px] lg:pt-7">
              <BuyCta event={event} placement="home_destacado" className="!h-[52px] flex-1 lg:!h-14" />
              <WhatsappIconButton
                href={whatsappUrlOrGroup(buildPriceWhatsappMessage(event.title))}
                source="event_price"
                eventSlug={event.slug}
                className="hidden lg:grid"
              />
            </div>
          )}

          {/* La expectativa va antes del clic: descubrir que la compra termina afuera después
              de tocar es donde se pierde la gente. En mobile esta línea vive en el detalle. */}
          <p className="mt-3 hidden items-center gap-2 text-[12.5px] leading-none text-white/45 lg:flex">
            <Icon name="shield" size={14} />
            Link oficial · precio y lotes actualizados en Bombo
          </p>
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
 * Nunca es un callejón: adelanta las próximas fechas confirmadas con su CTA y ofrece la
 * alerta. El único chartreuse de la pantalla es el CTA de esas fechas; "Activar alertas" va
 * delineado porque no lleva a comprar.
 *
 * En desktop pasa a dos columnas: el punteado y la próxima fecha a la izquierda, y el bloque
 * de alertas como columna lateral que **nunca se estira a ancho completo**. Es lo que evita
 * que una pantalla sin contenido se vea como una pantalla rota.
 */
function EmptyWeekend({
  range,
  nextEvents,
  alertsHref
}: {
  range: string;
  nextEvents: EventRecord[];
  alertsHref: string;
}) {
  return (
    <div className="col-vacio gutter flex flex-1 flex-col gap-[14px] pt-4 lg:pb-[46px] lg:pt-9">
      <div className="contents lg:flex lg:flex-col lg:gap-[26px]">
        <div className="flex flex-none flex-col items-center gap-[11px] rounded-block border border-dashed border-white/20 p-5 text-center lg:gap-[14px] lg:p-9">
          <span className="flex items-center gap-2 text-white/45">
            <Icon name="cal" size={16} />
            <span className="font-mono text-[11px] font-bold uppercase leading-none tracking-[0.16em] lg:text-[12px]">
              {range}
            </span>
          </span>
          <h2 className="text-[22px] font-bold leading-[1.15] tracking-[-0.025em] lg:text-[30px]">
            Todavía no hay fechas confirmadas
          </h2>
          <p className="text-[13.5px] leading-[1.55] text-white/55 lg:max-w-[460px] lg:text-[15px] lg:leading-[1.6]">
            Publicamos los jueves. Cuando entra algo, aparece acá primero.
          </p>
        </div>

        {nextEvents.length ? (
          <>
            <p className="dato-seccion flex-none lg:!text-[11.5px]">Lo próximo confirmado</p>
            <div className="flex-none">
              <div className="flex flex-col gap-3 lg:hidden">
                {nextEvents.map((event) => (
                  <DateCard
                    key={event.id}
                    event={event}
                    placement="vacio_proxima"
                    showFlyer={false}
                    railBottom="month"
                  />
                ))}
              </div>
              {/* En desktop las próximas fechas usan la card de grilla, en una grilla de 2 que
                  deja respirar la columna aunque haya una sola. */}
              <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
                {nextEvents.map((event) => (
                  <GridCard key={event.id} event={event} placement="vacio_proxima" />
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="trama flex flex-none flex-col gap-3 rounded-block p-4 lg:p-6">
        <div className="flex items-start gap-[11px]">
          <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[11px] bg-ink/35 text-white">
            <Icon name="bell" size={20} />
          </span>
          <span>
            <span className="block text-[17px] font-bold leading-[1.15] tracking-[-0.02em] lg:text-[19px]">
              ¿Te aviso apenas confirme?
            </span>
            <span className="mt-[6px] block text-[12.5px] leading-[1.5] text-white/80 lg:text-[13.5px]">
              Nuevas fechas, preventas y últimas entradas. Solo lo importante.
            </span>
          </span>
        </div>
        <a
          href={alertsHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("click_whatsapp_group", { wa_source: "home_alerts" })}
          className="btn-out t150 flex h-12 items-center justify-center gap-2 rounded-full border border-white/40 text-white"
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
