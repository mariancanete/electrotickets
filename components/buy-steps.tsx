import { Icon } from "@/components/icons";

/**
 * Los dos pasos de la compra. Van siempre **antes** del botón "Comprar en Bombo", nunca
 * debajo: descubrir que la compra termina afuera después del clic es donde se pierde gente.
 *
 * Son dos y no tres a propósito: comprás en Bombo, el QR queda en la app, y listo.
 *
 *   `franja`  una línea, arriba del botón en la barra de compra.
 *   `panel`   con íconos grandes, en la home.
 */
export function BuySteps({ variant = "franja", className = "" }: { variant?: "franja" | "panel"; className?: string }) {
  if (variant === "panel") {
    return (
      <ol className={`vidrio grid grid-cols-2 gap-1 rounded-block px-2 py-4 lg:py-6 ${className}`}>
        <li className="flex flex-col items-center gap-2 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10">
            <Icon name="card" size={22} />
          </span>
          <span className="text-[13.5px] font-bold leading-[1.25] lg:text-[15px]">
            <span className="text-cta">1.</span> Comprás en Bombo
          </span>
        </li>
        <li className="flex flex-col items-center gap-2 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10">
            <Icon name="ticket" size={22} />
          </span>
          <span className="text-[13.5px] font-bold leading-[1.25] lg:text-[15px]">
            <span className="text-cta">2.</span> QR en la app, y listo
          </span>
        </li>
      </ol>
    );
  }

  return (
    <ol
      aria-label="Cómo comprás"
      className={`flex items-center justify-center gap-2 text-[12px] font-bold leading-none text-white lg:text-[12.5px] ${className}`}
    >
      <li className="flex items-center gap-[6px]">
        <Icon name="card" size={15} className="text-cta" />
        Comprás en Bombo
      </li>
      <li aria-hidden="true" className="text-white/50">
        <Icon name="arrow" size={13} />
      </li>
      <li className="flex items-center gap-[6px]">
        <Icon name="ticket" size={15} className="text-cta" />
        QR en la app, y listo
      </li>
    </ol>
  );
}
