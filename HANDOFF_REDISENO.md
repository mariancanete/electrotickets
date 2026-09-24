# Handoff: rediseño "Camino corto" (Hora Pico v2)

Documento para implementar en Codex. Objetivo único: **acortar el camino entre "abrí el sitio" y
"toqué Comprar en Bombo"**, y que la persona confíe lo suficiente como para comprar acá y no en
otro lado.

- Diseño (lienzo con prototipo mobile + desktop, tokens, componentes, diagnóstico y Soldout):
  https://claude.ai/artifact/MaFd2gwbZvwaoXs77bCcaJ (privado hasta que lo compartas).
- Base de código analizada: `main @ 0604a94`.
- Los eventos, artistas y flyers del lienzo son **de ejemplo**. Los flyers reales salen solo de
  `flyer_url` (admin).

---

## 0. Reglas que no se tocan

Estas vienen de `AGENTS.md`, `DESIGN_CONTEXT.md §4` y del pedido del dueño. Si una tarea choca con
alguna, gana la regla.

1. **Todo CTA de compra va a `/go/[slug]`** con `buildGoUrl(slug, placement)` y dispara
   `track("click_buy", { ...eventParams(event), cta_placement })` **antes** de navegar. Nunca un
   `href` a `/go/` escrito a mano: siempre `<BuyCta>`.
2. **Nunca precios ni lotes.** `price_label` existe pero no se renderiza. La duda de precio va a
   WhatsApp (`event_price`).
3. **WhatsApp siempre secundario**: botón delineado, nunca relleno, nunca más grande que el CTA.
4. **Mis entradas = solo `localStorage`.** Sin auth, sin tabla, sin endpoint, sin dato personal.
5. **Sin columnas nuevas en la base.** Todo sale de `events`, `venues`, `lib/credentials.ts` y
   archivos de contenido en `lib/`.
6. **Venues con credencial RRPP = `lib/credentials.ts › officialVenues`.** No se completan ni se
   "corrigen" nombres sin confirmación del dueño.
7. **Fuera de alcance:** reseñas, puntajes, comentarios, contadores de asistentes o cualquier prueba
   social. No se diseñan ni se dejan slots.
8. **Nunca 404 a un evento pasado** (ni a un venue que tuvo fechas).
9. No tocar: JSON-LD existente del detalle (salvo lo que agrega este doc), metadata/OG/canonical,
   `/go/[slug]`, APIs de admin, el admin.

## 1. Decisiones de producto confirmadas

| Tema | Decisión |
|---|---|
| Tipografía | **Bebas Neue** (display) + **DM Mono** (datos). Como Bebas es solo mayúsculas, el cuerpo va en **DM Sans** (misma familia de diseño que DM Mono). *DM Sans es propuesta de diseño: si el dueño prefiere otra, cambia solo el token.* |
| CTA en tarjetas | **Directo a Bombo.** Cada tarjeta lleva "Comprar en Bombo" (outline) → `/go/` + `click_buy`. Tocar título o flyer abre el detalle y dispara `select_date` con el mismo placement. |
| Corazón "Guardar" | **Funciona.** Guarda en `localStorage`; Mis entradas distingue "Guardada" de "Fuiste a comprar". |
| Jerarquía de CTA | **Un solo CTA lleno (solid) por pantalla**: destacada en Inicio, barra/caja del detalle, próxima fecha en Venue. En tarjetas va **outline** chartreuse (mismo color = mismo destino, menor peso). Agenda, Buscar y Mis entradas no tienen solid. |
| Ley de color | **Chartreuse = va a Bombo. Sin excepciones.** La fecha en mono y el tab activo del nav pasan a blanco. Solo el isotipo del logo conserva el color, como marca. |
| `/eventos/[slug]/comprar` | Se reemplaza por el bloque "Cómo comprar" plegable en el detalle. La ruta hace `permanentRedirect` a `/eventos/[slug]#como-comprar` (sigue `noindex`). |

## 2. Tokens: `app/globals.css` y `app/layout.tsx`

### 2.1 Fuentes (`app/layout.tsx`)

Reemplazar `Space_Grotesk` + `JetBrains_Mono` por:

```ts
import { Bebas_Neue, DM_Mono, DM_Sans } from "next/font/google";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-bebas" });
const dmSans = DM_Sans({ subsets: ["latin"], display: "swap", variable: "--font-dm-sans" }); // variable 400–800
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], display: "swap", variable: "--font-dm-mono" });
// <html className={`${bebas.variable} ${dmSans.variable} ${dmMono.variable}`}>
```

`next/font` ya genera el fallback ajustado (`adjustFontFallback`), lo que evita el salto de layout
al cargar Bebas. Verificar que `Á É Í Ó Ú Ñ` se vean bien en Bebas (los tiene).

### 2.2 `@theme`

```css
--font-sans: var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif;
--font-display: var(--font-bebas), Impact, sans-serif;
--font-mono: var(--font-dm-mono), ui-monospace, SFMono-Regular, monospace;

/* Sin cambios */
--color-cta: #cbff1f;          /* Comprar en Bombo. Nada más. */
--color-cta-pressed: #b2e30a;
--color-marca: #2b34ff;
--color-urgencia: #ff5a3c;     /* Solo "Últimas entradas" */
--color-ink: #0a0a14;
--color-surface: #15151f;
--color-surface-alt: #1f1f2c;
--color-marca-tint: rgba(43, 52, 255, 0.14);
--color-marca-edge: rgba(154, 160, 255, 0.3);

/* Ajustados / nuevos */
--color-marca-ink: #c9ccff;    /* 13.5:1 sobre ink */
--color-urgencia-ink: #ff8a70; /* texto del chip de urgencia, 8.6:1 */
--color-text-1: #f4f4f6;       /* 17.9:1 */
--color-text-2: #bdbdc9;       /* 10.8:1 — reemplaza white/[0.62..0.78] */
--color-text-3: #8e8e9c;       /* 6.1:1 — piso de contraste, reemplaza white/[0.42..0.55] */
```

Las opacidades sueltas (`text-white/45`, `/50`, `/55`) se migran a `text-text-3` o `text-text-2`.
Hoy hay varias en 0.42–0.45 que quedan justas de contraste.

### 2.3 Clases propias

- `.display`: Bebas no tolera el tracking negativo del sistema actual. Queda así:
  `font-family: var(--font-display); font-weight: 400; letter-spacing: .005em; line-height: .88; text-transform: uppercase;`
  El texto del `h1` se sigue escribiendo en caja normal: la mayúscula es solo CSS, así SEO y lectores
  de pantalla leen el título real.
- `.dato` / `.dato-seccion`: sin cambios de uso, pasan a DM Mono (`font-weight: 500`, sin 800).
- `.wordmark-electro` → Bebas 25px (mobile) / 30px (desktop), `letter-spacing: .03em`.
- Borrar `.titular-hero` y `.titular-detalle` y usar los tamaños de la escala de abajo.

### 2.4 Escala

| Rol | Mobile | Desktop |
|---|---|---|
| Hero ("Este finde", "Agenda") | Bebas 60 / 52 | Bebas 108 |
| Título de detalle | Bebas 68 | Bebas 132 |
| Título de venue | Bebas 104 | Bebas 200 |
| Título de sección | Bebas 40 | Bebas 56 |
| Título de tarjeta | Bebas 26 (fila) / 40 (destacada) | Bebas 30 / 104 |
| Texto | DM Sans 16 · 14 · 13 · 12 | igual |
| CTA | DM Sans 16/700 (solid) · 13.5/700 (outline) | igual |
| Datos | DM Mono 14 · 12 · 11 (encabezado, tracking .16em) | 16 · 14 · 12 |

Espacio: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 44 · 64. Gutter 18 / 44 (≥1024) / 80 (≥1440).
Radios: 10 flyer chico · 12 tile · 16 card · 20 bloque · pill. Transición única 150ms ease-out.
Targets: mínimo 44px; CTA solid 52–56; CTA outline 44; nav 78.

### 2.5 Quitar chartreuse que no compra

- `app/eventos/[slug]/page.tsx:265`, `app/eventos/[slug]/comprar/page.tsx:109` y
  `components/agenda-screen.tsx:251`: fecha en mono → `text-text-1`.
- `components/bottom-nav.tsx:48` y `components/desktop-header.tsx:55`: el tab activo pasa a
  `text-text-1` en vez de `text-cta`, y se borra la excepción de Ayuda.
- `components/app-header.tsx:121-122`: el escudo de la credencial pasa a `text-marca-ink`.

## 3. Componentes

### 3.1 `components/cta.tsx`

- **`BuyCta`** suma `variant: "solid" | "outline" | "link"` (por defecto `"solid"`) y
  `size: "lg" | "md"` (56 / 52). La lógica de clic **no cambia**: `track("click_buy", …)` +
  `saveDate(slug, starts_at, "compra")`.
  - `outline`: `h-11 px-4 rounded-full border-[1.5px] border-cta bg-cta/[0.07] text-cta text-[13.5px] font-bold`;
    en hover se rellena (`bg-cta text-ink`). Ícono `out` de 15px.
  - `link`: texto chartreuse subrayado ("Retomar en Bombo"). Lo usa solo Mis entradas.
  - El label sigue siendo **"Comprar en Bombo"** en todas las variantes.
- **`CardCta`** (el "Entradas" que abría el detalle): se borra cuando no quede ningún uso.
- **`SoldOutCta`**: sin cambios. En tarjetas va acompañado de un link "Avisame" →
  `WhatsappLink source="event_waitlist"`.
- **`BuyExpectation`** (nuevo, server): la línea `shield` + "Link oficial de RRPP · el pago lo
  hacés en Bombo". Va **siempre arriba** de un `BuyCta` solid.

### 3.2 `components/event-row.tsx` (nuevo, reemplaza a `DateCard` en todas las listas mobile)

Props: `event`, `placement: CtaPlacement`, `priority?`, `saveSource?`.

- Alto fijo **144px** (skeleton idéntico).
- Fila superior: flyer 56×70 (link al detalle), bloque de texto (mono `VIE 25 SEP · 23:59`,
  título Bebas 26, `venue · lineup` truncado) y `SaveButton` 40px arriba a la derecha.
- Fila inferior: a la izquierda `UrgencyChip` **o** chip de género (nunca los dos: no entran junto
  al CTA); a la derecha `BuyCta variant="outline"` o `SoldOutCta compact` + "Avisame".
- Título y flyer: `<Link>` al detalle con `track("select_date", { …, cta_placement: placement })`.
- `sold_out`: opacidad .62. `sold_out` y `last_tickets` nunca juntos (regla vigente).

`components/grid-card.tsx` pasa a ser la **tarjeta horizontal de desktop**: flyer 128×160, título
Bebas 30, venue, chip y `BuyCta outline` abajo. Mismas reglas.

### 3.3 `components/featured-card.tsx` (nuevo, sale de `FeaturedDate` en `agenda-screen.tsx`)

Mobile: flyer 120×150 + chip de urgencia, fecha mono, título Bebas 40, venue, lineup. Abajo van
`BuyExpectation` y la fila `BuyCta solid md` + `WhatsappIconButton` 52 (`event_price`).
Desktop: flyer 320×400, título Bebas 104 y CTA de 360px. Nunca elige una fecha `sold_out`.
Props: `event`, `placement` (`home_destacado` | `venue_destacado`).

### 3.4 Guardar: `components/save-button.tsx` (nuevo, client) + `lib/saved-dates.ts`

```ts
export type SavedDate = {
  slug: string;
  starts_at: string;
  guardado_en: string;
  /** Ítems viejos sin campo = "compra" (solo BuyCta guardaba). */
  origen?: "guardada" | "compra";
};
export function saveDate(slug: string, startsAt: string, origen: "guardada" | "compra" = "compra"): void;
// Si ya existe como "compra", nunca se degrada a "guardada".
export function removeDate(slug: string): void;
export function isSaved(slug: string): boolean;
export function countUpcomingSaved(): number; // para el badge del nav
```

- `SaveButton`: `<button aria-pressed>` con corazón de trazo o relleno (blanco, **nunca**
  chartreuse ni coral). Al guardar muestra un `Toast` "Guardada en Mis entradas"; al sacar,
  "La sacaste de Mis entradas". Dispara `save_date` / `unsave_date` con `save_source` (`detalle`,
  `row`, `mis_entradas`).
- `components/detail-actions.tsx`: el corazón decorativo (`<span aria-hidden>`) pasa a
  `SaveButton`. En desktop, "Guardar" y "Compartir" quedan como botones delineados de 48px.
- `components/toast.tsx` (nuevo): píldora blanca, `role="status"`, 2,4s, fija a 140px del borde
  inferior en el detalle (arriba de la barra).

### 3.5 Confianza

- **`components/trust-strip.tsx`** (nuevo): franja de 38px (mobile) / 40px (desktop) con tinte
  ultramar, debajo del header. Mobile: "**RRPP oficial de Bombo** · 5 venues · Ver ›" →
  `/quienes-somos`. Desktop: la lista completa de `officialVenues` + "Pagás en Bombo · te respondo por
  WhatsApp". Sin venues cargados no renderiza nada. Va en Inicio, Detalle (desktop) y Venue.
- **`components/rrpp-block.tsx`** (nuevo): bloque con tinte ultramar. Eyebrow "Comprás con alguien
  real", título "Soy {NEXT_PUBLIC_CONTACT_NAME}, RRPP oficial de Bombo en {venue}.", los otros
  venues y un botón delineado "Escribime por WhatsApp" (`event_question`). Si el nombre de contacto
  queda en el valor por defecto, el título pasa a "Soy RRPP oficial de Bombo en {venue}." Si el venue
  del evento no es oficial: "…en Mute, Mandarine, Crobar, Río y The Bow."
- **`components/how-to-buy.tsx`** (nuevo): `<details id="como-comprar">` de tres pasos:
  1. **Tocá "Comprar en Bombo"**: se abre el link oficial del evento en la app o la web de Bombo.
  2. **Elegí tu entrada y pagá en Bombo**: el precio, los lotes y los medios de pago los ves ahí,
     siempre actualizados.
  3. **Tu entrada queda en tu cuenta de Bombo**: es nominada y es la que mostrás en la puerta. La
     fecha queda en Mis entradas.

  Pie: "ElectroTickets no cobra ni procesa pagos." Cerrado en el primer viewport del detalle y
  abierto si el hash es `#como-comprar`. Dispara `open_how_to_buy`.

### 3.6 Flyer: `components/flyer-stage.tsx` (nuevo)

El flyer del detalle se muestra **entero**, nunca recortado: `object-contain` a 224×280 (mobile),
centrado sobre un fondo que es el mismo flyer con `object-cover`, `blur-2xl`, `scale-110` y
`opacity-60`, más un degradé hacia `ink`. El fondo usa `sizes="32px"`: es una versión mínima y
casi no pesa. Al tocarlo se abre a pantalla completa (`view_full_flyer`). Sin `flyer_url`, usa
`.rayado-lg`. Desktop: 480×600, contain, radio 20. `priority` solo acá y en la destacada de la
home.

### 3.7 Navegación

- **`components/app-header.tsx`**: el `AppHeader` ultramar de la home se reemplaza por **`TopBar`**
  (56px, fondo ink): wordmark a la izquierda, a la derecha `search` → `/buscar` y `help` →
  `/preguntas-frecuentes`. **Se va la campana**, que llevaba a Ayuda.
- **`components/bottom-nav.tsx`**: tabs **Inicio** `/` · **Agenda** `/eventos` (y `/venues*`) ·
  **Buscar** `/buscar` · **Mis entradas** `/mis-entradas`, con badge ultramar de
  `countUpcomingSaved()` (client, oculto en 0). El tab activo va en blanco. Ayuda pasa al TopBar
  y al pie de la home.
- **`components/desktop-header.tsx`**: Inicio · Agenda · Venues (`/venues`) · Mis entradas, campo de
  búsqueda de 340px y botón de ayuda. Activo: blanco con subrayado blanco de 2px.
- **`components/day-tabs.tsx`** (nuevo, sale de `DaySelector`): tres tiles de 58px (mobile) o
  108×72 (desktop). Activo blanco; día vacío deshabilitado con "—".
- **`components/filter-chips.tsx`** (nuevo, client): fila scrolleable. "Últimas entradas" es un
  toggle (coral lleno cuando está activo, dispara `toggle_last_tickets`). Venue, Género y Horario
  abren un `FilterSheet` (bottom sheet en mobile, popover en desktop) que navega con los parámetros
  de `lib/filters.ts`.
- **`components/month-calendar.tsx`** (nuevo, client): grilla lunes a domingo, celdas de 44px, hasta
  3 puntos por día (blanco = fecha, coral = últimas entradas). Estados: pasado, hoy (anillo), sin
  fechas (deshabilitado), con fechas y elegido (blanco). Navega por mes con `?mes=YYYY-MM` y por día
  con `?dia=YYYY-MM-DD`. Dispara `select_calendar_day`.
- **`components/whatsapp-group-block.tsx`** (nuevo): bloque con trama "Enterate antes que nadie",
  botón delineado "Sumarme al grupo" (`click_whatsapp_group`, `home_alerts`) y link "¿Mesas o VIP?
  Escribime por WhatsApp" (`home_vip`).

### 3.8 Velocidad percibida

- **`components/skeletons.tsx`** (nuevo): `EventRowSkeleton` (144px), `FeaturedSkeleton` y
  `DayTabsSkeleton`, con las mismas medidas que el componente real. Sin shimmer. El CTA de
  skeleton es gris: nada se pinta de chartreuse hasta que hay un link real.
- `loading.tsx` nuevos en `app/`, `app/eventos/`, `app/eventos/[slug]/`, `app/buscar/` y
  `app/venues/[slug]/`.
- `MyTicketsScreen`: mientras hidrata `localStorage`, skeleton de filas en vez de la pantalla vacía.
- Flyers con caja de proporción fija (`aspect-4/5` o ancho y alto explícitos) y `sizes` correcto.
  Cero CLS.

### 3.9 Opcional (P2): `components/bombo-return.tsx`

Al tocar un `BuyCta` se guarda `{slug, t}` en `sessionStorage`. Si en los 30 minutos siguientes la
persona vuelve al detalle de esa fecha (`pageshow` con `persisted` o `visibilitychange`), aparece
**una vez** una hoja: "¿Pudiste comprar tu entrada para {título}?" con dos opciones:
- **Sí, ya la tengo**: cierra la hoja y marca `origen: "compra"`.
- **Tuve un problema**: WhatsApp, `bombo_return`.

## 4. Pantallas

### 4.1 Inicio: `app/page.tsx` + `components/agenda-screen.tsx`

Orden en mobile (el CTA solid tiene que quedar arriba del pliegue a 390×844):

1. `TopBar` + `TrustStrip`.
2. "Este finde" (Bebas 60) + rango en mono + `DayTabs`.
3. `FeaturedCard` del día elegido (`home_destacado`).
4. `FilterChips`: el toggle de Últimas filtra en el lugar; Venue y Género llevan a
   `/eventos?zona=…` o `/eventos?genero=…`.
5. "Más el {día}" → `EventRow` (`home_finde_card`).
6. **"Últimas entradas"**: carrusel horizontal de tarjetas de 270px con CTA outline de ancho
   completo (`home_ultimas_card`). Se arma con `getLastTicketsEvents(events)` sobre **todas** las
   próximas fechas, no solo las del finde. Si está vacía, no se muestra.
7. **"Próximos días"**: los 7 días siguientes al finde, agrupados por noche con `getDayKey`
   (`home_proximos_card`), y el botón "Ver toda la agenda".
8. `WhatsappGroupBlock`.
9. "Cómo funciona": tres tarjetas (links oficiales, pagás en Bombo, te responde una persona) y
   links a Quiénes somos, Preguntas frecuentes, Contacto y Privacidad.

Con el finde vacío se mantiene `EmptyWeekend`, pero las próximas fechas usan `EventRow`
(`vacio_card`) y el `WhatsappGroupBlock` aparece siempre.

Desktop: el hero va a dos columnas (`minmax(0,1fr) 400px`). A la izquierda, título, DayTabs y
destacada. A la derecha, un panel "Últimas entradas" con filas compactas y CTA outline, y el
bloque del grupo. Abajo, la barra de filtros y la agenda del finde por noche, en una grilla de 3
tarjetas horizontales.

### 4.2 Detalle: `app/eventos/[slug]/page.tsx`

Primer viewport en mobile, de arriba abajo:
1. `FlyerStage` con volver, `SaveButton` y compartir.
2. Chips (urgencia, género).
3. `h1` Bebas 68.
4. Fecha en mono blanca (`formatDatoRange`).
5. Fila con el venue (link a `/venues/[slug]`) y "Cómo llegar" (ancla a la sección).
6. Lineup en una línea.
7. `HowToBuy` cerrado.
8. Línea RRPP: "RRPP oficial de Bombo en {venue} · te respondo por WhatsApp".

La **barra sticky** (`detalle_barra`) lleva `BuyExpectation`, luego `BuyCta solid` + `WhatsappIconButton`
(`event_price`, o `event_waitlist` si está agotado).

Al scrollear:
1. Line-up en chips de 44px.
2. **Cómo llegar**: tarjeta con venue + `ver` badge si es oficial, dirección (`formatAddress`),
   "Abrir en Maps" (`getMapUrl`) y "Fechas en {venue}".
3. `HowToBuy`.
4. `RrppBlock`.
5. "Sobre la fecha" (`buildAboutEvent`, sin cambios).
6. FAQ (`buildEventFaq`, sin cambios).
7. **"Si no es esta"**: "Esa misma noche" (mismo `getDayKey`) y "Más en {venue}", las dos con
   `EventRow` (`detalle_relacionados`). Usa `getRelatedEvents` para completar si faltan.

Desktop: columna izquierda de 480px con `FlyerStage`, Guardar/Compartir y `RrppBlock`. A la
derecha van chips, `h1` Bebas 132, fecha y una grilla 2×2 de datos (Fecha, Horario, Venue, Cómo
llegar). Abajo, la **caja de compra** (card, no sticky) con `BuyExpectation`, `BuyCta` y
WhatsApp, más la línea "Precio, lotes y medios de pago se ven en Bombo…". Después, Line-up, Cómo
comprar abierto en 3 columnas y Sobre la fecha. Al final, "Si no es esta" a todo el ancho. La caja
de compra tiene que quedar arriba del pliegue a 1280×800.

Evento finalizado: se mantiene `FinishedEventBlock`, y las alternativas pasan a `EventRow`
(`finalizado_alternativa`).

### 4.3 Agenda: `app/eventos/page.tsx`

- Mobile: `TopBar`, "Agenda" (Bebas 52) con selector de mes, `MonthCalendar`, leyenda,
  `FilterChips` y la lista del día elegido ("Viernes 25 sep · 2 fechas") con `EventRow`
  (`agenda_card`).
- Sin `dia`, se elige el primer día con fechas desde hoy.
- Desktop: sidebar de 340px con el calendario y los filtros. Los filtros son: toggle "Solo últimas
  entradas", venues con checkbox + escudo si es oficial + conteo, géneros y horario. La lista va
  agrupada por noche en 2 columnas.
- `lib/filters.ts`: suma `ultimas` (`"1"` filtra `last_tickets && !sold_out`) y `mes`.
  `countActiveFilters` cuenta `ultimas`. Todo sigue viviendo en la URL.

### 4.4 Buscar: `app/buscar/page.tsx` + `components/event-browser.tsx`

- Campo de 52px con clear y chips "Este finde", "Últimas entradas", "Venue" y "Género".
- **Sin query ni filtros**, se muestra:
  - "Venues oficiales": chips con escudo que llevan a `/venues/[slug]`.
  - "Géneros": los chips escriben la query.
  - "Para este finde": 1–2 filas.
- **Con resultados:** "N fechas para 'x'" + `EventRow` (`buscar_card`).
- **Sin resultados:** "Nada para 'x' por ahora", con un botón delineado "Avisame por WhatsApp"
  (`empty_results`, mensaje `buildAlertsWhatsappMessage(query)`) y sugerencias del finde.

### 4.5 Mis entradas: `app/mis-entradas/page.tsx` + `components/my-tickets-screen.tsx`

- Subtítulo: "Las fechas que guardaste y las que fuiste a comprar. Tu entrada está en tu cuenta de
  Bombo."
- Grupos: "Este finde" y "Más adelante".
- Tarjeta **Fuiste a comprar** (`origen: "compra"`):
  - Sello ultramar `ticket`.
  - Cuenta en mono ("Mañana · VIE 25 · 23:59").
  - Botones "Cómo llegar" (Maps) y "Al calendario" (`.ics` generado en el cliente, sin servidor,
    `add_to_calendar`).
  - Línea "¿No terminaste la compra? **Retomar en Bombo**", con `BuyCta variant="link"` y
    placement `mis_entradas_retomar`.
- Tarjeta **Guardada**: sello con corazón (tocar = `removeDate`, con confirmación por toast) y
  `BuyCta outline` (`mis_entradas_comprar`).
- **Vacía:** caja punteada "Todavía no guardaste fechas / Tocá el corazón en cualquier fecha…" y
  sugerencias del finde (`mis_entradas_sugerida`).
- Sigue siendo `noindex`, y en pantalla no se menciona cómo se guarda la lista.

### 4.6 Venues (nuevo): `app/venues/page.tsx` + `app/venues/[slug]/page.tsx`

**Datos, sin campos nuevos.** Se crea `lib/venues.ts`:
- `getVenueSlug(name) = slugify(name)` (`lib/slugify.ts`).
- `getVenues()` agrupa los eventos publicados (próximos y pasados recientes) por
  `normalizeText(venue_name)`. Toma `venue_address`, `city` y `map_url` del primer evento que los
  tenga. Del lado del servidor puede completar con la tabla `venues` usando
  `getSupabaseAdminClient`: esa tabla no tiene política de lectura pública, así que **no se toca RLS**.
- `official = credentials.officialVenues` (comparado normalizado).

**Contenido:** `lib/venues-content.ts` (nuevo), `Record<slug, { description?: string; faq?: EventFaqItem[] }>`,
escrito por el dueño. Sin descripción, la sección no se renderiza. No se inventa texto sobre el
venue.

**Página** (mobile):
1. Header con volver y breadcrumb mono "Venues / Crobar".
2. Hero con trama: sello "RRPP oficial de Bombo" (solo si es oficial), nombre en Bebas 104,
   dirección, botón "Cómo llegar" y "N próximas fechas".
3. "Próxima fecha en {venue}" con `FeaturedCard` (`venue_destacado`), el único CTA solid.
4. "Más fechas en {venue}" con `EventRow` (`venue_card`).
5. **"Mesas y VIP en {venue}"**: bloque con tinte, "¿Vas en grupo?" y botón delineado "Consultar
   mesas por WhatsApp" (`venue_vip`, `buildVipWhatsappMessage`).
6. "Sobre {venue}" (de `venues-content`).
7. "Preguntas sobre {venue}": cómo comprar, mesas VIP, dónde queda.
8. "Otros venues oficiales".

Desktop: hero a todo el ancho (Bebas 200). Cuerpo en dos columnas (`1fr 380px`), con la columna
derecha para mesas y VIP, cómo llegar y otros venues.

**SEO:**
- `generateMetadata`: título "Entradas para {venue} · próximas fechas | ElectroTickets",
  descripción con el venue y la cantidad de fechas, canonical `/venues/{slug}` y OG `/og-logo`.
- JSON-LD: `NightClub` (o `Place`) con `name`, `address` y `url`, más un `ItemList` con las URLs de
  los `MusicEvent` próximos y un `FAQPage`.
- `robots`: `index` si el venue es oficial o tiene `description` **y** al menos una fecha próxima.
  Si no, `noindex, follow`. **Nunca 404** a un venue que tuvo fechas: se muestra "Sin fechas por
  ahora" + `WhatsappGroupBlock`.
- `app/sitemap.ts` suma `/venues` y cada venue indexable.
- Links internos: el venue del detalle, los chips de Buscar, el header de desktop y "Otros venues".

### 4.7 Compra: `app/eventos/[slug]/comprar/page.tsx`

`permanentRedirect(`/eventos/${slug}#como-comprar`)`. El placement `compra_barra` queda en el tipo,
pero deja de recibir clics.

## 5. Medición: `lib/analytics.ts`

### 5.1 `CtaPlacement` (se agregan al final; ninguno se renombra)

| placement | Pantalla | Componente |
|---|---|---|
| `home_finde_card` | Inicio | `EventRow` del día elegido |
| `home_ultimas_card` | Inicio | carrusel Últimas entradas |
| `home_proximos_card` | Inicio | Próximos días |
| `vacio_card` | Inicio con finde vacío | `EventRow` |
| `agenda_card` | /eventos | `EventRow` / `GridCard` |
| `buscar_card` | /buscar | `EventRow` / `GridCard` |
| `detalle_relacionados` | Detalle | "Si no es esta" |
| `venue_destacado` | Venue | `FeaturedCard` |
| `venue_card` | Venue | `EventRow` / `GridCard` |
| `mis_entradas_comprar` | Mis entradas | tarjeta guardada |
| `mis_entradas_retomar` | Mis entradas | "Retomar en Bombo" |
| `mis_entradas_sugerida` | Mis entradas vacía | sugerencias |
| `finalizado_alternativa` | Evento pasado | alternativas |

Se mantienen `home_destacado` y `detalle_barra` (este último también para la caja de compra de
desktop). Quedan retirados, sin clics nuevos: `listado_card`, `vacio_proxima`,
`mis_entradas_card` y `compra_barra`. Actualizar el comentario de las "dos familias" y
`CARD_PLACEMENTS`: los CTA de tarjeta ahora **son** `click_buy`. `select_date` queda para el toque
en título o flyer.

### 5.2 `WhatsappSource`

Nuevos: `venue_vip` y `bombo_return` (P2). Se reusan `home_alerts`, `home_vip`, `event_price`,
`event_question`, `event_waitlist` y `empty_results`.

### 5.3 Eventos GA4 nuevos

`save_date` / `unsave_date` (`save_source`), `toggle_last_tickets` (`screen`, `on`),
`select_calendar_day` (`day`, `results`), `open_how_to_buy`, `view_full_flyer`, `add_to_calendar`.

### 5.4 Admin

El panel de Conversión (`components/admin-dashboard.tsx`) agrupa por placement. Conviene que
sume una agrupación por familia (inicio, agenda, buscar, detalle, venue, mis entradas) para leer
de un vistazo qué sección vende. Es solo visual y no cambia datos.

## 6. Orden sugerido de PRs

1. **Base:** fuentes, tokens, clases, `BuyCta` con variantes, `BuyExpectation`, `EventRow`, `GridCard`
   horizontal, `SaveButton` + `saved-dates`, `Toast`, skeletons, `TopBar`, `BottomNav` y
   `DesktopHeader`, quitar el chartreuse que no compra.
2. **Inicio:** `DayTabs`, `FeaturedCard`, `FilterChips`, Últimas entradas, Próximos días,
   `WhatsappGroupBlock`, Cómo funciona, `TrustStrip`.
3. **Detalle:** `FlyerStage`, `HowToBuy`, `RrppBlock`, Cómo llegar, "Si no es esta", redirect de
   `/comprar`.
4. **Agenda:** `MonthCalendar`, `?ultimas`, `?mes`.
5. **Buscar y Mis entradas.**
6. **Venues:** `lib/venues.ts`, `lib/venues-content.ts`, rutas, JSON-LD, sitemap.
7. *(P2)* `BomboReturnSheet`.

Cada PR sigue `AGENTS.md`: rama nueva, `npm run typecheck`, `npx eslint .` y `npm run build` limpios,
y review antes de mergear.

## 7. Criterios de aceptación

- 390×844: en Inicio, Detalle y Venue el CTA solid se ve **sin scrollear**. A 1280×800 pasa lo mismo
  en Inicio, Detalle y Venue desktop.
- Hay un solo `BuyCta variant="solid"` en el árbol de accesibilidad por pantalla (la barra mobile y
  la caja desktop se alternan con `display`, como hoy).
- `grep -rn 'href={`/go/' app components` no devuelve nada: todo pasa por `BuyCta`.
- Cada `BuyCta` tiene `placement` y cada link de WhatsApp tiene `WhatsappSource`.
- No se renderiza ningún precio ni lote (`price_label` sin uso en el sitio público).
- Chartreuse solo aparece en `BuyCta` (y en el isotipo del logo).
- Contraste: el texto mínimo es `text-3` (6.1:1) y ningún target interactivo baja de 44px.
- CLS menor a 0.05 en Inicio, Detalle y Agenda (skeletons del mismo alto, flyers con caja fija).
- Mis entradas funciona sin red una vez cargada, sin pedir datos ni tocar el servidor.
- Un evento pasado muestra "finalizado" con alternativas, nunca 404.
- Sitemap y robots siguen funcionando y suman venues. Los OG del detalle usan el flyer, con
  `/og-logo` de fallback.

## 8. Pendientes del dueño

1. **Nombre para el bloque "Comprás con alguien real"**: `NEXT_PUBLIC_CONTACT_NAME`.
2. **"Rio" o "Río":** `lib/credentials.ts` dice "Rio" y en el pedido escribiste "Río". Confirmá
   cuál va antes de publicar, porque es una afirmación pública.
3. **Textos de venue** (80–150 palabras cada uno) para `lib/venues-content.ts`. Sin texto, la
   sección no aparece.
4. **Direcciones:** el lienzo usa "Paseo de la Infanta · Palermo" para Crobar como ejemplo.
   Verificar las cinco en el admin (`venue_address`, `map_url`).
5. **DM Sans** como fuente de cuerpo: confirmar o elegir otra.
6. **Soldout:** la comparativa sale de tu descripción. Conviene revisarla contra el sitio en vivo.

## 9. Documentación a actualizar en el mismo trabajo

- `AGENTS.md`: nombrar `EventRow` como el componente vigente de listas (vuelve a existir), sumar
  `/venues`, `/buscar` y `/mis-entradas` a las rutas públicas y reflejar la regla de "un solo CTA
  solid por pantalla".
- `DESIGN_CONTEXT.md`: agregar la sección "Hora Pico v2" con las decisiones de §1, y marcar la
  excepción de chartreuse en fecha y nav como retirada.
