import { NextResponse, type NextRequest } from "next/server";
import { demoEvents } from "@/lib/demo-events";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

const SESSION_COOKIE = "et_sid";
const SESSION_DAYS = 180;

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;

  const sessionId = request.cookies.get(SESSION_COOKIE)?.value || crypto.randomUUID();
  const userAgent = request.headers.get("user-agent") || "";
  const click = {
    placement: searchParams.get("placement"),
    // UTM de la visita entrante (Instagram, campañas), distinto de la UTM que le ponemos
    // nosotros al salir hacia Bombo.
    source: searchParams.get("utm_source"),
    medium: searchParams.get("utm_medium"),
    campaign: searchParams.get("utm_campaign"),
    referrer: request.headers.get("referer"),
    userAgent,
    device: detectDevice(userAgent),
    sessionId
  };

  const targetUrl = (await resolveTargetUrl(slug, click)) || fallbackUrl(slug);

  const url = new URL(targetUrl, request.url);
  if (url.hostname !== request.nextUrl.hostname) {
    url.searchParams.set("utm_source", "electrotickets");
    url.searchParams.set("utm_medium", "referral");
    url.searchParams.set("utm_campaign", slug);
    if (click.placement) url.searchParams.set("utm_content", click.placement);
  }

  const response = NextResponse.redirect(url);
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/"
  });

  return response;
}

type ClickContext = {
  placement: string | null;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  referrer: string | null;
  userAgent: string;
  device: string;
  sessionId: string;
};

/**
 * Devuelve el link de Bombo y registra el clic.
 *
 * Intenta primero `track_event_click` (migración `05-analytics.sql`), que registra la fila
 * completa. Si esa función todavía no existe en la base — por ejemplo en un preview
 * desplegado antes de correr la migración — cae a `increment_event_clicks`, que es el
 * comportamiento anterior. La redirección nunca depende de que la analítica funcione.
 */
async function resolveTargetUrl(slug: string, click: ClickContext) {
  if (!isSupabaseAdminConfigured) return null;

  let supabase;
  try {
    supabase = getSupabaseAdminClient();
  } catch (error) {
    console.error("Supabase admin client unavailable", error);
    return null;
  }

  try {
    const { data, error } = await supabase.rpc("track_event_click", {
      event_slug: slug,
      click_placement: click.placement,
      click_source: click.source,
      click_medium: click.medium,
      click_campaign: click.campaign,
      click_referrer: click.referrer,
      click_user_agent: click.userAgent,
      click_device: click.device,
      click_session_id: click.sessionId
    });

    if (!error && typeof data === "string") return data;
    if (error) console.error("track_event_click unavailable, falling back", error.message);
  } catch (error) {
    console.error("Click tracking error", error);
  }

  try {
    const { data, error } = await supabase.rpc("increment_event_clicks", { event_slug: slug });
    if (!error && typeof data === "string") return data;
  } catch (error) {
    console.error("Legacy click tracking error", error);
  }

  return null;
}

function fallbackUrl(slug: string) {
  return demoEvents.find((event) => event.slug === slug)?.bombo_url || "/eventos";
}

function detectDevice(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return "tablet";
  if (/mobi|android|iphone|ipod/.test(ua)) return "mobile";
  return "desktop";
}
