import type { Metadata } from "next";
import { Suspense } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { EventBrowser } from "@/components/event-browser";
import { getUpcomingPublishedEvents } from "@/lib/events";
import { buildGeneralWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Buscar fechas",
  description: "Buscá fiestas de electrónica por DJ, venue o género y comprá con el link oficial de cada fecha."
};

export default async function SearchPage() {
  const events = await getUpcomingPublishedEvents();

  return (
    <>
      <main>
        {/* `EventBrowser` lee los filtros desde la URL, así que necesita un límite de Suspense. */}
        <Suspense fallback={null}>
          <EventBrowser events={events} alertsHref={whatsappUrlOrGroup(buildGeneralWhatsappMessage())} />
        </Suspense>
      </main>
      <BottomNav />
    </>
  );
}
