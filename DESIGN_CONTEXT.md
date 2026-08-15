# Contexto de diseño — ElectroTickets

Documento de traspaso para retomar el trabajo visual sin releer todo el historial.
Última actualización: agosto 2026.

---

## 1. Stack y convenciones

| | |
|---|---|
| Framework | **Next.js 16.2.6**, App Router, React 19.2 |
| Estilos | **Tailwind CSS v4** (`@import "tailwindcss"` + bloque `@theme`), sin `tailwind.config.js` |
| Base de datos | Supabase (`@supabase/supabase-js`) |
| Iconos | **Phosphor Icons** (`@phosphor-icons/react`) |
| Hosting | Vercel |
| Idioma | Español rioplatense (voseo). Todo el copy público y los comentarios de código |

> **Ojo:** el proyecto se describe a veces como "Next.js 14". La versión real es **16.2.6**.
> Varias APIs difieren (`params` es una `Promise` en las páginas, por ejemplo).

**Convenciones detectadas y respetadas:**

- Server components por defecto; `"use client"` solo donde hace falta estado o eventos.
- Los iconos en server components se importan de **`@phosphor-icons/react/dist/ssr`**.
  El tipo `Icon` se importa del paquete raíz (`import type { Icon } from "@phosphor-icons/react"`).
- `@phosphor-icons/react` está en `optimizePackageImports` (`next.config.ts`) para que solo
  se empaqueten los iconos usados.
- Los comentarios explican **por qué**, no qué hace el código.
- `npm run typecheck`, `npm run build` y `npx eslint .` tienen que quedar limpios.

---

## 2. Cambios de diseño ya aplicados

### PR #22 — Sistema tipográfico, tokens y jerarquía

Informado por la skill **`frontend-design`** (de `anthropics/skills`).

- **Tipografía: Arial → Archivo variable + DM Mono.**
  Archivo con eje de ancho: expandido (`wdth 112`) en `h1`/`h2`/`.font-display`, ancho normal
  en el cuerpo. DM Mono con cifras tabulares para fechas y horarios (clase `.tabular`).
  Se auto-hospedan vía `next/font` — cero requests a Google en runtime.
  Arial se resolvía distinto en cada sistema operativo, así que el tracking ajustado a mano
  no era el mismo para todos los usuarios.
- **Cuerpo de 14px → 16px.** Dos tercios del sitio estaba en 14 o menos.
- **24 opacidades de texto → 4 roles:** `text-white` (100%), `/78`, `/62`, `/48`.
  Ninguna baja de 4.5:1 sobre el fondo. Se corrigieron 19 usos que fallaban contraste;
  el peor estaba en 3.1:1.
- **8 radios de borde → 3 pasos:** `rounded-[12px]`, `rounded-[20px]`, `rounded-full`.
- **`.glass` dejó de desenfocar.** Con seis paneles traslúcidos apilados, ninguno se leía
  como elevado. El `backdrop-blur` quedó solo en el header y el menú mobile, donde
  efectivamente pasa contenido por detrás.
- **Foco visible** (`:focus-visible` con anillo violeta). Antes no existía ninguna regla de
  foco en todo el proyecto.
- **`prefers-reduced-motion`** respetado.
- **La fecha como elemento firma:** mono, cifras tabulares, línea de pelo debajo. Se repite
  en fila, tarjeta y detalle, así que lleva la identidad a todo el sitio.
- El titular del hero se achicó: Archivo expandido es más ancho por carácter y al tamaño
  anterior pasaba a cinco líneas y desbalanceaba las columnas.

### PR #24 — Iconografía e identidad (foco mobile)

Informado por la skill **`ui-ux-pro-max`**, con referencia visual de allmusicparties.com.

- **Iconografía Phosphor.** La página de evento pasó de **0 a 31 iconos**. Peso `duotone` en
  encabezados de sección, `fill` en CTA, `bold` en metadatos.
- **El flyer se enciende:** clases `.flyer-glow` y `.flyer-glow-sm` (sombra de color en vez
  de marco). El sitio enmarca el afiche, pero ahora lo ilumina.
- **Fondo de negro de terminal a violeta muy oscuro** (`#0b0714`). Misma luminosidad, la
  temperatura del contexto nocturno.
- **Cuenta regresiva** en la página de evento. Cálculo de fecha en el cliente, sin datos
  nuevos ni lógica de negocio.
- **Targets táctiles:** CTA primarios a 44px, sticky de compra a 52px, links de footer de
  15px a 32px. Mínimo web WCAG es 24px; los primarios van a 44 por criterio.
- Estados comerciales con icono: llama en "Últimas entradas", prohibido en "Sold Out".

### Sobre las skills

- **`frontend-design`** se usó para el PR #22 pero **no quedó versionada**: el PR que la
  agregaba (#21) se cerró por decisión del dueño del proyecto.
- **`ui-ux-pro-max`** es la que está instalada. Se versiona solo `skills-lock.json`;
  `.agents/` y `.claude/skills/` están en `.gitignore` (PR #23) porque pesan ~3,8 MB.
  Para reinstalar: `npx skills add <source> --skill <nombre>`.
- **Nota honesta sobre `ui-ux-pro-max`:** su `--design-system` dio resultados fuera de tema
  para este rubro (devolvió una paleta de modo claro, y en otra corrida "Brutalism" con
  esquinas de 0px). Lo que sí sirve es la recomendación de librería de iconos, los umbrales
  de target táctil y los checklists de `references/pro-rules.md`. **No tomar su salida de
  paleta ni de tipografía sin filtrarla.**

---

## 3. Componentes principales de UI

### Núcleo — tocar con cuidado, se reutilizan en varias páginas

| Archivo | Qué es |
|---|---|
| `app/globals.css` | **Fuente de verdad del sistema visual.** Tokens, `@theme`, `.glass`, `.tabular`, `.flyer-glow`, foco, reduced-motion |
| `app/layout.tsx` | Carga de fuentes (`next/font`), GA4 y Clarity |
| `components/event-row.tsx` | **Fila compacta de evento.** Formato denso de la agenda. Se usa en hero, home y relacionados |
| `components/event-card.tsx` | **Tarjeta de evento** (flyer 4:5). Se usa en `/eventos` y `/destacados` |
| `components/section-heading.tsx` | Encabezado de sección con icono. Alinea al comienzo, no al centro |
| `components/flyer-image.tsx` | `next/image` con fallback sin optimizar si el host no está permitido |

> `EventRow` y `EventCard` son **el mismo objeto en dos densidades**. Comparten tipografía,
> radios y tratamiento de fecha a propósito. Si cambiás uno, revisá el otro.

### Páginas

| Archivo | Notas |
|---|---|
| `app/page.tsx` | Home. Hero + "Este finde" + "Últimas entradas" + agenda + captura + VIP |
| `components/hero.tsx` | Hero de la home. Las dos columnas cierran con `lg:mt-auto` en ambas |
| `app/eventos/[slug]/page.tsx` | **Detalle de evento. El archivo más grande y más sensible.** Contiene el JSON-LD |
| `app/eventos/page.tsx`, `app/destacados/page.tsx` | Listados. Usan `EventBrowser` dentro de `<Suspense>` |
| `components/event-browser.tsx` | Buscador y filtros. Estado en la URL (`?q=`, `?genero=`) |
| `app/quienes-somos/page.tsx`, `app/privacidad/page.tsx` | Páginas de confianza |
| `components/site-header.tsx` + `components/mobile-nav.tsx` | Header y menú hamburguesa |
| `components/site-footer.tsx` | Footer con contacto y redes |

### Captura y conversión

`components/whatsapp-alerts.tsx` exporta `WhatsappAlerts` y `VipTables`.
`components/buy-button.tsx` y `components/whatsapp-link.tsx` son los CTA instrumentados.

### Admin

`app/admin/page.tsx` + `components/admin-dashboard.tsx` (565+ líneas, client component).
Incluye el panel de Conversión con filtro Vigentes/Finalizados/Todos.
**El admin no es parte del rediseño visual** — es herramienta interna.

---

## 4. Restricciones acordadas

### No tocar bajo ningún concepto

- **JSON-LD** (`app/eventos/[slug]/page.tsx`). Ya se corrigió `organizer` → `seller`;
  ElectroTickets revende, no organiza.
- **Metadata, Open Graph, canonical, sitemap, robots.**
- **Flujo de WhatsApp:** `lib/whatsapp.ts` y todos los `WhatsappLink`.
- **Lógica de negocio y de conversión:** `/go/[slug]`, `lib/events.ts`, APIs de admin.
- **Copy de conversión** de los CTA.

### Reglas de medición — romperlas rompe la analítica

- **Todo CTA hacia `/go/[slug]` tiene que pasar un `placement`.** Sin eso no se sabe qué
  sección vende.
- **Todo CTA de WhatsApp tiene que llevar un `WhatsappSource`.**
- `/go/[slug]` es una redirección de servidor, así que GA4 no la ve: el clic se registra dos
  veces, en el cliente (`track("click_buy")`) y en el servidor (fila en `event_clicks`).

### Decisiones de producto

- **No se muestran precios.** Es decisión comercial. `price_label` existe en la base pero no
  se renderiza. **No agregar un CTA que prometa precio en el sitio** — la duda de precio se
  deriva a WhatsApp.
- **No inventar datos.** Nada de testimonios, cantidad de clientes, estadísticas ni
  credenciales que no estén respaldadas por un dato real.
- **Los eventos pasados nunca devuelven 404.** Su URL conserva posicionamiento; se renderiza
  el estado "finalizado" con alternativas.
- **Mobile no se degrada.** Es de donde entra la mayoría. Cualquier cambio de layout va en
  variantes `sm:` y superiores salvo que el objetivo sea justamente mejorar mobile.

### Descartado a propósito de la referencia visual

Banderas de país (el sitio es solo Argentina), fila de estadísticas (requeriría inventar
números), playlist de Spotify y mapa de mesas VIP (no existen esos activos), partículas de
fondo (se vuelven cursi y no aportan información).

---

## 5. Cómo verificar un cambio visual

El entorno de trabajo **no puede alcanzar Vercel ni las imágenes de Supabase**, así que la
verificación local se hace sobre el build de producción con Chromium:

```bash
npm run build && npm run start
# y con playwright-core apuntando a /opt/pw-browsers
```

Medir siempre a **390px** (mobile) y 1358px (desktop). Lo que conviene chequear:

- Que ningún título se corte (`scrollWidth > clientWidth`).
- Que las filas de una misma lista midan igual.
- Que no haya scroll horizontal.
- Que ningún target interactivo baje de 24px.

Los eventos de `lib/demo-events.ts` tienen fechas fijas de 2026 y **ya son pasadas**, así que
la home renderiza vacía con el fallback. Para verificar visualmente hay que adelantar esas
fechas de forma temporal y revertir el archivo después.
