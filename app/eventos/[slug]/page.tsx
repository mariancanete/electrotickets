import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatEventLongDate } from "@/lib/dates";
import { getEventBySlug, getPublishedEvents } from "@/lib/events";
import { siteConfig } from "@/lib/site";
import { getYoutubeEmbedUrl } from "@/lib/video";

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
  const description = event.description || `${event.title} en ${event.venue_name || siteConfig.defaultCity}. Comprá tickets oficiales.`;
  const image = event.flyer_url || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/eventos/${event.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${siteConfig.url}/eventos/${event.slug}`,
      images: image ? [{ url: image, width: 1200, height: 1500, alt: event.title }] : []
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : []
    }
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  const embedUrl = getYoutubeEmbedUrl(event.video_url);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: event.title,
    description: event.description,
    startDate: event.starts_at,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: event.flyer_url ? [event.flyer_url] : undefined,
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
      <main className="px-4 py-10 sm:px-6 lg:px-8">
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
              {event.description ? <p className="mt-5 text-lg leading-8 text-white/62">{event.description}</p> : null}

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
                <div className="aspect-video overflow-hidden rounded-[1.4rem] bg-black">
                  <iframe
                    src={embedUrl}
                    title={`Videoset de ${event.title}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </main>
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
