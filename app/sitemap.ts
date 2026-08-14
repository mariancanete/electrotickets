import type { MetadataRoute } from "next";
import { getRecentPastPublishedEvents, getUpcomingPublishedEvents } from "@/lib/events";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [upcomingEvents, pastEvents] = await Promise.all([
    getUpcomingPublishedEvents(),
    getRecentPastPublishedEvents()
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
