import { getSupabaseAdminClient } from "@/lib/supabase";
import type { EventSaleRecord, EventPerformance } from "@/types/analytics";

/** Ventana de análisis del panel. Acotada para que la consulta no crezca sin límite. */
const WINDOW_DAYS = 120;

type ClickRow = {
  event_slug: string;
  placement: string | null;
  device: string | null;
  source: string | null;
  created_at: string;
};

function windowStart() {
  return new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Cruza clics (`event_clicks`) contra ventas cargadas a mano desde Bombo (`event_sales`)
 * para obtener la tasa clic→venta por evento, que es la métrica que hoy no existe.
 *
 * Devuelve estructuras vacías si las tablas todavía no fueron creadas: el panel tiene que
 * seguir funcionando en un preview desplegado antes de correr la migración.
 */
export async function getEventPerformance(): Promise<{
  performance: Record<string, EventPerformance>;
  sales: EventSaleRecord[];
  ready: boolean;
}> {
  const empty = { performance: {}, sales: [], ready: false };

  let supabase;
  try {
    supabase = getSupabaseAdminClient();
  } catch {
    return empty;
  }

  const since = windowStart();

  const [clicksResult, salesResult] = await Promise.all([
    supabase
      .from("event_clicks")
      .select("event_slug, placement, device, source, created_at")
      .gte("created_at", since)
      .limit(20000),
    supabase.from("event_sales").select("*").order("sale_date", { ascending: false }).limit(2000)
  ]);

  if (clicksResult.error || salesResult.error) {
    console.error(
      "Analytics tables unavailable — ¿corriste supabase/05-analytics.sql?",
      clicksResult.error?.message || salesResult.error?.message
    );
    return empty;
  }

  const clicks = (clicksResult.data || []) as ClickRow[];
  const sales = (salesResult.data || []) as EventSaleRecord[];

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const performance: Record<string, EventPerformance> = {};

  for (const row of clicks) {
    const entry = (performance[row.event_slug] ||= {
      slug: row.event_slug,
      clicks: 0,
      clicksLast7Days: 0,
      ticketsSold: 0,
      byPlacement: {},
      byDevice: {},
      bySource: {}
    });

    entry.clicks += 1;
    if (new Date(row.created_at).getTime() >= sevenDaysAgo) entry.clicksLast7Days += 1;

    const placement = row.placement || "sin_placement";
    const device = row.device || "desconocido";
    const source = row.source || "directo";
    entry.byPlacement[placement] = (entry.byPlacement[placement] || 0) + 1;
    entry.byDevice[device] = (entry.byDevice[device] || 0) + 1;
    entry.bySource[source] = (entry.bySource[source] || 0) + 1;
  }

  return { performance, sales, ready: true };
}

/** Suma de entradas vendidas por `event_id`, para cruzar con los clics del mismo evento. */
export function sumSalesByEvent(sales: EventSaleRecord[]) {
  return sales.reduce<Record<string, number>>((acc, sale) => {
    acc[sale.event_id] = (acc[sale.event_id] || 0) + sale.tickets_sold;
    return acc;
  }, {});
}
