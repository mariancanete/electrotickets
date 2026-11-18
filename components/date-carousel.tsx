"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { UrgencyChip } from "@/components/chips";
import { BuyCta, SoldOutWhatsappCta } from "@/components/cta";
import { FlyerFrame } from "@/components/flyer-image";
import { SoldOutStamp } from "@/components/sold-out-stamp";
import { eventParams, track } from "@/lib/analytics";
import { getDateRail } from "@/lib/dates";
import { getEventCity } from "@/lib/event-seo";
import type { EventRecord } from "@/types/event";

/**
 * Alto del flyer en el carrusel. **Todas las cards miden lo mismo de alto y cada una toma el
 * ancho de su flyer**: así el flyer se ve completo, sin bandas, sin recortar y sin deformar,
 * sea 4:5, cuadrado o story. El ancho se acota para que una card no quede ni ilegible ni más
 * ancha que la pantalla; solo en esos extremos el recuadro se completa con el flyer difuminado.
 */
const ALTO_FLYER = 330;
const ANCHO_MIN = 204;
const ANCHO_MAX = 318;
/** Padding de la card (10px por lado): el ancho de la card es el del flyer más esto. */
const PADDING_CARD = 20;

/** Velocidad del loop, en px por segundo. */
const VELOCIDAD = 34;
/** Tope del envión al soltar, y cuánto tarda en volver a la velocidad del loop (ms). */
const ENVION_MAX = 2600;
const FRENADO_MS = 520;
/** Cuánto tiene que moverse el dedo en horizontal para que sea un arrastre y no un toque. */
const UMBRAL_ARRASTRE = 6;

/**
 * Carrusel de próximas fechas (mobile).
 *
 * **Loop continuo, sin principio ni final.** La lista se renderiza dos veces seguidas y la
 * tira se desplaza con `transform`; al pasar el ancho de una copia retrocede exactamente ese
 * ancho, y como las dos copias son idénticas el salto no se ve.
 *
 * **No usa el scroll del navegador, a propósito.** La primera versión movía `scrollLeft` y
 * dejaba que el dedo scrolleara nativo: en Android andaba, pero en iOS Safari escribir
 * `scrollLeft` mientras el sistema maneja el gesto (y su inercia) corta el gesto, y el
 * carrusel se trababa todo el tiempo. Acá hay **un solo dueño de la posición**: este
 * componente. El dedo arrastra la tira 1:1, al soltar sigue con el envión y se va frenando
 * hasta empalmar con la velocidad del loop, sin pausa. Como no hay contenedor scrolleable,
 * tampoco hay barra de scroll posible.
 *
 * `touch-action: pan-y` deja el scroll vertical de la página al navegador: arrastrar para
 * arriba o abajo sobre el carrusel scrollea la página como siempre.
 *
 * Con `prefers-reduced-motion` no se mueve solo (sigue siendo arrastrable). Fuera de pantalla
 * y con la pestaña en segundo plano se frena.
 */
export function DateCarousel({ events }: { events: EventRecord[] }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const loop = events.length > 1;

  useEffect(() => {
    const box = viewport.current;
    const strip = track.current;
    if (!box || !strip || !loop) return;

    const base = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : VELOCIDAD;

    let x = 0; // desplazamiento de la tira, en px
    let vel = base; // velocidad actual, px/s
    let visible = false;
    let frame = 0;
    let last = 0;

    // Estado del gesto.
    let pointerId: number | null = null;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastT = 0;
    let dragVel = 0;
    let moved = false;
    // Foco de **teclado** adentro del carrusel (no el de un toque): mientras dure, no se mueve.
    let keyboardFocus = false;

    /**
     * Ancho de una copia de la lista: de la primera card a su gemela. Se mide una vez y se
     * vuelve a medir solo si la tira cambia de tamaño. Antes se leía `offsetLeft` en cada
     * cuadro, justo después de escribir el `transform`: eso forzaba un recálculo de estilos
     * 60 veces por segundo mientras el carrusel estuviera en pantalla.
     */
    let width = 0;
    const measure = () => {
      const first = strip.children[0] as HTMLElement | undefined;
      const twin = strip.children[events.length] as HTMLElement | undefined;
      width = first && twin ? twin.offsetLeft - first.offsetLeft : 0;
    };
    measure();
    // El `transform` no cambia el tamaño de la tira, así que esto no se dispara por moverla.
    const resizeObserver = new ResizeObserver(() => {
      measure();
      paint();
    });
    resizeObserver.observe(strip);

    const paint = () => {
      if (width) x = ((x % width) + width) % width;
      strip.style.transform = `translate3d(${-x}px,0,0)`;
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = last ? Math.min(now - last, 64) : 0;
      last = now;

      // Con el dedo apoyado la tira no se mueve sola: si arrastra, la posición la lleva el
      // dedo; si es un toque, la card no se le escapa de abajo antes de soltar.
      if (pointerId !== null) return;
      if (!visible || document.hidden || keyboardFocus) return;

      // El envión del dedo se va frenando hasta empalmar con la velocidad del loop.
      vel += (base - vel) * (1 - Math.exp(-dt / FRENADO_MS));
      if (Math.abs(vel - base) < 0.5) vel = base;
      if (!vel) return;

      x += (vel * dt) / 1000;
      paint();
    };

    const down = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointerId = event.pointerId;
      dragging = false;
      moved = false;
      startX = lastX = event.clientX;
      startY = event.clientY;
      lastT = event.timeStamp;
      dragVel = 0;
    };

    const move = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;

      if (!dragging) {
        const dx = Math.abs(event.clientX - startX);
        const dy = Math.abs(event.clientY - startY);
        if (dx < UMBRAL_ARRASTRE || dx < dy) return;
        dragging = true;
        moved = true;
        lastX = event.clientX;
        lastT = event.timeStamp;
        try {
          box.setPointerCapture(event.pointerId);
        } catch {
          // Si el puntero ya no existe no hay nada que capturar.
        }
      }

      const dx = event.clientX - lastX;
      const dt = event.timeStamp - lastT;
      if (dt > 0) dragVel = dragVel * 0.6 + ((-dx / dt) * 1000) * 0.4;
      lastX = event.clientX;
      lastT = event.timeStamp;

      x -= dx;
      paint();
    };

    const up = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      if (!dragging) return;
      dragging = false;

      // Si el dedo se quedó quieto antes de soltar, no hay envión: retoma al paso del loop.
      const stale = event.timeStamp - lastT > 90;
      vel = stale ? base : Math.max(-ENVION_MAX, Math.min(ENVION_MAX, dragVel));
    };

    /** Después de arrastrar, el toque no tiene que abrir la fecha ni disparar la compra. */
    const click = (event: MouseEvent) => {
      if (!moved) return;
      moved = false;
      event.preventDefault();
      event.stopPropagation();
    };

    /**
     * Teclado: al enfocar un link fuera de la vista el navegador scrollea el contenedor
     * (aunque sea `overflow: hidden`). Se anula y se lleva la card enfocada a la vista.
     */
    const focus = (event: FocusEvent) => {
      box.scrollLeft = 0;
      // Solo con teclado. El foco que deja un toque no tiene que mover ni frenar nada: movería
      // la card justo antes del `click` y el toque no abriría la fecha.
      const target = event.target as HTMLElement;
      if (pointerId !== null || !target.matches(":focus-visible")) return;
      keyboardFocus = true;
      const card = (event.target as HTMLElement).closest("li") as HTMLElement | null;
      if (!card) return;
      x = card.offsetLeft - 18;
      vel = base;
      paint();
    };

    const blur = () => {
      keyboardFocus = false;
    };

    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.2 });
    observer.observe(box);

    box.addEventListener("pointerdown", down);
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerup", up);
    box.addEventListener("pointercancel", up);
    box.addEventListener("click", click, true);
    box.addEventListener("focusin", focus);
    box.addEventListener("focusout", blur);
    window.addEventListener("resize", measure);

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      box.removeEventListener("pointerdown", down);
      box.removeEventListener("pointermove", move);
      box.removeEventListener("pointerup", up);
      box.removeEventListener("pointercancel", up);
      box.removeEventListener("click", click, true);
      box.removeEventListener("focusin", focus);
      box.removeEventListener("focusout", blur);
      window.removeEventListener("resize", measure);
      resizeObserver.disconnect();
    };
  }, [events.length, loop]);

  // La segunda copia es la que hace posible el loop. Con una sola fecha no hay loop ni copia.
  const cards = loop ? [...events, ...events] : events;

  return (
    <div ref={viewport} className="carrusel">
      <ul
        ref={track}
        className={`carrusel-tira ${loop ? "" : "px-[18px]"}`}
        // `role="list"` explícito: Safari quita la semántica de lista a un `<ul>` con
        // `display: flex` y `list-style: none`.
        role="list"
        aria-label="Próximas fechas"
      >
        {cards.map((event, index) => (
          <CarouselCard
            key={`${event.id}-${index}`}
            event={event}
            priority={index < 2}
            clone={index >= events.length}
          />
        ))}
      </ul>
    </div>
  );
}

/**
 * `clone`: card de la segunda copia, la que existe solo para que el loop no tenga final.
 * Para un lector de pantalla y para el teclado no existe (`aria-hidden` y fuera del Tab), así
 * cada fecha se anuncia y se recorre una sola vez. Se sigue viendo y se puede tocar: no usa
 * `inert`, que también bloquearía el toque.
 */
function CarouselCard({ event, priority, clone }: { event: EventRecord; priority: boolean; clone: boolean }) {
  const skip = clone ? -1 : undefined;
  const rail = getDateRail(event.starts_at);
  const soldOut = Boolean(event.sold_out);
  const place = [event.venue_name, getEventCity(event)].filter(Boolean).join(" · ");

  const ratio = event.flyer_ratio && event.flyer_ratio > 0 ? event.flyer_ratio : 1.25;
  const flyerWidth = Math.round(Math.min(Math.max(ALTO_FLYER / ratio, ANCHO_MIN), ANCHO_MAX));

  return (
    <li
      aria-hidden={clone || undefined}
      className="vidrio flex flex-col gap-3 rounded-block p-[10px]"
      style={{ width: flyerWidth + PADDING_CARD }}
    >
      <Link
        href={`/eventos/${event.slug}`}
        aria-label={`Ver ${event.title}`}
        tabIndex={skip}
        onClick={() => track("select_date", { ...eventParams(event), cta_placement: "home_destacadas" })}
        // Alto fijo: si un flyer apaisado no llega a los 330px, queda centrado en su lugar.
        className="flex flex-col justify-center"
        style={{ minHeight: ALTO_FLYER }}
      >
        <FlyerFrame
          src={event.flyer_url}
          alt={`Flyer de ${event.title}`}
          sizes={`${flyerWidth}px`}
          ratio={event.flyer_ratio}
          // Tope = alto fijo sobre el ancho de esta card: el recuadro nunca pasa de 330px.
          maxRatio={ALTO_FLYER / flyerWidth}
          priority={priority}
          className="rounded-[20px]"
        >
          {soldOut ? <SoldOutStamp /> : null}
          {event.last_tickets && !soldOut ? (
            <span className="absolute left-[10px] top-[10px]">
              <UrgencyChip size="sm" />
            </span>
          ) : null}
        </FlyerFrame>
      </Link>

      <div className="mt-auto flex flex-col gap-[6px] px-[6px]">
        <span className="font-mono text-[12px] font-bold uppercase leading-none tracking-[0.08em] text-cta">
          {rail.month} {Number(rail.day)} · {rail.time}
        </span>
        <h3 className="line-clamp-2 min-h-[44px] text-[19px] font-extrabold uppercase leading-[1.15] tracking-[-0.01em]">
          {event.title}
        </h3>
        <span className="truncate text-[13px] font-medium leading-[1.2] text-white/70">{place || " "}</span>
      </div>

      {soldOut ? (
        <SoldOutWhatsappCta event={event} source="soldout" compact className="!h-[52px]" tabIndex={skip} />
      ) : (
        <BuyCta event={event} placement="home_destacado" className="!h-[52px]" tabIndex={skip} />
      )}
    </li>
  );
}
