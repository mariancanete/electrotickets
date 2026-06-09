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

export default async function HomePage() {
  const events = await getPublishedEvents();
  const featuredEvents = events.filter((event) => event.featured);
  const fallbackEvents = events.filter((event) => !event.featured);
  const heroEvents = [...featuredEvents, ...fallbackEvents].slice(0, 3);
  const heroEventIds = new Set(heroEvents.map((event) => event.id));
  const nextEvents = events.filter((event) => !heroEventIds.has(event.id)).slice(0, 6);

  return (
    <>
      <SiteHeader />
      <main>
        <Hero featuredEvents={heroEvents} />

        <section className="px-4 pb-14 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
          <div className="mx-auto max-w-7xl">
            <MotionReveal className="mb-6 flex flex-col items-start justify-between gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-end sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-violet-200/80">Próximos eventos</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Más fechas para seguir explorando</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                  Eventos publicados con links oficiales para comprar por Bombo y consultar detalles antes de decidir.
                </p>
              </div>
              <a href="/eventos" className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/85">
                Ver todos los eventos
              </a>
            </MotionReveal>

            {nextEvents.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {nextEvents.map((event) => (
                  <MotionReveal key={event.id}>
                    <EventCard event={event} />
                  </MotionReveal>
                ))}
              </div>
            ) : (
              <MotionReveal className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm leading-6 text-white/60">
                No hay más fechas publicadas por ahora. Revisá los destacados o volvé pronto para descubrir nuevos eventos.
              </MotionReveal>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
