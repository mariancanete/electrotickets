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
- `/contacto`
- `/preguntas-frecuentes`
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
- Primary CTA: Comprar tickets.
- Secondary CTA: Consultar por WhatsApp.
- Community CTA: Grupo de difusión.
- Keep the design dark, modern, premium and not overloaded.
- Mobile experience is critical.

## SEO rules

- Use `NEXT_PUBLIC_SITE_URL=https://electrotickets.com.ar`.
- Keep sitemap and robots working.
- Each event page must have metadata, canonical URL and Open Graph tags.
- WhatsApp previews must show a valid image.
- Use event flyer as `og:image` when available.
- Use `/og-home.jpg` as fallback.

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