import type { MetadataRoute } from "next";
import { getUpcomingArtists } from "@/lib/artists";
import { getRecentPastPublishedEvents, getUpcomingPublishedEvents } from "@/lib/events";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [upcomingEvents, pastEvents, artists] = await Promise.all([
    getUpcomingPublishedEvents(),
    getRecentPastPublishedEvents(),
    getUpcomingArtists()
  ]);

  const baseRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}/eventos`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/destacados`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${siteConfig.url}/quienes-somos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/contacto`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    {
      url: `${siteConfig.url}/preguntas-frecuentes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6
    },
    { url: `${siteConfig.url}/privacidad`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 }
  ];

  return [
    ...baseRoutes,
    ...upcomingEvents.map((event) => ({
      url: `${siteConfig.url}/eventos/${event.slug}`,
      lastModified: new Date(event.updated_at || event.created_at || event.starts_at),
      changeFrequency: "weekly" as const,
      priority: event.featured ? 0.85 : 0.75
    })),
    // Artistas con fechas vigentes. Sus páginas no vencen: el posicionamiento se acumula de
    // una fecha a la siguiente, así que pesan tanto como una fecha destacada.
    ...artists.map((artist) => ({
      url: `${siteConfig.url}/artistas/${artist.slug}`,
      lastModified: new Date(artist.lastModified),
      changeFrequency: "weekly" as const,
      priority: 0.85
    })),
    // Las fechas ya realizadas siguen en el sitemap con prioridad baja: conservan
    // posicionamiento y backlinks, y ahora sus páginas derivan a la agenda vigente en vez
    // de devolver 404.
    ...pastEvents.map((event) => ({
      url: `${siteConfig.url}/eventos/${event.slug}`,
      lastModified: new Date(event.updated_at || event.created_at || event.starts_at),
      changeFrequency: "monthly" as const,
      priority: 0.3
    }))
  ];
}
