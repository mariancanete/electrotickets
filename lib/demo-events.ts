import type { EventRecord } from "@/types/event";

export const demoEvents: EventRecord[] = [
  {
    id: "demo-1",
    title: "Nocturna Sessions · Melodic Techno",
    slug: "nocturna-sessions-melodic-techno-2026-06-14",
    description:
      "Una noche de melodic techno, visuales inmersivas y warm up progresivo en Buenos Aires.",
    flyer_url:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=80",
    lineup: ["Valen Vox", "Mora B2B Santi", "Ares Live"],
    venue_name: "Club Central",
    venue_address: "Buenos Aires, Argentina",
    city: "Buenos Aires",
    province: "CABA",
    map_url: "https://maps.google.com/?q=Buenos+Aires+Argentina",
    starts_at: "2026-06-14T02:00:00.000Z",
    end_at: null,
    price_label: "$18.000 - $32.000",
    genre: "Melodic Techno",
    video_url: "https://www.youtube.com/watch?v=5qap5aO4i9A",
    bombo_url: "https://bombo.com.ar/",
    featured: true,
    published: true,
    clicks_count: 0,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "demo-2",
    title: "Warehouse Ritual · Techno Night",
    slug: "warehouse-ritual-techno-night-2026-06-28",
    description:
      "Techno crudo, sonido industrial y cierre extendido para una fecha de alto voltaje.",
    flyer_url:
      "https://images.unsplash.com/photo-1571266028243-d220c9c3c2ff?auto=format&fit=crop&w=1400&q=80",
    lineup: ["Kora", "Nico R", "Lara Hex"],
    venue_name: "Distrito Sur",
    venue_address: "Buenos Aires, Argentina",
    city: "Buenos Aires",
    province: "CABA",
    map_url: "https://maps.google.com/?q=Buenos+Aires+Argentina",
    starts_at: "2026-06-28T03:00:00.000Z",
    end_at: null,
    price_label: "$22.000 - $40.000",
    genre: "Techno",
    video_url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    bombo_url: "https://bombo.com.ar/",
    featured: true,
    published: true,
    clicks_count: 0,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "demo-3",
    title: "Solar Groove · House & Progressive",
    slug: "solar-groove-house-progressive-2026-07-05",
    description:
      "House, progressive y grooves cálidos para arrancar la noche con energía elegante.",
    flyer_url:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80",
    lineup: ["Dante O", "Mila Sound", "Juan P"],
    venue_name: "Rooftop BA",
    venue_address: "Buenos Aires, Argentina",
    city: "Buenos Aires",
    province: "CABA",
    map_url: "https://maps.google.com/?q=Buenos+Aires+Argentina",
    starts_at: "2026-07-05T01:00:00.000Z",
    end_at: null,
    price_label: "$15.000 - $28.000",
    genre: "House",
    video_url: null,
    bombo_url: "https://bombo.com.ar/",
    featured: false,
    published: true,
    clicks_count: 0,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
