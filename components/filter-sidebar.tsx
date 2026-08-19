"use client";

import { usePathname, useRouter } from "next/navigation";
import { Chip } from "@/components/chips";
import { track } from "@/lib/analytics";
import { filtersToParams, HORARIOS, type Filters } from "@/lib/filters";

export type FilterOptions = {
  dias: { iso: string; label: string }[];
  generos: string[];
  zonas: string[];
};

/**
 * Sidebar de filtros del listado — solo desktop.
 *
 * Los mismos chips de mobile, desplegados por grupo en lugar de scrolleando en horizontal:
 * a partir de 1024px hay ancho para mostrar todas las opciones a la vez, y esconder opciones
 * detrás de un scroll lateral cuando entran todas es hacerle perder tiempo al usuario.
 *
 * **No se convierte en drawer en ningún ancho ≥1024.** Si el alto no alcanza, scrollea por
 * dentro (`.sticky-filtros`) y, en última instancia, con la página.
 *
 * Escribe los filtros en la URL igual que la pantalla Buscar, con `replace` por el mismo
 * motivo: cada chip no debería dejar una entrada de historial que después haya que deshacer
 * a fuerza de toques.
 */
export function FilterSidebar({
  options,
  filters,
  className = ""
}: {
  options: FilterOptions;
  filters: Filters;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function toggle(key: keyof Filters, value: string) {
    const next: Filters = { ...filters, [key]: filters[key] === value ? "" : value };
    track("select_filter", { filter: key, value: next[key] || "(ninguno)" });

    const search = filtersToParams(next).toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  }

  type Grupo = { titulo: string; campo: keyof Filters; opciones: { value: string; label: string }[] };

  const grupos: Grupo[] = ([
    { titulo: "Día", campo: "dia", opciones: options.dias.map((d) => ({ value: d.iso, label: d.label })) },
    { titulo: "Género", campo: "genero", opciones: options.generos.map((g) => ({ value: g, label: g })) },
    { titulo: "Zona", campo: "zona", opciones: options.zonas.map((z) => ({ value: z, label: z })) },
    { titulo: "Horario", campo: "horario", opciones: HORARIOS.map((h) => ({ value: h.value, label: h.label })) }
  ] satisfies Grupo[]).filter((grupo) => grupo.opciones.length > 0);

  return (
    <aside
      aria-label="Filtros"
      className={`sticky-col sticky-filtros flex flex-col gap-6 rounded-block border border-white/10 bg-surface p-[22px] ${className}`}
    >
      {grupos.map((grupo, index) => (
        <div key={grupo.campo} className="flex flex-col gap-3">
          {index > 0 ? <span className="-mt-3 h-px bg-white/10" /> : null}
          <h3 className="dato-seccion !text-[10.5px]">{grupo.titulo}</h3>
          <div className="flex flex-wrap gap-2">
            {grupo.opciones.map((opcion) => (
              <button
                key={opcion.value}
                type="button"
                onClick={() => toggle(grupo.campo, opcion.value)}
                aria-pressed={filters[grupo.campo] === opcion.value}
              >
                <Chip active={filters[grupo.campo] === opcion.value} className="!text-[12.5px]">
                  {opcion.label}
                </Chip>
              </button>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
