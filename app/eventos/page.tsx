import type { Metadata } from "next";
import { EventBrowser } from "@/components/event-browser";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedEvents } from "@/lib/events";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Eventos de música electrónica",
  description: "Explorá fiestas techno, house, melodic techno y eventos electrónicos en Argentina."
};

export default async function EventsPage() {
  const events = await getPublishedEvents();

  return (
    <>
      <SiteHeader />
      <main className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200/70">Agenda</p>
            <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">Eventos electrónicos</h1>
            <p className="mt-5 text-lg leading-8 text-white/58">
              Filtrá por género, venue o lineup y comprá desde el link oficial de cada fecha.
            </p>
          </div>
          <EventBrowser events={events} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
