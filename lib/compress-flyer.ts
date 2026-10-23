/**
 * Compresión del flyer en el navegador, antes de subirlo desde el panel.
 *
 * Los flyers llegaban tal como los exporta el diseñador: PNG de hasta 3,3 MB que después
 * se servían en todo el sitio. Se comprime acá, en el navegador, y no en el servidor, por
 * dos motivos:
 *
 *   1. Vercel rechaza los bodies de más de ~4,5 MB antes de que corra el handler de subida.
 *      Comprimiendo antes, se puede elegir el archivo original aunque pese 8 MB: lo que
 *      viaja ya es liviano.
 *   2. No suma dependencias ni tiempo de arranque a la función del servidor.
 *
 * Sale en **JPEG** y no en WebP: este mismo archivo es el `og:image` del evento, el que
 * muestra WhatsApp al compartir el link, y JPEG es el formato más seguro para esa vista
 * previa. El sitio igual lo recibe en WebP: lo convierte wsrv.nl (`lib/flyer-loader.ts`).
 */

/** Límite final, después de comprimir. Coincide con el del endpoint de subida. */
export const FLYER_MAX_BYTES = 2 * 1024 * 1024;

/**
 * 1200px de ancho cubren el flyer más grande del sitio (detalle de 540px a 2x) y el de
 * mobile a sangre. El alto deja pasar un flyer de story 9:16 sin achicarlo de más.
 */
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1600;
const QUALITY = 0.85;

export type CompressedFlyer = {
  file: File;
  originalBytes: number;
  width: number;
  height: number;
  /** `false` si se subió el original: GIF, formato que el navegador no puede leer, etc. */
  compressed: boolean;
};

export async function compressFlyer(file: File): Promise<CompressedFlyer> {
  const untouched = { file, originalBytes: file.size, width: 0, height: 0, compressed: false };

  // Un GIF puede ser animado y un SVG es vectorial: re-encodearlos los rompería.
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return untouched;
  }

  let bitmap: ImageBitmap;
  try {
    // `from-image` respeta la orientación EXIF: una foto vertical de celular no sale girada.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Formato que el navegador no decodifica (HEIC en Chrome, por ejemplo): va el original y
    // el límite de tamaño lo valida igual.
    return untouched;
  }

  const scale = Math.min(1, MAX_WIDTH / bitmap.width, MAX_HEIGHT / bitmap.height);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    return untouched;
  }

  // JPEG no tiene transparencia: un PNG con fondo transparente quedaría negro de todos
  // modos, así que se pinta explícito y no depende del navegador.
  context.fillStyle = "#000";
  context.fillRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
  if (!blob) return untouched;

  // Si el original ya era chico y no hubo que achicarlo, re-encodearlo solo perdería
  // calidad sin ganar peso.
  if (scale === 1 && blob.size >= file.size) {
    return { ...untouched, width, height };
  }

  const name = `${file.name.replace(/\.[^.]+$/, "") || "flyer"}.jpg`;

  return {
    file: new File([blob], name, { type: "image/jpeg", lastModified: Date.now() }),
    originalBytes: file.size,
    width,
    height,
    compressed: true
  };
}

/** "2,4 MB", "312 KB". */
export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toLocaleString("es-AR", { maximumFractionDigits: 1 })} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
