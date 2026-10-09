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

/**
 * Placeholder cuando el evento todavía no tiene flyer cargado.
 *
 * Franjas a 135° sobre surface. Reemplaza al tile "ET" con degradado del sistema anterior:
 * un placeholder que se lee como "acá va un flyer" es más honesto que uno que pretende ser
 * un logo, y además no compite con la marca real del header.
 *
 * `flyer_url` es opcional a propósito —lo carga el admin al bucket `event-flyers`— así que
 * este estado no es un error: es el estado normal de una fecha recién publicada.
 */
export function FlyerFallback({ className = "", large = false }: { className?: string; large?: boolean }) {
  return <div aria-hidden="true" className={`h-full w-full ${large ? "rayado-lg" : "rayado"} ${className}`} />;
}

/**
 * Flyer con su placeholder. Un solo lugar decide qué se dibuja cuando no hay imagen.
 *
 * Por defecto el recorte es `cover` centrado: si el flyer viene cuadrado o vertical se
 * recorta, nunca se deforma. Deformar la gráfica de una productora es peor que recortarla.
 *
 * `mobileFit="contain"` muestra el flyer **entero** debajo de 1024px. En mobile las cajas
 * no son 4:5 —la destacada de la home mide ~354×206 y el detalle 390×300—, así que con
 * `cover` se perdían arriba y abajo el line-up y los logos, que es justo lo que la gente lee
 * para decidir. El espacio que sobra a los costados se rellena con el mismo flyer
 * difuminado (`large`) en vez de dejar bandas vacías: es la misma URL y el mismo `sizes`,
 * así que el navegador no lo descarga dos veces.
 *
 * Desde 1024px vuelve a `cover` y el fondo difuminado desaparece: ahí las cajas ya son 4:5
 * y el flyer se ve completo, así que desktop queda exactamente como estaba.
 */
export function Flyer({
  src,
  alt,
  sizes,
  priority = false,
  large = false,
  mobileFit = "cover"
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  large?: boolean;
  mobileFit?: "cover" | "contain";
}) {
  if (!src) return <FlyerFallback large={large} />;

  if (mobileFit === "cover") {
    return <FlyerImage src={src} alt={alt} sizes={sizes} priority={priority} className="object-cover object-center" />;
  }

  return (
    <>
      {large ? (
        <FlyerImage
          src={src}
          alt=""
          sizes={sizes}
          priority={priority}
          className="scale-110 object-cover object-center opacity-45 blur-xl lg:hidden"
        />
      ) : null}
      <FlyerImage
        src={src}
        alt={alt}
        sizes={sizes}
        priority={priority}
        className="object-contain object-center lg:object-cover"
      />
    </>
  );
}
