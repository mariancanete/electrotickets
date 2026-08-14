import Image from "next/image";

const allowedHosts = new Set(
  [
    (() => {
      try {
        return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").hostname;
      } catch {
        return null;
      }
    })(),
    "images.unsplash.com"
  ].filter(Boolean) as string[]
);

/**
 * `next/image` falla en runtime si el host de la imagen no está en `remotePatterns`. Los
 * flyers los carga el admin y podrían venir de un host pegado a mano, así que para esos
 * casos se sirve la imagen sin optimizar en vez de romper la página.
 */
function isOptimizable(url: string) {
  try {
    return allowedHosts.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

type FlyerImageProps = {
  src: string;
  alt: string;
  /** Ancho renderizado en cada breakpoint, para que no se descargue el flyer entero en mobile. */
  sizes: string;
  priority?: boolean;
  className?: string;
};

export function FlyerImage({ src, alt, sizes, priority = false, className }: FlyerImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      unoptimized={!isOptimizable(src)}
      className={className}
    />
  );
}

/** Placeholder cuando el evento todavía no tiene flyer cargado. */
export function FlyerFallback({ className = "", size = "text-4xl" }: { className?: string; size?: string }) {
  return (
    <div
      className={`grid h-full w-full place-items-center bg-gradient-to-br from-violet-500/30 via-cyan-500/10 to-white/5 font-black ${size} ${className}`}
    >
      ET
    </div>
  );
}
