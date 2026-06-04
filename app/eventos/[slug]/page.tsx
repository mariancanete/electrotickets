import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatEventLongDate } from "@/lib/dates";
import { getEventBySlug, getPublishedEvents } from "@/lib/events";
import { absoluteUrl, siteConfig } from "@/lib/site";
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

  const title = `${event.title} · Tickets`;
  const venue = event.venue_name || "venue a confirmar";
  const city = event.city || siteConfig.defaultCity;
  const description = `Comprá tickets para ${event.title} en ${venue}, ${city}. Información del evento y compra oficial desde ElectroTickets.`;
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
    `Hola ${siteConfig.whatsappContactName}, quiero consultar por ${event.title}.`
  );
  const metadataDescription = `${event.title}${event.venue_name ? ` en ${event.venue_name}` : ""}. Lineup, ubicación, precios y compra oficial.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: event.title,
    description: metadataDescription,
    startDate: event.starts_at,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: [absoluteUrl(event.flyer_url || "/og-home.png")],
    location: {
      "@type": "Place",
      name: event.venue_name || "Venue a confirmar",
      address: event.venue_address || event.city || "Argentina"
    },
    performer: event.lineup?.map((artist) => ({ "@type": "Person", name: artist })),
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/go/${event.slug}`,
      availability: "https://schema.org/InStock",
      priceCurrency: "ARS"
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
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">{event.title}</h1>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <InfoCard label="Fecha y horario" value={formatEventLongDate(event.starts_at)} />
                <InfoCard label="Venue" value={`${event.venue_name || "A confirmar"}${event.city ? ` · ${event.city}` : ""}`} />
                <InfoCard label="Precios" value={event.price_label || "Ver fases en Bombo"} />
                <InfoCard label="Ubicación" value={event.venue_address || event.city || "Argentina"} />
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

            <div className="glass rounded-[2rem] p-6 sm:p-8">
              <h2 className="text-2xl font-black">Cómo comprar</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <StepCard number="1" title="Revisá la fecha" description="Confirmá lineup, venue, horario y banda de precios." />
                <StepCard number="2" title="Tocá comprar" description="Te llevamos al link oficial de Bombo del evento." />
                <StepCard number="3" title="Finalizá en Bombo" description="La compra y emisión del ticket se completan fuera de ElectroTickets." />
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
