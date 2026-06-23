import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatEventLongDate } from "@/lib/dates";
import type { EventRecord } from "@/types/event";
import { getEventBySlug, getPublishedEvents } from "@/lib/events";
import { absoluteUrl, bomboAppLinks, siteConfig } from "@/lib/site";
import { getYoutubeEmbedUrl } from "@/lib/video";
import { buildWhatsappDirectUrl } from "@/lib/whatsapp";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const events = await getPublishedEvents();
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return { title: "Evento no encontrado" };
  }

  const title = buildSeoTitle(event);
  const venue = event.venue_name || "venue a confirmar";
  const city = event.city || siteConfig.defaultCity;
  const description = `Comprá entradas para ${event.title} en ${venue}, ${city}. Fecha, ubicación, links oficiales de Bombo y consulta por mesas VIP desde ElectroTickets.`;
  const canonicalUrl = absoluteUrl(`/eventos/${event.slug}`);
  const image = absoluteUrl(event.flyer_url || "/og-home.png");

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
    }
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  const embedUrl = getYoutubeEmbedUrl(event.video_url);
  const contactUrl = buildWhatsappDirectUrl(
    siteConfig.whatsappNumber,
    `Hola Marian, quiero consultar por ${event.title}. ¿Hay disponibilidad de entradas o mesas VIP?`
  );
  const hasLastTickets = Boolean(event.last_tickets);
  const isSoldOut = Boolean(event.sold_out);
  const eventDate = formatEventLongDate(event.starts_at);
  const aboutParagraphs = buildAboutEventParagraphs(event, eventDate, isSoldOut);
  const eventFaq = buildEventFaq(event, isSoldOut);
  const metadataDescription = buildEventDescription(event, eventDate);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: metadataDescription,
    startDate: event.starts_at,
    ...(event.end_at ? { endDate: event.end_at } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: [absoluteUrl(event.flyer_url || "/og-home.png")],
    location: {
      "@type": "Place",
      name: event.venue_name || "Venue a confirmar",
      ...(event.venue_address || event.city || event.province
        ? {
            address: {
              "@type": "PostalAddress",
              streetAddress: event.venue_address || undefined,
              addressLocality: event.city || siteConfig.defaultCity,
              addressRegion: event.province || undefined,
              addressCountry: "AR"
            }
          }
        : {})
    },
    ...(event.lineup?.length ? { performer: event.lineup.map((artist) => ({ "@type": "Person", name: artist })) } : {}),
    organizer: {
      "@type": "Organization",
      name: "ElectroTickets",
      url: siteConfig.url
    },
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/go/${event.slug}`,
      availability: isSoldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock"
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="px-4 py-10 pb-28 sm:px-6 sm:pb-10 lg:px-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
                {hasLastTickets ? <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-black text-white shadow-lg shadow-red-950/30">Últimas entradas</span> : null}
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
                    href={`/go/${event.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white px-6 py-4 text-center text-sm font-black text-black transition hover:scale-[1.01] hover:bg-white/85"
                  >
                    Comprar tickets
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

            <section className="glass rounded-[2rem] p-6 sm:p-8">
              <h2 className="text-2xl font-black">Sobre el evento</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-white/58">
                {aboutParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="glass rounded-[2rem] p-6 sm:p-8">
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
            </section>

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

            <section className="glass rounded-[2rem] p-6 sm:p-8">
              <h2 className="text-2xl font-black">Preguntas frecuentes del evento</h2>
              <div className="mt-5 divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                {eventFaq.map((item) => (
                  <details key={item.question} className="group p-4 open:bg-white/[0.03]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-white marker:hidden">
                      <span>{item.question}</span>
                      <span className="text-lg text-white/45 transition group-open:rotate-45" aria-hidden="true">+</span>
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-white/55">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>

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
          href={`/go/${event.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-full bg-white px-5 py-4 text-center text-sm font-black text-black shadow-2xl shadow-black/50"
        >
          Comprar tickets
        </a>
      </div>
      <SiteFooter />
    </>
  );
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


function normalizeForSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function buildSeoTitle(event: EventRecord) {
  const venue = event.venue_name?.trim();
  const city = event.city || siteConfig.defaultCity;
  const normalizedTitle = normalizeForSearch(event.title);
  const normalizedVenue = venue ? normalizeForSearch(venue) : "";
  const alreadyMentionsVenue = Boolean(venue && normalizedTitle.includes(normalizedVenue));
  const titleWithVenue = venue && !alreadyMentionsVenue ? `${event.title} en ${venue}` : event.title;

  return `Entradas ${titleWithVenue} ${city} | ElectroTickets`;
}

function buildEventDescription(event: EventRecord, eventDate: string) {
  const details = [
    `${event.title}${event.venue_name ? ` en ${event.venue_name}` : ""}`,
    eventDate,
    event.genre ? `género ${event.genre}` : null,
    event.lineup?.length ? `lineup: ${event.lineup.join(", ")}` : null,
    event.venue_address || event.city ? `ubicación: ${event.venue_address || event.city}` : null
  ].filter(Boolean);

  return `${details.join(". ")}. Compra oficial mediante Bombo y consultas por WhatsApp desde ElectroTickets.`;
}

function buildAboutEventParagraphs(event: EventRecord, eventDate: string, isSoldOut: boolean) {
  const venueText = event.venue_name ? ` llega a ${event.venue_name}, ${event.city || siteConfig.defaultCity},` : "";
  const detailParts = [
    "la información principal de la fecha",
    event.venue_name || event.venue_address ? "ubicación" : null,
    event.genre ? "género musical" : null,
    event.lineup?.length ? "lineup" : null,
    "y acceso oficial de compra mediante Bombo"
  ].filter(Boolean);

  const first = `${event.title}${venueText} el ${eventDate}. En ElectroTickets encontrás ${detailParts.join(", ").replace(", y", " y")}.`;
  const second = isSoldOut
    ? `Si buscás mesas VIP o alternativas para ${event.title}${event.venue_name ? ` en ${event.venue_name}` : ""}, podés consultar por WhatsApp desde esta página.`
    : `Si buscás entradas para ${event.title}${event.venue_name ? ` en ${event.venue_name}` : ""}, podés comprar desde el botón principal o consultar por WhatsApp la disponibilidad de entradas o mesas VIP.`;

  return [first, second];
}

function buildEventFaq(event: EventRecord, isSoldOut: boolean) {
  const venue = event.venue_name || "el venue informado para la fecha";
  const locationParts = [event.venue_address, event.city || siteConfig.defaultCity].filter(Boolean);
  const locationAnswer = event.map_url
    ? `El evento se realiza en ${venue}, ${locationParts.join(", ")}. También podés abrir la ubicación desde el botón “Ver ubicación”.`
    : `El evento se realiza en ${venue}${locationParts.length ? `, ${locationParts.join(", ")}` : ""}.`;

  return [
    {
      question: `¿Dónde comprar entradas para ${event.title}?`,
      answer: isSoldOut
        ? "El evento figura como Sold Out. Podés consultar por WhatsApp si hay disponibilidad de mesas VIP o alternativas."
        : "Podés acceder al link oficial de compra desde ElectroTickets. La compra se completa en Bombo."
    },
    {
      question: `¿Dónde es ${event.title}?`,
      answer: locationAnswer
    },
    {
      question: "¿Necesito la app de Bombo para comprar?",
      answer: "Sí. Para completar la compra necesitás tener instalada la app de Bombo."
    },
    {
      question: "¿Puedo consultar por mesas VIP?",
      answer: "Sí. Podés consultar disponibilidad de entradas o mesas VIP por WhatsApp desde esta página."
    }
  ];
}
