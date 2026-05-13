export type VenueRecord = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  province: string | null;
  map_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type GenreRecord = {
  id: string;
  name: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CatalogResponse = {
  venues: VenueRecord[];
  genres: GenreRecord[];
};
