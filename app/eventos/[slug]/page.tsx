import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyButton } from "@/components/buy-button";
import { EventActions } from "@/components/event-actions";
import { EventRow } from "@/components/event-row";
import { FlyerFallback, FlyerImage } from "@/components/flyer-image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { VipTables, WhatsappAlerts } from "@/components/whatsapp-alerts";
import { WhatsappLink } from "@/components/whatsapp-link";
import { YoutubeFacade } from "@/components/youtube-facade";
import { formatEventLongDate } from "@/lib/dates";
import {
  getEventBySlug,
  getRecentPastPublishedEvents,
  getRelatedEvents,
  getUpcomingPublishedEvents,
  isPastEvent
} from "@/lib/events";
import { absoluteUrl, bomboAppLinks, siteConfig } from "@/lib/site";
import { normalizeText } from "@/lib/slugify";
import { getYoutubeEmbedUrl, getYoutubeVideoId } from "@/lib/video";
import {
  buildEventWhatsappMessage,
  buildPriceWhatsappMessage,
  buildVipWhatsappMessage,
  buildWaitlistWhatsappMessage,
  whatsappUrlOrGroup
} from "@/lib/whatsapp";
import type { EventFaqItem, EventRecord } from "@/types/event";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const [upcoming, past] = await Promise.all([getUpcomingPublishedEvents(), getRecentPastPublishedEvents()]);
  return [...upcoming, ...past].map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return { title: "Evento no encontrado" };
  }

  const finished = isPastEvent(event);
  const title = buildSeoTitle(event, finished);
  const description = buildSeoDescription(event, finished);
  const canonicalUrl = absoluteUrl(`/eventos/${event.slug}`);
  const image = absoluteUrl(event.flyer_url || "/og-logo");

  return {
    title: { absolute: title },
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

  if (!event) notFound();

  // Un evento que ya pasó conserva su URL en vez de devolver 404. Esas URLs acumulan
  // posicionamiento y backlinks durante semanas, y tirarlas al día siguiente de la fecha
  // significaba perder ese tráfico cada vez. Ahora funcionan como landing de captación.
  const finished = isPastEvent(event);

  const upcomingEvents = await getUpcomingPublishedEvents();
  const relatedEvents = getRelatedEvents(event, upcomingEvents, finished ? 4 : 3);
  const sameArtistEvent = finished ? findSameArtistEvent(event, upcomingEvents) : null;

  const videoId = getYoutubeVideoId(event.video_url);
  const embedUrl = getYoutubeEmbedUrl(event.video_url);
  const isSoldOut = Boolean(event.sold_out) && !finished;
  const hasLastTickets = Boolean(event.last_tickets) && !isSoldOut && !finished;

  const contactUrl = whatsappUrlOrGroup(buildEventWhatsappMessage(event.title));
  const priceUrl = whatsappUrlOrGroup(buildPriceWhatsappMessage(event.title));
  const vipUrl = whatsappUrlOrGroup(buildVipWhatsappMessage(event.title));
  const waitlistUrl = whatsappUrlOrGroup(buildWaitlistWhatsappMessage(event.title));

  const seoDescription = buildSeoDescription(event, finished);
  const aboutEvent = buildAboutEvent(event);
  const faqItems = buildEventFaq(event, isSoldOut, finished);
  const eventUrl = absoluteUrl(`/eventos/${event.slug}`);
  const goUrl = absoluteUrl(`/go/${event.slug}`);
  const eventImage = absoluteUrl(event.flyer_url || "/og-logo");
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
    // ElectroTickets revende y asiste, no organiza la fiesta. Declararse `organizer` era
    // incorrecto y es el tipo de dato estructurado que Google puede penalizar.
    offers: {
      "@type": "Offer",
      url: goUrl,
      seller: {
        "@type": "Organization",
        name: "ElectroTickets",
        url: siteConfig.url
      },
      availability: finished
        ? "https://schema.org/SoldOut"
        : isSoldOut
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock"
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  };

  return (
    <>
      <SiteHeader />
      <main className={`px-4 py-10 sm:px-6 lg:px-8 ${finished ? "pb-10" : "pb-28 sm:pb-10"}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] border border-white/10 bg-white/5 shadow-2xl shadow-black/30">
              {event.flyer_url ? (
                <FlyerImage
                  src={event.flyer_url}
                  alt={`Flyer de ${event.title}`}
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  priority
                  className="object-cover"
                />
              ) : (
                <FlyerFallback size="text-6xl" />
              )}
            </div>
          </div>

          <section className="space-y-8">
            <div className="glass rounded-[20px] p-6 sm:p-8">
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-violet-400/15 px-3 py-1 text-sm text-violet-100">
                  {event.genre || "Electrónica"}
                </span>
                {finished ? (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white/78">Finalizado</span>
                ) : null}
                {event.featured && !finished ? (
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-black">Destacado</span>
                ) : null}
                {isSoldOut ? (
                  <span className="rounded-full bg-red-700 px-3 py-1 text-sm font-black text-white shadow-lg shadow-red-950/40">
                    Sold Out
                  </span>
                ) : hasLastTickets ? (
                  <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-black text-white shadow-lg shadow-red-950/30">
                    Últimas entradas
                  </span>
                ) : null}
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">{event.title}</h1>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <InfoCard label="Fecha y horario" value={formatEventLongDate(event.starts_at)} />
                <InfoCard
                  label="Venue"
                  value={`${event.venue_name || "A confirmar"}${event.city ? ` · ${event.city}` : ""}`}
                />
                <InfoCard label="Ubicación" value={event.venue_address || event.city || "Argentina"} />
              </div>

              {finished ? (
                <FinishedEventBlock event={event} sameArtistEvent={sameArtistEvent} />
              ) : (
                <PurchaseBlock
                  event={event}
                  isSoldOut={isSoldOut}
                  waitlistUrl={waitlistUrl}
                  priceUrl={priceUrl}
                />
              )}
            </div>

            {/* Lineup y videoset arriba: son lo que hace que alguien decida ir. Antes estaban
                al final, debajo de dos acordeones de texto escrito para buscadores. */}
            {event.lineup?.length ? (
              <div className="glass rounded-[20px] p-6 sm:p-8">
                <h2 className="text-2xl font-black">Lineup</h2>
                <div className="mt-5 flex flex-wrap gap-3">
                  {event.lineup.map((artist) => (
                    <span
                      key={artist}
                      className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/78"
                    >
                      {artist}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {embedUrl && videoId ? (
              <div className="glass rounded-[20px] p-4 sm:p-5">
                <h2 className="px-2 pb-4 text-2xl font-black">Videoset</h2>
                <div className="aspect-video overflow-hidden rounded-[12px] bg-black">
                  <YoutubeFacade
                    embedUrl={embedUrl}
                    videoId={videoId}
                    title={`Videoset de ${event.title}`}
                    eventSlug={event.slug}
                  />
                </div>
              </div>
            ) : null}

            {!finished ? (
              <VipTables source="event_vip" eventTitle={event.title} eventSlug={event.slug} href={vipUrl} />
            ) : null}

            <div className="glass rounded-[20px] p-6 sm:p-8">
              <h2 className="text-2xl font-black">Sobre el evento</h2>
              <p className="mt-4 text-base leading-7 text-white/62">{aboutEvent}</p>

              {!finished ? (
                <div className="mt-6">
                  <EventActions
                    title={event.title}
                    slug={event.slug}
                    url={eventUrl}
                    startsAt={event.starts_at}
                    endAt={event.end_at}
                    venue={`${venueName}${event.city ? `, ${event.city}` : ""}`}
                  />
                </div>
              ) : null}
            </div>

            {!finished ? (
              <div className="glass rounded-[20px] p-6 sm:p-8">
                <h2 className="text-2xl font-black">¿Tenés dudas sobre este evento?</h2>
                <p className="mt-3 text-base leading-7 text-white/62">
                  Escribinos por WhatsApp para consultar por la fecha o sumate al grupo de difusión para recibir
                  próximos eventos.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <WhatsappLink
                    href={contactUrl}
                    source="event_question"
                    eventSlug={event.slug}
                    className="rounded-full bg-emerald-400 px-5 py-3 text-center text-sm font-black text-black transition hover:scale-[1.01] hover:bg-emerald-300"
                  >
                    Consultar por WhatsApp
                  </WhatsappLink>
                  <WhatsappLink
                    href={siteConfig.whatsappGroup}
                    source="event_question"
                    kind="group"
                    eventSlug={event.slug}
                    className="rounded-full border border-emerald-300/30 px-5 py-3 text-center text-sm font-bold text-emerald-100 transition hover:bg-emerald-300/10"
                  >
                    Grupo de difusión
                  </WhatsappLink>
                </div>
              </div>
            ) : null}

            <details className="group glass rounded-[20px] p-6 sm:p-8">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-2xl font-black marker:hidden">
                <span>Cómo comprar</span>
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-black/25 text-base text-white/78 transition group-open:rotate-45 group-open:bg-white group-open:text-black"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <StepCard number="1" title="Revisá la fecha" description="Confirmá lineup, venue, horario y detalles del evento." />
                <StepCard number="2" title="Tocá comprar" description="Te abrimos el evento en Bombo, donde vas a ver precio y disponibilidad." />
                <StepCard number="3" title="Finalizá en Bombo" description="El pago y la emisión del ticket se completan fuera de ElectroTickets." />
              </div>
            </details>

            <div className="glass rounded-[20px] p-6 sm:p-8">
              <h2 className="text-2xl font-black">Preguntas frecuentes del evento</h2>
              <div className="mt-5 divide-y divide-white/10">
                {faqItems.map((item) => (
                  <details key={item.question} className="group py-4 first:pt-0 last:pb-0">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-white marker:hidden">
                      <span>{item.question}</span>
                      <span className="text-xl text-white/48 transition group-open:rotate-45" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-base leading-7 text-white/62">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Eventos relacionados: sin esto, la página de evento era un callejón sin salida —
            quien no compraba se iba del sitio. */}
        {relatedEvents.length ? (
          <section className="mx-auto mt-12 max-w-7xl">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-violet-200/80">Seguí explorando</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  {finished ? "Próximas fechas parecidas" : "Eventos que también te pueden gustar"}
                </h2>
              </div>
              <Link href="/eventos" className="text-sm font-bold text-violet-200 transition hover:text-white">
                Ver agenda completa →
              </Link>
            </div>
            <div className="space-y-3">
              {relatedEvents.map((related) => (
                <EventRow key={related.id} event={related} placement="related" />
              ))}
            </div>
          </section>
        ) : null}

        {finished ? (
          <section className="mx-auto mt-8 max-w-7xl">
            <WhatsappAlerts
              source="past_event"
              title="Que no se te escape la próxima"
              text="Esta fecha ya pasó. Recibí las próximas por WhatsApp antes de que se agoten."
            />
          </section>
        ) : null}
      </main>

      {!finished ? (
        <div className="fixed inset-x-4 bottom-4 z-50 sm:hidden">
          {isSoldOut ? (
            <WhatsappLink
              href={waitlistUrl}
              source="soldout"
              eventSlug={event.slug}
              className="block rounded-full bg-emerald-400 px-5 py-4 text-center text-sm font-black text-black shadow-2xl shadow-black/50"
            >
              Avisame si se libera
            </WhatsappLink>
          ) : (
            <BuyButton
              event={event}
              placement="sticky_mobile"
              className="block rounded-full bg-white px-5 py-4 text-center text-sm font-black text-black shadow-2xl shadow-black/50"
            >
              Comprar en Bombo
            </BuyButton>
          )}
        </div>
      ) : null}

      <SiteFooter />
    </>
  );
}

/**
 * Bloque de compra.
 *
 * El microcopy va *arriba* del botón, no debajo: la expectativa hay que fijarla antes del
 * clic. El CTA dice "Comprar en Bombo" y no solo "Comprar" porque la compra efectivamente
 * se completa afuera, y descubrirlo después del clic es donde se pierde al usuario.
 */
function PurchaseBlock({
  event,
  isSoldOut,
  waitlistUrl,
  priceUrl
}: {
  event: EventRecord;
  isSoldOut: boolean;
  waitlistUrl: string;
  priceUrl: string;
}) {
  return (
    <div className="mt-8 space-y-4">
      {isSoldOut ? (
        <div className="rounded-[20px] border border-red-300/25 bg-red-500/10 p-5">
          <p className="text-sm font-bold text-red-50">Esta fecha está agotada en Bombo.</p>
          <p className="mt-2 text-base leading-7 text-white/62">
            Podemos avisarte si se libera alguna entrada, y consultar disponibilidad de mesas.
          </p>
          <WhatsappLink
            href={waitlistUrl}
            source="event_waitlist"
            eventSlug={event.slug}
            className="mt-4 inline-flex rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-black text-black transition hover:bg-emerald-300"
          >
            Avisame si se libera
          </WhatsappLink>
        </div>
      ) : (
        <>
          <p className="text-base leading-7 text-white/62">
            Te abrimos el evento en Bombo, donde vas a ver el precio y la disponibilidad actualizados.
            ElectroTickets no procesa el pago.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <BuyButton
              event={event}
              placement="event_detail"
              className="rounded-full bg-white px-6 py-4 text-center text-sm font-black text-black transition hover:scale-[1.01] hover:bg-white/85"
            >
              Comprar en Bombo
            </BuyButton>
            <WhatsappLink
              href={priceUrl}
              source="event_price"
              eventSlug={event.slug}
              className="rounded-full border border-emerald-300/30 px-6 py-4 text-center text-sm font-bold text-emerald-100 transition hover:bg-emerald-300/10"
            >
              Consultar precio por WhatsApp
            </WhatsappLink>
            {event.map_url ? (
              <a
                href={event.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 px-6 py-4 text-center text-sm font-bold text-white/78 transition hover:bg-white/10"
              >
                Ver ubicación
              </a>
            ) : null}
          </div>
        </>
      )}

      {/* Los links de instalación quedan plegados y después del CTA: antes ocupaban espacio
          principal delante de un usuario que todavía no manifestó intención de comprar. */}
      <details className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-white/48">
        <summary className="cursor-pointer font-semibold text-white/62">¿No tenés la app de Bombo?</summary>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={bomboAppLinks.ios}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-white/78 transition hover:border-white/25 hover:text-white"
          >
            App Store
          </a>
          <a
            href={bomboAppLinks.android}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-white/78 transition hover:border-white/25 hover:text-white"
          >
            Google Play
          </a>
        </div>
      </details>
    </div>
  );
}

function FinishedEventBlock({
  event,
  sameArtistEvent
}: {
  event: EventRecord;
  sameArtistEvent: EventRecord | null;
}) {
  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-[20px] border border-white/10 bg-black/25 p-5">
        <p className="text-sm font-bold text-white/78">Este evento ya finalizó.</p>
        <p className="mt-2 text-base leading-7 text-white/62">
          Dejamos la página online para que encuentres la información de la fecha y las próximas parecidas.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/eventos"
            className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/85"
          >
            Ver próximos eventos
          </Link>
          {sameArtistEvent ? (
            <Link
              href={`/eventos/${sameArtistEvent.slug}`}
              className="rounded-full border border-violet-300/30 px-5 py-3 text-sm font-bold text-violet-100 transition hover:bg-violet-300/10"
            >
              Próxima fecha de {sharedArtistName(event, sameArtistEvent) || sameArtistEvent.title}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function findSameArtistEvent(event: EventRecord, candidates: EventRecord[]) {
  const artists = new Set((event.lineup || []).map(normalizeText).filter(Boolean));
  if (!artists.size) return null;

  return (
    candidates.find((candidate) => (candidate.lineup || []).some((artist) => artists.has(normalizeText(artist)))) ||
    null
  );
}

function sharedArtistName(event: EventRecord, candidate: EventRecord) {
  const artists = new Set((event.lineup || []).map(normalizeText).filter(Boolean));
  return (candidate.lineup || []).find((artist) => artists.has(normalizeText(artist))) || null;
}

function buildSeoTitle(event: EventRecord, finished: boolean) {
  const place = getEventPrimaryPlace(event);
  const titleWithPlace = shouldAppendPlaceToTitle(event.title, place) ? `${event.title} en ${place}` : event.title;

  if (finished) return `${titleWithPlace} | Evento finalizado · ${siteConfig.name}`;
  return `${titleWithPlace} | Comprar entradas · ${siteConfig.name}`;
}

function buildSeoDescription(event: EventRecord, finished: boolean) {
  const place = getEventPrimaryPlace(event);
  const placeSuffix = place ? ` en ${place}` : "";

  if (finished) {
    return `${event.title}${placeSuffix} ya finalizó. Mirá las próximas fechas de electrónica, eventos similares y recibí avisos por WhatsApp desde ElectroTickets.`;
  }

  return `Comprá entradas para ${event.title}${placeSuffix}. Fecha, lineup, ubicación, links oficiales de Bombo y consulta por mesas VIP desde ElectroTickets.`;
}

function buildAboutEvent(event: EventRecord) {
  if (event.description?.trim()) return event.description.trim();

  const place = getEventPrimaryPlace(event) || "venue a confirmar";
  const genre = event.genre || "música electrónica";
  const lineup = event.lineup?.length ? ` con ${event.lineup.join(", ")}` : "";

  return `${event.title} llega a ${place}, con una propuesta de ${genre}${lineup}. En esta página encontrás la fecha, ubicación, lineup y el acceso al link oficial de Bombo para comprar tus entradas.`;
}

function buildEventFaq(event: EventRecord, isSoldOut: boolean, finished: boolean): EventFaqItem[] {
  const place = getEventPrimaryPlace(event) || "venue a confirmar";

  const buyAnswer = finished
    ? `${event.title} ya finalizó. Podés ver las próximas fechas en la agenda de ElectroTickets o pedir avisos por WhatsApp.`
    : isSoldOut
      ? `La fecha figura como Sold Out en Bombo. Podés escribirnos por WhatsApp para que te avisemos si se libera alguna entrada o si quedan mesas para ${event.title}.`
      : `Tocá "Comprar en Bombo" y te abrimos el link oficial del evento. El precio, la disponibilidad y el pago se completan en Bombo.`;

  return [
    {
      question: `¿Dónde comprar entradas para ${event.title}?`,
      answer: buyAnswer
    },
    {
      question: `¿Cuándo es ${event.title}?`,
      answer: `${event.title} ${finished ? "fue" : "es"} el ${formatEventLongDate(event.starts_at)}.`
    },
    {
      question: `¿Dónde se realiza ${event.title}?`,
      answer: `El evento se realiza en ${place}${event.venue_address ? `, en ${event.venue_address}` : ""}.`
    },
    {
      question: "¿ElectroTickets procesa el pago?",
      answer:
        "No. ElectroTickets es una agenda especializada que centraliza la información y te lleva al link oficial de compra. El pago y la emisión del ticket se completan en Bombo."
    },
    {
      question: "¿Puedo consultar por mesas VIP o cortesías?",
      answer:
        "Sí. Escribinos por WhatsApp y te pasamos disponibilidad y condiciones de mesas y cortesías para la fecha."
    }
  ];
}

function getEventPrimaryPlace(event: EventRecord) {
  return event.venue_name?.trim() || event.city?.trim() || "";
}

function shouldAppendPlaceToTitle(title: string, place: string) {
  if (!place) return false;
  return !normalizeText(title).includes(normalizeText(place));
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-black/25 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/48">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-white/78">{value}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-black/25 p-4">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-xs font-black text-black">
        {number}
      </span>
      <h3 className="mt-4 font-bold text-white">{title}</h3>
      <p className="mt-2 text-base leading-7 text-white/62">{description}</p>
    </div>
  );
}
