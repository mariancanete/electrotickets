import type { Metadata } from "next";
import { Suspense } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { EventBrowser } from "@/components/event-browser";
import { getUpcomingPublishedEvents } from "@/lib/events";
import { getDayKey } from "@/lib/dates";
import { getWeekendDays } from "@/lib/weekend";
import { buildGeneralWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";
import { DesktopHeader } from "@/components/desktop-header";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Buscar fechas",
  description: "Buscá fiestas de electrónica por DJ, venue o género y comprá con el link oficial de cada fecha."
};

export default async function SearchPage() {
  const events = await getUpcomingPublishedEvents();

  // Salida del estado sin resultados: las fechas del finde, con el mismo criterio que la
  // agenda. Si no hay ninguna, el bloque no se muestra.
  const weekendKeys = new Set(getWeekendDays().map((date) => getDayKey(date.toISOString())));
  const weekendEvents = events.filter((event) => weekendKeys.has(getDayKey(event.starts_at)));

  return (
    <>
      <DesktopHeader />
      <main>
        {/* `EventBrowser` lee los filtros desde la URL, así que necesita un límite de Suspense. */}
        <Suspense fallback={null}>
          <EventBrowser
            events={events}
            alertsHref={whatsappUrlOrGroup(buildGeneralWhatsappMessage())}
            weekendEvents={weekendEvents}
          />
        </Suspense>
      </main>
      <BottomNav />
    </>
  );
}
