"use client";

import { track, type WhatsappSource } from "@/lib/analytics";

type WhatsappLinkProps = {
  href: string;
  source: WhatsappSource;
  /** `group` para el grupo de difusión, `direct` para un chat 1 a 1. */
  kind?: "direct" | "group";
  eventSlug?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Link de WhatsApp instrumentado. Cada punto de captura manda su propio `wa_source`, que es
 * lo que permite saber qué bloque genera leads: sin eso, todos los leads llegan iguales y
 * no se puede decidir dónde poner el próximo CTA.
 */
export function WhatsappLink({
  href,
  source,
  kind = "direct",
  eventSlug,
  className,
  children
}: WhatsappLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() =>
        track(kind === "group" ? "click_whatsapp_group" : "click_whatsapp", {
          wa_source: source,
          event_slug: eventSlug
        })
      }
    >
      {children}
    </a>
  );
}
