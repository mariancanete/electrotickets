"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TabHeader } from "@/components/app-header";
import { NavSpacer } from "@/components/bottom-nav";
import { Chip } from "@/components/chips";
import { DateCard } from "@/components/date-card";
import { Icon } from "@/components/icons";
import { track } from "@/lib/analytics";
import {
  applyFilters,
  filtersToParams,
  getGenres,
  getZones,
  hasAnyFilter,
  WEEKEND,
  type Filters
} from "@/lib/filters";
import type { EventRecord } from "@/types/event";

/**
 * Pantalla 08 — Buscar.
 *
 * **Query y filtros viven en la URL.** Es lo que permite pegar un resultado en WhatsApp
 * ("mirá lo que hay en Mandarine este finde") y que el que lo recibe vea exactamente lo
 * mismo. También es lo que hace que el botón atrás devuelva a la pantalla anterior en vez de
 * a un estado intermedio.
 *
 * Se escribe con `router.replace` y no con `push` a propósito: el campo de texto sincroniza
 * con debounce, así que cada pausa al tipear crearía una entrada de historial. Con `push`,
 * escribir "techno" dejaría seis entradas y el botón atrás pasaría a ser una trampa de la que
 * hay que salir a fuerza de toques. Con `replace`, atrás sale de Buscar de una.
 *
 * La card de resultado es **la misma card de fecha del sistema**, con su CTA compacto
 * "Entradas". No hay card especial de búsqueda: una card de resultado distinta obligaría a
 * releer la misma información con dos formas distintas.
 */
export function EventBrowser({ events, alertsHref }: { events: EventRecord[]; alertsHref: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>(() => ({
    q: searchParams.get("q") || "",
    genero: searchParams.get("genero") || "",
    zona: searchParams.get("zona") || "",
    cuando: searchParams.get("cuando") || ""
  }));

  const genres = useMemo(() => getGenres(events), [events]);
  const zones = useMemo(() => getZones(events), [events]);
  const results = useMemo(() => applyFilters(events, filters), [events, filters]);

  const syncUrl = useCallback(
    (next: Filters) => {
      const search = filtersToParams(next).toString();
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      syncUrl(filters);
      if (filters.q.trim()) {
        track("search_event", { search_term: filters.q.trim(), results: results.length });
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [filters, syncUrl, results.length]);

  /** Un chip ya activo se apaga al volver a tocarlo: es la única forma de sacarlo sin "Limpiar". */
  function toggle(key: keyof Filters, value: string) {
    setFilters((current) => {
      const next = { ...current, [key]: current[key] === value ? "" : value };
      track("select_filter", { filter: key, value: next[key] || "(ninguno)" });
      return next;
    });
  }

  const active = hasAnyFilter(filters);

  return (
    <div className="flex min-h-screen flex-col pt-2">
      <TabHeader title="Buscar" />

      <div className="flex-none px-[18px] pb-3">
        <div className="flex h-12 items-center gap-[11px] rounded-full border border-white/[0.18] bg-black/30 px-[18px]">
          <Icon name="search" size={18} className="text-white/[0.48]" />
          <input
            value={filters.q}
            onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
            placeholder="DJ, venue, género…"
            aria-label="Buscar fechas"
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-white/40"
          />
          {filters.q ? (
            <button
              type="button"
              onClick={() => setFilters((current) => ({ ...current, q: "" }))}
              aria-label="Limpiar la búsqueda"
              className="grid h-[22px] w-[22px] flex-none place-items-center text-white/50"
            >
              <Icon name="x" size={13} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Género. El chip activo usa blanco, nunca chartreuse: filtrar no es comprar. */}
      {genres.length ? (
        <div className="chips-scroll flex flex-none gap-2 px-[18px] pb-3">
          {genres.map((genre) => (
            <button key={genre} type="button" onClick={() => toggle("genero", genre)} className="flex-none">
              <Chip active={filters.genero === genre}>{genre}</Chip>
            </button>
          ))}
        </div>
      ) : null}

      {/* Zona y fecha. La zona sale de `venue_name`, que es el corte que la gente usa. */}
      <div className="chips-scroll flex flex-none gap-2 border-b border-white/[0.08] px-[18px] pb-[14px]">
        <button type="button" onClick={() => toggle("cuando", WEEKEND)} className="flex-none">
          <Chip active={filters.cuando === WEEKEND}>Este finde</Chip>
        </button>
        {zones.map((zone) => (
          <button key={zone} type="button" onClick={() => toggle("zona", zone)} className="flex-none">
            <Chip active={filters.zona === zone}>{zone}</Chip>
          </button>
        ))}
      </div>

      {results.length ? (
        <div className="flex flex-col gap-3 px-[18px] pt-[14px]">
          <div className="flex items-center gap-[10px]">
            <span className="dato-seccion">
              {results.length} {results.length === 1 ? "resultado" : "resultados"}
            </span>
            <span className="h-px flex-1 bg-white/10" />
            {active ? (
              <button
                type="button"
                onClick={() => setFilters({ q: "", genero: "", zona: "", cuando: "" })}
                className="text-[11.5px] font-semibold leading-none text-white/50"
              >
                Limpiar
              </button>
            ) : null}
          </div>

          {results.map((event, index) => (
            <DateCard key={event.id} event={event} placement="listado_card" priority={index === 0} />
          ))}
        </div>
      ) : (
        // Mismo patrón que la pantalla 05: el vacío ofrece salida en vez de ser un callejón.
        <div className="flex flex-col gap-[14px] px-[18px] pt-4">
          <div className="rounded-block border border-dashed border-white/20 p-6 text-center">
            <h2 className="text-[20px] font-bold leading-[1.2] tracking-[-0.025em]">
              No encontramos fechas con eso
            </h2>
            <p className="mt-2 text-[13.5px] leading-[1.55] text-white/55">
              Probá con otro género o mirá la agenda completa.
            </p>
            <Link
              href="/eventos"
              className="mt-4 flex h-12 items-center justify-center rounded-full border border-white/40 text-[14px] font-bold text-white"
            >
              Ver todos los eventos
            </Link>
          </div>

          <div className="trama flex flex-col gap-3 rounded-block p-4">
            <div className="flex items-start gap-[11px]">
              <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[11px] bg-ink/35 text-white">
                <Icon name="chat" size={20} />
              </span>
              <span>
                <span className="block text-[17px] font-bold leading-[1.15] tracking-[-0.02em]">
                  ¿Buscabas una fecha puntual?
                </span>
                <span className="mt-[6px] block text-[12.5px] leading-[1.5] text-white/80">
                  Escribinos y te decimos si la tenemos o cuándo se publica.
                </span>
              </span>
            </div>
            <a
              href={alertsHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("click_whatsapp", { wa_source: "empty_results" })}
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/40 text-white"
            >
              <Icon name="chat" size={16} />
              <span className="text-[14px] font-bold leading-none">Escribinos por WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      <NavSpacer />
    </div>
  );
}
