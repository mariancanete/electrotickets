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
            <MotionReveal className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200/70">Curaduría ElectroTickets</p>
                <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Eventos destacados</h2>
              </div>
              <p className="max-w-md text-white/55">
                Fechas con mayor potencial de conversión: flyer fuerte, lineup claro, ubicación y acceso directo a compra.
              </p>
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
          <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-3">
            {[
              ["SEO por evento", "Cada fecha tiene URL, metadata y schema para posicionar en Google."],
              ["Mobile first", "Carga rápida, cards claras y compra a un toque desde Instagram o TikTok."],
              ["Admin simple", "Subí flyer, lineup, precios y link de Bombo desde tu celular."]
            ].map(([title, description]) => (
              <MotionReveal key={title} className="glass rounded-[2rem] p-6">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{description}</p>
              </MotionReveal>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
