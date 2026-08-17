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
      className={`inline-flex items-center gap-[6px] whitespace-nowrap rounded-full leading-none ${sizes[size]} ${
        active ? "bg-white font-bold text-ink" : "border border-white/[0.18] font-medium text-white/[0.72]"
      } ${className}`}
    >
      {children}
    </span>
  );
}

/** Solo "Últimas entradas". Nunca convive con el estado agotado. */
export function UrgencyChip({ size = "sm", label = "Últimas" }: { size?: ChipSize; label?: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full bg-urgencia font-bold leading-none text-ink ${sizes[size]}`}
    >
      {label}
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
