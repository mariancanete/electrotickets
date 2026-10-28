import type { EventRecord } from "@/types/event";

/**
 * Proporción real de cada flyer (alto / ancho), para dibujar el recuadro a su medida.
 *
 * Los flyers llegan en proporciones muy distintas —4:5, 3:4, cuadrados, stories 9:16— y un
 * recuadro fijo los cortaba (cover) o les dejaba bandas a los costados (contain). Con la
 * proporción conocida **antes de renderizar**, el recuadro se dibuja con su medida exacta
 * desde el HTML del servidor: el flyer se ve completo y la página no salta al cargar.
 *
 * No hay columna para esto en `events` (y no se agregan columnas): la medida se le pide a
 * wsrv.nl, el mismo servicio que ya sirve los flyers, con `output=json`. Cada flyer tiene una
 * URL única que nunca cambia, así que la respuesta se guarda en la caché de datos de Next y
 * se pide **una sola vez** por flyer.
 *
 * Si wsrv no responde a tiempo, la proporción queda en `null` y el recuadro cae al 4:5 de
 * siempre con el flyer entero adentro (`FlyerFrame`). Nunca bloquea ni rompe la página.
 */

const TIMEOUT_MS = 1500;

async function fetchFlyerRatio(url: string): Promise<number | null> {
  if (!/^https?:\/\//i.test(url)) return null;

  try {
    const response = await fetch(`https://wsrv.nl/?url=${encodeURIComponent(url)}&output=json`, {
      cache: "force-cache",
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (!response.ok) return null;

    const meta = (await response.json()) as { width?: number; height?: number; orientation?: number };
    if (!meta.width || !meta.height) return null;

    // Orientaciones EXIF 5–8 giran la imagen 90°: el navegador la muestra con los lados
    // invertidos respecto de lo que dice el archivo.
    const rotated = meta.orientation !== undefined && meta.orientation >= 5 && meta.orientation <= 8;
    const ratio = rotated ? meta.width / meta.height : meta.height / meta.width;

    return Number.isFinite(ratio) && ratio > 0 ? Math.round(ratio * 1000) / 1000 : null;
  } catch {
    return null;
  }
}

/** Agrega `flyer_ratio` a cada evento. Las consultas van en paralelo. */
export async function withFlyerRatios<T extends Pick<EventRecord, "flyer_url">>(events: T[]) {
  const ratios = await Promise.all(events.map((event) => (event.flyer_url ? fetchFlyerRatio(event.flyer_url) : null)));
  return events.map((event, index) => ({ ...event, flyer_ratio: ratios[index] }));
}
