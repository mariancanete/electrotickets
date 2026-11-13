"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { buildGoUrl, eventParams, track, type CtaPlacement, type WhatsappSource } from "@/lib/analytics";
import { saveDate } from "@/lib/saved-dates";
import { siteConfig } from "@/lib/site";
import { buildWaitlistWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";
import type { EventRecord } from "@/types/event";

type CtaEvent = Pick<
  EventRecord,
  "slug" | "title" | "genre" | "venue_name" | "sold_out" | "last_tickets" | "starts_at"
>;

/**
 * CTA primario de compra — 56px, píldora, chartreuse.
 *
 * Es cliente por dos razones, las dos obligatorias:
 *
 *   1. `/go/[slug]` es una redirección de servidor: no renderiza HTML ni ejecuta JS, así que
 *      GA4 nunca ve ese clic por su cuenta. `click_buy` tiene que dispararse acá, antes de
 *      navegar.
 *   2. La fecha se guarda en "Mis entradas" antes de salir (§8.4). Después del clic no hay
 *      retorno ni callback: si no se guarda ahora, no se guarda nunca.
 *
 * Navega con un `<a>` normal en la misma pestaña, sin webview propio: conserva el historial
 * para que el usuario pueda volver con atrás si Bombo no lo convence.
 */
export function BuyCta({
  event,
  placement,
  label = "Comprar en Bombo",
  className = ""
}: {
  event: CtaEvent;
  placement: CtaPlacement;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={buildGoUrl(event.slug, placement)}
      // `/go/` redirige a Bombo y registra el clic: no es contenido para que un buscador lo
      // siga ni lo indexe.
      rel="nofollow"
      onClick={() => {
        track("click_buy", { ...eventParams(event), cta_placement: placement });
        saveDate(event.slug, event.starts_at);
      }}
      className={`cta-hov t150 flex h-14 items-center justify-center gap-[9px] rounded-full bg-cta text-ink active:bg-cta-pressed max-lg:shadow-[0_8px_28px_rgba(61,232,245,0.22)] ${className}`}
    >
      <span className="text-[15px] font-bold leading-none tracking-[-0.01em] max-lg:text-[17px] max-lg:font-extrabold">{label}</span>
      <span className="cta-icon t150 flex">
        <Icon name="out" size={18} />
      </span>
    </a>
  );
}

/**
 * CTA compacto de card — 44px, "Entradas".
 *
 * **No va a Bombo: abre el detalle.** Por eso dice "Entradas" y lleva `arrow` en vez de
 * `out`; el glifo `out` significa siempre "esto sale de la app" y usarlo acá sería mentir
 * sobre a dónde va el toque.
 *
 * Como no pasa por `/go/`, no puede disparar `click_buy` — dispara `select_date` con su
 * `cta_placement`. Así se mide qué superficie empuja al detalle sin inflar la métrica de
 * compra contando dos veces la misma intención.
 */
export function CardCta({
  event,
  placement,
  label = "Entradas",
  className = ""
}: {
  event: CtaEvent;
  placement: CtaPlacement;
  label?: string;
  className?: string;
}) {
  return (
    <Link
      href={`/eventos/${event.slug}`}
      onClick={() => track("select_date", { ...eventParams(event), cta_placement: placement })}
      className={`cta-hov t150 flex h-11 items-center justify-center gap-2 rounded-full bg-cta text-ink active:bg-cta-pressed ${className}`}
    >
      <span className="text-[13px] font-bold leading-none">{label}</span>
      <span className="cta-icon t150 flex">
        <Icon name="arrow" size={16} />
      </span>
    </Link>
  );
}

/**
 * Fecha agotada — "Avisame por WhatsApp" en lugar del botón "Agotado".
 *
 * Antes la fecha agotada mostraba un botón deshabilitado: la persona llegaba con ganas de ir
 * y la pantalla no le ofrecía nada. Ahora el mismo lugar abre un chat con el mensaje armado
 * ("X figura como Sold Out. ¿Me avisás si se libera alguna entrada o si quedan mesas?"), que
 * es justo lo que el RRPP puede resolver: reventas que se liberan, mesas, otra fecha.
 *
 * Va **delineado y nunca chartreuse**: no lleva a Bombo, y el chartreuse significa comprar.
 * El "agotado" lo dice el sello sobre el flyer (`SoldOutStamp`), no el botón.
 */
export function SoldOutWhatsappCta({
  event,
  source,
  compact = false,
  className = ""
}: {
  event: Pick<EventRecord, "slug" | "title">;
  source: "event_waitlist" | "soldout";
  compact?: boolean;
  className?: string;
}) {
  return (
    <a
      href={whatsappUrlOrGroup(buildWaitlistWhatsappMessage(event.title))}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("click_whatsapp", { wa_source: source, event_slug: event.slug })}
      className={`btn-out t150 flex items-center justify-center gap-2 rounded-full border border-white/40 font-bold leading-none text-white ${
        compact ? "h-11 text-[13px]" : "h-14 text-[15px]"
      } ${className}`}
    >
      <Icon name="chat" size={compact ? 16 : 19} />
      Avisame por WhatsApp
    </a>
  );
}

/**
 * "Consultar por mesas VIP" — debajo de "Comprar en Bombo" en el detalle.
 *
 * Abre el WhatsApp de contacto con la fecha ya escrita, así el RRPP sabe de qué evento le
 * hablan sin preguntar. Delineado y más bajo que el CTA (44px contra 56): es la segunda
 * acción del bloque, y si pesara lo mismo competiría con la compra. `wa_source: event_vip`.
 */
export function VipWhatsappCta({
  href,
  eventSlug,
  className = ""
}: {
  href: string;
  eventSlug: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("click_whatsapp", { wa_source: "event_vip", event_slug: eventSlug })}
      className={`btn-out t150 flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.18] text-[13.5px] font-bold leading-none text-white ${className}`}
    >
      <Icon name="chat" size={17} />
      Consultar por mesas VIP
    </a>
  );
}

/**
 * WhatsApp secundario — 58px, delineado, **nunca relleno**.
 *
 * Va al lado del CTA de compra y no compite con él: si el verde de WhatsApp se rellenara,
 * pasaría a pesar lo mismo que el chartreuse y la pantalla dejaría de tener un solo CTA
 * primario.
 */
export function WhatsappIconButton({
  href,
  source,
  eventSlug,
  label = "Consultar por WhatsApp",
  className = ""
}: {
  href: string;
  source: string;
  eventSlug?: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onClick={() => track("click_whatsapp", { wa_source: source, event_slug: eventSlug })}
      // 58px en mobile (§1.5) y 56 en desktop (§10): a 56 el CTA de la columna del detalle
      // da los 400px a 1280 y los 470px a 1440 que fija el PRD.
      className={`btn-out t150 grid h-14 w-[58px] flex-none place-items-center rounded-full border border-white/[0.18] text-white lg:w-14 ${className}`}
    >
      <Icon name="chat" size={21} />
    </a>
  );
}

/**
 * Grupo de difusión de WhatsApp, dentro del bloque de credencial RRPP del detalle.
 *
 * Es para quien todavía no compra: si esta fecha no es la suya, que no se vaya sin dejar
 * una vía para volver. Delineado y en blanco, como todo lo que no lleva a Bombo; dos líneas
 * porque el pedido completo ("…para enterarte de los próximos eventos") no entra en una
 * píldora sin cortarse en mobile.
 */
export function WhatsappGroupButton({
  eventSlug,
  source = "event_group",
  className = ""
}: {
  eventSlug?: string;
  source?: WhatsappSource;
  className?: string;
}) {
  return (
    <a
      href={siteConfig.whatsappGroup}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("click_whatsapp_group", { wa_source: source, event_slug: eventSlug })}
      // En mobile se destaca un punto más: fondo de vidrio, borde fuerte, ícono en verde
      // WhatsApp y flecha. Sigue siendo delineado y nunca cian: no compite con comprar.
      className={`btn-out t150 flex min-h-[52px] items-center gap-3 rounded-[14px] border border-white/30 px-[14px] py-[10px] text-white max-lg:min-h-[64px] max-lg:rounded-[18px] max-lg:border-white/45 max-lg:bg-white/[0.1] max-lg:py-3 ${className}`}
    >
      <Icon name="chat" size={19} className="flex-none lg:block max-lg:hidden" />
      <span className="hidden h-10 w-10 flex-none place-items-center rounded-full bg-[#25D366] text-ink max-lg:grid">
        <Icon name="chat" size={20} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="text-[13.5px] font-bold leading-[1.2] max-lg:text-[15.5px] max-lg:font-extrabold">Sumate al grupo de WhatsApp</span>
        <span className="text-[12px] leading-[1.3] text-white/60 max-lg:text-[12.5px] max-lg:text-white/75">Para enterarte de los próximos eventos</span>
      </span>
      <Icon name="arrow" size={18} className="flex-none lg:hidden" />
    </a>
  );
}
