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
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...(host ? [{ protocol: "https" as const, hostname: host }] : []),
      // Solo lo usan los eventos de demo cuando Supabase todavía no está configurado.
      { protocol: "https" as const, hostname: "images.unsplash.com" }
    ]
  }
};

export default nextConfig;
