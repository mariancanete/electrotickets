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

/**
 * Marca gráfica: ticket troquelado con el rayo calado.
 *
 * La versión anterior era el monograma "ET" dentro de un recuadro, y no era un logo: era
 * texto en una caja. Un logo tiene que ser reconocible como *forma*, sin leerse.
 *
 * Esta lo es por dos razones. La primera es que las muescas laterales son exactamente la
 * misma perforación que `.ticket-cut` recorta en cada fila y cada tarjeta del sitio: la
 * marca y el objeto que se repite en todas las pantallas son la misma figura, así que cada
 * fecha de la agenda refuerza el logo. La segunda es que el rayo y el ticket son los dos
 * sustantivos del nombre —electro y tickets— resueltos en una sola silueta.
 *
 * Se dibuja como un único `path` con `fillRule="evenodd"`: el rayo es un agujero, no una
 * pieza encima. Eso la deja en un solo color plano —hereda `currentColor`— así que funciona
 * en cyan sobre el fondo, en blanco sobre cyan, en negro sobre papel y a 16px en una pestaña,
 * que es donde el degradé de tres paradas del logo original se convertía en una mancha.
 */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="presentation" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M21 8h22a13 13 0 0 1 13 13v4.5a6.5 6.5 0 0 0 0 13V43a13 13 0 0 1-13 13H21A13 13 0 0 1 8 43v-4.5a6.5 6.5 0 0 0 0-13V21A13 13 0 0 1 21 8Zm16 5L18 37h11.5l-3.5 16 18-25H31l6-15Z"
      />
    </svg>
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
