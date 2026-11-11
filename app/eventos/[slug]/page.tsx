import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { Chip, InfoBlock, UrgencyChip } from "@/components/chips";
import {
  BuyCta,
  SoldOutWhatsappCta,
  VipWhatsappCta,
  WhatsappGroupButton,
  WhatsappIconButton
} from "@/components/cta";
import { DateCard } from "@/components/date-card";
import { DetailActions } from "@/components/detail-actions";
import { FlyerFrame } from "@/components/flyer-image";
import { GridCard } from "@/components/grid-card";
import { Icon } from "@/components/icons";
import { SoldOutStamp } from "@/components/sold-out-stamp";
import { YoutubeFacade } from "@/components/youtube-facade";
import { getArtistUpcomingEvents } from "@/lib/artists";
import { formatDatoRange, formatLongDay, formatTime } from "@/lib/dates";
import {
  artistPath,
  formatSeoDate,
  formatShortSeoDate,
  getEventArtists,
  getEventCity,
  getEventCityAndCountry,
  getEventCityLine,
  getEventCountry,
  getEventLabel,
  getEventPrimaryPlace,
  getEventYear,
  getHeadliners,
  isRealArtist,
  joinList,
  shouldAppendPlaceToTitle
} from "@/lib/event-seo";
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
  buildVipWhatsappMessage,
  whatsappUrlOrGroup
} from "@/lib/whatsapp";
import type { EventFaqItem, EventRecord } from "@/types/event";
import { DesktopHeader } from "@/components/desktop-header";

/**
 * Una hora, no un minuto. Con 60 s cada página se regeneraba en cuanto la visitaba alguien (o
 * un crawler) y el cupo de ISR Writes de Vercel llegó a 110K de 200K. El contenido solo
 * cambia cuando se edita un evento, y eso ahora se publica al instante desde el panel
 * (`revalidatePublicPages` en `lib/revalidate.ts`). Lo único que depende del reloj —que una
 * fecha pase a "finalizada", la sección "Este finde"— tolera una hora de demora.
 */
export const revalidate = 3600;

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
  const nextDate = finished ? findSameArtistEvent(event, await getUpcomingPublishedEvents()) : null;
  const title = buildSeoTitle(event, finished, nextDate);
  const description = buildSeoDescription(event, finished, nextDate);
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
  // "…para MASSANO B2B KEVIN DE VRIES en Mute, Mar del Plata (sábado 23 de enero)": con la
  // fecha y el lugar, el RRPP sabe qué noche le consultan sin tener que preguntar.
  const vipUrl = whatsappUrlOrGroup(
    buildVipWhatsappMessage(`${getLabelWithCity(event)} (${formatLongDay(event.starts_at).toLowerCase()})`)
  );

  const seoDescription = buildSeoDescription(event, finished, sameArtistEvent);
  const aboutEvent = buildAboutEvent(event, sameArtistEvent, finished);
  const faqItems = buildEventFaq(event, isSoldOut, finished, sameArtistEvent, upcomingEvents);
  const eventUrl = absoluteUrl(`/eventos/${event.slug}`);
  const goUrl = absoluteUrl(`/go/${event.slug}`);
  const eventImage = absoluteUrl(event.flyer_url || "/og-logo");
  const venueName = event.venue_name || "Venue a confirmar";
  const lineup = event.lineup?.filter(Boolean) ?? [];
  const mapUrl = getMapUrl(event);
  const placeName = getEventPrimaryPlace(event);
  // Debajo del título, "en Mandarine Park, Buenos Aires": el h1 decía solo "SOLOMUN" y no
  // nombraba nunca el lugar ni la ciudad, que son justo las palabras con las que se busca.
  // Cada parte se corta entera: "EN MANDARINE PARK, / BUENOS AIRES" y nunca "EN MANDARINE /
  // PARK, BUENOS AIRES".
  const placeLine = [shouldAppendPlaceToTitle(event.title, placeName) ? `en ${placeName}` : "", getEventCityLine(event)].filter(
    Boolean
  );

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
      ) : hasLastTickets ? (
        // Últimas entradas: la urgencia se repite justo arriba del botón, que es donde se
        // decide. La expectativa de que se paga en Bombo sigue en la misma línea.
        <Link
          href={`/eventos/${event.slug}/comprar`}
          className="t150 flex items-center justify-center gap-[6px] text-[12px] leading-none text-white/55 hover:text-white lg:order-2 lg:mt-1 lg:justify-start lg:text-[13px]"
        >
          <span className="flex items-center gap-[5px] font-bold text-urgencia">
            <Icon name="flame" size={15} />
            Últimas entradas
          </span>
          · link oficial de Bombo
        </Link>
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

      {/* Mesas VIP, debajo del CTA en los dos anchos. En agotada no va: el botón de lista de
          espera ya pregunta por mesas, y dos chats de WhatsApp seguidos confunden. */}
      {isSoldOut ? null : <VipWhatsappCta href={vipUrl} eventSlug={event.slug} className="lg:order-3" />}
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
            {/* El flyer a su medida y entero, en mobile y en desktop. En mobile va a ancho
                completo con tope 2:3: una story no empuja el título debajo de la barra de
                compra. En desktop el tope es 4:5, el alto que ya tenía la columna: un flyer
                más alto bajaría el CTA de la columna sticky abajo del pliegue. */}
            <FlyerFrame
              src={event.flyer_url}
              alt={`Flyer de ${event.title}`}
              sizes="(min-width:1024px) 540px, 100vw"
              ratio={event.flyer_ratio}
              maxRatio={1.5}
              maxRatioDesktop={1.25}
              priority
              className="flex-none lg:rounded-block lg:border lg:border-white/10"
            >
              {isSoldOut ? <SoldOutStamp size="xl" /> : null}
              <div className="lg:hidden">
                <DetailActions title={event.title} slug={event.slug} />
              </div>
            </FlyerFrame>

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
                  {hasLastTickets ? <UrgencyChip size="lg" /> : null}
                  {event.genre ? <Chip>{event.genre}</Chip> : null}
                </div>
              ) : null}

              {/* El venue y la ciudad van dentro del h1. Antes el h1 decía solo "SOLOMUN": el
                  encabezado principal no nombraba nunca el lugar, que es justo la palabra con la
                  que se busca ("solomun mute", "solomun buenos aires"). */}
              <h1 className="display titular-detalle mt-[14px] text-[40px] leading-[0.92] tracking-[-0.045em] lg:mt-[18px]">
                {event.title}
                {placeLine.length ? (
                  <span className="mt-2 block text-[24px] leading-none tracking-[-0.02em] text-white/70 lg:mt-3 lg:text-[34px]">
                    {placeLine.map((part, index) => (
                      <Fragment key={part}>
                        {index ? " " : null}
                        <span className="whitespace-nowrap">
                          {part}
                          {index < placeLine.length - 1 ? "," : ""}
                        </span>
                      </Fragment>
                    ))}
                  </span>
                ) : null}
              </h1>

              {/* Fecha en mono chartreuse: es el dato firma del sistema, no un CTA. */}
              <p className="mt-3 font-mono text-[12px] font-bold uppercase leading-none tracking-[0.05em] text-cta lg:mt-5 lg:text-[13px]">
                {formatDatoRange(event.starts_at, event.end_at)}
              </p>

              {/* Fecha finalizada con el mismo artista de nuevo en agenda: el aviso va arriba de
                  todo y no al pie. Estas URLs viejas son las que ya posicionan ("kevin de vries
                  entradas" traía primero la de Mandarine) y el link a la fecha nueva estaba
                  debajo del FAQ, donde no lo veía nadie ni le pasaba peso. */}
              {sameArtistEvent ? <NextDateBanner event={event} nextDate={sameArtistEvent} /> : null}

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
                  {/* Cada artista enlaza a su página: es el camino interno que le pasa peso a
                      `/artistas/[slug]` y la URL que no cambia de una fecha a la siguiente. */}
                  {lineup.map((artist) =>
                    isRealArtist(artist) ? (
                      <Link
                        key={artist}
                        href={artistPath(artist)}
                        className="btn-out t150 rounded-full border border-white/[0.12] bg-surface px-4 py-[11px] text-[13px] font-semibold leading-none lg:px-[18px] lg:py-[13px] lg:text-[14px]"
                      >
                        {artist}
                      </Link>
                    ) : (
                      <span
                        key={artist}
                        className="rounded-full border border-white/[0.12] bg-surface px-4 py-[11px] text-[13px] font-semibold leading-none lg:px-[18px] lg:py-[13px] lg:text-[14px]"
                      >
                        {artist}
                      </span>
                    )
                  )}
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
          // 132 + 53 del botón de mesas VIP (44 + 9 de separación), que en agotada no va.
          style={{ height: `calc(${isSoldOut ? 132 : 185}px + env(safe-area-inset-bottom))` }}
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

/**
 * Aviso de fecha nueva en una página finalizada. Es un link al detalle, no a Bombo: por eso
 * ultramar y no chartreuse. El texto del link ("Entradas para X en Mute, Mar del Plata") es
 * también lo que Google lee para entender a qué página pasarle la búsqueda.
 */
function NextDateBanner({ event, nextDate }: { event: EventRecord; nextDate: EventRecord }) {
  const artist = sharedArtistName(event, nextDate) || nextDate.title;
  const city = getEventCityLine(nextDate);

  return (
    <Link
      href={`/eventos/${nextDate.slug}`}
      className="t150 mt-4 flex max-w-[640px] items-center gap-3 rounded-card border border-marca-edge bg-marca-tint p-[15px] hover:border-white/40 lg:mt-5"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-semibold leading-[1.3] text-marca-ink">
          Esta fecha ya finalizó · {artist} vuelve
        </span>
        <span className="mt-[6px] block text-[16px] font-bold leading-[1.25]">
          Entradas para {getEventLabel(nextDate)}
          {city ? `, ${city}` : ""}
        </span>
        <span className="mt-[6px] block font-mono text-[11.5px] font-bold uppercase leading-none tracking-[0.05em] text-white/70">
          {formatDatoRange(nextDate.starts_at, nextDate.end_at)}
        </span>
      </span>
      <span className="flex-none text-marca-ink">
        <Icon name="arrow" size={20} />
      </span>
    </Link>
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
          {/* La página del artista junta todas sus fechas y no vence: es el destino que más
              conviene alimentar desde una URL que ya posiciona y que ya no vende. */}
          {getHeadliners(event).slice(0, 1).map((artist) => (
            <Link
              key={artist}
              href={artistPath(artist)}
              className="flex h-12 items-center justify-center rounded-full border border-white/40 text-[14px] font-bold text-white"
            >
              Todas las fechas de {artist}
            </Link>
          ))}
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
  const artists = new Set(getEventArtists(event).map(normalizeText));
  if (!artists.size) return null;

  return (
    candidates.find(
      (candidate) =>
        candidate.id !== event.id && getEventArtists(candidate).some((artist) => artists.has(normalizeText(artist)))
    ) || null
  );
}

function sharedArtistName(event: EventRecord, candidate: EventRecord) {
  const artists = new Set(getEventArtists(event).map(normalizeText));
  return getEventArtists(candidate).find((artist) => artists.has(normalizeText(artist))) || null;
}

/** "SOLOMUN en Mandarine Park, Buenos Aires". */
function getLabelWithCity(event: EventRecord) {
  const city = getEventCityLine(event);
  return `${getEventLabel(event)}${city ? `, ${city}` : ""}`;
}

/** El año, salvo que el título ya lo diga ("Afterlife 2026"). */
function getTitleYear(event: EventRecord) {
  const year = getEventYear(event.starts_at);
  return event.title.includes(year) ? "" : ` ${year}`;
}

/**
 * Título del resultado de Google: artista, venue, ciudad y año adelante, que es como se
 * busca ("solomun mandarine park 2026", "solomun buenos aires"). El nombre del sitio no va:
 * Google ya lo muestra arriba del resultado y empujaba "entradas" fuera de lo visible.
 */
function buildSeoTitle(event: EventRecord, finished: boolean, nextDate: EventRecord | null) {
  const base = getLabelWithCity(event);

  if (finished) {
    // Con el mismo artista de nuevo en agenda, el resultado lo anuncia: quien busca "kevin
    // de vries entradas" y ve "Evento finalizado" no hace clic.
    if (nextDate) {
      const place = getEventPrimaryPlace(event);
      const nextPlace = getEventPrimaryPlace(nextDate);
      const where =
        nextPlace && normalizeText(nextPlace) !== normalizeText(place)
          ? `en ${nextPlace}`
          : `el ${formatShortSeoDate(nextDate.starts_at)}`;
      return `${base} | Finalizado · Nueva fecha ${where}`;
    }
    return `${base}${getTitleYear(event)} | Evento finalizado`;
  }

  return `${base}${getTitleYear(event)} | Entradas`;
}

function buildSeoDescription(event: EventRecord, finished: boolean, nextDate: EventRecord | null = null) {
  const label = getEventLabel(event);
  const where = getEventCityAndCountry(event);

  if (finished) {
    if (nextDate) {
      const nextCity = getEventCityLine(nextDate);
      return `${label} ya finalizó. Próxima fecha: ${getEventLabel(nextDate)}${nextCity ? ` (${nextCity})` : ""}, el ${formatSeoDate(nextDate.starts_at)}. Entradas con link oficial de Bombo en ElectroTickets.`;
    }
    return `${label} (${where}) fue el ${formatSeoDate(event.starts_at)}. Mirá las próximas fechas de electrónica y recibí avisos por WhatsApp desde ElectroTickets.`;
  }

  // "Argentina" y la ciudad van en la descripción: Google las resalta cuando coinciden con
  // la búsqueda, y son las dos palabras que más se repiten en las consultas.
  return `Entradas para ${label} (${where}), el ${formatSeoDate(event.starts_at)} a las ${formatTime(event.starts_at)}. Link oficial de Bombo, lineup, ubicación y consulta por mesas VIP en ElectroTickets.`;
}

function buildAboutEvent(event: EventRecord, nextDate: EventRecord | null, finished: boolean) {
  if (event.description?.trim()) return event.description.trim();

  // Finalizada con fecha nueva del mismo artista: el texto de respaldo hablaba en presente
  // ("acá tenés el link oficial para comprar tus entradas") de una fiesta que ya pasó.
  if (nextDate) {
    const place = getEventPrimaryPlace(event) || "el venue";
    const artist = sharedArtistName(event, nextDate) || event.title;
    const nextCity = getEventCityLine(nextDate);

    return `${event.title} fue en ${place} el ${formatSeoDate(event.starts_at)}${event.genre ? `, una noche de ${event.genre}` : ""}. La próxima fecha de ${artist} es ${getEventLabel(nextDate)}${nextCity ? ` (${nextCity})` : ""}, el ${formatSeoDate(nextDate.starts_at)}: las entradas están en su página, con el link oficial de Bombo.`;
  }

  // Texto que nombra lo que distingue a la fecha: venue, ciudad, país, fecha con año, puertas
  // y la credencial RRPP. El de antes ("X llega a Y, con una propuesta de Z con X") no decía
  // ni la ciudad ni el año y repetía el artista como lineup.
  const label = getEventLabel(event);
  const venue = event.venue_name?.trim() || "";
  const lineupNames = getEventArtists(event);
  const hasOtherArtists = lineupNames.some((artist) => normalizeText(artist) !== normalizeText(event.title));

  const when = `${label} (${getEventCityAndCountry(event)}) ${finished ? "fue" : "es"} el ${formatSeoDate(event.starts_at)}, con puertas a las ${formatTime(event.starts_at)}${event.genre ? `: una noche de ${event.genre}` : ""}.`;
  const lineup = hasOtherArtists ? ` Lineup: ${lineupNames.join(", ")}.` : "";
  if (finished) return `${when}${lineup}`;

  const official =
    venue && isOfficialVenue(venue)
      ? ` Somos RRPP oficial de ${venue}: acá tenés el link oficial de Bombo para comprar tus entradas.`
      : " Acá tenés la fecha, la ubicación y el link oficial de Bombo para comprar tus entradas.";

  return `${when}${lineup}${official}`;
}

/** "el sábado 2 de enero de 2027 en Mute (Mar del Plata)". */
function describeDate(event: EventRecord) {
  const place = getEventPrimaryPlace(event);
  const city = getEventCityLine(event);
  return `el ${formatSeoDate(event.starts_at)}${place ? ` en ${place}` : ""}${city ? ` (${city})` : ""}`;
}

function buildEventFaq(
  event: EventRecord,
  isSoldOut: boolean,
  finished: boolean,
  nextDate: EventRecord | null,
  upcomingEvents: EventRecord[]
): EventFaqItem[] {
  if (finished && nextDate) return buildFinishedWithNextDateFaq(event, nextDate);

  const label = getEventLabel(event);
  const place = getEventPrimaryPlace(event) || "venue a confirmar";
  const city = getEventCity(event);
  const country = getEventCountry(event);
  const address = formatAddress(event);

  const buyAnswer = finished
    ? `${label} ya finalizó. Podés ver las próximas fechas en la agenda de ElectroTickets o pedir avisos por WhatsApp.`
    : isSoldOut
      ? `La fecha figura como Sold Out en Bombo. Podés escribirnos por WhatsApp para que te avisemos si se libera alguna entrada o si quedan mesas para ${label}.`
      : `Tocá "Comprar en Bombo" y te abrimos el link oficial del evento. El precio, la disponibilidad y el pago se completan en Bombo.`;

  // Una pregunta por artista del título con todas sus fechas vigentes en el país. Es la
  // búsqueda que más impresiones trae ("solomun argentina", "miss monique argentina 2026") y
  // la que un b2b no cubría: se busca "massano", no el título entero.
  const artistItems: EventFaqItem[] = finished
    ? []
    : getHeadliners(event)
        .slice(0, 3)
        .map((artist) => {
          // Solo fechas del mismo país: la pregunta dice "en Argentina" (o "en Uruguay").
          const dates = getArtistUpcomingEvents(artist, upcomingEvents).filter(
            (date) => getEventCountry(date) === country
          );
          const list = dates.some((date) => date.id === event.id) ? dates : [event, ...dates];
          const others = getHeadliners(event).filter((other) => other !== artist);
          const withOthers = others.length ? ` junto a ${joinList(others)}` : "";

          return {
            question: `¿Cuándo toca ${artist} en ${country}?`,
            answer:
              list.length > 1
                ? `${artist} tiene ${list.length} fechas en ${country}: ${joinList(list.map(describeDate))}. Las entradas de cada fecha están en ElectroTickets, con el link oficial de Bombo.`
                : `${artist} toca${withOthers} ${describeDate(event)}. Las entradas para ${artist} en ${city || country} se compran desde esta página, con el link oficial de Bombo.`
          };
        });

  return [
    {
      question: `¿Dónde comprar entradas para ${label}?`,
      answer: buyAnswer
    },
    ...artistItems,
    {
      question: `¿Cuándo es ${label}?`,
      answer: `${label} ${finished ? "fue" : "es"} el ${formatSeoDate(event.starts_at)}, a las ${formatTime(event.starts_at)}.`
    },
    {
      question: `¿Dónde se realiza ${event.title}?`,
      answer: `El evento se realiza en ${place}${address ? `, ${address}` : city ? `, ${city}` : ""}.`
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

/**
 * Preguntas de una fecha finalizada cuando el artista vuelve. "¿Dónde comprar entradas para
 * KEVIN DE VRIES?" respondía "ya finalizó": la página posicionaba para la búsqueda y la
 * respuesta no llevaba a ningún lado. Ahora deriva a la fecha nueva.
 */
function buildFinishedWithNextDateFaq(event: EventRecord, nextDate: EventRecord): EventFaqItem[] {
  const place = getEventPrimaryPlace(event) || "el venue";
  const artist = sharedArtistName(event, nextDate) || event.title;
  const nextCity = getEventCity(nextDate);
  const nextLabel = `${getEventLabel(nextDate)}${nextCity ? ` (${nextCity})` : ""}`;
  const nextWhen = formatSeoDate(nextDate.starts_at);

  return [
    {
      question: `¿Dónde comprar entradas para ${artist}?`,
      answer: `La fecha de ${place} ya finalizó. La próxima fecha de ${artist} es ${nextLabel}, el ${nextWhen}: las entradas están en su página de ElectroTickets, con el link oficial de Bombo.`
    },
    {
      question: `¿Cuándo vuelve a tocar ${artist}?`,
      answer: `${artist} vuelve el ${nextWhen}, a las ${formatTime(nextDate.starts_at)}, en ${nextLabel}.`
    },
    {
      question: `¿Cuándo fue ${event.title} en ${place}?`,
      answer: `${event.title} fue en ${place} el ${formatSeoDate(event.starts_at)}.`
    },
    {
      question: "¿ElectroTickets procesa el pago?",
      answer:
        "No. ElectroTickets es una agenda especializada que centraliza la información y te lleva al link oficial de compra. El pago y la emisión del ticket se completan en Bombo."
    }
  ];
}

/** "Mandarine Park" cuenta como "Mandarine": `credentials` guarda el nombre corto del venue. */
function isOfficialVenue(venue: string) {
  const normalized = normalizeText(venue);
  return credentials.officialVenues.some((official) => {
    const name = normalizeText(official);
    return normalized === name || normalized.startsWith(`${name} `);
  });
}
