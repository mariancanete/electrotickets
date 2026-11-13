import type { Metadata } from "next";
import { AgendaScreen, type DayTile } from "@/components/agenda-screen";
import { HomeScreen } from "@/components/home-screen";
import { BottomNav } from "@/components/bottom-nav";
import { formatRange, getDayKey, getDayTile } from "@/lib/dates";
import { getUpcomingPublishedEvents } from "@/lib/events";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { buildAlertsWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";
import { getWeekendDays, groupByDay } from "@/lib/weekend";
import type { EventRecord } from "@/types/event";
import { DesktopHeader } from "@/components/desktop-header";

// Una hora; los cambios del panel se publican al instante (ver `revalidatePublicPages`).
export const revalidate = 3600;

/** Cuántas fechas adelanta el estado vacío del finde. */
const PROXIMAS_FECHAS = 5;

/** Tope de cards del carrusel de próximas fechas (mobile). */
const CARRUSEL_HOME = 8;

/** Tope de destacadas en la home. Si hay más, la sección enlaza a `/destacados`. */
const DESTACADAS_HOME = 8;

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

  // Fechas destacadas fuera del finde. Antes una `featured` solo llegaba a la home cuando
  // caía dentro del viernes-domingo en curso, así que la fecha más importante del mes
  // —la que el dueño marcó a mano— no se veía en la home hasta su propia semana y había que
  // ir a Buscar para encontrarla. Las del finde se excluyen porque ya están arriba, en el
  // selector de días; con el finde vacío se excluyen también las que ya adelanta
  // `nextEvents`, para no listar la misma fecha dos veces seguidas.
  const shownIds = new Set(weekendHasEvents(days) ? [] : nextEvents.map((event) => event.id));
  const allFeatured = events.filter(
    (event) => event.featured && !dayKeys.has(getDayKey(event.starts_at)) && !shownIds.has(event.id)
  );
  const featuredEvents = allFeatured.slice(0, DESTACADAS_HOME);

  // Carrusel de mobile: primero las que el dueño marcó como destacadas, después lo más
  // cercano. Las agotadas van al final: siguen visibles, pero no ocupan la primera card.
  const carouselEvents = [...events.filter((event) => event.featured), ...events.filter((event) => !event.featured)]
    .slice(0, CARRUSEL_HOME)
    .sort((a, b) => Number(Boolean(a.sold_out)) - Number(Boolean(b.sold_out)));
  const alertsHref = whatsappUrlOrGroup(buildAlertsWhatsappMessage());

  // Dos homes, una por ancho, y **nunca las dos a la vez**: Vidrio hasta 1023px y Hora Pico
  // desde 1024px. Se alternan con `display`, igual que las cards mobile/desktop del resto del
  // sitio, así que en cada ancho hay una sola en pantalla y en el árbol de accesibilidad.
  return (
    <>
      <DesktopHeader />
      <main>
        <HomeScreen events={events} carouselEvents={carouselEvents} activeCount={events.length} alertsHref={alertsHref} />
        <div className="hidden lg:block">
        <AgendaScreen
          days={days}
          eventsByDay={eventsByDay}
          emptyRange={formatRange(weekendDays[0], weekendDays[2])}
          nextEvents={nextEvents}
          featuredEvents={featuredEvents}
          hasMoreFeatured={allFeatured.length > featuredEvents.length}
          alertsHref={alertsHref}
        />
        </div>
      </main>
      <BottomNav />
    </>
  );
}

function weekendHasEvents(days: DayTile[]) {
  return days.some((day) => day.count > 0);
}
