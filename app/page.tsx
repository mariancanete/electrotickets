import type { Metadata } from "next";
import { HomeScreen } from "@/components/home-screen";
import { BottomNav } from "@/components/bottom-nav";
import { getUpcomingPublishedEvents } from "@/lib/events";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { buildAlertsWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";
import { DesktopHeader } from "@/components/desktop-header";

// Una hora; los cambios del panel se publican al instante (ver `revalidatePublicPages`).
export const revalidate = 3600;

/** Tope de cards del carrusel de próximas fechas. */
const CARRUSEL_HOME = 8;

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

  // Carrusel: primero las que el dueño marcó como destacadas, después lo más cercano, hasta
  // completar. Las agotadas van al final: siguen visibles, pero no ocupan la primera card.
  const featured = events.filter((event) => event.featured);
  const others = events.filter((event) => !event.featured);
  const carouselEvents = [...featured, ...others]
    .slice(0, CARRUSEL_HOME)
    .sort((a, b) => Number(Boolean(a.sold_out)) - Number(Boolean(b.sold_out)));

  return (
    <>
      <DesktopHeader />
      <main>
        <HomeScreen
          events={events}
          carouselEvents={carouselEvents}
          activeCount={events.length}
          alertsHref={whatsappUrlOrGroup(buildAlertsWhatsappMessage())}
        />
      </main>
      <BottomNav />
    </>
  );
}
