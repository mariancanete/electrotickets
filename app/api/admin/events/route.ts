import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { buildEventSlug } from "@/lib/slugify";
import { getSupabaseAdminClient } from "@/lib/supabase";
import type { EventInput } from "@/types/event";

export const runtime = "nodejs";

async function guard() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function POST(request: Request) {
  const unauthorized = await guard();
  if (unauthorized) return unauthorized;

  try {
    const payload = normalizePayload(await request.json());
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from("events").insert(payload).select("*").single();

    if (error) throw error;
    return NextResponse.json({ event: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error creating event" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const unauthorized = await guard();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as EventInput & { id?: string };
    if (!body.id) throw new Error("Missing event id");

    const payload = normalizePayload(body);
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from("events").update(payload).eq("id", body.id).select("*").single();

    if (error) throw error;
    return NextResponse.json({ event: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error updating event" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await guard();
  if (unauthorized) return unauthorized;

  try {
    const { id } = (await request.json()) as { id?: string };
    if (!id) throw new Error("Missing event id");

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error deleting event" }, { status: 400 });
  }
}

function normalizePayload(input: EventInput) {
  if (!input.title?.trim()) throw new Error("El título es obligatorio");
  if (!input.starts_at) throw new Error("La fecha es obligatoria");
  if (!input.bombo_url?.trim()) throw new Error("El link de Bombo es obligatorio");

  return {
    title: input.title.trim(),
    slug: input.slug?.trim() || buildEventSlug(input.title, input.starts_at),
    description: input.description?.trim() || null,
    flyer_url: input.flyer_url?.trim() || null,
    lineup: Array.isArray(input.lineup) ? input.lineup : [],
    venue_name: input.venue_name?.trim() || null,
    venue_address: input.venue_address?.trim() || null,
    city: input.city?.trim() || "Buenos Aires",
    province: input.province?.trim() || "CABA",
    map_url: input.map_url?.trim() || null,
    starts_at: input.starts_at,
    end_at: input.end_at || null,
    price_label: input.price_label?.trim() || null,
    genre: input.genre?.trim() || null,
    video_url: input.video_url?.trim() || null,
    bombo_url: input.bombo_url.trim(),
    featured: Boolean(input.featured),
    last_tickets: Boolean(input.last_tickets),
    published: Boolean(input.published),
    sort_order: Number(input.sort_order || 0),
    updated_at: new Date().toISOString()
  };
}
