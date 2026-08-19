"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { buildGoUrl, eventParams, track, type CtaPlacement } from "@/lib/analytics";
import { saveDate } from "@/lib/saved-dates";
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
      onClick={() => {
        track("click_buy", { ...eventParams(event), cta_placement: placement });
        saveDate(event.slug, event.starts_at);
      }}
      className={`cta-hov t150 flex h-14 items-center justify-center gap-[9px] rounded-full bg-cta text-ink active:bg-cta-pressed ${className}`}
    >
      <span className="text-[15px] font-bold leading-none tracking-[-0.01em]">{label}</span>
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
 * Estado agotado — la única variante del CTA sin chartreuse.
 *
 * Se renderiza como `<span>` y no como `<button disabled>` porque no hay ninguna acción
 * detrás: es una etiqueta de estado con forma de botón. Un botón deshabilitado invita a
 * tocarlo; esto informa y se termina ahí.
 *
 * `sold_out` apaga la card y el CTA, y `last_tickets` pinta el chip coral: nunca se muestran
 * los dos juntos, porque una fecha agotada no puede estar además por agotarse.
 */
export function SoldOutCta({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <span
      aria-disabled="true"
      className={`cta-disabled flex items-center justify-center rounded-full border border-white/10 bg-surface-alt text-white/[0.34] ${
        compact ? "h-11 text-[13px]" : "h-14 text-[15px]"
      } font-bold leading-none ${className}`}
    >
      Agotado
    </span>
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
