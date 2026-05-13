export type EventRecord = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  flyer_url: string | null;
  lineup: string[] | null;
  venue_name: string | null;
  venue_address: string | null;
  city: string | null;
  province: string | null;
  map_url: string | null;
  starts_at: string;
  end_at: string | null;
  price_label: string | null;
  genre: string | null;
  video_url: string | null;
  bombo_url: string;
  featured: boolean;
  published: boolean;
  clicks_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type EventInput = Partial<EventRecord> & {
  title: string;
  starts_at: string;
  bombo_url: string;
};
