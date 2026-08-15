import type { Icon } from "@phosphor-icons/react";

/**
 * Encabezado de sección con marca.
 *
 * La página de evento tenía ocho bloques con exactamente el mismo peso visual, así que en
 * un teléfono se leía como una sola columna de texto indiferenciada. El icono le da a cada
 * bloque un ancla reconocible que se identifica sin leer el título.
 *
 * Alinea al comienzo y no al centro: con un título de dos o tres líneas, centrar dejaba el
 * icono flotando contra el medio del bloque en vez de anclado a la primera línea.
 */
export function SectionHeading({
  icon: IconComponent,
  children,
  className = ""
}: {
  icon: Icon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    // `items-start`: con un título de dos o tres líneas, centrar dejaba el icono flotando
    // contra el medio del bloque en vez de anclado al comienzo.
    <h2 className={`flex items-start gap-2.5 text-2xl font-black ${className}`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-violet-300/20 bg-violet-500/10 text-violet-200">
        <IconComponent size={19} weight="duotone" aria-hidden="true" />
      </span>
      {children}
    </h2>
  );
}
