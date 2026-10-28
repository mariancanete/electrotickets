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

/** Proporción por defecto (4:5) cuando no se conoce la del flyer. */
const DEFAULT_RATIO = 1.25;
/** Un flyer más apaisado que 2:1 no existe en la práctica; el piso evita recuadros finitos. */
const MIN_RATIO = 0.5;

/**
 * Flyer en un recuadro **a su medida**: entero, sin recortar, sin deformar y sin bandas.
 *
 * Los flyers llegan en proporciones distintas (4:5, 3:4, cuadrados, stories 9:16). Con un
 * recuadro fijo había que elegir entre cortarlos (cover) o dejarles bandas a los costados
 * (contain). Acá el recuadro toma la proporción real del flyer (`ratio`, que calcula el
 * servidor en `lib/flyer-meta.ts`), así que el flyer lo llena exacto.
 *
 * El único límite es el alto: una story 9:16 a ancho completo estiraría la card o empujaría
 * el contenido. Por eso hay un tope (`maxRatio` en mobile, `maxRatioDesktop` desde 1024px).
 * Solo si el flyer lo supera —o si no se conoce su proporción— queda margen a los costados,
 * y ese margen se rellena con el mismo flyer difuminado: misma URL y mismo `sizes`, así que
 * no es una segunda descarga.
 *
 * `imageClassName` envuelve las imágenes (para el zoom de hover de la card de grilla) sin
 * mover los `children`, que se dibujan encima: sellos, chips, controles.
 */
export function FlyerFrame({
  src,
  alt,
  sizes,
  ratio,
  maxRatio = 4 / 3,
  maxRatioDesktop,
  priority = false,
  className = "",
  imageClassName = "",
  children
}: {
  src: string | null;
  alt: string;
  sizes: string;
  ratio?: number | null;
  maxRatio?: number;
  maxRatioDesktop?: number;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  children?: React.ReactNode;
}) {
  const natural = ratio && ratio > 0 ? ratio : null;
  const fit = (cap: number) => Math.min(Math.max(natural ?? DEFAULT_RATIO, MIN_RATIO), cap);
  const mobile = fit(maxRatio);
  const desktop = fit(maxRatioDesktop ?? maxRatio);
  const needsBackdrop =
    natural === null || Math.abs(natural - mobile) > 0.01 || Math.abs(natural - desktop) > 0.01;

  return (
    <div
      className={`flyer-frame relative overflow-hidden ${className}`}
      style={{ "--fr-m": mobile, "--fr-d": desktop } as React.CSSProperties}
    >
      {src ? (
        <div className={`absolute inset-0 ${imageClassName}`}>
          {needsBackdrop ? (
            <FlyerImage
              src={src}
              alt=""
              sizes={sizes}
              priority={priority}
              className="scale-110 object-cover object-center opacity-45 blur-xl"
            />
          ) : null}
          <FlyerImage src={src} alt={alt} sizes={sizes} priority={priority} className="object-contain object-center" />
        </div>
      ) : (
        <FlyerFallback large />
      )}
      {children}
    </div>
  );
}
