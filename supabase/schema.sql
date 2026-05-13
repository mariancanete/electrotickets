-- ElectroTickets MVP schema
-- Ejecutar en Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  flyer_url text,
  lineup text[] default '{}',
  venue_name text,
  venue_address text,
  city text default 'Buenos Aires',
  province text default 'CABA',
  map_url text,
  starts_at timestamptz not null,
  end_at timestamptz,
  price_label text,
  genre text,
  video_url text,
  bombo_url text not null,
  featured boolean not null default false,
  published boolean not null default true,
  clicks_count integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_published_starts_at_idx on public.events (published, starts_at);
create index if not exists events_slug_idx on public.events (slug);
create index if not exists events_genre_idx on public.events (genre);

alter table public.events enable row level security;

drop policy if exists "Public can read published events" on public.events;
create policy "Public can read published events"
  on public.events
  for select
  to anon, authenticated
  using (published = true);

-- Service role bypasses RLS. The admin panel uses SUPABASE_SERVICE_ROLE_KEY only on the server.

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create or replace function public.increment_event_clicks(event_slug text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  target_url text;
begin
  update public.events
  set clicks_count = clicks_count + 1
  where slug = event_slug and published = true
  returning bombo_url into target_url;

  return target_url;
end;
$$;

-- Storage bucket for flyers
insert into storage.buckets (id, name, public)
values ('event-flyers', 'event-flyers', true)
on conflict (id) do nothing;

drop policy if exists "Public can read event flyers" on storage.objects;
create policy "Public can read event flyers"
  on storage.objects
  for select
  to public
  using (bucket_id = 'event-flyers');
