"use client";

import { buildGoUrl, eventParams, track, type CtaPlacement } from "@/lib/analytics";
import type { EventRecord } from "@/types/event";

type BuyButtonProps = {
  event: Pick<EventRecord, "slug" | "title" | "genre" | "venue_name" | "sold_out" | "last_tickets">;
  placement: CtaPlacement;
  className?: string;
  children: React.ReactNode;
};

/**
 * CTA de compra. Existe como componente cliente por una sola razón: `/go/[slug]` es una
 * redirección de servidor, así que GA4 no puede ver ese clic por su cuenta. El evento tiene
 * que dispararse acá, antes de navegar.
 *
 * La navegación es un `<a>` normal, en la misma pestaña: mantener el historial permite que
 * el usuario vuelva con el botón atrás si Bombo no lo convence.
 */
export function BuyButton({ event, placement, className, children }: BuyButtonProps) {
  return (
    <a
      href={buildGoUrl(event.slug, placement)}
      className={className}
      onClick={() => track("click_buy", { ...eventParams(event), cta_placement: placement })}
    >
      {children}
    </a>
  );
}
