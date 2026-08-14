import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminCatalog } from "@/lib/catalog";
import { normalizeText } from "@/lib/slugify";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

async function guard() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET() {
  const unauthorized = await guard();
  if (unauthorized) return unauthorized;

  const catalog = await getAdminCatalog();
  return NextResponse.json(catalog);
}

export async function POST(request: Request) {
  const unauthorized = await guard();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const supabase = getSupabaseAdminClient();

    // Un nombre que ya existe salvo por mayúsculas o acentos no crea una fila nueva: se
    // devuelve la existente. Así el panel selecciona la canónica en vez de fallar con un
    // error de unicidad o, peor, duplicar el género y partir el filtro público.
    const catalog = await getAdminCatalog();

    if (body.type === "venue") {
      const venue = normalizeVenue(body.venue || body);
      const existing = catalog.venues.find((item) => normalizeText(item.name) === normalizeText(venue.name));
      if (existing) return NextResponse.json({ venue: existing });

      const { data, error } = await supabase.from("venues").insert(venue).select("*").single();
      if (error) throw error;
      return NextResponse.json({ venue: data });
    }

    if (body.type === "genre") {
      const genre = normalizeGenre(body.genre || body);
      const existing = catalog.genres.find((item) => normalizeText(item.name) === normalizeText(genre.name));
      if (existing) return NextResponse.json({ genre: existing });

      const { data, error } = await supabase.from("genres").insert(genre).select("*").single();
      if (error) throw error;
      return NextResponse.json({ genre: data });
    }

    throw new Error("Tipo de catálogo inválido");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error saving catalog item" }, { status: 400 });
  }
}

function normalizeVenue(input: Record<string, unknown>) {
  const name = String(input.name || "").trim();
  if (!name) throw new Error("El nombre del venue es obligatorio");

  return {
    name,
    address: optionalString(input.address),
    city: optionalString(input.city) || "Buenos Aires",
    province: optionalString(input.province) || "CABA",
    map_url: optionalString(input.map_url),
    active: true,
    sort_order: Number(input.sort_order || 0)
  };
}

function normalizeGenre(input: Record<string, unknown>) {
  const name = String(input.name || "").trim();
  if (!name) throw new Error("El nombre del género es obligatorio");

  return {
    name,
    active: true,
    sort_order: Number(input.sort_order || 0)
  };
}

function optionalString(value: unknown) {
  const text = String(value || "").trim();
  return text || null;
}
