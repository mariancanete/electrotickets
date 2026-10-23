"use client";

import type { ImageLoaderProps } from "next/image";

/**
 * Loader de imágenes: los flyers se optimizan en wsrv.nl, no en Vercel.
 *
 * El plan de Vercel tiene un cupo mensual de transformaciones de imagen. Al agotarlo,
 * `/_next/image` empezó a devolver `402 Payment Required` y la mayoría de los flyers se veían
 * rotos. Además se gastaba muy rápido: Supabase sirve los flyers con `cache-control: no-cache`,
 * así que Vercel los volvía a transformar cada 4 horas, en cada tamaño y en dos formatos.
 *
 * wsrv.nl es un proxy de imágenes gratuito y open source sobre Cloudflare: recibe la URL
 * pública del flyer, lo redimensiona, lo convierte a WebP y lo cachea un año. Un flyer de 2 MB
 * llega como ~11 KB en miniatura y ~90 KB a 828px.
 *
 * Parámetros:
 *   w       ancho pedido por `next/image` según `sizes` y la densidad de pantalla.
 *   q       calidad (75, el default de Next).
 *   output  WebP, que todos los navegadores actuales soportan.
 *   we      "without enlargement": nunca agranda un flyer más chico que el ancho pedido.
 *
 * Para volver al optimizador de Vercel alcanza con sacar `loader` y `loaderFile` de
 * `next.config.ts`.
 */
export default function flyerLoader({ src, width, quality }: ImageLoaderProps) {
  // Rutas locales (`/og-logo`, archivos de `public/`): no hace falta optimizarlas afuera.
  if (!/^https?:\/\//i.test(src)) return src;

  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality ?? 75),
    output: "webp",
    we: ""
  });

  return `https://wsrv.nl/?${params.toString()}`;
}
