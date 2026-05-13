import { EventCard } from "@/components/event-card";
import { Hero } from "@/components/hero";
import { MotionReveal } from "@/components/motion-reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedEvents } from "@/lib/events";

export const revalidate = 60;

export default async function HomePage() {
  const events = await getPublishedEvents();
  const featuredEvents = events.filter((event) => event.featured).slice(0, 3);
  const nextEvents = events.slice(0, 6);

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />

        <section id="destacados" className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <MotionReveal className="mb-8">
              <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Eventos destacados</h2>
            </MotionReveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(featuredEvents.length ? featuredEvents : nextEvents).map((event, index) => (
                <MotionReveal key={event.id}>
                  <EventCard event={event} priority={index === 0} />
                </MotionReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <MotionReveal className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-violet-200/80">Próximas fechas</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Encontrá tu próximo evento electrónico</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Explorá fechas destacadas, revisá ubicación, lineup y comprá desde el link oficial del evento.</p>
            </div>
            <a href="/eventos" className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/85">
              Ver todos los eventos
            </a>
          </MotionReveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
