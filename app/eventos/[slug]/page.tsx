import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chip, InfoBlock, UrgencyChip } from "@/components/chips";
import { BuyCta, SoldOutWhatsappCta, WhatsappGroupButton, WhatsappIconButton } from "@/components/cta";
import { DateCard } from "@/components/date-card";
import { DetailActions } from "@/components/detail-actions";
import { Flyer } from "@/components/flyer-image";
import { GridCard } from "@/components/grid-card";
import { Icon } from "@/components/icons";
import { SoldOutStamp } from "@/components/sold-out-stamp";
import { YoutubeFacade } from "@/components/youtube-facade";
import { formatDatoRange, formatEventLongDate, formatLongDay, formatTime } from "@/lib/dates";
import {
  getEventBySlug,
  getRecentPastPublishedEvents,
  getRelatedEvents,
  getUpcomingPublishedEvents,
  isPastEvent
} from "@/lib/events";
import { credentials } from "@/lib/credentials";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { normalizeText } from "@/lib/slugify";
import { getYoutubeEmbedUrl, getYoutubeVideoId } from "@/lib/video";
import {
  buildPriceWhatsappMessage,
  whatsappUrlOrGroup
} from "@/lib/whatsapp";
import type { EventFaqItem, EventRecord } from "@/types/event";
import { DesktopHeader } from "@/components/desktop-header";

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

/**
 * Pantalla 03 — detalle de evento.
 *
 * Flyer a sangre, datos de la fecha y barra fija de compra. La barra está fija desde el
 * primer scroll y el contenido reserva su alto, así que nunca tapa el último bloque.
 *
 * **No aparece ningún precio.** En su lugar, arriba del CTA, la línea "Link oficial · precio
 * y lotes actualizados en Bombo" fija la expectativa *antes* del clic: el monto y los lotes
 * viven en Bombo y cambian ahí. Descubrir eso después de tocar es donde se pierde la gente.
 */
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

  const embedUrl = getYoutubeEmbedUrl(event.video_url);
  const videoId = getYoutubeVideoId(event.video_url);
  const isSoldOut = Boolean(event.sold_out) && !finished;
  const hasLastTickets = Boolean(event.last_tickets) && !isSoldOut && !finished;

  const priceUrl = whatsappUrlOrGroup(buildPriceWhatsappMessage(event.title));

  const seoDescription = buildSeoDescription(event, finished);
  const aboutEvent = buildAboutEvent(event);
  const faqItems = buildEventFaq(event, isSoldOut, finished);
  const eventUrl = absoluteUrl(`/eventos/${event.slug}`);
  const goUrl = absoluteUrl(`/go/${event.slug}`);
  const eventImage = absoluteUrl(event.flyer_url || "/og-logo");
  const venueName = event.venue_name || "Venue a confirmar";
  const lineup = event.lineup?.filter(Boolean) ?? [];
  const mapUrl = getMapUrl(event);
  const placeName = getEventPrimaryPlace(event);
  // Solo fuera de CABA (ver `getDistinctCity`): las fechas porteñas, Mandarine Park
  // incluida, ya posicionan bien con el h1 de siempre y no se tocan.
  const titleNeedsPlace = Boolean(getDistinctCity(event)) && shouldAppendPlaceToTitle(event.title, placeName);

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

  // Bloque de compra. Se renderiza dos veces con la misma información y **nunca las dos a la
  // vez**: en mobile va en la barra fija de abajo, y en desktop viaja adentro de la columna
  // sticky del flyer. Como se alternan con `display`, en cada ancho hay exactamente uno en el
  // árbol de accesibilidad, así que un lector de pantalla tampoco escucha dos CTA.
  const bloqueCompra = (
    <>
      {/* La expectativa va **antes** del CTA, no debajo: descubrir que la compra termina
          afuera después del clic es donde se pierde la gente. Agotada no lleva a Bombo, así
          que la línea cuenta qué hace el botón de WhatsApp en vez de hablar de precios. */}
      {isSoldOut ? (
        <p className="flex items-center justify-center gap-[6px] text-[11.5px] leading-none text-white/50 lg:order-2 lg:mt-1 lg:justify-start lg:text-[12.5px]">
          <Icon name="chat" size={13} />
          Agotado en Bombo · te aviso si se libera una entrada
        </p>
      ) : (
        <Link
          href={`/eventos/${event.slug}/comprar`}
          className="t150 flex items-center justify-center gap-[6px] text-[11.5px] leading-none text-white/50 hover:text-white lg:order-2 lg:mt-1 lg:justify-start lg:text-[12.5px]"
        >
          <Icon name="shield" size={13} />
          Link oficial · precio y lotes actualizados en Bombo
        </Link>
      )}

      <div className="flex gap-[9px] lg:order-1 lg:gap-3">
        {isSoldOut ? (
          // Un solo botón: el de WhatsApp ya es la acción, y repetirlo como ícono al lado
          // abriría el mismo chat dos veces.
          <SoldOutWhatsappCta event={event} source="event_waitlist" className="flex-1" />
        ) : (
          <>
            <BuyCta event={event} placement="detalle_barra" className="flex-1" />
            <WhatsappIconButton
              href={priceUrl}
              source="event_price"
              eventSlug={event.slug}
              label="Consultar precio por WhatsApp"
            />
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      <DesktopHeader />
      <main className="app-shell flex min-h-screen flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        {/* A partir de 1024px el botón flotante de volver lo reemplaza el breadcrumb: sobre
            el flyer no hay dónde apoyarlo y en desktop la ruta se lee mejor que una flecha. */}
        <nav
          aria-label="Ruta"
          className="gutter hidden flex-none items-center gap-[10px] pt-6 text-[12.5px] font-semibold leading-none text-white/50 lg:flex"
        >
          <Link href="/eventos" className="t150 flex items-center gap-[10px] hover:text-white">
            <Icon name="back" size={16} />
            Agenda
          </Link>
          <span className="text-white/30">/</span>
          <span>{formatLongDay(event.starts_at)}</span>
          <span className="text-white/30">/</span>
          <span className="truncate text-white">{event.title}</span>
        </nav>

        <div className="col-detalle gutter-lg lg:pb-[46px] lg:pt-[22px]">
          {/**
           * Columna izquierda. En desktop es sticky y lleva el CTA adentro: es el equivalente
           * de la barra fija de mobile. El detalle puede crecer mucho —descripción larga,
           * lineup de ocho nombres, video, FAQ— y sin esto el único punto de conversión de la
           * pantalla se perdería de vista al primer scroll.
           */}
          <div className="sticky-col sticky-detalle flex flex-col lg:gap-[14px]">
            <div className="relative h-[300px] flex-none overflow-hidden lg:aspect-4/5 lg:h-auto lg:overflow-hidden lg:rounded-block lg:border lg:border-white/10">
              <Flyer src={event.flyer_url} alt={`Flyer de ${event.title}`} sizes="(min-width:1024px) 540px, 100vw" priority large mobileFit="contain" />
              {isSoldOut ? <SoldOutStamp size="xl" /> : null}
              <div className="lg:hidden">
                <DetailActions title={event.title} slug={event.slug} />
              </div>
            </div>

            {/* En desktop Guardar y Compartir dejan de flotar sobre el flyer y pasan a
                botones delineados con etiqueta. Siguen sin usar chartreuse. */}
            <div className="hidden lg:block">
              <DetailActions title={event.title} slug={event.slug} variant="desktop" />
            </div>

            {finished ? null : <div className="hidden lg:flex lg:flex-col lg:gap-3">{bloqueCompra}</div>}
          </div>

          <div className="flex flex-col">
            <div className="gutter flex-none pt-[18px] lg:px-0 lg:pt-0">
              {hasLastTickets || event.genre ? (
                <div className="flex flex-wrap gap-[7px] lg:gap-2">
                  {hasLastTickets ? <UrgencyChip size="md" label="Últimas entradas" /> : null}
                  {event.genre ? <Chip>{event.genre}</Chip> : null}
                </div>
              ) : null}

              {/* El venue va dentro del h1 cuando el título no lo nombra. Antes el h1 decía solo
                  "SOLOMUN" en las dos fechas de Solomun: el encabezado principal no nombraba nunca
                  el lugar, que es justo la palabra con la que se busca ("solomun mute"). */}
              <h1 className="display titular-detalle mt-[14px] text-[40px] leading-[0.92] tracking-[-0.045em] lg:mt-[18px]">
                {event.title}
                {titleNeedsPlace ? (
                  <span className="mt-2 block text-[24px] leading-none tracking-[-0.02em] text-white/70 lg:mt-3 lg:text-[34px]">
                    en {placeName}
                  </span>
                ) : null}
              </h1>

              {/* Fecha en mono chartreuse: es el dato firma del sistema, no un CTA. */}
              <p className="mt-3 font-mono text-[12px] font-bold uppercase leading-none tracking-[0.05em] text-cta lg:mt-5 lg:text-[13px]">
                {formatDatoRange(event.starts_at, event.end_at)}
              </p>

              {/* La descripción sube arriba de las filas de dato en desktop, que es donde el
                  mockup la pone: primero qué es la fiesta, después la logística. */}
              <p className="mt-5 hidden max-w-[640px] text-[15px] leading-[1.65] text-white/[0.62] lg:block">
                {aboutEvent}
              </p>
            </div>

            <div className="gutter flex flex-none flex-col gap-[9px] pt-4 lg:grid lg:grid-cols-2 lg:gap-3 lg:px-0 lg:pt-[26px]">
              <InfoRow
                icon="cal"
                title={formatLongDay(event.starts_at)}
                detail={`Puertas ${formatTime(event.starts_at)}`}
              />
              <InfoRow
                icon="pin"
                title={venueName}
                detail={formatAddress(event)}
                action={
                  mapUrl ? (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-out t150 inline-flex flex-none items-center gap-[6px] rounded-full border border-white/[0.18] px-[13px] py-[9px] text-[12px] font-semibold leading-none"
                    >
                      <Icon name="map" size={14} />
                      Mapa
                    </a>
                  ) : null
                }
              />
            </div>

            {lineup.length ? (
              <section className="gutter flex-none pt-5 lg:px-0 lg:pt-8">
                <h2 className="text-[18px] font-bold leading-none tracking-[-0.02em] lg:text-[20px]">Lineup</h2>
                <div className="mt-3 flex flex-wrap gap-2 lg:mt-[14px] lg:gap-[10px]">
                  {lineup.map((artist) => (
                    <span
                      key={artist}
                      className="rounded-full border border-white/[0.12] bg-surface px-4 py-[11px] text-[13px] font-semibold leading-none lg:px-[18px] lg:py-[13px] lg:text-[14px]"
                    >
                      {artist}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {/**
             * Slot de prueba social.
             *
             * Se renderiza **vacío** mientras no haya dato real: no hay reseñas, ni contador
             * de asistentes, ni "X personas van". Inventarlos en un negocio de RRPP cuesta
             * más de lo que rinde, así que el bloque directamente no existe en pantalla hasta
             * que exista el dato que lo respalde. Cuando lo haya, se renderiza acá, ocupando
             * su columna al lado de la credencial.
             */}

            {credentials.officialVenues.length ? (
              <div className="gutter flex-none pt-[14px] lg:px-0 lg:pt-7">
                <InfoBlock icon="shield">
                  Somos RRPP oficial de {formatVenueList(credentials.officialVenues)}. Entrada nominada, sin reventa.
                  <WhatsappGroupButton eventSlug={event.slug} className="mt-3" />
                </InfoBlock>
              </div>
            ) : null}

            {/**
             * Contenido indexable de la fecha. El PRD no lo especifica en la pantalla, pero se
             * conserva: es el texto que sostiene el posicionamiento de la URL y las preguntas
             * que alimentan el `FAQPage` del JSON-LD. Sacarlo sería una decisión de SEO
             * disfrazada de decisión de diseño.
             */}
            <section className="gutter flex-none pt-6 lg:hidden">
              <h2 className="text-[18px] font-bold leading-none tracking-[-0.02em]">Sobre la fecha</h2>
              <p className="mt-3 text-[13.5px] leading-[1.65] text-white/60">{aboutEvent}</p>
            </section>

            {embedUrl && videoId ? (
              <section className="gutter flex-none pt-6 lg:px-0 lg:pt-8">
                <h2 className="text-[18px] font-bold leading-none tracking-[-0.02em] lg:text-[20px]">
                  Escuchá el sonido
                </h2>
                <div className="mt-3 max-w-[640px] overflow-hidden rounded-block border border-white/10">
                  <YoutubeFacade
                    embedUrl={embedUrl}
                    videoId={videoId}
                    title={`Video de ${event.title}`}
                    eventSlug={event.slug}
                  />
                </div>
              </section>
            ) : null}

            <section className="gutter flex-none pt-6 lg:px-0 lg:pt-8">
              <h2 className="text-[18px] font-bold leading-none tracking-[-0.02em] lg:text-[20px]">
                Preguntas frecuentes
              </h2>
              <div className="mt-3 flex max-w-[640px] flex-col gap-2">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="acc-hov t150 rounded-card border border-white/10 bg-surface p-[14px]"
                  >
                    <summary className="cursor-pointer text-[14px] font-bold leading-[1.3]">{item.question}</summary>
                    <p className="mt-[10px] text-[13px] leading-[1.6] text-white/[0.62]">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>

            {finished ? <FinishedEventBlock event={event} sameArtistEvent={sameArtistEvent} /> : null}

            {relatedEvents.length ? (
              <section className="gutter flex-none pt-6 lg:px-0 lg:pt-9">
                <h2 className="dato-seccion lg:!text-[11.5px]">Fechas parecidas</h2>
                <div className="mt-3 flex flex-col gap-3 lg:mt-5 lg:hidden">
                  {relatedEvents.map((related) => (
                    <DateCard key={related.id} event={related} placement="listado_card" />
                  ))}
                </div>
                <div className="grilla-cards-con-sidebar mt-5 hidden">
                  {relatedEvents.map((related) => (
                    <GridCard key={related.id} event={related} placement="listado_card" />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>

        {/* Reserva el alto de la barra fija de mobile para que no tape el último bloque.
            En desktop no hay barra fija, así que no reserva nada. */}
        <div
          aria-hidden="true"
          className="lg:hidden"
          style={{ height: "calc(132px + env(safe-area-inset-bottom))" }}
        />

        {finished ? null : (
          <div
            className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-[9px] border-t border-white/10 bg-ink px-[18px] pt-[13px] lg:hidden"
            style={{ paddingBottom: "calc(18px + env(safe-area-inset-bottom))" }}
          >
            {bloqueCompra}
          </div>
        )}
      </main>
    </>
  );
}

function InfoRow({
  icon,
  title,
  detail,
  action
}: {
  icon: "cal" | "pin";
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-white/10 bg-surface px-[15px] py-[13px]">
      <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[11px] bg-marca text-white">
        <Icon name={icon} size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold leading-[1.2]">{title}</span>
        {detail ? <span className="mt-1 block text-[12px] leading-[1.2] text-white/55">{detail}</span> : null}
      </span>
      {action}
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
    <section className="flex-none px-[18px] pt-6">
      <div className="rounded-block border border-white/10 bg-surface p-5">
        <p className="text-[14px] font-bold text-white/[0.78]">Este evento ya finalizó.</p>
        <p className="mt-2 text-[13.5px] leading-[1.6] text-white/60">
          Dejamos la página online para que encuentres la información de la fecha y las próximas parecidas.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href="/eventos"
            className="flex h-12 items-center justify-center rounded-full border border-white/40 text-[14px] font-bold text-white"
          >
            Ver próximos eventos
          </Link>
          {sameArtistEvent ? (
            <Link
              href={`/eventos/${sameArtistEvent.slug}`}
              className="flex h-12 items-center justify-center rounded-full border border-marca-edge bg-marca-tint text-[14px] font-bold text-marca-ink"
            >
              Próxima fecha de {sharedArtistName(event, sameArtistEvent) || sameArtistEvent.title}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/**
 * Dirección de la fila de lugar. La ciudad se agrega solo si `venue_address` no la nombra ya:
 * el admin la carga a mano y muchas veces escribe la dirección completa, así que concatenar
 * a ciegas daba "Buenos Aires, Argentina, Buenos Aires".
 */
function formatAddress(event: EventRecord) {
  const address = event.venue_address?.trim();
  const city = event.city?.trim();

  if (!address) return city || "";
  if (!city || normalizeText(address).includes(normalizeText(city))) return address;

  return `${address}, ${city}`;
}

/** Mapa: usa el link cargado en el admin y, si no hay, arma una búsqueda con venue y dirección. */
function getMapUrl(event: EventRecord) {
  if (event.map_url?.trim()) return event.map_url.trim();

  const query = [event.venue_name, event.venue_address, event.city].filter(Boolean).join(", ");
  if (!query) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function formatVenueList(venues: string[]) {
  if (venues.length === 1) return venues[0];
  return `${venues.slice(0, -1).join(", ")} y ${venues[venues.length - 1]}`;
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
  const city = getDistinctCity(event);
  const titleWithPlace = shouldAppendPlaceToTitle(event.title, place)
    ? `${event.title} en ${place}${city ? `, ${city}` : ""}`
    : event.title;

  if (finished) return `${titleWithPlace} | Evento finalizado · ${siteConfig.name}`;
  return `${titleWithPlace} | Comprar entradas · ${siteConfig.name}`;
}

function buildSeoDescription(event: EventRecord, finished: boolean) {
  const place = getEventPrimaryPlace(event);
  const placeSuffix = place ? ` en ${place}` : "";

  if (finished) {
    return `${event.title}${placeSuffix} ya finalizó. Mirá las próximas fechas de electrónica, eventos similares y recibí avisos por WhatsApp desde ElectroTickets.`;
  }

  const city = getDistinctCity(event);

  // Fuera de CABA la descripción suma ciudad y fecha con año: diferencia "Solomun en Mute"
  // (Mar del Plata, enero) de cualquier otra fecha del mismo artista. Las porteñas quedan
  // exactamente como estaban: ya posicionan bien ("solomun mandarine") y no se tocan.
  if (city) {
    return `Comprá entradas para ${event.title}${placeSuffix} (${city}), el ${formatSeoDate(event.starts_at)}. Link oficial de Bombo, lineup, ubicación y consulta por mesas VIP desde ElectroTickets.`;
  }

  return `Comprá entradas para ${event.title}${placeSuffix}. Fecha, lineup, ubicación, links oficiales de Bombo y consulta por mesas VIP desde ElectroTickets.`;
}

function buildAboutEvent(event: EventRecord) {
  if (event.description?.trim()) return event.description.trim();

  const city = getDistinctCity(event);

  // Fechas porteñas: el texto de respaldo de siempre, sin cambios.
  if (!city) {
    const place = getEventPrimaryPlace(event) || "venue a confirmar";
    const genre = event.genre || "música electrónica";
    const lineup = event.lineup?.length ? ` con ${event.lineup.join(", ")}` : "";

    return `${event.title} llega a ${place}, con una propuesta de ${genre}${lineup}. En esta página encontrás la fecha, ubicación, lineup y el acceso al link oficial de Bombo para comprar tus entradas.`;
  }

  // Fuera de CABA el texto de siempre ("X llega a Y, con una propuesta de Z con X") no
  // decía la ciudad ni el año, y repetía el artista como lineup. Acá usa los datos que
  // distinguen a la fecha: venue, ciudad, fecha, puertas y la credencial RRPP.
  const label = getEventLabel(event);
  const venue = event.venue_name?.trim() || "";
  const lineupNames = (event.lineup || []).filter((artist) => artist.trim());
  const hasOtherArtists = lineupNames.some((artist) => normalizeText(artist) !== normalizeText(event.title));

  const when = `${label} (${city}) es el ${formatSeoDate(event.starts_at)}, con puertas a las ${formatTime(event.starts_at)}${event.genre ? `: una noche de ${event.genre}` : ""}.`;
  const lineup = hasOtherArtists ? ` Lineup: ${lineupNames.join(", ")}.` : "";
  const official =
    venue && isOfficialVenue(venue)
      ? ` Somos RRPP oficial de ${venue}: acá tenés el link oficial de Bombo para comprar tus entradas.`
      : " Acá tenés la fecha, la ubicación y el link oficial de Bombo para comprar tus entradas.";

  return `${when}${lineup}${official}`;
}

function buildEventFaq(event: EventRecord, isSoldOut: boolean, finished: boolean): EventFaqItem[] {
  const place = getEventPrimaryPlace(event) || "venue a confirmar";
  // Fuera de CABA, "SOLOMUN en Mute" en vez de "SOLOMUN": las preguntas son texto indexable,
  // alimentan el FAQPage del JSON-LD y son las frases que la gente escribe en Google. Las
  // fechas porteñas conservan sus preguntas de siempre.
  const outsideCaba = Boolean(getDistinctCity(event));
  const label = outsideCaba ? getEventLabel(event) : event.title;

  const buyAnswer = finished
    ? `${label} ya finalizó. Podés ver las próximas fechas en la agenda de ElectroTickets o pedir avisos por WhatsApp.`
    : isSoldOut
      ? `La fecha figura como Sold Out en Bombo. Podés escribirnos por WhatsApp para que te avisemos si se libera alguna entrada o si quedan mesas para ${label}.`
      : `Tocá "Comprar en Bombo" y te abrimos el link oficial del evento. El precio, la disponibilidad y el pago se completan en Bombo.`;

  return [
    {
      question: `¿Dónde comprar entradas para ${label}?`,
      answer: buyAnswer
    },
    {
      question: `¿Cuándo es ${label}?`,
      answer: outsideCaba
        ? `${label} ${finished ? "fue" : "es"} el ${formatSeoDate(event.starts_at)}, a las ${formatTime(event.starts_at)}.`
        : `${event.title} ${finished ? "fue" : "es"} el ${formatEventLongDate(event.starts_at)}.`
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

/** "SOLOMUN en Mute". Si el título ya nombra el lugar, queda como está. */
function getEventLabel(event: EventRecord) {
  const place = getEventPrimaryPlace(event);
  return shouldAppendPlaceToTitle(event.title, place) ? `${event.title} en ${place}` : event.title;
}

/**
 * Ciudades que no distinguen nada: casi todo el inventario es CABA y `city` viene con ese
 * valor por defecto. Sumarlas al título solo lo alargaría.
 */
const DEFAULT_CITIES = new Set(["caba", "buenos aires", "ciudad de buenos aires", "ciudad autonoma de buenos aires"]);

/**
 * La ciudad, solo cuando agrega información: "Mar del Plata" para Mute sí, "CABA" no. Es la
 * palabra con la que se completa la búsqueda ("solomun mute mar del plata") y la que separa
 * dos fechas del mismo artista en ciudades distintas.
 */
function getDistinctCity(event: EventRecord) {
  const city = event.city?.trim();
  const venue = event.venue_name?.trim();
  if (!city || !venue) return "";

  const normalized = normalizeText(city);
  if (DEFAULT_CITIES.has(normalized) || normalizeText(venue).includes(normalized)) return "";

  return formatCityName(city);
}

/** "Mar del plata" → "Mar del Plata". El admin la carga a mano y llega con mayúsculas sueltas. */
function formatCityName(city: string) {
  const minor = new Set(["de", "del", "la", "las", "los", "y"]);

  return city
    .split(/\s+/)
    .map((word, index) =>
      index > 0 && minor.has(word.toLowerCase()) ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

/** "sábado 2 de enero de 2027". Con año: las fechas de enero se venden desde octubre. */
function formatSeoDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  })
    .format(new Date(date))
    .replace(",", "");
}

/** "Mandarine Park" cuenta como "Mandarine": `credentials` guarda el nombre corto del venue. */
function isOfficialVenue(venue: string) {
  const normalized = normalizeText(venue);
  return credentials.officialVenues.some((official) => {
    const name = normalizeText(official);
    return normalized === name || normalized.startsWith(`${name} `);
  });
}
