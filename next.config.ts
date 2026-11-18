import type { NextConfig } from "next";

/**
 * Los flyers viven en Supabase Storage, cuyo host depende del proyecto. Se deriva de la env
 * en vez de hardcodearlo para que funcione igual en preview y en producción.
 */
function supabaseImageHost() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").hostname;
  } catch {
    return null;
  }
}

const host = supabaseImageHost();

/**
 * Encabezados de seguridad para todas las rutas. Ninguno cambia lo que se ve.
 *
 *   frame-ancestors / X-Frame-Options  ningún sitio puede meter estas páginas en un iframe
 *                                      (clickjacking, sobre todo en `/admin`). El CSP lleva
 *                                      **solo** esa directiva: un CSP completo con nonce
 *                                      obliga a renderizar cada página en cada visita y anula
 *                                      el ISR de `revalidate = 3600`.
 *   X-Content-Type-Options             el navegador no adivina tipos de archivo.
 *   Referrer-Policy                    a Bombo y a terceros solo les llega el dominio, nunca
 *                                      la ruta completa con sus parámetros.
 *   Permissions-Policy                 cámara, micrófono y ubicación apagados: el sitio no
 *                                      los usa y así tampoco los puede pedir un script ajeno.
 *
 * HSTS no va acá: Vercel ya lo manda en todas las respuestas.
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "@phosphor-icons/react"]
  },
  images: {
    /**
     * Los flyers se optimizan en wsrv.nl (ver `lib/flyer-loader.ts`) y no en Vercel: el cupo
     * de transformaciones del plan se agotó y `/_next/image` devolvía 402. Con un loader
     * propio, `next/image` sigue armando `srcset` y `sizes`, pero ya no pasa por Vercel.
     */
    loader: "custom",
    loaderFile: "./lib/flyer-loader.ts",
    /**
     * Menos anchos posibles = menos variantes por flyer, y más aciertos de caché en wsrv.
     * Cubren los usos reales: miniatura de 62px (hasta 3x → 256), card de grilla de ~380px
     * (2x → 828), destacada de 460px y detalle de 540px (2x → 1080), y el flyer a sangre de
     * mobile (390px a 3x → 1200).
     */
    deviceSizes: [640, 828, 1080, 1200],
    imageSizes: [64, 128, 256, 384],
    remotePatterns: [
      ...(host ? [{ protocol: "https" as const, hostname: host }] : []),
      // Solo lo usan los eventos de demo cuando Supabase todavía no está configurado.
      { protocol: "https" as const, hostname: "images.unsplash.com" }
    ]
  }
};

export default nextConfig;
