"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TabHeader } from "@/components/app-header";
import { NavSpacer } from "@/components/bottom-nav";
import { InfoBlock } from "@/components/chips";
import { DateCard, SavedBadge } from "@/components/date-card";
import { GridCard } from "@/components/grid-card";
import { Icon } from "@/components/icons";
import { track } from "@/lib/analytics";
import { readSavedDates, subscribeToSavedDates } from "@/lib/saved-dates";
import type { EventRecord } from "@/types/event";

/**
 * Pantallas 06 y 07 — Mis entradas.
 *
 * La lista sale de `localStorage` y se **rehidrata contra los eventos publicados**: lo que se
 * guardó es un slug, no una copia del evento, así que si la fecha cambió de horario o de
 * venue se muestra el dato actual y no el que estaba vigente el día que se guardó. Las
 * fechas que ya pasaron se descartan solas porque el servidor solo manda las próximas.
 *
 * En pantalla **no se menciona que la lista vive en el dispositivo**. Es una decisión de
 * producto: explicar el mecanismo de almacenamiento no le sirve a nadie que quiera ver a qué
 * hora era la fiesta, y sí siembra la duda de si la entrada está o no está.
 */
export function MyTicketsScreen({
  events,
  weekendEvents
}: {
  events: EventRecord[];
  /** Fechas del finde que se ofrecen cuando la lista está vacía. */
  weekendEvents: EventRecord[];
}) {
  // `localStorage` no existe en el servidor, así que el primer render es siempre vacío. Sin
  // este flag, la pantalla parpadearía mostrando el estado vacío antes de hidratar.
  const [saved, setSaved] = useState<string[] | null>(null);

  useEffect(() => {
    const sync = () => setSaved(readSavedDates().map((item) => item.slug));
    sync();
    return subscribeToSavedDates(sync);
  }, []);

  const list = useMemo(() => {
    if (!saved) return [];
    const savedSet = new Set(saved);
    return events.filter((event) => savedSet.has(event.slug));
  }, [events, saved]);

  if (saved === null) {
    return (
      <div className="app-shell flex min-h-screen flex-col pt-2 lg:pt-0">
        <TabHeader title="Mis entradas" />
      </div>
    );
  }

  if (!list.length) {
    return <EmptyTickets weekendEvents={weekendEvents} />;
  }

  return (
    <div className="app-shell flex min-h-screen flex-col pt-2 lg:pt-0">
      <TabHeader title="Mis entradas" description="Las fechas que fuiste a comprar quedan acá." />

      {/**
       * En desktop el aviso de Bombo pasa a columna lateral. Entre 1024 y 1279 vuelve abajo:
       * con dos columnas de cards y una lateral, el ancho de card quedaría demasiado angosto
       * para el formato horizontal con riel.
       */}
      <div className="col-entradas gutter flex flex-col gap-3 lg:pb-[46px] lg:pt-[26px]">
        <div className="flex flex-col gap-3 lg:gap-5">
          <div className="flex items-center gap-[10px] lg:gap-[14px]">
            <h2 className="dato-seccion lg:!text-[11.5px]">Próximas</h2>
            <span className="h-px flex-1 bg-white/10" />
            <span className="font-mono text-[11px] font-bold leading-none text-white/45 lg:text-[12px]">
              {list.length}
            </span>
          </div>

          {/* Las cards conservan el formato horizontal con riel; lo que cambia es que en
              desktop entran de a dos por fila. */}
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-5">
            {list.map((event) => (
              <Link
                key={event.id}
                href={`/eventos/${event.slug}`}
                onClick={() => track("select_date", { event_slug: event.slug, cta_placement: "mis_entradas_card" })}
              >
                {/* El sello dice "Guardada" y va en gris: no afirmamos que la compra se
                    completó, porque el pago ocurre en Bombo y nunca vuelve a la app.
                    Ninguna card de esta pantalla tiene CTA: acá no se compra. */}
                <DateCard
                  event={event}
                  placement="mis_entradas_card"
                  showFlyer={false}
                  action="none"
                  badge={<SavedBadge />}
                />
              </Link>
            ))}
          </div>
        </div>

        <InfoBlock icon="ticket">
          El ticket con QR está en tu cuenta de Bombo. Acá guardamos la fecha para que no se te pase.
        </InfoBlock>
      </div>

      <NavSpacer />
    </div>
  );
}

/**
 * Pantalla 07 — Mis entradas vacío.
 *
 * "Ver la agenda" es una píldora **delineada**, no chartreuse: lleva a mirar, no a comprar.
 * El único chartreuse de la pantalla es el CTA de la fecha del finde, que es lo que convierte
 * el vacío en una salida en lugar de un callejón.
 */
function EmptyTickets({ weekendEvents }: { weekendEvents: EventRecord[] }) {
  return (
    <div className="app-shell flex min-h-screen flex-col pt-2 lg:pt-0">
      <TabHeader title="Mis entradas" />

      <div className="gutter flex flex-col gap-[14px] lg:gap-9 lg:pb-[46px]">
        <div className="flex flex-col items-center gap-3 rounded-block border border-dashed border-white/20 px-5 py-[26px] text-center lg:mx-auto lg:w-full lg:max-w-[640px] lg:gap-4 lg:p-10">
          <span className="grid h-14 w-14 place-items-center rounded-card bg-surface text-white/35 lg:h-16 lg:w-16 lg:rounded-[18px]">
            <Icon name="ticket" size={28} className="lg:hidden" />
            <Icon name="ticket" size={32} className="hidden lg:block" />
          </span>
          <h2 className="text-[21px] font-bold leading-[1.2] tracking-[-0.025em] lg:text-[28px] lg:leading-[1.15]">
            Todavía no guardaste
            <br className="lg:hidden" /> ninguna fecha
          </h2>
          <p className="text-[13.5px] leading-[1.55] text-white/55 lg:max-w-[420px] lg:text-[14.5px]">
            Cuando toques comprar, la fecha queda acá para que no se te pase.
          </p>
          {/* Delineada y de 260px fijos en desktop: no lleva a comprar, así que no es
              chartreuse, y no se estira con la ventana. */}
          <Link
            href="/"
            className="btn-out t150 mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/40 text-white lg:w-[260px]"
          >
            <Icon name="home" size={16} />
            <span className="text-[14px] font-bold leading-none">Ver la agenda</span>
          </Link>
        </div>

        {/* Las fechas que se ofrecen salen del mismo criterio de finde que la agenda. Si no
            hay ninguna, el bloque no se muestra y queda solo el punteado centrado. */}
        {weekendEvents.length ? (
          <>
            <div className="flex items-center gap-[14px]">
              <h2 className="dato-seccion lg:!text-[11.5px]">Este finde</h2>
              <span className="hidden h-px flex-1 bg-white/10 lg:block" />
            </div>

            <div className="lg:hidden">
              <DateCard event={weekendEvents[0]} placement="mis_entradas_card" />
            </div>

            {/* El único chartreuse de la pantalla son los CTA de estas cards: es lo que
                convierte el vacío en una salida en lugar de un callejón. */}
            <div className="grilla-cards hidden">
              {weekendEvents.map((event) => (
                <GridCard key={event.id} event={event} placement="mis_entradas_card" />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <NavSpacer />
    </div>
  );
}
