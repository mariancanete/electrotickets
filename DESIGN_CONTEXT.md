# Contexto de diseño — ElectroTickets

Documento de traspaso para retomar el trabajo visual sin releer todo el historial.
Última actualización: noviembre 2026 (**PR #30 a #36: conversión, SEO de Mute, agotadas,
flyers en wsrv y a su medida, compresión en el panel**). Lo más reciente está en §2.7 y en
los pendientes de §6.

> **Si arrancás una sesión nueva, leé en este orden:** `AGENTS.md` (reglas), este archivo
> (qué hay y por qué), y recién después `HANDOFF_REDISENO.md`, que es una **propuesta** de
> rediseño de octubre que se implementó solo en parte (ver §6).

> El sistema visual vigente es **Hora Pico** (§2.5). Reemplaza al sistema violeta + cyan con
> Archivo + DM Mono que describen los PR #22 a #26. Todo lo anterior a §2.5 queda como
> historial: sirve para entender por qué se decidió algo, no para copiar tokens.

---

## 1. Stack y convenciones

| | |
|---|---|
| Framework | **Next.js 16.2.6**, App Router, React 19.2 |
| Estilos | **Tailwind CSS v4** (`@import "tailwindcss"` + bloque `@theme`), sin `tailwind.config.js` |
| Base de datos | Supabase (`@supabase/supabase-js`) |
| Iconos | **Set propio de 23 glifos** (`components/icons.tsx`). Phosphor sigue instalado pero solo lo usa el admin |
| Hosting | Vercel |
| Idioma | Español rioplatense (voseo). Todo el copy público y los comentarios de código |

> **Ojo:** el proyecto se describe a veces como "Next.js 14". La versión real es **16.2.6**.
> Varias APIs difieren (`params` es una `Promise` en las páginas, por ejemplo).

**Convenciones detectadas y respetadas:**

- Server components por defecto; `"use client"` solo donde hace falta estado o eventos.
- Los iconos salen de `components/icons.tsx`: `<Icon name="pin" size={14} />`. El sprite
  (`<IconSprite />`) se monta una sola vez en `app/layout.tsx` y cada ícono es un `<use>`.
- El admin todavía importa de **`@phosphor-icons/react/dist/ssr`**; sigue en
  `optimizePackageImports` (`next.config.ts`) por eso.
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

### PR #25 — Identidad de marca: color de acción, logo y troquelado

Mergeado y en producción.

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
- **Íconos: hay dos fuentes y se tocan juntas.** `app/icon.svg` es una convención de archivo
  del App Router y genera la ruta `/icon.svg`; `public/favicon.svg` es lo que declara
  `metadata.icons`. Hoy gana el segundo porque `metadata.icons` tiene precedencia sobre la
  convención, pero **dejarlos desincronizados hace reaparecer el logo viejo** por cualquier
  vía que pida `/icon.svg`. En esta sesión pasó exactamente eso y costó una vuelta de
  revisión. Si tocás uno, tocá el otro.
- **Favicon, ícono e imagen OG** llevan la marca nueva, y `themeColor` a `#0b0714` para que coincida con
  el fondo real del body (había una costura visible en la barra del navegador en mobile).
  Los tres se aprobaron aparte por tocar zona restringida; la metadata de `app/og-logo` —
  `alt`, `contentType`, `size`, la URL— **no** cambió, solo el dibujo.
- **`lib/credentials.ts`**: placeholders vacíos para prueba social (venues donde es RRPP
  oficial, año de inicio, tamaño de la comunidad). **No renderizan nada mientras estén
  vacíos** y no hay que tocar componentes para activarlos. No se inventó ningún dato.

**Verificación:** 390px y 1358px, sin scroll horizontal, sin títulos cortados y sin targets
interactivos por debajo de 24px. Los diez valores de `CtaPlacement` y sus ubicaciones quedaron
**idénticos a `main`** (se comparó archivo por archivo contra `origin/main`).

### PR #26 — Venues oficiales y fix de secciones curadas

**Credencial de RRPP oficial.** `lib/credentials.ts` ya tiene cargados los venues reales:
Mute, Mandarine, Crobar, Rio y The Bow. Se muestran con `components/official-venues.tsx` en
el hero —dentro de la caja de confianza, para no romper el `lg:mt-auto` que cierra las dos
columnas— y en Quiénes somos. Los nombres van tal como los pasó el dueño del proyecto: **no
completar ni "corregir" la nomenclatura sin confirmarlo**, porque es una afirmación pública
sobre relaciones comerciales reales.

> **Ojo con el PR #25:** ahí se creó `lib/credentials.ts` con los huecos vacíos pero **ningún
> componente lo consumía**, así que cargar un dato no habría mostrado nada. La UI se agregó
> recién en este PR. Hoy sí funciona como se documentó: se completa el archivo y aparece solo.
> Siguen vacíos `sinceYear` y `communitySize`.

**Fix: las secciones curadas se perdían fechas.** Con dos eventos marcados como últimas
entradas, "Últimas entradas" mostraba uno solo. `weekendEvents` y `lastTicketsEvents` se
calculaban sobre una lista que excluía a los tres del hero —para no repetirlos más abajo—, así
que una fecha que quedaba destacada arriba desaparecía de la sección de escasez. "Este finde"
tenía el mismo agujero.

Ahora las dos secciones curadas se calculan sobre **todos** los eventos: ahí la completitud
vale más que no repetir. La agenda genérica de abajo sigue filtrando lo que ya apareció. Se
mantiene la precedencia entre secciones: una fecha del finde con últimas entradas se lista
solo en "Este finde", donde su fila ya muestra el chip rojo. `lib/events.ts` no se tocó — el
cambio es cómo la home compone, no cómo se filtra.

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

### Rediseño "Hora Pico" — 9 pantallas mobile (sistema vigente)

Salido de `handoff-prd.md` + `ElectroTickets.dc.html` (Claude Design). Mobile-first, ancho de
diseño 390px. La adaptación a desktop está más abajo, en §2.6.

**Color** — cada token tiene un uso único y cerrado (`app/globals.css`):

| Token | Valor | Uso |
|---|---|---|
| `cta` | `#CBFF1F` | CTA de compra y tab activo del nav. **Nada más.** |
| `cta-pressed` | `#B2E30A` | Pressed del CTA |
| `marca` | `#2B34FF` | Header, riel de fecha, badges informativos |
| `urgencia` | `#FF5A3C` | Solo "Últimas entradas" |
| `ink` / `surface` / `surface-alt` | `#0A0A14` / `#15151F` / `#1F1F2C` | Fondo / cards / deshabilitado |

**Tipografía** — Space Grotesk (display y cuerpo) + JetBrains Mono. El mono es **solo** para
datos que genera la máquina: fechas, horas, contadores, estados, IDs. Lo que escribe una
persona va en Space Grotesk.

**Utilidades nuevas:** `.trama` / `.trama-fuerte` (semitono de 7px sobre ultramar, reemplaza a
la foto cuando no hay flyer), `.rayado` / `.rayado-lg` (placeholder de flyer a 135°),
`.dato` / `.dato-seccion` (mono), `.display`, `.chips-scroll`.

**Mapa de pantallas → rutas:**

| # | Pantalla | Ruta |
|---|---|---|
| 01 | Home / descubrimiento | `/` |
| 02 | Listado de eventos | `/eventos` |
| 03 | Detalle de evento | `/eventos/[slug]` |
| 04 | Compra (pasaje a Bombo) | `/eventos/[slug]/comprar` *(nueva)* |
| 05 | Estado vacío | estado de `/` cuando el finde no tiene fechas |
| 06 | Mis entradas | `/mis-entradas` *(nueva)* |
| 07 | Mis entradas vacío | estado de `/mis-entradas` |
| 08 | Buscar | `/buscar` *(nueva)* |
| 09 | Ayuda | `/preguntas-frecuentes` |

**Agrupación por noche, no por día calendario.** Una fecha que arranca 03:00 del domingo es
la noche del sábado. `getDayKey` corre la fecha 6 horas antes de agrupar (`NIGHT_HOURS` en
`lib/dates.ts`). Sin eso cada finde se partía en dos y quedaban fechas sueltas bajo un
domingo que nadie busca.

**Ajustes al PRD por límite técnico o por conflicto interno del propio PRD:**

1. **Placeholder de flyer sin etiqueta.** La §5 pide "franjas + etiqueta mono del formato",
   pero "flyer 4:5" es una anotación del mockup, no copy de producto: a un usuario no le
   dice nada. Se dibujan las franjas sin texto. El propio mockup ya lo hace así en la card
   agotada de la pantalla 02.
2. **Tab activo de Ayuda en blanco, no chartreuse.** El mockup pinta ese tab de chartreuse,
   pero la §6.09 exige "cero chartreuse" en esa pantalla. Gana el PRD: si Ayuda encendiera
   el chartreuse en el nav, rompería su propia regla en el elemento más visible.
3. **"Ver las N" de la home en blanco, no chartreuse.** El mockup lo pinta de chartreuse
   pero lleva al listado, no a comprar. Gana el principio 1.
4. **Título de la 02: "Todas las fechas", no "Este finde".** El mockup muestra el estado
   filtrado; la ruta lista todo, así que llamarla "Este finde" sería falso cuando aparecen
   fechas del mes siguiente. Los filtros aplicados se muestran como chips.
5. **La credencial de RRPP no se renderiza en el estado vacío (05).** Es la pantalla más
   apretada —tiene que entrar el punteado, la próxima fecha y el bloque de alertas completos
   arriba del nav— y el mockup de la 05 tampoco la muestra.
6. **El detalle conserva descripción, video, FAQ y fechas parecidas** debajo de los bloques
   que sí especifica la §6.03. El PRD no los menciona, pero es el contenido indexable que
   sostiene el posicionamiento de la URL y alimenta el `FAQPage` del JSON-LD. Sacarlos
   habría sido una decisión de SEO disfrazada de decisión de diseño.
7. **Zona de los filtros = `venue_name`, no `city`.** `city` viene cargado como "Buenos
   Aires" en casi todas las filas: una fila de chips donde todos dicen lo mismo no filtra.

**Pendiente resuelto por decisión del dueño:** el corazón de guardar del detalle se
implementa **visualmente y sin función** (`components/detail-actions.tsx`); la prueba social
**no se implementa** y su slot queda oculto; los flyers salen únicamente de `flyer_url` tal
como lo carga el admin.


### Adaptación a desktop (§10 del PRD)

**Es reflow de layout, no rediseño.** No entra ni un token nuevo: los mismos colores, la misma
escala tipográfica, el mismo sprite de 23 glifos y los mismos componentes base. Lo único que
cambia es dónde se paran las cosas y qué pasa cuando hay un mouse.

**El mobile ya aprobado no se movió un pixel.** Está verificado con un diff pixel a pixel de
las 11 rutas públicas a 390px, comparando contra el commit anterior: 11 de 11 idénticas.
Cuando un cambio de desktop movía algo en mobile —el wrapper de la barra de Buscar, el margen
del bloque de contacto de Ayuda— se corrigió hasta que el diff volvió a cero.

**Breakpoints:**

| Rango | Layout | Nav |
|---|---|---|
| ≤767 | Mobile, sin cambios | Barra inferior fija |
| 768–1023 | Mobile centrado, máximo 560px (`.app-shell`) | Barra inferior fija |
| ≥1024 | Desktop, padding lateral 44px | **Header superior de 76px** |
| ≥1280 | Grillas de 3, sidebar de 260px | Header |
| ≥1440 | Grillas de 4 donde aplica, sidebar 280px, padding 60px | Header |

La transición de nav ocurre **exactamente en 1024px** y no hay estado intermedio: `BottomNav`
lleva `lg:hidden` y `DesktopHeader` lleva `hidden lg:flex`. Verificado a 1023 y 1024.

**Trampa que costó encontrar: el breakpoint de 1440 no puede ser un `--breakpoint-*` custom.**
Tailwind v4 ordena las variantes de breakpoint **por nombre, no por valor**, así que un
`--breakpoint-3xl` emite sus reglas *antes* que las de `lg`. A 1440 las dos condiciones se
cumplen y ganaba la de 1024 por orden de aparición: el ancho de 1440 no se aplicaba nunca y
en pantalla no se notaba salvo midiendo. Todo lo que cambia a 1440 vive ahora en clases
propias de `globals.css` (`grilla-cards`, `col-detalle`, `col-listado`, `col-vacio`,
`col-entradas`, `col-ayuda`, `titular-hero`, `titular-detalle`, `destacada`), que están fuera
de las capas de Tailwind y por eso ganan siempre.

**Misma razón, otra trampa:** una clase propia como `.line-clamp-2` le gana a `lg:hidden` por
estar fuera de las capas. Se eliminó en favor del `line-clamp-*` nativo de Tailwind v4. Regla
general: **no escribir clases propias que compitan con utilidades de Tailwind**; las clases
propias son para lo que Tailwind no puede expresar (layouts con dos cortes, sticky
condicionado por alto, la trama).

**Sticky.** Solo tres cosas se pegan, más el header:
- Sidebar de filtros del listado: `top: 100px`, con `max-height: calc(100vh - 124px)` y scroll
  interno. Nunca se convierte en drawer.
- Barra de búsqueda de Buscar: pegada al header, mismo fondo ink y su borde.
- Columna izquierda del detalle: `top: 100px`, y lleva el CTA adentro. **Si la columna es más
  alta que el viewport, libera el sticky** (`@media (max-height: 928.98px)` a 1024 y 1015.98px a 1440;
  hasta el PR #39 eran 859.98 y 949.98px) y scrollea con la página: antes que recortar el único punto de conversión de la
  pantalla, se pierde el pegado. Verificado a 1280×720.

**Hover y foco.** Todo detrás de `@media (hover: hover)`, incluidos los `:active` — en un touch
`:active` se dispara al tocar, y encerrarlo garantiza que mobile se comporte igual que antes.
Transición única de 150ms ease-out (`.t150`). El anillo de foco pasó de chartreuse a blanco:
un anillo recorriendo filtros y links diluía el significado del color de compra. **El hover
nunca introduce chartreuse donde no lo había.** Con `prefers-reduced-motion` se anulan también
los `transform`, no solo las transiciones.

**Qué se duplica en el DOM y por qué.** El bloque de compra del detalle y el de la pantalla de
compra se renderizan dos veces —barra fija en mobile, dentro de la columna sticky o al pie de
la columna en desktop— porque una media query cambia estilos pero no mueve un nodo de lugar.
Se alternan con `display`, así que en cada ancho hay exactamente uno en el árbol de
accesibilidad y un lector de pantalla nunca escucha dos CTA. Lo mismo pasa con el selector de
días de la home, que en desktop viaja adentro del campo ultramar.

**Filtros nuevos, sin campos nuevos.** El sidebar suma `dia` (ISO, `2026-08-21`) y `horario`
(`temprano` / `tarde`, cortado a las 2). Los dos salen de `starts_at` y viajan en la URL como
los demás. `getDayKeyIso` usa la misma corrección de noche que `getDayKey`.

**Ajustes al PRD por conflicto interno de la §10:**

1. **El flyer de la destacada se achica en ventanas bajas.** La §10 pide flyer de 400px *y*
   CTA visible en el primer viewport a 1280×800; con el header y el hero, el botón cae 22px
   abajo del pliegue. Se resuelve por alto de ventana —igual que la propia §10 resuelve el
   sticky del detalle—: 400px en pantallas altas, 340px en bajas. Medido: CTA a 747px en
   1280×800.
2. **El CTA del detalle mide 402px a 1280 y 472px a 1440**, no 400 y 470. La cuenta del PRD
   (columna − 56 de WhatsApp − 12 de gap) da esos valores; se usa `flex: 1` para que cierre
   sola en vez de dejar 2px de aire.
3. **El listado se queda en 3 columnas a 1440**, no 4: los 280px del sidebar se comen el ancho.
   Es lo que muestra el propio frame `D02 Listado 1440`.
4. **El chip "+18"** de los frames no se implementa: no hay columna que lo respalde, mismo
   criterio que la prueba social.
5. **El riel de la card muestra la fecha calendario real, no la de la noche.** Una fecha que
   arranca 03:00 del domingo se agrupa bajo el sábado (encabezado "SÁBADO 22.08") pero su riel
   dice "DOM 23 · 03:00". Los frames muestran "SÁB" en los dos lugares. Se prefirió el dato
   real: quien va a la fiesta tiene que presentarse el domingo, y un riel que dijera sábado lo
   mandaría un día antes.

**Numeración.** La §6 y la §10 numeran distinto las mismas pantallas (en la §6 la 03 es Detalle
y la 08 es Buscar; en la §10 la 03 es Buscar y la 04 es Detalle). Las rutas son las mismas y no
cambian: conviene nombrarlas por ruta.

### Oct–nov 2026 — PR #30 a #36 (sistema vigente: Hora Pico + estos cambios)

Todo se hizo sobre Hora Pico, sin cambiar tokens ni tipografías. `HANDOFF_REDISENO.md` y el
lienzo de Claude Design (https://claude.ai/artifact/MaFd2gwbZvwaoXs77bCcaJ, privado) son
la propuesta "Camino corto" de esa misma conversación: **no** se implementó entera (§6).

| PR | Qué cambió |
|---|---|
| #30 | Sección **"Fechas destacadas"** en la home: las `featured` fuera del finde (placement `home_destacadas`). **Flyer completo en mobile** (contain + fondo difuminado; luego lo reemplazó #36). Se commiteó `HANDOFF_REDISENO.md` |
| #31 + #32 | **SEO de la fecha de Mute** (`/eventos/solomun-2027-01-02`): h1 con el venue, título con la ciudad, descripción con fecha y año, "Sobre la fecha" y FAQ con "SOLOMUN en Mute". El #31 lo aplicó a todos los eventos y cambió la página de Mandarine Park, que **no había que tocar** ("solomun mandarine" sale 2.ª); el #32 lo restringe a **fechas fuera de CABA** (`getDistinctCity`): las porteñas quedan idénticas a antes del #31 (verificado comparando el HTML del build). #32 también sube el tope de destacadas a **8** |
| #33 | **Agotadas:** el botón "Agotado" pasa a **"Avisame por WhatsApp"** (`SoldOutWhatsappCta`, delineado, nunca chartreuse; abre `wa.me` con `buildWaitlistWhatsappMessage`). **Sello "AGOTADO / SOLD OUT"** sobre el flyer (`SoldOutStamp`: tinta y blanco, ni coral ni chartreuse; banda al pie en miniaturas). Las cards agotadas dejan de bajar la opacidad entera. Botón **"Sumate al grupo de WhatsApp"** dentro de la credencial RRPP del detalle (`WhatsappGroupButton`, `wa_source: event_group`) |
| #34 | **Flyers rotos:** se agotó el cupo de transformaciones de Vercel (4,9K/5K) y `/_next/image` devolvía **402**. Ahora `next/image` usa un loader propio (`lib/flyer-loader.ts`) que pide los flyers a **wsrv.nl** (WebP, sin agrandar, Cloudflare cachea un año); menos anchos (`deviceSizes`/`imageSizes` en `next.config.ts`); preconnect en el layout. **Card con venue largo** (DISCIP, SOLOMUN NYE) se salía de la card: `min-w-0` en la columna de `DateCard` |
| #35 | **El panel comprime el flyer** en el navegador antes de subirlo (`lib/compress-flyer.ts`: máx. 1200×1600, JPEG 0,85 —es el `og:image` de WhatsApp—). Valida 2 MB **antes** de subir con el mensaje de AGENTS.md; muestra "Flyer optimizado: 3,1 MB → 134 KB". Upload con `cacheControl` de un año. `GridCard` (solo desktop) dejaba bajar flyers de 1200px ocultos en mobile: `sizes` con `1px` final |
| #36 | **Flyers enteros a su medida** en mobile y desktop: `FlyerFrame` dibuja el recuadro con la proporción real del flyer (`flyer_ratio`, ver abajo), sin recortar ni deformar ni bandas. **"Últimas entradas" más visible:** llama nueva en el sprite, texto completo, halo coral, tres tamaños; también en la fila compacta de la home y en la línea sobre el CTA del detalle |

**Proporción del flyer (`flyer_ratio`).** No es columna: `lib/flyer-meta.ts` la pide a wsrv
(`output=json`, caché de datos de Next, timeout 1,5 s) y `lib/events.ts` la agrega en
`getPublishedEvents` y `getEventBySlug`. Si falla, `null` → recuadro 4:5 con el flyer entero.
En vivo había 4 cuadrados, 3 stories 9:16, 3 de 3:4 y 6 de 4:5.

**Topes de `FlyerFrame` (alto/ancho máximo).** Card mobile 62px de ancho, hasta 1,5 · grilla
desktop 4/3 · detalle mobile ancho completo, hasta 1,5 · **detalle y destacada desktop 1,25**
(el alto que ya tenían: con 4/3 el CTA del detalle bajaba a 990px en 1440×900; los umbrales
del sticky siguen en 859.98/949.98). Por encima del tope queda margen relleno con el mismo
flyer difuminado (misma URL, sin segunda descarga).

**Destacada mobile de la home.** Flyer de 128px al costado de los datos y CTA debajo a todo
el ancho. A lo ancho y a su medida el flyer empujaba "Comprar en Bombo" abajo del pliegue;
así queda a ~590px en 390×844.

---

## 3. Componentes principales de UI

### Núcleo — tocar con cuidado, se reutilizan en varias páginas

| Archivo | Qué es |
|---|---|
| `app/globals.css` | **Fuente de verdad del sistema visual.** Tokens de Hora Pico, `@theme`, `.trama`, `.rayado`, `.dato`, `.display`, foco, reduced-motion |
| `app/layout.tsx` | Carga de fuentes (`next/font`), sprite de íconos, GA4 y Clarity |
| `components/icons.tsx` | **Set de 24 glifos** (se sumó `flame`) + isotipo `Mark`. `IconSprite` va una vez en el layout |
| `components/date-card.tsx` | **La card de fecha.** Se reusa en 02, 05, 06, 07 y 08. No hay card especial de búsqueda |
| `components/cta.tsx` | `BuyCta` (56px, va a `/go/`), `CardCta` (44px, abre el detalle), `SoldOutWhatsappCta` (agotada → WhatsApp; reemplazó a `SoldOutCta`), `WhatsappIconButton`, `WhatsappGroupButton` |
| `components/bottom-nav.tsx` | Nav de 4 tabs + `NavSpacer`, que reserva su alto al final de cada pantalla |
| `components/app-header.tsx` | `AppHeader` (marca ultramar con trama), `ScreenHeader`, `TabHeader`, `Wordmark` |
| `components/chips.tsx` | `Chip`, `UrgencyChip` (llama + "Últimas entradas", tamaños sm/md/lg), `CredentialChip`, `InfoBlock` |
| `components/flyer-image.tsx` | **`FlyerFrame`** (recuadro a la medida del flyer), `FlyerImage`, `FlyerFallback`. `Flyer` ya no existe |
| `components/sold-out-stamp.tsx` | Sello de agotada sobre el flyer (`sm` banda, `lg`, `xl`) |
| `lib/flyer-loader.ts` | Loader de `next/image`: flyers por **wsrv.nl**, no por Vercel. Para volver a Vercel: sacar `loader` y `loaderFile` de `next.config.ts` |
| `lib/flyer-meta.ts` | `withFlyerRatios`: agrega `flyer_ratio` a los eventos públicos |
| `lib/compress-flyer.ts` | Compresión del flyer en el navegador (panel) |
| `lib/saved-dates.ts` | Mis entradas en `localStorage`. Sin cuenta, sin cookie, sin dato personal |
| `lib/filters.ts` | Filtros de 02 y 08. Todos viven en la URL |
| `lib/weekend.ts` | Criterio de finde (viernes-sábado-domingo) en horario argentino |

> **`EventRow`, `EventCard` y `SectionHeading` ya no existen.** La card de listas es
> `DateCard` (mobile) y `GridCard` (desktop, oculta debajo de 1024px).

### Páginas

| Archivo | Notas |
|---|---|
| `app/page.tsx` + `components/agenda-screen.tsx` | Pantallas **01 y 05**. Misma ruta, dos estados: el vacío no es un error |
| `app/eventos/page.tsx` | Pantalla **02**. Agrupado por noche, con la barra de filtros aplicados |
| `app/eventos/[slug]/page.tsx` | Pantalla **03**. **El archivo más grande y más sensible.** Contiene el JSON-LD |
| `app/eventos/[slug]/comprar/page.tsx` | Pantalla **04**. `noindex`: es pantalla de paso, no landing |
| `app/mis-entradas/page.tsx` + `components/my-tickets-screen.tsx` | Pantallas **06 y 07**. `noindex` |
| `app/buscar/page.tsx` + `components/event-browser.tsx` | Pantalla **08**. Filtros en la URL (`?q=`, `?genero=`, `?zona=`, `?cuando=`) |
| `app/preguntas-frecuentes/page.tsx` | Pantalla **09**. Acordeón `<details>`, cero chartreuse |
| `app/destacados/page.tsx` | Fuera de las 9, pero es URL indexada: se pasó a `DateCard` porque `EventBrowser` ahora es la pantalla Buscar entera |
| `app/quienes-somos/page.tsx`, `app/contacto/page.tsx`, `app/privacidad/page.tsx` | Páginas de confianza, **también en Hora Pico**. Cero chartreuse: acá no se compra, se decide si confiar |
| `app/not-found.tsx` | 404 con el patrón del estado vacío: la salida es la agenda |

> **Ya no hay footer.** El nav inferior de 4 tabs lo reemplaza. Las tres páginas de confianza
> se enlazan desde el pie de **Ayuda** (`/preguntas-frecuentes`): sin ese bloque quedarían
> huérfanas, que son URLs indexadas sin ningún link interno que las alimente.

> **Se eliminó el sistema visual anterior entero.** `site-header`, `site-footer`, `hero`,
> `event-card`, `event-row`, `section-heading`, `mobile-nav`, `buy-button`, `wordmark`,
> `official-venues`, `whatsapp-alerts`, `event-actions` y `event-countdown` ya no existen.
> Eran un bloque cerrado de código muerto que solo se referenciaba a sí mismo, y dejarlo era
> invitar a que alguien reusara un componente del sistema viejo sin darse cuenta.

### Captura y conversión

Los CTA instrumentados son `BuyCta`, `SoldOutWhatsappCta`, `WhatsappIconButton`,
`WhatsappGroupButton` (`components/cta.tsx`) y `WhatsappLink` (`components/whatsapp-link.tsx`).

`lib/credentials.ts` centraliza la credencial: `officialVenues` tiene **Mute, Mandarine,
Crobar, Rio y The Bow** (dato del dueño; ver "Rio"/"Río" en §6). `sinceYear` y
`communitySize` siguen vacíos y no renderizan. **No completar nada que no se pueda sostener
con un dato real.**

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
  `<BuyCta event placement>`, que construye la URL con `buildGoUrl`. **Nunca escribir un
  `href` a `/go/` a mano:** rediseñar un botón es cambiarle `className`, nada más.
- **Los placements de Hora Pico se agregaron a los viejos, no los reemplazaron.**
  `event_clicks` ya tiene meses de filas con los nombres anteriores y renombrarlos partiría
  la serie histórica justo en la métrica que decide dónde va el próximo CTA.
- Los seis placements nuevos son de **dos familias distintas** y se leen distinto:
  `home_destacado`, `detalle_barra` y `compra_barra` son botones "Comprar en Bombo" que van a
  `/go/` y disparan `click_buy` — esos son intención de compra. `listado_card`,
  `vacio_proxima` y `mis_entradas_card` son los CTA compactos "Entradas", que **abren el
  detalle, no Bombo** (§1.2 del PRD), así que disparan `select_date`: miden qué superficie
  empuja al detalle sin inflar `click_buy` contando dos veces la misma intención.
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
- **La ley de color no se negocia.** Chartreuse = comprar y nada más (más el tab activo del
  nav y la fecha en mono, que son las dos excepciones que fija el propio sistema); ultramar =
  marca e informativo; coral = solo "Últimas entradas"; blanco = selección. Un filtro
  activo, un día seleccionado o un botón de alertas **nunca** van en chartreuse: si el color
  de compra decora, deja de significar compra.
- **Sold out y últimas entradas nunca se muestran juntos.** Una fecha agotada no puede estar
  además por agotarse. `sold_out` apaga la card y el CTA; `last_tickets` pinta el chip coral.
- **Mis entradas no pide cuenta ni dato personal.** Vive entera en `localStorage`. No agregar
  auth, tabla ni endpoint: mandar la lista al servidor convertiría en dato de servidor
  justamente lo que se decidió que no saliera del dispositivo.
- **No se agregan campos a `events`.** Todo el rediseño se construye con las columnas que ya
  existen. Fue por eso que se descartó mostrar lotes en la pantalla 04.
- **Los eventos pasados nunca devuelven 404.** Su URL conserva posicionamiento; se renderiza
  el estado "finalizado" con alternativas.
- **Mobile no se degrada.** Es de donde entra la mayoría. Cualquier cambio de layout va en
  variantes `sm:` y superiores salvo que el objetivo sea justamente mejorar mobile.

### Decisiones de oct–nov 2026

- ~~Mandarine Park no se toca en SEO.~~ **Reemplazada en el PR #39** por decisión del dueño
  ("la prioridad es que entre más gente"), con los datos de Search Console de octubre 2026:
  el 38 % de las impresiones tenía "argentina" y el 23 % "buenos aires", y ningún título de
  una fecha porteña nombraba la ciudad ni el país. "solomun buenos aires" (3.028
  impresiones) estaba en posición 6,8 con 1 % de CTR. Ver "SEO por intención" abajo.
- **SEO de Massano B2B Kevin de Vries (PR #38).** "kevin de vries entradas" traía primero la
  finalizada de Mandarine: su FAQ decía literal "¿Dónde comprar entradas para KEVIN DE VRIES?"
  y respondía "ya finalizó", y el link a la fecha nueva estaba al pie, debajo del FAQ.
  - **Finalizada + mismo artista en agenda** (`findSameArtistEvent`): título "… | Finalizado ·
    Nueva fecha en Mute", descripción y "Sobre la fecha" que nombran la fecha nueva, FAQ que
    deriva a ella y aviso ultramar (`NextDateBanner`, nunca chartreuse: lleva al detalle, no
    a Bombo) **arriba**, debajo de la fecha. Sin fecha nueva, la finalizada queda como antes.
  - **Placeholders fuera:** "TBA", "TBC", "a confirmar"… no cuentan como artista. Antes una
    finalizada con "TBA" mostraba "Próxima fecha de TBA" y mandaba a cualquier fecha con TBA.
  - **Fuera de CABA, vigentes:** título corto "X en Mute, Mar del Plata | Entradas" (pasaba
    los 80 caracteres y Google lo cortaba antes de "entradas"); h1 "en Mute, Mar del Plata";
    con 2+ artistas en el título, una pregunta por artista ("¿Cuándo toca MASSANO en Mar del
    Plata?"), que es como se busca un b2b.
  - El JSON-LD `MusicEvent` no cambia de forma; solo su `description`, que siempre salió de
    `buildSeoDescription`.
- **SEO por intención (PR #39).** Una misma fecha tiene que salir para varias búsquedas, y
  cada tipo de búsqueda tiene su página:
  - **Detalle de evento** (`/eventos/[slug]`) — "[artista] [venue]", "[artista] [ciudad]",
    "[artista] [fecha]". Título `SOLOMUN en Mandarine Park, Buenos Aires 2026 | Entradas`
    para **todas** las fechas; h1 con "en Mandarine Park, Buenos Aires"; descripción con
    "(Buenos Aires, Argentina)"; FAQ "¿Cuándo toca X en Argentina?" por cada artista del
    título, con todas sus fechas vigentes. "CABA" se muestra "Buenos Aires" (`getEventCity`).
  - **Página de artista** (`/artistas/[slug]`, nueva) — "[artista] argentina", "[artista]
    argentina 2026", "[artista] entradas". Título `SOLOMUN en Argentina 2026 y 2027: fechas y
    entradas`. Lista fechas vigentes (`DateCard`/`GridCard`, placement `artista_card`) y hasta
    6 anteriores. **Es una URL que no vence**: el posicionamiento se acumula entre fechas en
    vez de arrancar de cero con cada slug nuevo. Sin fechas vigentes no da 404: muestra el
    grupo de WhatsApp (`wa_source: artist_page`). Sale del `lineup`, no hay tabla de artistas.
    Cada chip del lineup del detalle enlaza acá, y la finalizada suma "Todas las fechas de X".
  - Los helpers de texto viven en `lib/event-seo.ts`; la consulta de artistas en
    `lib/artists.ts`. Placeholders ("TBA", "a confirmar"…) nunca generan página ni link.
- **`/go/` fuera de Google (PR #39).** Search Console tenía `/go/...` indexadas (311
  impresiones) y la ruta registraba en `event_clicks` cada pasada de un crawler. Ahora
  responde con `X-Robots-Tag: noindex, nofollow`, a los bots los redirige sin registrar nada
  (`isBot` en `app/go/[slug]/route.ts`) y `BuyCta` lleva `rel="nofollow"`. **Los clics de
  `event_clicks` pueden bajar desde este PR: es la limpieza, no una caída de ventas.**
- **Ciudad y provincia en el panel (PR #39).** La regla de carga es provincia = "Buenos Aires"
  y ciudad = "CABA", "Mar del Plata"… En vivo había filas invertidas (Miss Monique: ciudad
  "Buenos Aires", provincia "Mar del plata"; Green Velvet y Emiliano Demarco: ciudad "Buenos
  Aires", provincia "CABA") y una en Uruguay con el país en la ciudad (Music On: "URUGUAY",
  "Maldonado"). `resolvePlace` en `lib/event-seo.ts` lo tolera: "Buenos Aires" en ciudad con
  una ciudad real en provincia se invierte, y un país en cualquiera de los dos campos pasa a
  ser el país ("MUSIC ON en Open Park, Maldonado, Uruguay 2027"). Las preguntas por artista
  dicen "en Uruguay" y solo listan fechas de ese país; la página de artista dice "en
  Argentina y Uruguay" si corresponde. **El JSON-LD sigue leyendo los campos crudos**: conviene
  corregir las filas en Supabase igual.
- **"Consultar por mesas VIP" (PR #39)** debajo de "Comprar en Bombo" en el detalle, mobile y
  desktop (`VipWhatsappCta`, `wa_source: event_vip`). Delineado y de 44px: segunda acción del
  bloque, nunca chartreuse. Abre el WhatsApp de contacto con `buildVipWhatsappMessage` y la
  fecha escrita ("…para MASSANO B2B KEVIN DE VRIES en Mute, Mar del Plata (sábado 23 de
  enero)"). No va en agotadas: "Avisame por WhatsApp" ya pregunta por mesas. Costos de
  layout: la barra fija de mobile pasa de ~110 a 163px (espaciador 185, o 132 en agotada) y
  los umbrales del sticky de desktop suben a 928.98 / 1015.98 (columna de 805 / 892px). En
  ventanas de 900px de alto la columna ahora scrollea con la página.
- **Agotada nunca queda sin acción:** WhatsApp de lista de espera, delineado. El "agotado" lo
  dice el sello del flyer, no el botón.
- **Los flyers no pasan por el optimizador de Vercel** (cupo agotado → 402). Van por wsrv.
  Ningún visitante descarga nada directo de Supabase; solo el `og:image` y el panel.
- **El flyer nunca se recorta ni se deforma.** Si no entra a su medida por el tope, se
  completa con el mismo flyer difuminado.
- **"Últimas entradas" sin animación:** urgencia que se lee, no que molesta.

### Descartado a propósito de la referencia visual

Banderas de país (el sitio es solo Argentina), fila de estadísticas (requeriría inventar
números), playlist de Spotify y mapa de mesas VIP (no existen esos activos), partículas de
fondo (se vuelven cursi y no aportan información).

---

## 5. Cómo verificar un cambio visual

La verificación se hace sobre el build de producción con Chromium
(`playwright-core` con `executablePath: "/opt/pw-browsers/chromium"`):

```bash
npm ci                     # en un contenedor nuevo no hay node_modules
npm run build && npm run start
```

**Trampas que costaron tiempo (nov 2026):**

- **Cerrar el servidor:** `pkill -x next-server` **no** lo mata (el proceso se llama
  `next-server (v16…`) y queda sirviendo el build viejo; `pkill -f next-server` mata también
  la shell. Usar `pkill -f "^next-server"`.
- **ISR:** un servidor levantado regenera páginas en segundo plano y "ensucia" las
  comparaciones. Para comparar antes/después, leer el HTML del build
  (`.next/server/app/eventos/<slug>.html`) sin levantar servidor.
- **Flyers reales en local:** setear `NEXT_PUBLIC_SUPABASE_URL` en el build (sin la anon
  key los datos siguen siendo los demo) y poner URLs reales de flyers en `lib/demo-events.ts`
  de forma temporal. Para `flyer_ratio` el build necesita red (wsrv).
- **Red desde el navegador de prueba:** Chromium no confía en el CA del proxy. Interceptar
  con `page.route("**/*", r => r.fulfill({ response: await r.fetch() }))` y correr node con
  `NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt NODE_USE_ENV_PROXY=1`. Nunca desactivar TLS.
- **Contar pedidos por dominio:** las URLs de wsrv llevan la de Supabase como parámetro.

Medir siempre a **390×844** (mobile, idealmente 3x) y **1440×900** (desktop). Lo que conviene chequear:

- Que ningún título se corte (`scrollWidth > clientWidth`).
- Que las filas de una misma lista midan igual.
- Que no haya scroll horizontal.
- Que ningún target interactivo baje de 24px.
- Que el CTA de compra quede arriba del pliegue (home mobile ~590px, desktop <800px).
- Que en `/eventos` mobile la columna de contenido de cada `DateCard` mida igual (286px).

Los eventos de `lib/demo-events.ts` tienen fechas fijas de 2026 y **ya son pasadas**, así que
la home renderiza vacía con el fallback. Para verificar visualmente hay que adelantar esas
fechas de forma temporal y revertir el archivo después.

---

## 6. Pendientes y estado (noviembre 2026)

**Del dueño (no son código):**

- `NEXT_PUBLIC_WHATSAPP_GROUP_URL` en Vercel tiene el link viejo del grupo (`?mode=gi_t`);
  es el mismo grupo. Si se quiere el link nuevo, cambiar la variable y redeployar.
- **"Rio" o "Río"** en `lib/credentials.ts`: el dueño escribió "Río". Confirmar antes de
  cambiarlo (es una afirmación pública).
- Search Console: pedir reindexación de las URLs que cambian (en su momento, la de Mute).
- Mirar Supabase → Usage → Egress: con wsrv tendría que haber bajado.
- Los flyers subidos antes del #35 no se recomprimieron (se sirven livianos por wsrv igual).
- Nombre para el bloque de RRPP (`NEXT_PUBLIC_CONTACT_NAME`) y textos de venue, si se
  implementan las páginas de venue.

**De `HANDOFF_REDISENO.md` (propuesta "Camino corto"):**

- **Hecho, aunque distinto a la propuesta:** destacadas fuera del finde en la home; flyer
  entero (con `FlyerFrame`, no con el fondo difuminado fijo); "Últimas entradas" visible;
  agotada con WhatsApp; grupo de WhatsApp en el detalle; compresión en el panel.
- **No hecho:** tipografía Bebas Neue + DM Mono + DM Sans; CTA de tarjeta directo a Bombo
  (las cards siguen con "Entradas" → detalle); corazón "Guardar" funcional; calendario
  mensual en `/eventos`; páginas `/venues/[slug]`; "Cómo comprar" plegable; ley de color sin
  excepciones; placements nuevos de esa propuesta.
