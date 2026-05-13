-- ElectroTickets catalog migration
-- Ejecutar en Supabase SQL Editor sobre la base existente.

create extension if not exists pgcrypto;

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text,
  city text default 'Buenos Aires',
  province text default 'CABA',
  map_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists venues_active_name_idx on public.venues (active, name);

alter table public.venues enable row level security;

create table if not exists public.genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists genres_active_sort_idx on public.genres (active, sort_order, name);

alter table public.genres enable row level security;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_venues_updated_at on public.venues;
create trigger set_venues_updated_at
before update on public.venues
for each row execute function public.set_updated_at();

drop trigger if exists set_genres_updated_at on public.genres;
create trigger set_genres_updated_at
before update on public.genres
for each row execute function public.set_updated_at();

insert into public.genres (name, sort_order) values
  ('Techno', 10),
  ('House', 20),
  ('Progressive House', 30),
  ('Melodic Techno', 40),
  ('Deep House', 50),
  ('Tech House', 60),
  ('Minimal', 70),
  ('Trance', 80),
  ('Hard Techno', 90),
  ('Afro House', 100),
  ('Electrónica', 110)
on conflict (name) do nothing;
