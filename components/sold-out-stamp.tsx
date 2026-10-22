/**
 * Sello de fecha agotada, apoyado sobre el flyer.
 *
 * El flyer es lo primero que se mira, así que el "agotado" tiene que leerse ahí y no solo en
 * el botón: antes una fecha agotada se distinguía apenas por la card a media opacidad, y
 * desde la grilla parecía una fecha más.
 *
 * Es un sello de goma —doble filete blanco, levemente girado— en los colores del sistema:
 * tinta y blanco. **Ni coral ni chartreuse**: el coral es solo "Últimas entradas" y el
 * chartreuse es comprar, y un agotado no es ninguna de las dos cosas. Un velo de tinta baja el
 * flyer sin taparlo: se sigue reconociendo qué fiesta es.
 *
 * Va siempre en un contenedor `relative` con el flyer, y se dibuja encima de la imagen pero
 * debajo de los controles (volver, guardar, compartir) y del chip de fecha. El texto es real,
 * no una imagen, así que un lector de pantalla también escucha "Agotado".
 */
export function SoldOutStamp({ size = "lg" }: { size?: "sm" | "lg" | "xl" }) {
  // Miniatura de 62px: un sello no se leería, así que es una banda al pie.
  if (size === "sm") {
    return (
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-ink/85 py-[5px] text-center font-mono text-[8px] font-bold uppercase leading-none tracking-[0.14em] text-white">
        Agotado
      </span>
    );
  }

  const xl = size === "xl";

  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center bg-ink/45">
      <span
        className={`-rotate-[7deg] rounded-[14px] border-2 border-white bg-ink/80 shadow-[0_14px_36px_rgba(0,0,0,0.5)] ${
          xl ? "p-[5px] lg:rounded-[18px] lg:p-[6px]" : "p-1"
        }`}
      >
        <span
          className={`flex flex-col items-center rounded-[9px] border border-white/35 ${
            xl ? "gap-[7px] px-6 py-3 lg:gap-[9px] lg:rounded-[12px] lg:px-9 lg:py-[18px]" : "gap-[6px] px-4 py-[10px]"
          }`}
        >
          <span className={`display leading-none text-white ${xl ? "text-[34px] lg:text-[52px]" : "text-[28px]"}`}>
            Agotado
          </span>
          <span
            className={`font-mono font-bold uppercase leading-none tracking-[0.32em] text-white/70 ${
              xl ? "text-[10px] lg:text-[12px]" : "text-[9px]"
            }`}
          >
            Sold out
          </span>
        </span>
      </span>
    </div>
  );
}
