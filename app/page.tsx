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

  // Para el estado vacío: la próxima fecha confirmada fuera del finde. `getUpcomingPublishedEvents`
  // ya viene ordenada por `starts_at`, así que la primera que no cae en el finde es la próxima.
  const nextEvent = events.find((event) => !dayKeys.has(getDayKey(event.starts_at))) ?? null;

  return (
    <>
      <DesktopHeader />
      <main>
        <AgendaScreen
          days={days}
          eventsByDay={eventsByDay}
          emptyRange={formatRange(weekendDays[0], weekendDays[2])}
          nextEvent={nextEvent}
          alertsHref={whatsappUrlOrGroup(buildAlertsWhatsappMessage())}
        />
      </main>
      <BottomNav />
    </>
  );
}
