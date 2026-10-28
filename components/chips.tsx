import { Icon } from "@/components/icons";

/**
 * Chips del sistema.
 *
 * La regla de color acá es la que más se rompe sola si no se explicita: **el chip activo usa
 * blanco, nunca chartreuse**. Un filtro seleccionado no lleva a comprar, y si se pintara de
 * chartreuse el usuario aprendería que el color no significa nada.
 *
 * El coral queda reservado para "Últimas entradas" y no se usa como estado de selección.
 */

type ChipSize = "sm" | "md";

const sizes: Record<ChipSize, string> = {
  // Dentro de card: el chip acompaña al título, no compite con él.
  sm: "px-[9px] py-[6px] text-[10px]",
  // Barra de filtros: es un control, así que llega al área táctil cómoda.
  md: "px-[14px] py-[11px] text-[12px]"
};

export function Chip({
  children,
  active = false,
  size = "md",
  className = ""
}: {
  children: React.ReactNode;
  active?: boolean;
  size?: ChipSize;
  className?: string;
}) {
  return (
    <span
      className={`t150 inline-flex items-center gap-[6px] whitespace-nowrap rounded-full leading-none ${sizes[size]} ${
        active
          ? "chip-activo bg-white font-bold text-ink"
          : "chip-inactivo border border-white/[0.18] font-medium text-white/[0.72]"
      } ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * "Últimas entradas" — la única urgencia real del sitio, y por eso la que más tiene que
 * verse. Antes era un chip chico que decía solo "Últimas", del mismo tamaño que el de género,
 * y se perdía. Ahora lleva la llama, el texto completo y un halo coral que lo despega del
 * flyer y de la card, sin animación: urgencia que se lee, no que molesta.
 *
 * Sigue siendo el único uso del coral en el sitio, y nunca convive con el estado agotado.
 *
 *   sm  cards (mobile y grilla)
 *   md  fecha destacada de la home
 *   lg  detalle del evento
 */
const urgencySizes = {
  sm: { box: "gap-[5px] px-[10px] py-[6px] text-[11.5px]", icon: 13 },
  md: { box: "gap-[6px] px-[13px] py-2 text-[13px]", icon: 15 },
  lg: { box: "gap-[7px] px-4 py-[10px] text-[15px]", icon: 18 }
} as const;

export function UrgencyChip({ size = "sm" }: { size?: keyof typeof urgencySizes }) {
  const { box, icon } = urgencySizes[size];

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full bg-urgencia font-bold leading-none text-ink shadow-[0_0_0_3px_rgba(255,90,60,0.22),0_6px_18px_rgba(255,90,60,0.35)] ${box}`}
    >
      <Icon name="flame" size={icon} />
      Últimas entradas
    </span>
  );
}

/**
 * Credencial de RRPP. Ultramar tenue con borde y `shield`: es informativo, no accionable.
 *
 * No sale de la tabla `events` sino de `lib/credentials.ts`, y cada valor vacío no renderiza
 * nada. Si no queda ninguna credencial cargada, la franja se omite entera: ese archivo es el
 * slot de prueba social del sistema, y una credencial inventada en un negocio de RRPP cuesta
 * más de lo que rinde.
 */
export function CredentialChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-[6px] rounded-full border border-marca-edge bg-marca-tint px-[14px] py-[9px] text-[12px] font-semibold leading-none text-marca-ink">
      <Icon name="shield" size={14} />
      {children}
    </span>
  );
}

/** Bloque informativo ultramar: credencial en detalle/compra, aviso del QR en mis entradas. */
export function InfoBlock({
  icon,
  children,
  className = ""
}: {
  icon: "shield" | "ticket" | "chat" | "bell";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start gap-[11px] rounded-card border border-marca-edge bg-marca-tint p-[15px] ${className}`}
    >
      <span className="flex-none text-marca-ink">
        <Icon name={icon} size={20} />
      </span>
      <div className="text-[12.5px] leading-[1.5] text-white/[0.72]">{children}</div>
    </div>
  );
}
