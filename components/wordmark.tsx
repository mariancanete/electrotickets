/**
 * Identidad de ElectroTickets.
 *
 * El nombre es el único activo de marca real del proyecto, y hasta acá estaba tipografiado
 * igual que cualquier otro texto del sitio (`font-black tracking-tight`, el mismo Archivo de
 * los h2 y los títulos de evento). No había nada que registrar de un vistazo.
 *
 * El lockup lo resuelve con las dos familias que el sitio ya carga: Archivo expandido para
 * ELECTRO —la letra ancha y densa de la gráfica de fiesta— y DM Mono trackeado para TICKETS
 * —la letra de dato, la misma con la que se imprimen las fechas—. Las dos mitades del nombre
 * dicen las dos mitades del negocio, y no hay ni un byte de fuente nuevo.
 */

/** Monograma para superficies cuadradas chicas: favicon, avatar, el cuadro del header. */
export function WordmarkMonogram({ className = "" }: { className?: string }) {
  return (
    <span
      className={`grid place-items-center rounded-[12px] border border-brand/35 bg-brand/10 ${className}`}
      aria-hidden="true"
    >
      <span className="tabular text-[15px] font-medium leading-none tracking-[0.06em] text-brand">
        ET
      </span>
    </span>
  );
}

/**
 * Lockup completo. `stacked` apila ELECTRO sobre TICKETS con la regla cyan en el medio —es
 * la versión compacta, para el header de mobile—; en línea se usa donde sobra ancho.
 */
export function Wordmark({
  className = "",
  size = "md"
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const scale = {
    sm: { electro: "text-[15px]", tickets: "text-[7px]", rule: "h-px" },
    md: { electro: "text-[19px]", tickets: "text-[8px]", rule: "h-[2px]" },
    lg: { electro: "text-[26px]", tickets: "text-[10px]", rule: "h-[2px]" }
  }[size];

  return (
    <span className={`inline-flex flex-col items-start ${className}`}>
      <span className={`wordmark-electro block leading-none text-white ${scale.electro}`}>
        ELECTRO
      </span>
      {/* La regla es el único uso decorativo del color de acción en todo el sistema, y es
          deliberado: ata el color del botón de comprar al nombre de la marca. */}
      <span className={`mt-[4px] block w-full bg-brand ${scale.rule}`} aria-hidden="true" />
      <span className={`wordmark-tickets mt-[4px] block leading-none text-white/78 ${scale.tickets}`}>
        Tickets
      </span>
    </span>
  );
}
