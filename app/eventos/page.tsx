import type { Metadata } from "next";
import { Suspense } from "react";
import { EventBrowser } from "@/components/event-browser";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { VipTables } from "@/components/whatsapp-alerts";
import { getUpcomingPublishedEvents } from "@/lib/events";
import { buildVipWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Eventos de música electrónica",
  description: "Explorá fiestas techno, house, melodic techno y eventos electrónicos en Argentina."
};

export default async function EventsPage() {
  const events = await getUpcomingPublishedEvents();

  return (
    <>
      <SiteHeader />
      <main className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200/70">Agenda</p>
            <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">Eventos electrónicos</h1>
            <p className="mt-5 text-lg leading-8 text-white/62">
              Filtrá por género, venue o lineup y comprá con el link oficial de Bombo de cada fecha.
            </p>
          </div>
          {/* EventBrowser lee los filtros desde la URL, así que necesita un límite de Suspense. */}
          <Suspense fallback={null}>
            <EventBrowser events={events} placement="event_list" />
          </Suspense>
          <VipTables source="home_vip" href={whatsappUrlOrGroup(buildVipWhatsappMessage())} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
