/**
 * Capa de medición de ElectroTickets.
 *
 * El clic de compra sale por `/go/[slug]`, que es una redirección de servidor: no renderiza
 * HTML ni ejecuta JS, así que GA4 nunca lo ve por su cuenta. Por eso el clic se mide dos
 * veces y en dos lugares distintos:
 *
 * 1. En el cliente, con `track("click_buy")` antes de navegar (GA4, para atribución).
 * 2. En el servidor, guardando una fila en `event_clicks` dentro del route handler
 *    (Supabase, para conciliar contra las ventas que reporta Bombo).
 */

/**
 * Dónde estaba el CTA que originó el clic. Se guarda en `event_clicks.placement`.
 *
 * Los valores del rediseño Hora Pico se **agregan** a los anteriores en vez de reemplazarlos:
 * `event_clicks` ya tiene meses de filas con los placements viejos, y renombrarlos partiría
 * la serie histórica justo en la métrica que se usa para decidir dónde poner el próximo CTA.
 */
export type CtaPlacement =
  // Placements del sistema anterior. Se conservan por la serie histórica de `event_clicks`.
  | "hero"
  | "home_agenda"
  | "home_weekend"
  | "home_last_tickets"
  | "event_list"
  | "featured_list"
  | "event_detail"
  | "sticky_mobile"
  | "related"
  | "past_event"
  // Placements del rediseño de 9 pantallas (§8.2 del PRD).
  | "home_destacado"
  | "listado_card"
  | "detalle_barra"
  | "compra_barra"
  | "vacio_proxima"
  | "mis_entradas_card";

/**
 * Los seis placements nuevos se dividen en dos familias, y la diferencia importa para leer
 * los números:
 *
 *   **Directos a Bombo** — `home_destacado`, `detalle_barra`, `compra_barra`. Son los botones
 *   "Comprar en Bombo": navegan a `/go/[slug]` y disparan `click_buy`. Estos son los que
 *   cuentan como intención de compra.
 *
 *   **De card** — `listado_card`, `vacio_proxima`, `mis_entradas_card`. Son los CTA compactos
 *   que dicen "Entradas" y abren el **detalle**, no Bombo (§1.2). No pueden disparar
 *   `click_buy` porque no van a `/go/`, así que disparan `select_date`: mide qué superficie
 *   empuja al detalle sin inflar la métrica de compra contando dos veces la misma intención.
 */
export const CARD_PLACEMENTS = ["listado_card", "vacio_proxima", "mis_entradas_card"] as const;

/** De dónde salió una consulta de WhatsApp. Se manda como `wa_source` a GA4. */
export type WhatsappSource =
  | "home_alerts"
  | "home_vip"
  | "footer"
  | "contact_page"
  | "contact_group"
  | "event_question"
  | "event_price"
  | "event_vip"
  | "event_waitlist"
  | "soldout"
  | "empty_results"
  | "past_event";

export function buildGoUrl(slug: string, placement: CtaPlacement) {
  return `/go/${slug}?placement=${placement}`;
}

type TrackParams = Record<string, string | number | boolean | undefined>;

type GtagWindow = Window & {
  gtag?: (command: "event", name: string, params?: TrackParams) => void;
};

/**
 * Manda un evento a GA4 si está cargado. Si no lo está, no hace nada y no rompe:
 * `NEXT_PUBLIC_GA_ID` es opcional y en local normalmente no está.
 */
export function track(name: string, params: TrackParams = {}) {
  if (typeof window === "undefined") return;

  const gtag = (window as GtagWindow).gtag;
  if (typeof gtag !== "function") return;

  const clean: TrackParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") clean[key] = value;
  }

  try {
    gtag("event", name, clean);
  } catch {
    // Nunca dejar que la analítica rompa una navegación.
  }
}

/** Parámetros comunes a todos los eventos de un evento concreto. */
export function eventParams(event: {
  slug: string;
  title: string;
  genre?: string | null;
  venue_name?: string | null;
  sold_out?: boolean;
  last_tickets?: boolean;
}): TrackParams {
  return {
    event_slug: event.slug,
    event_title: event.title,
    genre: event.genre || undefined,
    venue: event.venue_name || undefined,
    sold_out: Boolean(event.sold_out),
    last_tickets: Boolean(event.last_tickets)
  };
}
