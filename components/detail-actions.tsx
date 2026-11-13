"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { track } from "@/lib/analytics";

/**
 * Acciones del detalle que no son comprar: volver y compartir.
 *
 *   `flotante`  círculos de vidrio sobre el flyer, en mobile.
 *   `boton`     "Compartir" con etiqueta, debajo de la fecha, en todos los anchos.
 *
 * Compartir usa la hoja nativa del teléfono (WhatsApp, Instagram, copiar…). Donde no existe
 * copia el link y lo dice. Nunca usa cian: no lleva a comprar.
 */
export function DetailActions({
  title,
  slug,
  variant = "flotante"
}: {
  title: string;
  slug: string;
  variant?: "flotante" | "boton";
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    track("share_event", { event_slug: slug });

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Cancelar el diálogo de compartir lanza; no es un error que haya que mostrar.
    }
  }

  if (variant === "boton") {
    return (
      <button
        type="button"
        onClick={share}
        className="btn-out t150 flex h-11 items-center justify-center gap-2 rounded-full border border-white/30 px-5 text-[14px] font-extrabold text-white"
      >
        <Icon name={copied ? "check" : "share"} size={17} />
        <span aria-live="polite">{copied ? "Link copiado" : "Compartir"}</span>
      </button>
    );
  }

  const circle = "vidrio-barra grid h-11 w-11 place-items-center rounded-full text-white";

  return (
    <div className="absolute inset-x-4 top-4 flex justify-between">
      <button type="button" onClick={() => router.back()} aria-label="Volver" className={circle}>
        <Icon name="back" size={19} />
      </button>
      <button type="button" onClick={share} aria-label="Compartir esta fecha" className={circle}>
        <Icon name="share" size={19} />
      </button>
    </div>
  );
}
