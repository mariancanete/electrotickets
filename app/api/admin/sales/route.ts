import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase";
import type { EventSaleInput } from "@/types/analytics";

export const runtime = "nodejs";

async function guard() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

/**
 * Carga manual de las entradas vendidas que reporta Bombo, por evento y por día.
 *
 * Bombo no expone API ni webhook, pero sí muestra ventas por evento desglosadas por fecha.
 * Cargarlas acá es lo que permite cruzarlas contra `event_clicks` y obtener la tasa
 * clic→venta real, que es la métrica que hoy falta para decidir cualquier otra cosa.
 */
export async function POST(request: Request) {
  const unauthorized = await guard();
  if (unauthorized) return unauthorized;

  try {
    const payload = normalizeSale(await request.json());
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from("event_sales")
      .upsert(payload, { onConflict: "event_id,sale_date" })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ sale: data });
  } catch (error) {
    return NextResponse.json({ error: toMessage(error, "No se pudo guardar la venta.") }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await guard();
  if (unauthorized) return unauthorized;

  try {
    const { id } = (await request.json()) as { id?: string };
    if (!id) throw new Error("Falta el id de la venta");

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("event_sales").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: toMessage(error, "No se pudo borrar la venta.") }, { status: 400 });
  }
}

function normalizeSale(input: Partial<EventSaleInput>): EventSaleInput {
  if (!input.event_id) throw new Error("Elegí un evento");
  if (!input.sale_date) throw new Error("La fecha es obligatoria");

  const tickets = Number(input.tickets_sold);
  if (!Number.isFinite(tickets) || tickets < 0) throw new Error("Las entradas vendidas tienen que ser un número válido");

  return {
    event_id: input.event_id,
    sale_date: input.sale_date,
    tickets_sold: Math.round(tickets),
    notes: input.notes?.trim() || null
  };
}

function toMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    // La tabla se crea con supabase/05-analytics.sql; sin ella el mensaje de Postgres no
    // le dice nada al operador.
    if (/relation .*event_sales.* does not exist/i.test(error.message)) {
      return "Falta crear la tabla de ventas. Ejecutá supabase/05-analytics.sql en Supabase.";
    }
    return error.message;
  }
  return fallback;
}
