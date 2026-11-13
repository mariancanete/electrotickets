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

/** Velocidad del loop, en px por segundo. */
const VELOCIDAD = 34;
/** Cuánto tiene que estar quieto después de soltarlo para retomar: lo justo para no pisar la inercia. */
const QUIETO_MS = 140;

/**
 * Carrusel de próximas fechas (mobile).
 *
 * **Loop continuo, sin principio ni final.** La lista se renderiza dos veces seguidas y el
 * scroll avanza solo a velocidad constante; al pasar el ancho de una copia retrocede
 * exactamente ese ancho, y como las dos copias son idénticas el salto no se ve. Hacia atrás
 * funciona igual, así que con el dedo también se puede arrastrar para cualquier lado sin
 * llegar nunca a un borde.
 *
 * Es scroll nativo: el dedo lo mueve como cualquier lista, y nunca muestra barra. Se frena
 * solo mientras el dedo está apoyado y **retoma apenas se suelta** (si se soltó con envión,
 * apenas termina la inercia). También se frena fuera de pantalla y en segundo plano. Con
 * `prefers-reduced-motion` no se mueve solo (sigue siendo arrastrable).
 */
export function DateCarousel({ events }: { events: EventRecord[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const loop = events.length > 1;

  useEffect(() => {
    const el = ref.current;
    if (!el || !loop) return;

    const auto = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = false;
    let touching = false;
    let pausedUntil = 0;
    let pos = el.scrollLeft;
    let last = 0;
    let frame = 0;

    /** Ancho de una copia de la lista: de la primera card a su gemela. */
    const span = () => {
      const first = el.children[0] as HTMLElement | undefined;
      const twin = el.children[events.length] as HTMLElement | undefined;
      return first && twin ? twin.offsetLeft - first.offsetLeft : 0;
    };

    /** Mantiene el scroll dentro de la primera copia. Devuelve la posición corregida. */
    const wrap = (value: number) => {
      const width = span();
      if (!width) return value;
      if (value >= width) return value - width;
      if (value <= 0) return value + width;
      return value;
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = last ? Math.min(now - last, 64) : 0;
      last = now;

      if (touching || now < pausedUntil) {
        // Mientras lo mueve el dedo (o su inercia) solo se cuida que no llegue a un borde.
        const fixed = wrap(el.scrollLeft);
        if (fixed !== el.scrollLeft) el.scrollLeft = fixed;
        // Si todavía se está moviendo por la inercia del dedo, se espera a que frene.
        else if (!touching && Math.abs(el.scrollLeft - pos) > 0.5) pausedUntil = now + QUIETO_MS;
        pos = el.scrollLeft;
        return;
      }

      if (!auto || !visible || document.hidden) return;

      pos = wrap(pos + (VELOCIDAD * dt) / 1000);
      el.scrollLeft = pos;
    };

    const hold = () => {
      touching = true;
    };
    const release = () => {
      touching = false;
      pausedUntil = performance.now() + QUIETO_MS;
    };
    const nudge = () => {
      pausedUntil = performance.now() + QUIETO_MS * 4;
    };

    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.2 });
    observer.observe(el);

    const opts = { passive: true } as const;
    el.addEventListener("touchstart", hold, opts);
    el.addEventListener("touchend", release, opts);
    el.addEventListener("touchcancel", release, opts);
    // Si el dedo se levanta fuera del carrusel, el `touchend` igual tiene que soltarlo.
    window.addEventListener("touchend", release, opts);
    window.addEventListener("touchcancel", release, opts);
    el.addEventListener("wheel", nudge, opts);
    el.addEventListener("focusin", nudge);

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      el.removeEventListener("touchstart", hold);
      el.removeEventListener("touchend", release);
      el.removeEventListener("touchcancel", release);
      window.removeEventListener("touchend", release);
      window.removeEventListener("touchcancel", release);
      el.removeEventListener("wheel", nudge);
      el.removeEventListener("focusin", nudge);
    };
  }, [events.length, loop]);

  // La segunda copia es la que hace posible el loop. Con una sola fecha no hay loop ni copia.
  const cards = loop ? [...events, ...events] : events;

  return (
    <div ref={ref} className={`carrusel ${loop ? "" : "px-[18px]"}`} role="list" aria-label="Próximas fechas">
      {cards.map((event, index) => (
        <CarouselCard key={`${event.id}-${index}`} event={event} priority={index < 2} />
      ))}
    </div>
  );
}

function CarouselCard({ event, priority }: { event: EventRecord; priority: boolean }) {
  const rail = getDateRail(event.starts_at);
  const soldOut = Boolean(event.sold_out);
  const place = [event.venue_name, getEventCity(event)].filter(Boolean).join(" · ");

  return (
    <article role="listitem" className="vidrio flex w-[264px] flex-col gap-3 rounded-block p-[10px]">
      <Link
        href={`/eventos/${event.slug}`}
        aria-label={`Ver ${event.title}`}
        onClick={() => track("select_date", { ...eventParams(event), cta_placement: "home_destacadas" })}
        className="block"
      >
        <FlyerFrame
          src={event.flyer_url}
          alt={`Flyer de ${event.title}`}
          sizes="560px"
          // Todas las cards miden lo mismo: recuadro 4:5 fijo que el flyer llena entero, sin
          // bandas y sin deformar. `sizes` pide de más a propósito: un flyer apaisado se
          // escala hasta cubrir el alto, y con el ancho justo se vería blando.
          cover
          ratio={event.flyer_ratio}
          maxRatio={1.25}
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

      <div className="flex flex-col gap-[6px] px-[6px]">
        <span className="font-mono text-[12px] font-bold uppercase leading-none tracking-[0.08em] text-cta">
          {rail.month} {Number(rail.day)} · {rail.time}
        </span>
        <h3 className="line-clamp-2 min-h-[44px] text-[19px] font-extrabold uppercase leading-[1.15] tracking-[-0.01em]">
          {event.title}
        </h3>
        <span className="truncate text-[13px] font-medium leading-[1.2] text-white/70">{place || " "}</span>
      </div>

      {soldOut ? (
        <SoldOutWhatsappCta event={event} source="soldout" compact className="mt-auto !h-[52px]" />
      ) : (
        <BuyCta event={event} placement="home_destacado" className="mt-auto !h-[52px]" />
      )}
    </article>
  );
}
