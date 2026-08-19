import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ScreenHeader } from "@/components/app-header";
import { InfoBlock } from "@/components/chips";
import { BuyCta, WhatsappIconButton } from "@/components/cta";
import { Flyer } from "@/components/flyer-image";
import { Icon } from "@/components/icons";
import { credentials } from "@/lib/credentials";
import { formatDato } from "@/lib/dates";
import { getEventBySlug, isPastEvent } from "@/lib/events";
import { buildPriceWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";
import { DesktopHeader } from "@/components/desktop-header";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  return {
    title: event ? `Comprar entradas para ${event.title}` : "Comprar entradas",
    // Es una pantalla de paso, no una landing: si se indexara competiría con el detalle,
    // que es la URL que tiene el canonical, el JSON-LD y los backlinks.
    robots: { index: false, follow: true }
  };
}

/**
 * Pantalla 04 — el pasaje a Bombo.
 *
 * Confirma **qué fecha** se está comprando y explica cómo sigue. No lista lotes ni muestra
 * precio, total ni cargo por servicio: los lotes se eligen en Bombo y el monto cambia ahí.
 * Fue justamente para no mostrar lotes que se descartó agregar una tabla y un campo de
 * admin nuevos — esta pantalla existe para dar contexto, no para replicar el checkout.
 */
export default async function BuyPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  // Agotado es un estado de la fecha, no del lote: con `sold_out` el CTA de origen está
  // deshabilitado y esta pantalla no se alcanza. El redirect cubre el acceso directo por URL,
  // que si no mostraría un botón de compra para algo que no se puede comprar.
  if (event.sold_out || isPastEvent(event)) redirect(`/eventos/${event.slug}`);

  const venue = [event.venue_name, event.city].filter(Boolean).join(" · ");
  const priceUrl = whatsappUrlOrGroup(buildPriceWhatsappMessage(event.title));
  const venues = credentials.officialVenues;

  const barraCompra = (
    <>
      <div className="flex gap-[9px] lg:gap-3">
        <BuyCta event={event} placement="compra_barra" className="flex-1" />
        <WhatsappIconButton
          href={priceUrl}
          source="event_price"
          eventSlug={event.slug}
          label="Consultar precio por WhatsApp"
        />
      </div>
      <p className="text-center text-[11.5px] leading-[1.4] text-white/45 lg:text-[12.5px]">
        Se abre la app de Bombo · ElectroTickets no procesa el pago
      </p>
    </>
  );

  return (
    <>
      <DesktopHeader />
      <main className="app-shell flex min-h-screen flex-col pt-2 lg:pt-0">
        {/**
         * Es la **única pantalla desktop sin grilla**: la columna mide 620px a cualquier
         * ancho y el espacio que sobra se va a los márgenes, no al contenido. Ensancharla
         * sería invitar a llenarla, y lo que habría para llenar son lotes y precio, que es
         * justamente lo que vive en Bombo.
         */}
        <div className="gutter-lg lg:flex lg:justify-center lg:py-11">
          <div className="lg:flex lg:w-[620px] lg:flex-col lg:gap-6">
            <div className="lg:hidden">
              <ScreenHeader title="Comprar entradas" backHref={`/eventos/${event.slug}`} icon="x" />
            </div>

            <div className="hidden items-center justify-between lg:flex">
              <h1 className="text-[32px] font-bold leading-none tracking-[-0.03em]">Comprar entradas</h1>
              <Link
                href={`/eventos/${event.slug}`}
                aria-label="Volver al detalle"
                className="btn-out t150 grid h-[42px] w-[42px] place-items-center rounded-full border border-white/[0.18] text-white"
              >
                <Icon name="x" size={18} />
              </Link>
            </div>

            <div className="gutter flex flex-col gap-[14px] lg:gap-6 lg:px-0">
              <div className="flex items-center gap-3 rounded-card border border-white/10 bg-surface p-[14px] lg:gap-4 lg:p-[18px]">
                <div className="relative h-[56px] w-[46px] flex-none overflow-hidden rounded-[9px] lg:h-[72px] lg:w-[58px] lg:rounded-[10px]">
                  <Flyer src={event.flyer_url} alt={`Flyer de ${event.title}`} sizes="58px" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-[16px] font-bold leading-[1.1] tracking-[-0.02em] lg:text-[20px]">
                    {event.title}
                  </h2>
                  <p className="mt-[6px] font-mono text-[11px] font-bold uppercase leading-none text-cta lg:mt-2 lg:text-[12px]">
                    {formatDato(event.starts_at)}
                  </p>
                  {venue ? (
                    <p className="mt-[5px] truncate text-[11.5px] leading-none text-white/50 lg:mt-[6px] lg:text-[12.5px]">
                      {venue}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-[14px]">
                <h3 className="dato-seccion lg:!text-[11.5px]">Cómo sigue</h3>
                <span className="hidden h-px flex-1 bg-white/10 lg:block" />
              </div>

              <ol className="flex flex-col gap-[13px] lg:gap-4">
                <Step number={1}>Tocás comprar y se abre esta fecha en la app de Bombo.</Step>
                <Step number={2}>Ahí ves los lotes disponibles, el precio y pagás.</Step>
                <Step number={3}>La entrada queda en tu cuenta de Bombo, a tu nombre.</Step>
              </ol>

              {venues.length ? (
                <InfoBlock icon="shield">
                  Somos RRPP oficial de {venues.length === 1 ? venues[0] : `${venues.slice(0, -1).join(", ")} y ${venues[venues.length - 1]}`}.
                  Este es el link oficial de la fecha, no reventa.
                </InfoBlock>
              ) : null}

              {/* En desktop la barra fija baja a ser el último bloque de la columna. */}
              <div className="hidden lg:flex lg:flex-col lg:gap-3 lg:border-t lg:border-white/10 lg:pt-6">
                {barraCompra}
              </div>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="lg:hidden"
          style={{ height: "calc(140px + env(safe-area-inset-bottom))" }}
        />

        <div
          className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-[9px] border-t border-white/10 bg-ink px-[18px] pt-[13px] lg:hidden"
          style={{ paddingBottom: "calc(18px + env(safe-area-inset-bottom))" }}
        >
          {barraCompra}
        </div>
      </main>
    </>
  );
}

function Step({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-full bg-marca font-mono text-[12px] font-extrabold leading-none">
        {number}
      </span>
      <span className="pt-1 text-[13.5px] leading-[1.45] text-white/[0.72] lg:text-[15px] lg:leading-[1.5]">
        {children}
      </span>
    </li>
  );
}
