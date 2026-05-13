import { NextResponse, type NextRequest } from "next/server";
import { demoEvents } from "@/lib/demo-events";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { slug } = await params;
  let targetUrl: string | null = null;

  if (isSupabaseAdminConfigured) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase.rpc("increment_event_clicks", { event_slug: slug });
      if (!error && typeof data === "string") targetUrl = data;
    } catch (error) {
      console.error("Click tracking error", error);
    }
  }

  if (!targetUrl) {
    targetUrl = demoEvents.find((event) => event.slug === slug)?.bombo_url || "/eventos";
  }

  const url = new URL(targetUrl, request.url);
  if (url.hostname !== request.nextUrl.hostname) {
    url.searchParams.set("utm_source", "electrotickets");
    url.searchParams.set("utm_medium", "referral");
    url.searchParams.set("utm_campaign", slug);
  }

  return NextResponse.redirect(url);
}
