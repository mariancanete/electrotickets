import type { Metadata } from "next";
import Link from "next/link";
import { ScreenHeader } from "@/components/app-header";
import { BottomNav, NavSpacer } from "@/components/bottom-nav";
import { Chip } from "@/components/chips";
import { DateCard } from "@/components/date-card";
import { DesktopHeader } from "@/components/desktop-header";
import { FilterSidebar } from "@/components/filter-sidebar";
import { GridCard } from "@/components/grid-card";
import { Icon } from "@/components/icons";
import { formatDayHeading } from "@/lib/dates";
import { getUpcomingPublishedEvents } from "@/lib/events";
import {
  applyFilters,
  countActiveFilters,
  filtersToParams,
  getDias,
  getGenres,
  getZones,
  parseFilters,
  WEEKEND
} from "@/lib/filters";
import { groupByDay } from "@/lib/weekend";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Eventos de música electrónica",
  description: "Explorá fiestas techno, house, melodic techno y eventos electrónicos en Argentina."
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Pantalla 02 — listado de eventos.
 *
 * Las fechas se agrupan por noche con un encabezado en mono y su contador. En mobile los
 * filtros son una barra de chips que lleva a Buscar; en desktop se despliegan en un sidebar
 * sticky de 260px con los cuatro grupos a la vista. Los filtros llegan por la URL en los dos
 * anchos, así que un listado filtrado se comparte tal cual.
 */
export default async function EventsPage({ searchParams }: PageProps) {
  const events = await getUpcomingPublishedEvents();
  const filters = parseFilters(await searchParams);
  const visible = applyFilters(events, filters);
  const activeCount = countActiveFilters(filters);

  const groups = Array.from(groupByDay(visible).entries());
  const searchHref = `/buscar${filtersToParams(filters).toString() ? `?${filtersToParams(filters)}` : ""}`;

  // Las opciones del sidebar salen del catálogo completo, no del filtrado: si salieran del
  // resultado, aplicar un filtro haría desaparecer todos los demás y no habría forma de
  // cambiar de idea sin limpiar.
  const options = { dias: getDias(events), generos: getGenres(events), zonas: getZones(events) };

  return (
    <>
      <DesktopHeader />
      <main className="app-shell flex min-h-screen flex-col pt-2 lg:pt-0">
        {/* Mobile: cabecera con volver. Desktop: título grande con el contador y "Limpiar". */}
        <div className="lg:hidden">
          <ScreenHeader title="Todas las fechas" backHref="/" />
        </div>

        <div className="gutter hidden flex-none items-end justify-between gap-6 pb-0 pt-[34px] lg:flex">
          <div>
            <h1 className="text-[40px] font-bold leading-none tracking-[-0.035em]">Todas las fechas</h1>
            <p className="mt-3 text-[14px] leading-none text-white/55">
              {visible.length} {visible.length === 1 ? "fecha" : "fechas"} publicadas
            </p>
          </div>
          {activeCount ? (
            <p className="flex items-center gap-[10px] text-[12.5px] font-semibold leading-none text-white/55">
              <Icon name="sliders" size={16} />
              {activeCount} {activeCount === 1 ? "filtro aplicado" : "filtros aplicados"} ·{" "}
              <Link href="/eventos" className="t150 text-white hover:opacity-80">
                Limpiar
              </Link>
            </p>
          ) : null}
        </div>

        {/* Barra de filtros de mobile. En desktop la reemplaza el sidebar. */}
        <div className="chips-scroll gutter flex flex-none gap-2 border-b border-white/[0.08] pb-[14px] lg:hidden">
          <Link href={searchHref} className="flex-none">
            <Chip active>
              <Icon name="sliders" size={14} />
              {activeCount ? `Filtros · ${activeCount}` : "Filtros"}
            </Chip>
          </Link>
          {filters.cuando === WEEKEND ? <Chip className="flex-none">Este finde</Chip> : null}
          {filters.genero ? <Chip className="flex-none">{filters.genero}</Chip> : null}
          {filters.zona ? <Chip className="flex-none">{filters.zona}</Chip> : null}
        </div>

        <div className="col-listado gutter pt-[14px] lg:pb-[46px] lg:pt-7">
          <FilterSidebar options={options} filters={filters} className="hidden lg:flex" />

          {groups.length ? (
            <div className="flex flex-col gap-3 lg:gap-[26px]">
              {groups.map(([key, dayEvents]) => (
                <section key={key} className="flex flex-col gap-3 lg:gap-5">
                  {/* El encabezado de día ocupa la fila completa; la grilla arranca debajo. */}
                  <div className="flex items-center gap-[10px] lg:gap-[14px]">
                    <h2 className="dato-seccion lg:!text-[11.5px]">
                      {formatDayHeading(dayEvents[0].starts_at)}
                      <span className="hidden lg:inline">
                        {" "}
                        — {dayEvents.length} {dayEvents.length === 1 ? "fecha" : "fechas"}
                      </span>
                    </h2>
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="font-mono text-[11px] font-bold leading-none text-white/45 lg:hidden">
                      {dayEvents.length}
                    </span>
                  </div>

                  {/* Una fecha agotada se muestra atenuada con el botón deshabilitado; nunca se
                      oculta: si desapareciera, el usuario la seguiría buscando. */}
                  <div className="flex flex-col gap-3 lg:hidden">
                    {dayEvents.map((event, index) => (
                      <DateCard key={event.id} event={event} placement="listado_card" priority={index === 0} />
                    ))}
                  </div>

                  {/* Un día con una sola fecha ocupa una columna y deja el resto vacío: no se
                      rellena con eventos de otro día, que rompería la agrupación. */}
                  <div className="grilla-cards-con-sidebar hidden">
                    {dayEvents.map((event, index) => (
                      <GridCard key={event.id} event={event} placement="listado_card" priority={index === 0} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-[14px] pt-4 lg:pt-0">
              <div className="rounded-block border border-dashed border-white/20 p-6 text-center lg:mx-auto lg:max-w-[640px] lg:p-9">
                <h2 className="text-[20px] font-bold leading-[1.2] tracking-[-0.025em] lg:text-[26px]">
                  No hay fechas con esos filtros
                </h2>
                <p className="mt-2 text-[13.5px] leading-[1.55] text-white/55 lg:text-[15px]">
                  Probá con otro género o mirá la agenda completa.
                </p>
                <Link
                  href="/eventos"
                  className="btn-out t150 mt-4 flex h-12 items-center justify-center rounded-full border border-white/40 text-[14px] font-bold text-white lg:mx-auto lg:w-[260px]"
                >
                  Ver todos los eventos
                </Link>
              </div>
            </div>
          )}
        </div>

        <NavSpacer />
      </main>
      <BottomNav />
    </>
  );
}
