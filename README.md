# ElectroTickets MVP

Plataforma moderna para listar eventos de música electrónica y enviar la compra al link de vendedor de Bombo.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Framer Motion
- Supabase Postgres + Storage
- Deploy recomendado: Vercel

## Funcionalidades incluidas

- Home moderna mobile first.
- Listado de eventos con búsqueda y filtro por género.
- Página SEO individual por evento: `/eventos/[slug]`.
- Metadata dinámica + Open Graph + Twitter Cards.
- Schema.org `MusicEvent` para SEO.
- Sitemap dinámico y robots.
- Admin privado en `/admin`.
- Login simple por contraseña.
- Alta, edición y eliminación de eventos.
- Upload de flyer a Supabase Storage.
- Redirección trackeable a Bombo por `/go/[slug]`.
- Contador de clicks por evento.
- Fallback demo si todavía no configuraste Supabase.

## Instalación local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrir:

```bash
http://localhost:3000
```

Admin:

```bash
http://localhost:3000/admin
```

## Configurar Supabase

1. Crear proyecto en Supabase.
2. Ir a SQL Editor.
3. Ejecutar `supabase/schema.sql`.
4. Ir a Project Settings > API.
5. Copiar:
   - Project URL
   - anon public key
   - service_role key
6. Completar `.env.local`.

Variables requeridas:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx
SUPABASE_STORAGE_BUCKET=event-flyers
ELECTROTICKETS_ADMIN_PASSWORD=tu-password
ADMIN_SESSION_SECRET=un-string-largo-random
```

## Deploy en Vercel

1. Crear repo en GitHub.
2. Subir este proyecto.
3. Importar repo en Vercel.
4. Cargar las mismas variables de entorno en Vercel.
5. Deploy.

Cuando compres el dominio `electrotickets.com.ar`, cambiar:

```bash
NEXT_PUBLIC_SITE_URL=https://electrotickets.com.ar
```

Y agregar el dominio desde Vercel > Project > Settings > Domains.

## Flujo de carga de eventos

1. Entrar a `/admin`.
2. Login con `ELECTROTICKETS_ADMIN_PASSWORD`.
3. Completar:
   - título
   - fecha
   - género
   - link de vendedor Bombo
   - venue
   - precios
   - lineup
   - flyer
   - videoset
4. Publicar.

El botón de compra público usa:

```bash
/go/slug-del-evento
```

Ese endpoint incrementa `clicks_count` y luego redirige al link de Bombo con UTM:

```bash
utm_source=electrotickets&utm_medium=referral&utm_campaign=slug-del-evento
```

## Próximas mejoras recomendadas

- Mapa embebido real por evento.
- Páginas SEO por género: `/techno`, `/house`, `/melodic-techno`.
- Página por venue.
- Captura de email / WhatsApp para comunidad.
- Dashboard con clicks por día.
- Featured placements pagos.
- Integración futura con API o scraping si Bombo lo permite.

## Admin rápido: venues y géneros guardados

Para habilitar la carga rápida de eventos, ejecutá en Supabase SQL Editor:

```sql
-- usar el contenido de supabase/02-catalog.sql
```

Esto crea:

- `venues`: venues reutilizables con dirección, ciudad, provincia y Google Maps URL.
- `genres`: géneros precargados para seleccionar rápido.

Desde `/admin` podés guardar un venue una sola vez. Luego, al seleccionarlo en un evento, ElectroTickets completa automáticamente nombre, dirección, ciudad, provincia y link de Google Maps.


## Contacto y WhatsApp

Para mostrar el botón de consulta directa en eventos y en `/contacto`, agregá estas variables en `.env.local` y también en Vercel:

```env
NEXT_PUBLIC_CONTACT_WHATSAPP=54911XXXXXXXX
NEXT_PUBLIC_CONTACT_NAME=ElectroTickets
NEXT_PUBLIC_WHATSAPP_GROUP_URL=https://chat.whatsapp.com/LVWQjAe4r0EAtprDPObqnH?mode=gi_t
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/electrotickets
```

`NEXT_PUBLIC_CONTACT_WHATSAPP` debe ir sin espacios, guiones ni el signo `+`.
