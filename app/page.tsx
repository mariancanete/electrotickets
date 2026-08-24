import type { Metadata } from "next";
import { AgendaScreen, type DayTile } from "@/components/agenda-screen";
import { BottomNav } from "@/components/bottom-nav";
import { formatRange, getDayKey, getDayTile } from "@/lib/dates";
import { getUpcomingPublishedEvents } from "@/lib/events";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { buildAlertsWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";
import { getWeekendDays, groupByDay } from "@/lib/weekend";
import type { EventRecord } from "@/types/event";
import { DesktopHeader } from "@/components/desktop-header";

export const revalidate = 60;

/** Cuántas fechas adelanta el estado vacío del finde. */
const PROXIMAS_FECHAS = 5;

const homeTitle = "ElectroTickets · Tickets de electrónica en Argentina";
const homeImage = absoluteUrl("/og-logo");

export const metadata: Metadata = {
  title: homeTitle,
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: homeTitle,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: homeImage, width: 1200, height: 630, alt: "ElectroTickets" }]
  }
};

export default async function HomePage() {
  const events = await getUpcomingPublishedEvents();

  const weekendDays = getWeekendDays();
  const grouped = groupByDay(events);

  const days: DayTile[] = weekendDays.map((date) => {
    const tile = getDayTile(date);
    return { ...tile, count: (grouped.get(tile.key) ?? []).length };
  });

  const dayKeys = new Set(days.map((day) => day.key));
  const eventsByDay: Record<string, EventRecord[]> = {};
  for (const key of dayKeys) {
    eventsByDay[key] = grouped.get(key) ?? [];
  }

  // Para el estado vacío: las próximas fechas confirmadas fuera del finde.
  // `getUpcomingPublishedEvents` ya viene ordenada por `starts_at`, así que alcanza con
  // filtrar las del finde y cortar. Son hasta cinco y no una sola: cuando el finde está
  // vacío, mostrar únicamente la más cercana esconde el resto de la agenda —si el 11 y el
  // 12 tienen fecha, ver solo el 11 hace parecer que no hay nada más.
  const nextEvents = events
    .filter((event) => !dayKeys.has(getDayKey(event.starts_at)))
    .slice(0, PROXIMAS_FECHAS);

  return (
    <>
      <DesktopHeader />
      <main>
        <AgendaScreen
          days={days}
          eventsByDay={eventsByDay}
          emptyRange={formatRange(weekendDays[0], weekendDays[2])}
          nextEvents={nextEvents}
          alertsHref={whatsappUrlOrGroup(buildAlertsWhatsappMessage())}
        />
      </main>
      <BottomNav />
    </>
  );
}
