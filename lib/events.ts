import { demoEvents } from "@/lib/demo-events";
import { getSupabaseAdminClient, getSupabasePublicClient, isSupabasePublicConfigured } from "@/lib/supabase";
import type { EventRecord } from "@/types/event";

const eventSelect = "*";

export function isUpcomingEvent(event: Pick<EventRecord, "starts_at">) {
  if (!event.starts_at) return false;

  const startsAt = new Date(event.starts_at).getTime();
  if (Number.isNaN(startsAt)) return false;

  return startsAt > Date.now();
}

export function filterUpcomingEvents<T extends Pick<EventRecord, "starts_at">>(events: T[]) {
  return events.filter(isUpcomingEvent);
}

export async function getPublishedEvents(): Promise<EventRecord[]> {
  if (!isSupabasePublicConfigured) {
    return demoEvents.filter((event) => event.published).sort(sortEvents);
  }

  const supabase = getSupabasePublicClient();
  if (!supabase) return demoEvents.filter((event) => event.published).sort(sortEvents);

  const { data, error } = await supabase
    .from("events")
    .select(eventSelect)
    .eq("published", true)
    .order("starts_at", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error loading public events", error);
    return demoEvents.filter((event) => event.published).sort(sortEvents);
  }

  return (data || []) as EventRecord[];
}

export async function getUpcomingPublishedEvents(): Promise<EventRecord[]> {
  const events = await getPublishedEvents();
  return filterUpcomingEvents(events);
}

export async function getEventBySlug(slug: string, includeUnpublished = false): Promise<EventRecord | null> {
  if (!isSupabasePublicConfigured) {
    return demoEvents.find((event) => event.slug === slug && (includeUnpublished || event.published)) || null;
  }

  const supabase = includeUnpublished ? getSupabaseAdminClient() : getSupabasePublicClient();
  if (!supabase) return null;

  let query = supabase.from("events").select(eventSelect).eq("slug", slug).limit(1).single();
  if (!includeUnpublished) {
    query = supabase.from("events").select(eventSelect).eq("slug", slug).eq("published", true).limit(1).single();
  }

  const { data, error } = await query;

  if (error) return null;
  return data as EventRecord;
}

export async function getAdminEvents(): Promise<EventRecord[]> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("events")
      .select(eventSelect)
      .order("starts_at", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as EventRecord[];
  } catch (error) {
    console.error("Admin events fallback", error);
    return demoEvents.sort(sortEvents);
  }
}

function sortEvents(a: EventRecord, b: EventRecord) {
  return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
}
