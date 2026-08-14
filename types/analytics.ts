export type EventSaleRecord = {
  id: string;
  event_id: string;
  sale_date: string;
  tickets_sold: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type EventSaleInput = {
  event_id: string;
  sale_date: string;
  tickets_sold: number;
  notes?: string | null;
};

export type EventPerformance = {
  slug: string;
  clicks: number;
  clicksLast7Days: number;
  ticketsSold: number;
  byPlacement: Record<string, number>;
  byDevice: Record<string, number>;
  bySource: Record<string, number>;
};
