-- ElectroTickets · Normalización de géneros y venues
-- Ejecutar en Supabase SQL Editor. Es idempotente.
--
-- `genres.name` y `venues.name` tienen unique case-sensitive, así que "Progressive House" y
-- "Progressive house" conviven como dos filas distintas. Como el filtro público compara por
-- igualdad exacta, un género duplicado aparece dos veces en el select y parte los eventos
-- entre las dos variantes.
--
-- Esta migración fusiona los duplicados existentes, reapunta los eventos al nombre canónico
-- y agrega un índice único sobre el nombre normalizado para que no vuelvan a entrar.

-- ---------------------------------------------------------------------------
-- 1. Géneros: fusionar duplicados que solo difieren en mayúsculas o espacios
-- ---------------------------------------------------------------------------

with canonical as (
  select distinct on (lower(btrim(name)))
    id,
    name,
    lower(btrim(name)) as key
  from public.genres
  order by lower(btrim(name)), sort_order asc, created_at asc
)
update public.events e
set genre = c.name
from canonical c
where e.genre is not null
  and lower(btrim(e.genre)) = c.key
  and e.genre is distinct from c.name;

delete from public.genres g
where exists (
  select 1
  from public.genres keeper
  where lower(btrim(keeper.name)) = lower(btrim(g.name))
    and keeper.id <> g.id
    and (keeper.sort_order, keeper.created_at, keeper.id) < (g.sort_order, g.created_at, g.id)
);

update public.genres set name = btrim(name) where name <> btrim(name);

create unique index if not exists genres_name_normalized_idx
  on public.genres (lower(btrim(name)));

-- ---------------------------------------------------------------------------
-- 2. Venues: mismo tratamiento
-- ---------------------------------------------------------------------------

with canonical as (
  select distinct on (lower(btrim(name)))
    id,
    name,
    lower(btrim(name)) as key
  from public.venues
  order by lower(btrim(name)), sort_order asc, created_at asc
)
update public.events e
set venue_name = c.name
from canonical c
where e.venue_name is not null
  and lower(btrim(e.venue_name)) = c.key
  and e.venue_name is distinct from c.name;

delete from public.venues v
where exists (
  select 1
  from public.venues keeper
  where lower(btrim(keeper.name)) = lower(btrim(v.name))
    and keeper.id <> v.id
    and (keeper.sort_order, keeper.created_at, keeper.id) < (v.sort_order, v.created_at, v.id)
);

update public.venues set name = btrim(name) where name <> btrim(name);

create unique index if not exists venues_name_normalized_idx
  on public.venues (lower(btrim(name)));

-- ---------------------------------------------------------------------------
-- 3. Limpiar espacios sobrantes en los eventos ya cargados
-- ---------------------------------------------------------------------------

update public.events
set genre = btrim(genre)
where genre is not null and genre <> btrim(genre);

update public.events
set venue_name = btrim(venue_name)
where venue_name is not null and venue_name <> btrim(venue_name);
