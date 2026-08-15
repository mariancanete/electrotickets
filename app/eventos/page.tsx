import type { Metadata } from "next";
import Link from "next/link";
import { ScreenHeader } from "@/components/app-header";
import { BottomNav, NavSpacer } from "@/components/bottom-nav";
import { Chip } from "@/components/chips";
import { DateCard } from "@/components/date-card";
import { Icon } from "@/components/icons";
import { formatDayHeading } from "@/lib/dates";
import { getUpcomingPublishedEvents } from "@/lib/events";
import { applyFilters, countActiveFilters, filtersToParams, parseFilters, WEEKEND } from "@/lib/filters";
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
 * Las fechas se agrupan por día con un encabezado en mono y su contador. La barra de filtros
 * muestra cuántos hay aplicados y cuáles: editarlos se hace en Buscar (08), que es la
 * pantalla que tiene el campo y las dos filas de chips. Los filtros llegan por la URL, así
 * que un listado filtrado se puede compartir tal cual.
 */
export default async function EventsPage({ searchParams }: PageProps) {
  const events = await getUpcomingPublishedEvents();
  const filters = parseFilters(await searchParams);
  const visible = applyFilters(events, filters);
  const activeCount = countActiveFilters(filters);

  const groups = Array.from(groupByDay(visible).entries());
  const searchHref = `/buscar${filtersToParams(filters).toString() ? `?${filtersToParams(filters)}` : ""}`;

  return (
    <>
      <main className="flex min-h-screen flex-col pt-2">
        <ScreenHeader title="Todas las fechas" backHref="/" />

        <div className="chips-scroll flex flex-none gap-2 border-b border-white/[0.08] px-[18px] pb-[14px]">
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

        {groups.length ? (
          <div className="flex flex-col gap-3 px-[18px] pt-[14px]">
            {groups.map(([key, dayEvents]) => (
              <section key={key} className="flex flex-col gap-3">
                <div className="flex items-center gap-[10px]">
                  <h2 className="dato-seccion">{formatDayHeading(dayEvents[0].starts_at)}</h2>
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="font-mono text-[11px] font-bold leading-none text-white/45">{dayEvents.length}</span>
                </div>

                {/* Una fecha agotada se muestra atenuada con el botón deshabilitado; nunca se
                    oculta: si desapareciera, el usuario la seguiría buscando. */}
                {dayEvents.map((event, index) => (
                  <DateCard
                    key={event.id}
                    event={event}
                    placement="listado_card"
                    priority={index === 0}
                  />
                ))}
              </section>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-[14px] px-[18px] pt-4">
            <div className="rounded-block border border-dashed border-white/20 p-6 text-center">
              <h2 className="text-[20px] font-bold leading-[1.2] tracking-[-0.025em]">
                No hay fechas con esos filtros
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
          </div>
        )}

        <NavSpacer />
      </main>
      <BottomNav />
    </>
  );
}
