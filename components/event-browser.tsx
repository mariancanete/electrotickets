"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TabHeader } from "@/components/app-header";
import { NavSpacer } from "@/components/bottom-nav";
import { Chip } from "@/components/chips";
import { DateCard } from "@/components/date-card";
import { GridCard } from "@/components/grid-card";
import { Icon } from "@/components/icons";
import { track } from "@/lib/analytics";
import {
  applyFilters,
  EMPTY_FILTERS,
  filtersToParams,
  getDias,
  getGenres,
  getZones,
  hasAnyFilter,
  HORARIOS,
  WEEKEND,
  type Filters
} from "@/lib/filters";
import type { EventRecord } from "@/types/event";

/**
 * Pantalla Buscar.
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
 * La card de resultado es **la misma card del sistema** en los dos anchos: horizontal en
 * mobile, de grilla en desktop. No hay card especial de búsqueda.
 */
export function EventBrowser({
  events,
  alertsHref,
  weekendEvents
}: {
  events: EventRecord[];
  alertsHref: string;
  /** Fechas del finde, para ofrecer salida cuando la búsqueda no devuelve nada. */
  weekendEvents: EventRecord[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>(() => ({
    q: searchParams.get("q") || "",
    genero: searchParams.get("genero") || "",
    zona: searchParams.get("zona") || "",
    cuando: searchParams.get("cuando") || "",
    dia: searchParams.get("dia") || "",
    horario: searchParams.get("horario") || ""
  }));

  // En desktop "Más filtros" despliega los mismos grupos del sidebar del listado, en línea:
  // no es un set propio ni un drawer, es el mismo set.
  const [masFiltros, setMasFiltros] = useState(false);

  const genres = useMemo(() => getGenres(events), [events]);
  const zones = useMemo(() => getZones(events), [events]);
  const dias = useMemo(() => getDias(events), [events]);
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
    <div className="app-shell flex min-h-screen flex-col pt-2 lg:pt-0">
      <div className="lg:hidden">
        <TabHeader title="Buscar" />
      </div>

      {/**
       * Barra superior. En desktop queda pegada al header con el mismo fondo ink y su borde,
       * para poder cambiar la query sin volver arriba después de scrollear resultados.
       */}
      <div className="contents lg:sticky lg:top-[76px] lg:z-30 lg:flex lg:flex-col lg:gap-[18px] lg:border-b lg:border-white/10 lg:bg-ink gutter-lg lg:pb-7 lg:pt-7">
        <div className="gutter flex flex-none items-center gap-[14px] pb-3 lg:px-0 lg:pb-0">
          <div className="flex h-12 flex-1 items-center gap-[11px] rounded-full border border-white/[0.18] bg-black/30 px-[18px] lg:h-14 lg:gap-[14px] lg:px-[22px]">
            <Icon name="search" size={18} className="text-white/[0.48] lg:hidden" />
            <Icon name="search" size={20} className="hidden text-white/50 lg:block" />
            <input
              value={filters.q}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
              placeholder="DJ, venue, género…"
              aria-label="Buscar fechas"
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-white/40 lg:text-[16px]"
            />
            {filters.q ? (
              <button
                type="button"
                onClick={() => setFilters((current) => ({ ...current, q: "" }))}
                aria-label="Limpiar la búsqueda"
                className="grid h-[22px] w-[22px] flex-none place-items-center text-white/50 lg:h-[26px] lg:w-[26px]"
              >
                <Icon name="x" size={13} />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setMasFiltros((v) => !v)}
            aria-expanded={masFiltros}
            className="btn-out t150 hidden h-14 flex-none items-center gap-[9px] rounded-full border border-white/[0.18] px-5 text-white lg:flex"
          >
            <Icon name="sliders" size={17} />
            <span className="text-[13.5px] font-semibold leading-none">Más filtros</span>
          </button>
        </div>

        {/* Género. El chip activo usa blanco, nunca chartreuse: filtrar no es comprar. */}
        {genres.length ? (
          <div className="chips-scroll gutter flex flex-none gap-2 pb-3 lg:flex-wrap lg:gap-[9px] lg:px-0 lg:pb-0">
            {genres.map((genre) => (
              <button key={genre} type="button" onClick={() => toggle("genero", genre)} className="flex-none">
                <Chip active={filters.genero === genre} className="lg:!text-[12.5px]">
                  {genre}
                </Chip>
              </button>
            ))}

            {/* Divisor entre géneros y zona/fecha. Solo desktop: en mobile son dos filas. */}
            <span className="mx-[6px] hidden w-px self-stretch bg-white/[0.12] lg:block" />

            <button
              type="button"
              onClick={() => toggle("cuando", WEEKEND)}
              className="hidden flex-none lg:block"
            >
              <Chip active={filters.cuando === WEEKEND} className="lg:!text-[12.5px]">
                Este finde
              </Chip>
            </button>
            {zones.map((zone) => (
              <button key={zone} type="button" onClick={() => toggle("zona", zone)} className="hidden flex-none lg:block">
                <Chip active={filters.zona === zone} className="lg:!text-[12.5px]">
                  {zone}
                </Chip>
              </button>
            ))}
          </div>
        ) : null}

        {/* Fila de zona y fecha de mobile. En desktop va todo en una sola fila con divisor. */}
        <div className="chips-scroll gutter flex flex-none gap-2 border-b border-white/[0.08] pb-[14px] lg:hidden">
          <button type="button" onClick={() => toggle("cuando", WEEKEND)} className="flex-none">
            <Chip active={filters.cuando === WEEKEND}>Este finde</Chip>
          </button>
          {zones.map((zone) => (
            <button key={zone} type="button" onClick={() => toggle("zona", zone)} className="flex-none">
              <Chip active={filters.zona === zone}>{zone}</Chip>
            </button>
          ))}
        </div>

        {masFiltros ? (
          <div className="hidden gap-8 rounded-block border border-white/10 bg-surface p-5 lg:flex">
            <Grupo titulo="Día">
              {dias.map((dia) => (
                <button key={dia.iso} type="button" onClick={() => toggle("dia", dia.iso)}>
                  <Chip active={filters.dia === dia.iso} className="!text-[12.5px]">
                    {dia.label}
                  </Chip>
                </button>
              ))}
            </Grupo>
            <Grupo titulo="Horario">
              {HORARIOS.map((h) => (
                <button key={h.value} type="button" onClick={() => toggle("horario", h.value)}>
                  <Chip active={filters.horario === h.value} className="!text-[12.5px]">
                    {h.label}
                  </Chip>
                </button>
              ))}
            </Grupo>
          </div>
        ) : null}
      </div>

      {results.length ? (
        <div className="gutter flex flex-col gap-3 pt-[14px] lg:gap-5 lg:pb-[46px] lg:pt-[26px]">
          <div className="flex items-center gap-[10px] lg:gap-[14px]">
            <span className="dato-seccion lg:!text-[11.5px]">
              {results.length} {results.length === 1 ? "resultado" : "resultados"}
              {filters.q.trim() ? (
                <span className="hidden lg:inline"> para «{filters.q.trim()}»</span>
              ) : null}
            </span>
            <span className="h-px flex-1 bg-white/10" />
            {active ? (
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="t150 text-[11.5px] font-semibold leading-none text-white/50 hover:text-white lg:text-[12px]"
              >
                Limpiar<span className="hidden lg:inline"> búsqueda</span>
              </button>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 lg:hidden">
            {results.map((event, index) => (
              <DateCard key={event.id} event={event} placement="listado_card" priority={index === 0} />
            ))}
          </div>

          <div className="grilla-cards hidden">
            {results.map((event, index) => (
              <GridCard key={event.id} event={event} placement="listado_card" priority={index === 0} />
            ))}
          </div>
        </div>
      ) : (
        <SinResultados
          query={filters.q.trim()}
          alertsHref={alertsHref}
          weekendEvents={weekendEvents}
          onClear={() => setFilters(EMPTY_FILTERS)}
        />
      )}

      <NavSpacer />
    </div>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="dato-seccion !text-[10.5px]">{titulo}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/**
 * Sin resultados.
 *
 * Reusa el patrón del estado vacío de la agenda: el vacío ofrece salida en vez de ser un
 * callejón. La barra de búsqueda queda intacta arriba con los chips que produjeron el vacío
 * a la vista —el usuario tiene que poder ver qué filtró— y debajo aparecen las fechas del
 * finde con su grilla normal.
 *
 * **Cero chartreuse en el bloque de vacío**: el único chartreuse de la pantalla son los CTA
 * de las cards del finde. Si tampoco hay fechas del finde, queda el punteado más el bloque
 * de WhatsApp; nunca una pantalla con solo el mensaje.
 */
function SinResultados({
  query,
  alertsHref,
  weekendEvents,
  onClear
}: {
  query: string;
  alertsHref: string;
  weekendEvents: EventRecord[];
  onClear: () => void;
}) {
  return (
    <div className="gutter flex flex-col gap-[14px] pt-4 lg:gap-9 lg:pb-[46px] lg:pt-[34px]">
      <div className="rounded-block border border-dashed border-white/20 p-6 text-center lg:mx-auto lg:flex lg:w-full lg:max-w-[640px] lg:flex-col lg:items-center lg:gap-4 lg:p-[38px]">
        <span className="mx-auto mb-4 hidden h-16 w-16 place-items-center rounded-[18px] bg-surface text-white/35 lg:mb-0 lg:grid">
          <Icon name="search" size={32} />
        </span>
        <h2 className="text-[20px] font-bold leading-[1.2] tracking-[-0.025em] lg:text-[28px] lg:leading-[1.15]">
          {query ? <>No encontramos fechas para «{query}»</> : "No encontramos fechas con eso"}
        </h2>
        <p className="mt-2 text-[13.5px] leading-[1.55] text-white/55 lg:mt-0 lg:max-w-[420px] lg:text-[14.5px]">
          Probá sacando algún filtro o mirá la agenda completa.
        </p>
        <Link
          href="/eventos"
          onClick={onClear}
          className="btn-out t150 mt-4 flex h-12 items-center justify-center rounded-full border border-white/40 text-[14px] font-bold text-white lg:mt-1 lg:w-[260px]"
        >
          Ver todos los eventos
        </Link>
      </div>

      {weekendEvents.length ? (
        <div className="hidden flex-col gap-5 lg:flex">
          <div className="flex items-center gap-[14px]">
            <h3 className="dato-seccion !text-[11.5px]">Este finde</h3>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <div className="grilla-cards">
            {weekendEvents.map((event) => (
              <GridCard key={event.id} event={event} placement="vacio_proxima" />
            ))}
          </div>
        </div>
      ) : null}

      <div className="trama flex flex-col gap-3 rounded-block p-4 lg:mx-auto lg:w-full lg:max-w-[640px] lg:p-6">
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
          className="btn-out t150 flex h-12 items-center justify-center gap-2 rounded-full border border-white/40 text-white"
        >
          <Icon name="chat" size={16} />
          <span className="text-[14px] font-bold leading-none">Escribinos por WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
