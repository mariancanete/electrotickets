import { getSupabaseAdminClient } from "@/lib/supabase";
import type { CatalogResponse, GenreRecord, VenueRecord } from "@/types/catalog";

const now = new Date(0).toISOString();

const fallbackGenres: GenreRecord[] = [
  "Techno",
  "House",
  "Progressive House",
  "Melodic Techno",
  "Deep House",
  "Tech House",
  "Minimal",
  "Trance",
  "Hard Techno",
  "Afro House",
  "Electrónica"
].map((name, index) => ({
  id: `fallback-genre-${index}`,
  name,
  active: true,
  sort_order: index,
  created_at: now,
  updated_at: now
}));

const fallbackVenues: VenueRecord[] = [];

export async function getAdminCatalog(): Promise<CatalogResponse> {
  try {
    const supabase = getSupabaseAdminClient();

    const [venuesResult, genresResult] = await Promise.all([
      supabase
        .from("venues")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("genres")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true })
    ]);

    if (venuesResult.error) throw venuesResult.error;
    if (genresResult.error) throw genresResult.error;

    return {
      venues: (venuesResult.data || []) as VenueRecord[],
      genres: (genresResult.data?.length ? genresResult.data : fallbackGenres) as GenreRecord[]
    };
  } catch (error) {
    console.error("Admin catalog fallback", error);
    return {
      venues: fallbackVenues,
      genres: fallbackGenres
    };
  }
}
