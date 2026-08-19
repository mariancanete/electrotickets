"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { track } from "@/lib/analytics";

/**
 * Controles flotantes sobre el flyer del detalle: volver, guardar y compartir.
 *
 * **Guardar (corazón) está sin función a propósito.** El ícono ocupa su lugar en el diseño
 * pero todavía no dispara ninguna acción: el comportamiento de guardado quedó pendiente de
 * definición de producto, y una estrella que no hace nada se descubre en un toque. Se
 * renderiza como `<span>` y no como `<button>` para no anunciar a un lector de pantalla una
 * acción que no existe; el día que se defina, pasa a `<button>` y se conecta.
 */
export function DetailActions({
  title,
  slug,
  variant = "flotante"
}: {
  title: string;
  slug: string;
  /**
   * `flotante` es el de mobile, sobre el flyer. `desktop` los baja a botones delineados con
   * etiqueta, debajo del flyer y dentro de la columna sticky. Siguen sin usar chartreuse: no
   * llevan a comprar.
   */
  variant?: "flotante" | "desktop";
}) {
  const router = useRouter();

  async function share() {
    const url = window.location.href;
    track("share_event", { event_slug: slug });

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      // Cancelar el diálogo de compartir lanza; no es un error que haya que mostrar.
    }
  }

  const circle =
    "grid h-[42px] w-[42px] place-items-center rounded-full bg-ink/60 text-white backdrop-blur-sm";

  if (variant === "desktop") {
    const pill =
      "btn-out t150 flex h-12 flex-1 items-center justify-center gap-[9px] rounded-full border border-white/[0.18] text-[13.5px] font-semibold text-white";

    return (
      <div className="flex gap-3">
        <span aria-hidden="true" className={pill}>
          <Icon name="heart" size={17} />
          Guardar
        </span>
        <button type="button" onClick={share} className={pill}>
          <Icon name="share" size={17} />
          Compartir
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-[18px] top-[52px] flex justify-between">
      <button type="button" onClick={() => router.back()} aria-label="Volver" className={circle}>
        <Icon name="back" size={19} />
      </button>

      <span className="flex gap-[9px]">
        <span aria-hidden="true" className={circle}>
          <Icon name="heart" size={19} />
        </span>
        <button type="button" onClick={share} aria-label="Compartir esta fecha" className={circle}>
          <Icon name="share" size={19} />
        </button>
      </span>
    </div>
  );
}
