"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TabHeader } from "@/components/app-header";
import { NavSpacer } from "@/components/bottom-nav";
import { InfoBlock } from "@/components/chips";
import { DateCard, SavedBadge } from "@/components/date-card";
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
  weekendEvent
}: {
  events: EventRecord[];
  weekendEvent: EventRecord | null;
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
      <div className="flex min-h-screen flex-col pt-2">
        <TabHeader title="Mis entradas" />
      </div>
    );
  }

  if (!list.length) {
    return <EmptyTickets weekendEvent={weekendEvent} />;
  }

  return (
    <div className="flex min-h-screen flex-col pt-2">
      <TabHeader title="Mis entradas" description="Las fechas que fuiste a comprar quedan acá." />

      <div className="flex flex-col gap-3 px-[18px]">
        <div className="flex items-center gap-[10px]">
          <h2 className="dato-seccion">Próximas</h2>
          <span className="h-px flex-1 bg-white/10" />
          <span className="font-mono text-[11px] font-bold leading-none text-white/45">{list.length}</span>
        </div>

        {list.map((event) => (
          <Link
            key={event.id}
            href={`/eventos/${event.slug}`}
            onClick={() => track("select_date", { event_slug: event.slug, cta_placement: "mis_entradas_card" })}
          >
            {/* El sello dice "Guardada" y va en gris: no afirmamos que la compra se completó,
                porque el pago ocurre en Bombo y nunca vuelve a la app. */}
            <DateCard
              event={event}
              placement="mis_entradas_card"
              showFlyer={false}
              action="none"
              badge={<SavedBadge />}
            />
          </Link>
        ))}

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
function EmptyTickets({ weekendEvent }: { weekendEvent: EventRecord | null }) {
  return (
    <div className="flex min-h-screen flex-col pt-2">
      <TabHeader title="Mis entradas" />

      <div className="flex flex-col gap-[14px] px-[18px]">
        <div className="flex flex-col items-center gap-3 rounded-block border border-dashed border-white/20 px-5 py-[26px] text-center">
          <span className="grid h-14 w-14 place-items-center rounded-card bg-surface text-white/35">
            <Icon name="ticket" size={28} />
          </span>
          <h2 className="text-[21px] font-bold leading-[1.2] tracking-[-0.025em]">
            Todavía no guardaste
            <br />
            ninguna fecha
          </h2>
          <p className="text-[13.5px] leading-[1.55] text-white/55">
            Cuando toques comprar, la fecha queda acá para que no se te pase.
          </p>
          <Link
            href="/"
            className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/40 text-white"
          >
            <Icon name="home" size={16} />
            <span className="text-[14px] font-bold leading-none">Ver la agenda</span>
          </Link>
        </div>

        {/* La fecha que se ofrece sale del mismo criterio de finde que la agenda. Si no hay
            ninguna, el bloque no se muestra y queda solo el punteado. */}
        {weekendEvent ? (
          <>
            <h2 className="dato-seccion">Este finde</h2>
            <DateCard event={weekendEvent} placement="mis_entradas_card" />
          </>
        ) : null}
      </div>

      <NavSpacer />
    </div>
  );
}
