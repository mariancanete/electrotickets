import type { MetadataRoute } from "next";
import { getPublishedEvents } from "@/lib/events";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getPublishedEvents();
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
    }
  ];

  return [
    ...baseRoutes,
    ...events.map((event) => ({
      url: `${siteConfig.url}/eventos/${event.slug}`,
      lastModified: new Date(event.updated_at),
      changeFrequency: "weekly" as const,
      priority: event.featured ? 0.85 : 0.75
    }))
  ];
}
