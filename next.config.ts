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

const nextConfig: NextConfig = {
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
