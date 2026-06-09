import type { Metadata } from "next";
import { EventCard } from "@/components/event-card";
import { Hero } from "@/components/hero";
import { MotionReveal } from "@/components/motion-reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedEvents } from "@/lib/events";
import { absoluteUrl, siteConfig } from "@/lib/site";

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

function getHeroFeaturedEvents(events: Awaited<ReturnType<typeof getPublishedEvents>>) {
  const featured = events.filter((event) => event.featured);
  const featuredIds = new Set(featured.map((event) => event.id));
  const fallbackEvents = events.filter((event) => !featuredIds.has(event.id));

  return [...featured, ...fallbackEvents].slice(0, 3);
}

export default async function HomePage() {
  const events = await getPublishedEvents();
  const heroFeaturedEvents = getHeroFeaturedEvents(events);
  const heroFeaturedIds = new Set(heroFeaturedEvents.map((event) => event.id));
  const nextEvents = events.filter((event) => !heroFeaturedIds.has(event.id)).slice(0, 6);
  const venuesCount = new Set(events.map((event) => event.venue_name).filter(Boolean)).size;

  return (
    <>
      <SiteHeader />
      <main>
        <Hero featuredEvents={heroFeaturedEvents} eventsCount={events.length} venuesCount={venuesCount} />

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <MotionReveal className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200/70">Agenda</p>
                <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Próximos eventos</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                  Más fechas publicadas para seguir comparando lineup, venue y precio antes de comprar.
                </p>
              </div>
              <a href="/eventos" className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/85">
                Ver todos los eventos
              </a>
            </MotionReveal>

            {nextEvents.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {nextEvents.map((event, index) => (
                  <MotionReveal key={event.id}>
                    <EventCard event={event} priority={index === 0} />
                  </MotionReveal>
                ))}
              </div>
            ) : (
              <MotionReveal className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-white/60">
                No hay más eventos publicados por ahora. Volvé pronto para ver nuevas fechas.
              </MotionReveal>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
