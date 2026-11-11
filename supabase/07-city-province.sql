-- ElectroTickets · Ciudad y provincia en el orden correcto
-- Ejecutar en Supabase SQL Editor. Es idempotente: se puede correr más de una vez.
--
-- La regla es provincia = "Buenos Aires" y ciudad = "CABA", "Mar del Plata"… El panel y el
-- esquema original las tenían al revés (ciudad "Buenos Aires", provincia "CABA"), así que
-- cada evento nuevo y cada venue del catálogo se guardaban invertidos.
--
-- 1. Defaults de columna. Si se cargaron a mano desde el editor de tablas con comillas
--    ('CABA'::text), Supabase los guarda como el texto literal "'CABA'::text". Esto los deja
--    como valores simples.

alter table public.events alter column city set default 'CABA';
alter table public.events alter column province set default 'Buenos Aires';

alter table public.venues alter column city set default 'CABA';
alter table public.venues alter column province set default 'Buenos Aires';

-- 2. Filas invertidas: "Buenos Aires" en ciudad y otra cosa en provincia. Se dan vuelta los
--    dos campos. Una fila de Uruguay con "Maldonado" en provincia no se toca porque no tiene
--    "Buenos Aires" en ciudad.

update public.venues
set city = province, province = city, updated_at = now()
where city = 'Buenos Aires'
  and province is not null
  and province <> 'Buenos Aires';

update public.events
set city = province, province = city, updated_at = now()
where city = 'Buenos Aires'
  and province is not null
  and province <> 'Buenos Aires';

-- 3. Para revisar el resultado:
-- select name, city, province from public.venues order by name;
-- select slug, venue_name, city, province from public.events order by starts_at desc;
