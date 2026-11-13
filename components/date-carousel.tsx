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

/** Cada cuánto avanza solo, y cuánto espera después de que alguien lo tocó. */
const AVANCE_MS = 4000;
const PAUSA_MS = 7000;

/**
 * Carrusel de próximas fechas.
 *
 * Avanza solo, una card por vez, y al llegar al final vuelve al principio. Con el dedo se
 * arrastra normalmente (es scroll nativo con `scroll-snap`, no un slider propio) y **nunca
 * muestra barra de scroll**. Se frena mientras lo tocan, cuando no está en pantalla, con la
 * pestaña en segundo plano y con `prefers-reduced-motion`.
 */
export function DateCarousel({ events }: { events: EventRecord[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const pausedUntil = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || events.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visible = false;
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.4 });
    observer.observe(el);

    const pause = () => (pausedUntil.current = Date.now() + PAUSA_MS);
    const opts = { passive: true } as const;
    el.addEventListener("touchstart", pause, opts);
    el.addEventListener("pointerdown", pause, opts);
    el.addEventListener("wheel", pause, opts);
    el.addEventListener("focusin", pause);
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mousemove", pause, opts);

    const timer = window.setInterval(() => {
      if (!visible || document.hidden || Date.now() < pausedUntil.current) return;

      const card = el.firstElementChild as HTMLElement | null;
      if (!card) return;
      const step = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "12");
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;

      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + step, behavior: "smooth" });
    }, AVANCE_MS);

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("wheel", pause);
      el.removeEventListener("focusin", pause);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mousemove", pause);
    };
  }, [events.length]);

  return (
    <div ref={ref} className="carrusel sin-barra" role="list" aria-label="Próximas fechas">
      {events.map((event, index) => (
        <CarouselCard key={event.id} event={event} priority={index < 2} />
      ))}
    </div>
  );
}

function CarouselCard({ event, priority }: { event: EventRecord; priority: boolean }) {
  const rail = getDateRail(event.starts_at);
  const soldOut = Boolean(event.sold_out);
  const place = [event.venue_name, getEventCity(event)].filter(Boolean).join(" · ");

  return (
    <article role="listitem" className="vidrio flex w-[264px] flex-col gap-3 rounded-block p-[10px] lg:w-[300px] lg:p-3">
      <Link
        href={`/eventos/${event.slug}`}
        aria-label={`Ver ${event.title}`}
        onClick={() => track("select_date", { ...eventParams(event), cta_placement: "home_destacadas" })}
        className="block"
      >
        <FlyerFrame
          src={event.flyer_url}
          alt={`Flyer de ${event.title}`}
          sizes="(min-width:1024px) 300px, 264px"
          // Todas las cards miden lo mismo: recuadro 4:5 fijo. El flyer se ve entero y, si es
          // de otra proporción, se completa con el mismo flyer difuminado (nunca se recorta).
          ratio={null}
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
