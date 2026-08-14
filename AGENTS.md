# ElectroTickets - Project Context

ElectroTickets is a Next.js + Tailwind + Framer Motion + Supabase website for electronic music events in Argentina.

## Business goal

The site must generate ticket sales through Bombo referral links.

Priorities:
- trust
- fast loading
- mobile-first UX
- SEO
- WhatsApp sharing
- simple admin event upload
- conversion to ticket purchases

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase
- Vercel

## Public routes

- `/`
- `/eventos`
- `/eventos/[slug]`
- `/destacados`
- `/quienes-somos`
- `/contacto`
- `/preguntas-frecuentes`
- `/privacidad`
- `/go/[slug]`

## Private route

- `/admin`

The admin route must not be visible in public navigation.

## Business logic

- Events are loaded manually by the owner.
- Each event has a unique Bombo referral link.
- The buy button redirects through `/go/[slug]` to track clicks before sending the user to Bombo.
- Featured events appear on the homepage.
- All published events appear in `/eventos`.

## UX rules

- Public copy must generate trust and sales.
- Avoid technical/internal copy on public pages.
- Primary CTA: **Comprar en Bombo** (never just "Comprar": the purchase completes off-site,
  and discovering that after the click is where users are lost).
- Always set the expectation *before* the CTA, not below it.
- Secondary CTA: Consultar por WhatsApp.
- Community CTA: Grupo de difusión / Recibir alertas.
- Prices are deliberately not shown. Do not add a CTA that promises a price on-site; route
  price questions to WhatsApp instead.
- Keep the design dark, modern, premium and not overloaded.
- Prefer the compact `EventRow` over full-height cards in agenda listings: on mobile a 4/5
  card fills the screen and eight dates become eight screens of scrolling.
- Mobile experience is critical.

## Measurement rules

- Every CTA to `/go/[slug]` must pass a `placement`. Without it there is no way to know
  which section sells.
- `/go/[slug]` is a server redirect, so GA4 cannot observe it. Purchase clicks are tracked
  twice: `track("click_buy")` client-side before navigating, and a row in `event_clicks`
  server-side.
- Every WhatsApp CTA must carry a `WhatsappSource`.
- Sales from Bombo are loaded by hand in `/admin` (`event_sales`, per event and per day).
  That is the only way to compute the click→sale rate.

## SEO rules

- Use `NEXT_PUBLIC_SITE_URL=https://electrotickets.com.ar`.
- Keep sitemap and robots working.
- Each event page must have metadata, canonical URL and Open Graph tags.
- WhatsApp previews must show a valid image.
- Use event flyer as `og:image` when available.
- Use the dynamic `/og-logo` route as fallback.
- **Never 404 a past event.** Its URL keeps ranking and backlinks; render the "finalizado"
  state with alternatives instead.

## Admin rules

- Keep event creation simple.
- Do not show technical errors to the user.
- Validate flyer size before upload.
- If flyer is too large, show:
  "El flyer es demasiado pesado. Comprimilo o usá una imagen menor a 2 MB."

## Git workflow

Never push directly to `main`.

Always:
1. Create a new branch.
2. Make changes.
3. Run `npm run build`.
4. Commit changes.
5. Open a Pull Request.
6. Wait for review before merging to production.

## Safety

- Never expose `.env.local`.
- Never commit secrets.
- Do not break Supabase integration.
- Do not remove Vercel compatibility.