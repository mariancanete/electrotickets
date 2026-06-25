import type { MetadataRoute } from "next";
import { getUpcomingPublishedEvents } from "@/lib/events";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getUpcomingPublishedEvents();
  const baseRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${siteConfig.url}/eventos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${siteConfig.url}/destacados`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85
    },
    {
      url: `${siteConfig.url}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${siteConfig.url}/preguntas-frecuentes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6
    }
  ];

  return [
    ...baseRoutes,
    ...events.map((event) => ({
      url: `${siteConfig.url}/eventos/${event.slug}`,
      lastModified: new Date(event.updated_at || event.created_at || event.starts_at),
      changeFrequency: "weekly" as const,
      priority: event.featured ? 0.85 : 0.75
    }))
  ];
}
