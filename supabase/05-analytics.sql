-- ElectroTickets · Medición comercial
-- Ejecutar en Supabase SQL Editor sobre la base existente. Es idempotente.
--
-- Resuelve el problema central de la auditoría: hoy el único dato de conversión es
-- `events.clicks_count`, un entero sin fecha, sin origen y sin ubicación del CTA, así que
-- no se puede calcular CTR, ni comparar secciones, ni atribuir a un canal.
--
-- Crea dos tablas:
--   · event_clicks → una fila por clic hacia Bombo (la mitad del embudo que falta).
--   · event_sales  → entradas vendidas por evento y por día, cargadas a mano desde Bombo.
-- Cruzando ambas se obtiene la tasa clic→venta real, por evento y por día.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Clics hacia Bombo
-- ---------------------------------------------------------------------------

create table if not exists public.event_clicks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events (id) on delete set null,
  event_slug text not null,
  placement text,
  source text,
  medium text,
  campaign text,
  referrer text,
  user_agent text,
  device text,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists event_clicks_slug_created_idx
  on public.event_clicks (event_slug, created_at desc);
create index if not exists event_clicks_created_idx
  on public.event_clicks (created_at desc);
create index if not exists event_clicks_event_id_idx
  on public.event_clicks (event_id);

alter table public.event_clicks enable row level security;

-- Sin política para anon/authenticated: solo el service role (servidor) escribe y lee.
revoke all on public.event_clicks from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Ventas reportadas por Bombo (carga manual desde /admin)
-- ---------------------------------------------------------------------------

create table if not exists public.event_sales (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  sale_date date not null,
  tickets_sold integer not null default 0 check (tickets_sold >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, sale_date)
);

create index if not exists event_sales_event_date_idx
  on public.event_sales (event_id, sale_date desc);

alter table public.event_sales enable row level security;
revoke all on public.event_sales from anon, authenticated;

drop trigger if exists set_event_sales_updated_at on public.event_sales;
create trigger set_event_sales_updated_at
before update on public.event_sales
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Registrar un clic y devolver el link de Bombo en una sola llamada
-- ---------------------------------------------------------------------------
-- Una sola ida y vuelta a la base: el clic de compra es el momento más sensible a la
-- latencia de todo el sitio, así que no conviene encadenar dos consultas antes del redirect.

create or replace function public.track_event_click(
  event_slug text,
  click_placement text default null,
  click_source text default null,
  click_medium text default null,
  click_campaign text default null,
  click_referrer text default null,
  click_user_agent text default null,
  click_device text default null,
  click_session_id text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  target_event public.events%rowtype;
begin
  update public.events
  set clicks_count = clicks_count + 1
  where slug = event_slug and published = true
  returning * into target_event;

  if target_event.id is null then
    return null;
  end if;

  insert into public.event_clicks (
    event_id, event_slug, placement, source, medium, campaign,
    referrer, user_agent, device, session_id
  )
  values (
    target_event.id, event_slug, click_placement, click_source, click_medium, click_campaign,
    click_referrer, left(click_user_agent, 400), click_device, click_session_id
  );

  return target_event.bombo_url;
end;
$$;

revoke all on function public.track_event_click(
  text, text, text, text, text, text, text, text, text
) from anon, authenticated;
