import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatEventLongDate } from "@/lib/dates";
import { getEventBySlug, getUpcomingPublishedEvents, isUpcomingEvent } from "@/lib/events";
import { absoluteUrl, bomboAppLinks, siteConfig } from "@/lib/site";
import { getYoutubeEmbedUrl } from "@/lib/video";
import { buildEventWhatsappMessage, buildWhatsappDirectUrl } from "@/lib/whatsapp";
import type { EventFaqItem, EventRecord } from "@/types/event";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const events = await getUpcomingPublishedEvents();
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return { title: "Evento no encontrado" };
  }

  const title = buildSeoTitle(event);
  const description = buildSeoDescription(event);
  const canonicalUrl = absoluteUrl(`/eventos/${event.slug}`);
  const image = absoluteUrl(event.flyer_url || "/og-home.jpg");

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      siteName: "ElectroTickets",
      type: "website",
      url: canonicalUrl,
      images: [{ url: image, width: 1200, height: 1500, alt: `Flyer de ${event.title}` }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event || !isUpcomingEvent(event)) notFound();

  const embedUrl = getYoutubeEmbedUrl(event.video_url);
  const contactUrl = buildWhatsappDirectUrl(
    siteConfig.whatsappNumber,
    buildEventWhatsappMessage(event.title)
  );
  const isSoldOut = Boolean(event.sold_out);
  const hasLastTickets = Boolean(event.last_tickets) && !isSoldOut;
  const seoDescription = buildSeoDescription(event);
  const aboutEvent = buildAboutEvent(event);
  const faqItems = buildEventFaq(event, isSoldOut);
  const eventUrl = absoluteUrl(`/eventos/${event.slug}`);
  const goUrl = absoluteUrl(`/go/${event.slug}`);
  const eventImage = absoluteUrl(event.flyer_url || "/og-home.jpg");
  const venueName = event.venue_name || "Venue a confirmar";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: event.title,
    description: seoDescription,
    url: eventUrl,
    startDate: event.starts_at,
    endDate: event.end_at || undefined,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: [eventImage],
    location: {
      "@type": "Place",
      name: venueName,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.venue_address || undefined,
        addressLocality: event.city || siteConfig.defaultCity,
        addressRegion: event.province || undefined,
        addressCountry: "AR"
      }
    },
    performer: event.lineup?.map((artist) => ({ "@type": "MusicGroup", name: artist })),
    organizer: {
      "@type": "Organization",
      name: "ElectroTickets",
      url: siteConfig.url
    },
    offers: {
      "@type": "Offer",
      url: goUrl,
      availability: isSoldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock"
    }
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <>
      <SiteHeader />
      <main className="px-4 py-10 pb-28 sm:px-6 sm:pb-10 lg:px-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/30">
              {event.flyer_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.flyer_url} alt={`Flyer de ${event.title}`} className="w-full object-cover" />
              ) : (
                <div className="grid aspect-[4/5] place-items-center bg-white/5 text-6xl font-black">ET</div>
              )}
            </div>
          </div>

          <section className="space-y-8">
            <div className="glass rounded-[2rem] p-6 sm:p-8">
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-violet-400/15 px-3 py-1 text-sm text-violet-100">{event.genre || "Electrónica"}</span>
                {event.featured ? <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-black">Destacado</span> : null}
                {isSoldOut ? <span className="rounded-full bg-red-700 px-3 py-1 text-sm font-black text-white shadow-lg shadow-red-950/40">Sold Out</span> : hasLastTickets ? <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-black text-white shadow-lg shadow-red-950/30">Últimas entradas</span> : null}
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">{event.title}</h1>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <InfoCard label="Fecha y horario" value={formatEventLongDate(event.starts_at)} />
                <InfoCard label="Venue" value={`${event.venue_name || "A confirmar"}${event.city ? ` · ${event.city}` : ""}`} />
                <InfoCard label="Ubicación" value={event.venue_address || event.city || "Argentina"} />
              </div>
              <p className="mt-4 text-sm leading-6 text-white/45">
                El valor final y la disponibilidad se confirman en Bombo al momento de comprar.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href={isSoldOut ? contactUrl || siteConfig.whatsappGroup : `/go/${event.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white px-6 py-4 text-center text-sm font-black text-black transition hover:scale-[1.01] hover:bg-white/85"
                  >
                    {isSoldOut ? "Consultar por Mesas" : "Comprar tickets"}
                  </a>
                  {event.map_url ? (
                    <a
                      href={event.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/15 px-6 py-4 text-center text-sm font-bold text-white/80 transition hover:bg-white/10"
                    >
                      Ver ubicación
                    </a>
                  ) : null}
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/48">
                  <p>La compra se completa en Bombo. Si no tenés la app:</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={bomboAppLinks.ios}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-white/72 transition hover:border-white/25 hover:text-white"
                    >
                      App Store
                    </a>
                    <a
                      href={bomboAppLinks.android}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-white/72 transition hover:border-white/25 hover:text-white"
                    >
                      Google Play
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-[2rem] p-6 sm:p-8">
              <h2 className="text-2xl font-black">Sobre el evento</h2>
              <p className="mt-4 text-sm leading-7 text-white/62">{aboutEvent}</p>
            </div>

            <div className="glass rounded-[2rem] p-6 sm:p-8">
              <h2 className="text-2xl font-black">¿Tenés dudas sobre este evento?</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">
                Escribime por WhatsApp para consultar por la fecha o sumate al grupo de difusión para recibir próximos eventos.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {contactUrl ? (
                  <a
                    href={contactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-emerald-400 px-5 py-3 text-center text-sm font-black text-black transition hover:scale-[1.01] hover:bg-emerald-300"
                  >
                    Consultar por WhatsApp
                  </a>
                ) : null}
                <a
                  href={siteConfig.whatsappGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-emerald-300/30 px-5 py-3 text-center text-sm font-bold text-emerald-100 transition hover:bg-emerald-300/10"
                >
                  Grupo de difusión
                </a>
              </div>
            </div>

            <details className="group glass rounded-[2rem] p-6 sm:p-8">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-2xl font-black marker:hidden">
                <span>Cómo comprar</span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-black/25 text-base text-white/70 transition group-open:rotate-45 group-open:bg-white group-open:text-black" aria-hidden="true">
                  +
                </span>
              </summary>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <StepCard number="1" title="Revisá la fecha" description="Confirmá lineup, venue, horario y detalles del evento." />
                <StepCard number="2" title="Tocá comprar" description="Te llevamos al link oficial de Bombo del evento." />
                <StepCard number="3" title="Finalizá en Bombo" description="La compra y emisión del ticket se completan fuera de ElectroTickets." />
              </div>
            </details>

            <div className="glass rounded-[2rem] p-6 sm:p-8">
              <h2 className="text-2xl font-black">Preguntas frecuentes del evento</h2>
              <div className="mt-5 divide-y divide-white/10">
                {faqItems.map((item) => (
                  <details key={item.question} className="group py-4 first:pt-0 last:pb-0">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-white marker:hidden">
                      <span>{item.question}</span>
                      <span className="text-xl text-white/45 transition group-open:rotate-45" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-white/55">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>

            {event.lineup?.length ? (
              <div className="glass rounded-[2rem] p-6 sm:p-8">
                <h2 className="text-2xl font-black">Lineup</h2>
                <div className="mt-5 flex flex-wrap gap-3">
                  {event.lineup.map((artist) => (
                    <span key={artist} className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/80">
                      {artist}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {embedUrl ? (
              <div className="glass rounded-[2rem] p-4 sm:p-5">
                <h2 className="px-2 pb-4 text-2xl font-black">Videoset</h2>
                <div className="aspect-video overflow-hidden rounded-[1.4rem] bg-black">
                  <iframe
                    src={embedUrl}
                    title={`Videoset de ${event.title}`}
                    className="h-full w-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </main>

      <div className="fixed inset-x-4 bottom-4 z-50 sm:hidden">
        <a
          href={isSoldOut ? contactUrl || siteConfig.whatsappGroup : `/go/${event.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-full bg-white px-5 py-4 text-center text-sm font-black text-black shadow-2xl shadow-black/50"
        >
          {isSoldOut ? "Consultar por Mesas" : "Comprar tickets"}
        </a>
      </div>
      <SiteFooter />
    </>
  );
}

function buildSeoTitle(event: EventRecord) {
  const city = event.city || siteConfig.defaultCity;
  return `${event.title} en ${city} | Comprar tickets`;
}

function buildSeoDescription(event: EventRecord) {
  const venue = event.venue_name || "venue a confirmar";
  const city = event.city || siteConfig.defaultCity;
  const genre = event.genre || "música electrónica";
  return `Comprá tickets para ${event.title} en ${venue}, ${city}. Fecha, lineup, ubicación e información oficial de ${genre} en ElectroTickets.`;
}

function buildAboutEvent(event: EventRecord) {
  if (event.description?.trim()) return event.description.trim();

  const city = event.city || siteConfig.defaultCity;
  const venue = event.venue_name || "venue a confirmar";
  const genre = event.genre || "música electrónica";
  const lineup = event.lineup?.length ? ` con ${event.lineup.join(", ")}` : "";

  return `${event.title} llega a ${venue}, ${city}, con una propuesta de ${genre}${lineup}. En esta página encontrás la fecha, ubicación, lineup y el acceso oficial para comprar tus tickets desde ElectroTickets.`;
}

function buildEventFaq(event: EventRecord, isSoldOut: boolean): EventFaqItem[] {
  const venue = event.venue_name || "venue a confirmar";
  const city = event.city || siteConfig.defaultCity;
  const buyAnswer = isSoldOut
    ? `La fecha figura como Sold Out. Podés consultar por WhatsApp si hay novedades o alternativas disponibles para ${event.title}.`
    : `Tocá "Comprar tickets" y te llevamos al link oficial de Bombo para ${event.title}. La compra se completa de forma externa en Bombo.`;

  return [
    {
      question: `¿Dónde comprar tickets para ${event.title}?`,
      answer: buyAnswer
    },
    {
      question: `¿Cuándo es ${event.title}?`,
      answer: `${event.title} es el ${formatEventLongDate(event.starts_at)}.`
    },
    {
      question: `¿Dónde se realiza ${event.title}?`,
      answer: `${event.title} se realiza en ${venue}, ${city}${event.venue_address ? `, en ${event.venue_address}` : ""}.`
    },
    {
      question: "¿Puedo consultar por WhatsApp?",
      answer: "Sí. Podés escribir por WhatsApp para consultar por la fecha o sumarte al grupo de difusión para recibir próximos eventos."
    }
  ];
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-white/86">{value}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-xs font-black text-black">{number}</span>
      <h3 className="mt-4 font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/52">{description}</p>
    </div>
  );
}
