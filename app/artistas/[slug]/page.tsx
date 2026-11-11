import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/app-header";
import { BottomNav, NavSpacer } from "@/components/bottom-nav";
import { InfoBlock } from "@/components/chips";
import { WhatsappGroupButton } from "@/components/cta";
import { DateCard } from "@/components/date-card";
import { DesktopHeader } from "@/components/desktop-header";
import { GridCard } from "@/components/grid-card";
import { Icon } from "@/components/icons";
import { getArtistBySlug, getUpcomingArtists, type Artist } from "@/lib/artists";
import { credentials } from "@/lib/credentials";
import { formatDato, formatTime } from "@/lib/dates";
import {
  formatSeoDate,
  formatShortSeoDate,
  getEventCityLine,
  getEventCountry,
  getEventLabel,
  getEventPrimaryPlace,
  getEventYear,
  joinList
} from "@/lib/event-seo";
import { absoluteUrl } from "@/lib/site";
import { normalizeText } from "@/lib/slugify";
import type { EventFaqItem, EventRecord } from "@/types/event";

// Una hora; los cambios del panel se publican al instante (ver `revalidatePublicPages`).
export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const artists = await getUpcomingArtists();
  return artists.map((artist) => ({ slug: artist.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) return { title: "Artista no encontrado" };

  const title = buildArtistTitle(artist);
  const description = buildArtistDescription(artist);
  const canonicalUrl = absoluteUrl(`/artistas/${artist.slug}`);
  const flyer = artist.upcoming.find((event) => event.flyer_url)?.flyer_url;
  const image = absoluteUrl(flyer || "/og-logo");

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
      images: [{ url: image, alt: `${artist.name} en ${getRegion(artist.upcoming)}` }]
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
 * Página de artista: todas sus fechas en Argentina en una URL que no vence.
 *
 * Apunta a las búsquedas sin venue ("solomun argentina", "miss monique argentina 2026",
 * "camelphat entradas"), que en octubre de 2026 eran la mayor parte de las impresiones y
 * caían en el detalle de una fecha puntual. Cuando esa fecha pasaba, el posicionamiento se
 * quedaba en una URL que ya no vendía.
 *
 * Nunca devuelve 404 mientras el artista tenga alguna fecha publicada, aunque sean todas
 * pasadas: misma regla que el detalle de evento.
 */
export default async function ArtistPage({ params }: PageProps) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) notFound();

  const { name, upcoming, past } = artist;
  const region = getRegion(upcoming);
  const faqItems = buildArtistFaq(artist);
  const pageUrl = absoluteUrl(`/artistas/${artist.slug}`);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  };

  // Solo URLs: cada fecha ya declara su `MusicEvent` completo en su propia página, y
  // repetirlo acá duplicaría el dato estructurado del mismo evento en dos URLs.
  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Fechas de ${name} en ${region}`,
    url: pageUrl,
    itemListElement: upcoming.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/eventos/${event.slug}`),
      name: getEventLabel(event)
    }))
  };

  return (
    <>
      <DesktopHeader />
      <main className="app-shell flex min-h-screen flex-col pt-2 lg:pt-0">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        {upcoming.length ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />
        ) : null}

        <ScreenHeader title={`${name} en ${region}`} backHref="/eventos" />

        <div className="gutter flex-none">
          <p className="dato-seccion">
            {upcoming.length
              ? `${upcoming.length} ${upcoming.length === 1 ? "fecha" : "fechas"} · ${joinList(getCities(upcoming))}`
              : "Sin fechas anunciadas"}
          </p>
          <p className="mt-3 max-w-[640px] text-[14px] leading-[1.65] text-white/[0.62] lg:text-[15px]">
            {buildArtistIntro(artist)}
          </p>
        </div>

        {upcoming.length ? (
          <section className="gutter flex-none pt-6 lg:pt-8">
            <h2 className="dato-seccion lg:!text-[11.5px]">Próximas fechas</h2>
            <div className="mt-3 flex flex-col gap-3 lg:hidden">
              {upcoming.map((event, index) => (
                <DateCard
                  key={event.id}
                  event={event}
                  placement="artista_card"
                  railBottom="month"
                  priority={index === 0}
                />
              ))}
            </div>
            <div className="grilla-cards mt-5 hidden">
              {upcoming.map((event, index) => (
                <GridCard key={event.id} event={event} placement="artista_card" priority={index === 0} />
              ))}
            </div>
          </section>
        ) : (
          <section className="gutter flex-none pt-6 lg:max-w-[704px] lg:pt-8">
            <InfoBlock icon="bell">
              Todavía no hay fechas de {name} anunciadas en Argentina. Sumate al grupo y te avisamos apenas salgan las
              entradas.
              <WhatsappGroupButton source="artist_page" className="mt-3" />
            </InfoBlock>
            <Link
              href="/eventos"
              className="btn-out t150 mt-3 flex h-12 items-center justify-center rounded-full border border-white/40 text-[14px] font-bold text-white"
            >
              Ver todas las fechas
            </Link>
          </section>
        )}

        {past.length ? (
          <section className="gutter flex-none pt-7 lg:max-w-[704px] lg:pt-9">
            <h2 className="dato-seccion lg:!text-[11.5px]">Fechas anteriores</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {past.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/eventos/${event.slug}`}
                    className="acc-hov t150 flex items-center gap-3 rounded-card border border-white/10 bg-surface px-[15px] py-[13px]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold leading-[1.25]">{getEventLabel(event)}</span>
                      <span className="mt-1 block font-mono text-[11px] font-bold uppercase leading-none tracking-[0.05em] text-white/50">
                        {formatDato(event.starts_at).split(" · ")[0]}.{getEventYear(event.starts_at).slice(2)}
                        {getEventCityLine(event) ? ` · ${getEventCityLine(event)}` : ""}
                      </span>
                    </span>
                    <span className="flex-none text-white/40">
                      <Icon name="arrow" size={18} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="gutter flex-none pt-7 lg:pt-9">
          <h2 className="text-[18px] font-bold leading-none tracking-[-0.02em] lg:text-[20px]">Preguntas frecuentes</h2>
          <div className="mt-3 flex max-w-[640px] flex-col gap-2">
            {faqItems.map((item) => (
              <details key={item.question} className="acc-hov t150 rounded-card border border-white/10 bg-surface p-[14px]">
                <summary className="cursor-pointer text-[14px] font-bold leading-[1.3]">{item.question}</summary>
                <p className="mt-[10px] text-[13px] leading-[1.6] text-white/[0.62]">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="pb-6 lg:pb-[46px]" />
        <NavSpacer />
      </main>
      <BottomNav />
    </>
  );
}

/** Ciudades de las fechas, sin repetir y en orden de aparición. */
function getCities(events: EventRecord[]) {
  const seen = new Map<string, string>();
  for (const event of events) {
    const city = getEventCityLine(event) || getEventPrimaryPlace(event);
    if (city && !seen.has(normalizeText(city))) seen.set(normalizeText(city), city);
  }
  return Array.from(seen.values());
}

/**
 * "Argentina", o "Argentina y Uruguay" si alguna fecha es afuera (Music On en Maldonado).
 * Argentina va siempre primero y, sin fechas vigentes, es la única: es la palabra que se busca.
 */
function getRegion(events: EventRecord[]) {
  const countries = new Set(events.map(getEventCountry));
  const others = Array.from(countries).filter((country) => country !== "Argentina");
  if (!events.length || !others.length) return "Argentina";
  return joinList(countries.has("Argentina") ? ["Argentina", ...others] : others);
}

/** "2026 y 2027". Las búsquedas con año son las que mejor posicionan. */
function getYears(events: EventRecord[]) {
  return joinList(Array.from(new Set(events.map((event) => getEventYear(event.starts_at)))));
}

/** "SOLOMUN en Argentina 2026 y 2027: fechas y entradas". */
function buildArtistTitle({ name, upcoming }: Artist) {
  const years = upcoming.length ? ` ${getYears(upcoming)}` : "";
  return `${name} en ${getRegion(upcoming)}${years}: fechas y entradas`;
}

/** "31 de diciembre de 2026 en Mandarine Park (Buenos Aires)". */
function describeShort(event: EventRecord) {
  const place = getEventPrimaryPlace(event);
  const city = getEventCityLine(event);
  return `${formatShortSeoDate(event.starts_at)}${place ? ` en ${place}` : ""}${city ? ` (${city})` : ""}`;
}

function buildArtistDescription({ name, upcoming }: Artist) {
  if (!upcoming.length) {
    return `Fechas de ${name} en Argentina: sumate al grupo de WhatsApp de ElectroTickets y te avisamos apenas salgan las entradas.`;
  }

  const shown = upcoming.slice(0, 3).map(describeShort);
  const more = upcoming.length > 3 ? ` y ${upcoming.length - 3} más` : "";

  return `Entradas para ${name} en ${getRegion(upcoming)}: ${joinList(shown)}${more}. Link oficial de Bombo y consulta por mesas VIP en ElectroTickets.`;
}

function buildArtistIntro({ name, upcoming, past }: Artist) {
  const official = upcoming.some((event) => isOfficialVenue(event.venue_name))
    ? ` Somos RRPP oficial de ${joinList(credentials.officialVenues)}: desde cada fecha tenés el link oficial de Bombo.`
    : " Desde cada fecha tenés el link oficial de Bombo para comprar tus entradas.";

  if (upcoming.length === 1) {
    const [only] = upcoming;
    const place = getEventPrimaryPlace(only);
    const city = getEventCityLine(only);
    return `${name} toca en ${getRegion(upcoming)} el ${formatSeoDate(only.starts_at)}${place ? ` en ${place}` : ""}${city ? `, ${city}` : ""}.${official}`;
  }

  if (upcoming.length > 1) {
    return `${name} tiene ${upcoming.length} fechas en ${getRegion(upcoming)}: ${joinList(upcoming.map(describeShort))}.${official}`;
  }

  const last = past[0];
  return last
    ? `La última fecha de ${name} en Argentina fue ${getEventLabel(last)} el ${formatSeoDate(last.starts_at)}. Todavía no hay una nueva anunciada.`
    : `Todavía no hay fechas de ${name} anunciadas en Argentina.`;
}

function buildArtistFaq({ name, upcoming, past }: Artist): EventFaqItem[] {
  const next = upcoming[0];

  const items: EventFaqItem[] = [
    {
      question: `¿Cuándo toca ${name} en ${getRegion(upcoming)}?`,
      answer: upcoming.length
        ? `${name} tiene ${upcoming.length === 1 ? "una fecha" : `${upcoming.length} fechas`} en ${getRegion(upcoming)}: ${joinList(
            upcoming.map((event) => `${describeShort(event)}, a las ${formatTime(event.starts_at)}`)
          )}.`
        : past[0]
          ? `Por ahora no hay una fecha nueva anunciada. La última fue el ${formatSeoDate(past[0].starts_at)} en ${getEventPrimaryPlace(past[0])}.`
          : "Por ahora no hay una fecha anunciada."
    },
    {
      question: `¿Dónde comprar entradas para ${name}?`,
      answer: next
        ? `En la página de cada fecha de ElectroTickets: tocá "Comprar en Bombo" y te abrimos el link oficial del evento. El precio, la disponibilidad y el pago se completan en Bombo.`
        : `Cuando salga una fecha nueva, las entradas van a estar en ElectroTickets con el link oficial de Bombo. Sumate al grupo de WhatsApp para enterarte primero.`
    }
  ];

  if (upcoming.length) {
    items.push({
      question: `¿Dónde toca ${name}?`,
      answer: `${joinList(
        upcoming.map((event) => {
          const city = getEventCityLine(event);
          return `${getEventPrimaryPlace(event)}${city ? `, ${city}` : ""}${event.venue_address ? ` (${event.venue_address})` : ""}`;
        })
      )}.`
    });
  }

  items.push({
    question: "¿ElectroTickets procesa el pago?",
    answer:
      "No. ElectroTickets es una agenda especializada que centraliza la información y te lleva al link oficial de compra. El pago y la emisión del ticket se completan en Bombo."
  });

  return items;
}

/** "Mandarine Park" cuenta como "Mandarine": `credentials` guarda el nombre corto del venue. */
function isOfficialVenue(venue: string | null) {
  const normalized = normalizeText(venue);
  if (!normalized) return false;
  return credentials.officialVenues.some((official) => {
    const name = normalizeText(official);
    return normalized === name || normalized.startsWith(`${name} `);
  });
}
