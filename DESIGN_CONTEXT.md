# Contexto de diseño — ElectroTickets

Documento de traspaso para retomar el trabajo visual sin releer todo el historial.
Última actualización: agosto 2026 (sesión de identidad de marca).

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

### Rama `claude/electrotickets-brand-identity-78v9rv` — identidad de marca

> **Estado: en rama, pendiente de revisión en la URL de preview.** Todavía no está en `main`.

El objetivo de esta sesión no era estética sino **recordación**: que ElectroTickets sea la
primera opción cuando alguien piensa "¿qué hay este finde?".

**Diagnóstico de partida.** El sitio ejecutaba bien lo de los PR #22 y #24, pero no había una
decisión de marca que todo eso estuviera ejecutando:

- El botón de comprar tenía **cuatro tratamientos distintos** según la superficie: degradé
  violeta en `EventRow`, **`bg-white/10` fantasma en `EventCard`** (o sea, en `/eventos` y
  `/destacados`, las dos páginas dedicadas a explorar, el botón que genera la facturación
  pesaba menos que un chip de género), blanco sólido en el detalle y blanco sólido en la
  barra fija. Además había 21 usos de `bg-white` sólido haciendo de botón primario.
  **El blanco no es un color que se pueda tener.**
- **Seis familias de color sin rol asignado** (violeta 46, emerald 39, rojo 29, ámbar 11,
  azul 5, cyan 2). El verde de WhatsApp había quedado de hecho como co-primario.
- El elemento firma del sitio —el bloque de fecha en mono— era `hidden sm:block`:
  **no existía en mobile**, que es de donde entra la mayoría del tráfico.
- El logo (tres barras con degradé de tres paradas) no funcionaba en un solo color, a 16px
  era una mancha y no tenía parentesco con la tipografía del nombre que llevaba al lado.

**Concepto: el ticket.** La primera versión de esta sesión lo llamó "la lista" y **el dueño
del proyecto lo rechazó con razón: la lista de RRPP es cosa del pasado y ya no le dice nada a
nadie.** El concepto que quedó es el objeto que sí sigue vivo —el ticket troquelado— y sostiene
igual las tres decisiones del sistema: el mono tabular de la fecha, la densidad de fila en
mobile y la perforación como forma repetida. **No revivir la metáfora de la lista en el copy.**

**Ley de color — cuatro roles cerrados** (documentada en `app/globals.css`):

| Rol | Color | Solo para |
|---|---|---|
| Acción / marca | cyan `#3de8f5` (`--color-brand`) | **Relleno** = comprar. **Filete o tinte** = firma de marca |
| WhatsApp | emerald | Acciones de WhatsApp. Retirado de toda decoración |
| Escasez | rojo | Sold Out / últimas entradas |
| Atmósfera | violeta | Fondo, glow del flyer. **Nunca un CTA** |

Se eligió cyan y no violeta porque el campo ya es violeta: un botón violeta sobre fondo
violeta no salta, que es exactamente la razón por la que el proyecto había terminado cayendo
al blanco. **La familia ámbar se retiró del sitio público** (mesas VIP pasa a violeta, con su
CTA de WhatsApp en emerald).

**Qué cambió:**

- **Wordmark tipográfico** (`components/wordmark.tsx`): ELECTRO en Archivo expandido +
  TICKETS en DM Mono trackeado, con regla cyan. Cero fuentes nuevas, y cada `h1` del sitio
  refuerza el logo porque están en la misma letra.
- **Marca gráfica** (`BrandMark`): ticket troquelado con el rayo calado en negativo. Las
  muescas laterales son la misma perforación que `.ticket-cut`, así que el logo y el objeto
  que se repite en cada pantalla son la misma figura. Un solo `path` con `fillRule="evenodd"`
  en color plano, probado a 16/24/40/110px. **La primera versión fue un monograma "ET" dentro
  de un recuadro y se rechazó por no ser un logo sino texto en una caja** — si en el futuro se
  vuelve a tocar, el criterio es que tiene que ser reconocible como forma, sin leerse.
- **Riel de fecha en mono, también en mobile**, con día de la semana (`getDayBadge` ahora
  devuelve `weekday`). Es la columna que ordena la agenda en cualquier ancho.
- **Troquelado de ticket** como única forma repetida: `.ticket-cut` (fila, vertical),
  `.ticket-cut-h` (tarjeta, horizontal, encima del CTA), `.ticket-perf` (perforación).
  Se recorta con `mask-image` porque el fondo es un degradé y un semicírculo sólido se vería
  como un parche. **La elevación se movió a `drop-shadow` en un contenedor `.ticket-elev`:**
  la máscara recorta todo lo que pinta el elemento, `box-shadow` incluido.
- **Mobile:** confianza por encima de los botones (`order-4`/`order-5`), botones del hero en
  una sola fila, barra fija de compra en cyan.
- **Copy.** Titular: **"Dónde suena la electrónica en Argentina."** Es la tercera versión; la
  primera vendía la categoría ("Las mejores fechas... en un solo lugar", lo firmaba cualquier
  agregador) y la segunda usaba la metáfora muerta de la lista. Esta nombra el lugar, que es
  lo que se recuerda. En "Este finde" se sacó "dentro de los próximos siete días": era la
  ventana de `getWeekendEvents` contada en voz alta y confundía. El filtro no cambió.
- **Favicon e imagen OG** al monograma ET, y `themeColor` a `#0b0714` para que coincida con
  el fondo real del body (había una costura visible en la barra del navegador en mobile).
  Los tres se aprobaron aparte por tocar zona restringida; la metadata de `app/og-logo` —
  `alt`, `contentType`, `size`, la URL— **no** cambió, solo el dibujo.
- **`lib/credentials.ts`**: placeholders vacíos para prueba social (venues donde es RRPP
  oficial, año de inicio, tamaño de la comunidad). **No renderizan nada mientras estén
  vacíos** y no hay que tocar componentes para activarlos. No se inventó ningún dato.

**Verificación:** 390px y 1358px, sin scroll horizontal, sin títulos cortados y sin targets
interactivos por debajo de 24px. Los diez valores de `CtaPlacement` y sus ubicaciones quedaron
**idénticos a `main`** (se comparó archivo por archivo contra `origin/main`).

### Sobre las skills

- **`frontend-design`** se usó para el PR #22 pero **no quedó versionada**: el PR que la
  agregaba (#21) se cerró por decisión del dueño del proyecto.
- **`ui-ux-pro-max`** es la que está instalada. Se versiona solo `skills-lock.json`;
  `.agents/` y `.claude/skills/` están en `.gitignore` (PR #23) porque pesan ~3,8 MB.
  Para reinstalar: `npx skills add <source> --skill <nombre>`.
  **Ojo:** en un entorno recién clonado la skill **no está en disco** (está ignorada), así que
  hay que reinstalarla antes de poder correr sus scripts.

#### `--design-system` está roto para elegir estilo — no es un problema de keyword

Esto ya se había anotado dos veces como "da resultados fuera de tema". En esta sesión se
aisló la causa, así que **no hace falta volver a iterar keywords**:

| Query | Estilo devuelto | Paleta |
|---|---|---|
| `electronic music events ticketing nightlife Argentina youth` | Minimalism & Swiss Style | `#FFF7ED` (crema, modo claro) |
| `nightlife entertainment vibrant dark` | Minimalism & Swiss Style | `#FFF1F2` (rosa claro) |
| `event discovery mobile-first` | Minimalism & Swiss Style | `#F8FAFC` + Atkinson Hyperlegible |
| **`banana plumbing invoices tax`** (control absurdo) | **Minimalism & Swiss Style** | — |

El bloque de estilo del test de control salió **idéntico carácter por carácter** al de las
tres queries reales. `--design-system` no lee la query para elegir estilo: devuelve siempre el
mismo default —cuyo *Best For* es "Enterprise apps, dashboards, documentation sites"— y solo
varía paleta y tipografía. **Ninguna combinación de keywords lo arregla.**

**Lo que sí funciona es la búsqueda por dominio**, y devuelve datos perfectamente en tema:

```bash
python .claude/skills/ui-ux-pro-max/scripts/search.py "dark neon rave club techno poster energy" --domain style -n 5
# → dark-mode-oled (fondo #000/#121212, acentos neón, contraste 7:1+, "no white background"),
#   cyberpunk-ui, retro-futurism (synthwave, preferred mode: dark)

python .claude/skills/ui-ux-pro-max/scripts/search.py "bold condensed display nightlife poster techno" --domain typography -n 4
# → "Bold Typography Mobile (Inter Poster)": poster, type-as-hero, high-contrast, event apps
```

**Regla para la próxima sesión: usar `--domain style` / `--domain typography` / `--domain ux`
y saltear `--design-system`.** La base de datos de la skill es buena; el compositor no.

---

## 3. Componentes principales de UI

### Núcleo — tocar con cuidado, se reutilizan en varias páginas

| Archivo | Qué es |
|---|---|
| `app/globals.css` | **Fuente de verdad del sistema visual.** Tokens, `@theme`, `.glass`, `.tabular`, `.flyer-glow`, foco, reduced-motion |
| `app/layout.tsx` | Carga de fuentes (`next/font`), GA4 y Clarity |
| `components/event-row.tsx` | **Fila compacta de evento.** Formato denso de la agenda. Se usa en hero, home y relacionados |
| `components/event-card.tsx` | **Tarjeta de evento** (flyer 4:5). Se usa en `/eventos` y `/destacados` |
| `components/wordmark.tsx` | **Identidad.** `Wordmark` (lockup ELECTRO/TICKETS) y `WordmarkMonogram` (ET). Se usa en header y footer |
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

`lib/credentials.ts` centraliza la prueba social. Está **vacío a propósito** y lo que está
vacío no renderiza. Es el único lugar donde cargar venues donde sos RRPP oficial, año de
inicio o tamaño de la comunidad. **No completar nada que no se pueda sostener con un dato
real.**

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
  sección vende. En la práctica esto se cumple solo mientras todo CTA siga pasando por
  `<BuyButton event placement>`, que construye la URL con `buildGoUrl`. **Nunca escribir un
  `href` a `/go/` a mano:** rediseñar un botón es cambiarle `className` y los hijos, nada más.
- **Todo CTA de WhatsApp tiene que llevar un `WhatsappSource`.**
- `/go/[slug]` es una redirección de servidor, así que GA4 no la ve: el clic se registra dos
  veces, en el cliente (`track("click_buy")`) y en el servidor (fila en `event_clicks`).

### Decisiones de producto

- **No se muestran precios.** Es decisión comercial. `price_label` existe en la base pero no
  se renderiza. **No agregar un CTA que prometa precio en el sitio** — la duda de precio se
  deriva a WhatsApp.
- **No inventar datos.** Nada de testimonios, cantidad de clientes, estadísticas ni
  credenciales que no estén respaldadas por un dato real. Los huecos viven en
  `lib/credentials.ts` y no renderizan mientras estén vacíos.
- **La ley de color no se negocia.** Cyan relleno = comprar y nada más; emerald = WhatsApp;
  rojo = escasez; violeta = atmósfera. Meter un quinto color o usar cyan para navegación
  vuelve a dejar el sitio sin color de marca, que es de donde se venía.
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
