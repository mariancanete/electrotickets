import type { Metadata } from "next";
import Link from "next/link";
import { EventRow } from "@/components/event-row";
import { Hero } from "@/components/hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { VipTables, WhatsappAlerts } from "@/components/whatsapp-alerts";
import type { CtaPlacement } from "@/lib/analytics";
import { getLastTicketsEvents, getUpcomingPublishedEvents, getWeekendEvents } from "@/lib/events";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { buildVipWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";
import type { EventRecord } from "@/types/event";

export const revalidate = 60;

const homeTitle = "ElectroTickets · Tickets de electrónica en Argentina";
const homeImage = absoluteUrl("/og-logo");

/** Cuántas fechas se listan en la home antes de derivar a la agenda completa. */
const HOME_AGENDA_LIMIT = 8;

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

  const featuredEvents = events.filter((event) => event.featured);
  const heroEvents = [...featuredEvents, ...events.filter((event) => !event.featured)].slice(0, 3);
  const heroIds = new Set(heroEvents.map((event) => event.id));

  // La home repetía en la grilla los mismos tres eventos que ya mostraba el hero. Acá se
  // listan solo los que no están arriba.
  const agendaEvents = events.filter((event) => !heroIds.has(event.id));
  const weekendEvents = getWeekendEvents(agendaEvents);
  const weekendIds = new Set(weekendEvents.map((event) => event.id));
  const lastTicketsEvents = getLastTicketsEvents(agendaEvents).filter((event) => !weekendIds.has(event.id));
  const highlightedIds = new Set([...weekendIds, ...lastTicketsEvents.map((event) => event.id)]);

  const restOfAgenda = agendaEvents.filter((event) => !highlightedIds.has(event.id));
  const visibleAgenda = restOfAgenda.slice(0, HOME_AGENDA_LIMIT);
  const remainingCount = restOfAgenda.length - visibleAgenda.length;

  return (
    <>
      <SiteHeader />
      <main>
        <Hero featuredEvents={heroEvents} />

        <div className="mx-auto max-w-7xl space-y-10 px-4 pb-16 pt-4 sm:px-6 lg:px-8">
          {/* La descripción decía "dentro de los próximos siete días", que era la ventana del
              filtro contada en voz alta. En pantalla confundía: nadie piensa el finde como un
              horizonte de días. `getWeekendEvents` no cambia; solo se nombra por lo que
              devuelve, que son las fechas de viernes, sábado y domingo. */}
          {weekendEvents.length ? (
            <AgendaSection
              eyebrow="Esta semana"
              title="Este finde"
              description="Todo lo que hay viernes, sábado y domingo."
              events={weekendEvents}
              placement="home_weekend"
            />
          ) : null}

          {lastTicketsEvents.length ? (
            <AgendaSection
              eyebrow="Se están agotando"
              title="Últimas entradas"
              description="Fechas marcadas como últimas entradas por la productora."
              events={lastTicketsEvents}
              placement="home_last_tickets"
            />
          ) : null}

          {/* Único mecanismo de retorno del sitio: quien llega desde Google y no compra hoy
              se iba sin dejar ningún punto de contacto. */}
          <WhatsappAlerts source="home_alerts" />

          <section>
            <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-violet-200/80">Agenda</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Próximos eventos</h2>
                <p className="mt-2 max-w-2xl text-base leading-7 text-white/62">
                  Fechas publicadas con su link oficial de Bombo, lineup y ubicación para decidir antes de comprar.
                </p>
              </div>
              <Link
                href="/eventos"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-black text-white transition hover:border-white/40 hover:bg-white/10"
              >
                Ver todos los eventos
              </Link>
            </div>

            {visibleAgenda.length ? (
              <>
                <div className="space-y-3">
                  {visibleAgenda.map((event) => (
                    <EventRow key={event.id} event={event} placement="home_agenda" />
                  ))}
                </div>
                {remainingCount > 0 ? (
                  <Link
                    href="/eventos"
                    className="mt-4 flex items-center justify-center rounded-[20px] border border-dashed border-white/15 px-5 py-4 text-sm font-bold text-white/78 transition hover:border-white/30 hover:text-white"
                  >
                    Ver {remainingCount} {remainingCount === 1 ? "fecha más" : "fechas más"} en la agenda →
                  </Link>
                ) : null}
              </>
            ) : (
              <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.03] p-6 text-base leading-7 text-white/62">
                No hay más fechas publicadas por ahora. Sumate a las alertas de WhatsApp y te avisamos apenas
                publiquemos la próxima.
              </div>
            )}
          </section>

          <VipTables source="home_vip" href={whatsappUrlOrGroup(buildVipWhatsappMessage())} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function AgendaSection({
  eyebrow,
  title,
  description,
  events,
  placement
}: {
  eyebrow: string;
  title: string;
  description: string;
  events: EventRecord[];
  placement: CtaPlacement;
}) {
  return (
    <section>
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-violet-200/80">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-base leading-7 text-white/62">{description}</p>
      </div>
      <div className="space-y-3">
        {events.map((event) => (
          <EventRow key={event.id} event={event} placement={placement} />
        ))}
      </div>
    </section>
  );
}
