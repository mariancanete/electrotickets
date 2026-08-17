/**
 * Set de iconografía de ElectroTickets — 23 glifos sólidos, sin trazo, caja 24×24.
 *
 * Son sólidos y de peso óptico alto a propósito: tienen que sobrevivir al fondo negro y al
 * brillo de la calle, que es donde se usa la app. Un set de trazo fino se apaga en las dos
 * condiciones.
 *
 * Regla dura: **ningún ícono tiene dos significados**. `ticket` es siempre "mis entradas",
 * `out` es siempre "esto sale de la app", `heart` es siempre guardar. Si hace falta un
 * significado nuevo, se agrega un glifo; no se recicla uno existente.
 *
 * Aparte va `mark`, el isotipo, con caja de 64×64: no es un ícono de interfaz y no comparte
 * la grilla de 24, así que se instancia con su propio componente.
 *
 * El sprite se monta una sola vez en el layout y cada instancia es un `<use>`: el markup de
 * los paths viaja una vez por documento en lugar de una vez por ícono.
 */

export type IconName =
  | "pin"
  | "cal"
  | "clock"
  | "ticket"
  | "search"
  | "sliders"
  | "heart"
  | "share"
  | "chat"
  | "home"
  | "user"
  | "eq"
  | "map"
  | "bell"
  | "shield"
  | "card"
  | "check"
  | "plus"
  | "minus"
  | "arrow"
  | "back"
  | "x"
  | "out";

/**
 * Sprite SVG. Va una sola vez, al principio del `<body>`.
 *
 * `position:absolute` + tamaño 0 en vez de `display:none`: Safari deja de resolver los
 * `<use>` cuando el sprite está oculto con `display:none`.
 */
export function IconSprite() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <symbol id="i-pin" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2Z"
          />
        </symbol>
        <symbol id="i-cal" viewBox="0 0 24 24">
          <path fill="currentColor" d="M7 2h2.4v3H7zM14.6 2H17v3h-2.4z" />
          <path fill="currentColor" fillRule="evenodd" d="M3 4h18v18H3V4Zm2.2 6.4v9.4h13.6v-9.4H5.2Z" />
          <path fill="currentColor" d="M7 12.6h3.4V16H7z" />
        </symbol>
        <symbol id="i-clock" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M12 2.6a9.4 9.4 0 1 0 0 18.8 9.4 9.4 0 0 0 0-18.8ZM13 6.8v5.6l4.2 2.5-1 1.7-5.2-3.1V6.8H13Z"
          />
        </symbol>
        <symbol id="i-ticket" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M2 5.5h20v4.3a2.2 2.2 0 0 0 0 4.4v4.3H2v-4.3a2.2 2.2 0 0 0 0-4.4V5.5Zm12.6 2.2h1.6v2h-1.6v-2Zm0 4.3h1.6v2h-1.6v-2Zm0 4.3h1.6v2h-1.6v-2Z"
          />
        </symbol>
        <symbol id="i-search" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M10.8 2.6a8.2 8.2 0 1 0 5.1 14.6l3.6 3.6 1.6-1.6-3.6-3.6A8.2 8.2 0 0 0 10.8 2.6Zm0 2.6a5.6 5.6 0 1 1 0 11.2 5.6 5.6 0 0 1 0-11.2Z"
          />
        </symbol>
        <symbol id="i-sliders" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M2.5 6.1h9.6v1.9H2.5zM19 6.1h2.5v1.9H19zM2.5 11.1h4.6v1.9H2.5zM14 11.1h7.5v1.9H14zM2.5 16h9.6v1.9H2.5zM19 16h2.5v1.9H19z"
          />
          <circle cx="15.6" cy="7" r="2.8" fill="currentColor" />
          <circle cx="10.6" cy="12" r="2.8" fill="currentColor" />
          <circle cx="15.6" cy="16.9" r="2.8" fill="currentColor" />
        </symbol>
        <symbol id="i-heart" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 21.2S3.2 15.3 3.2 9.6A4.9 4.9 0 0 1 12 6.4a4.9 4.9 0 0 1 8.8 3.2c0 5.7-8.8 11.6-8.8 11.6Z"
          />
        </symbol>
        <symbol id="i-share" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2 7.2 6.8 8.8 8.4 10.9 6.3V15h2.2V6.3l2.1 2.1 1.6-1.6L12 2Z" />
          <path fill="currentColor" d="M4 11.5h3.2v7.3h9.6v-7.3H20V21H4v-9.5Z" />
        </symbol>
        <symbol id="i-chat" viewBox="0 0 24 24">
          <path fill="currentColor" d="M2 3.4h20v13.2H8.6L2 22V3.4Z" />
        </symbol>
        <symbol id="i-home" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2 2 10.3v11.3h7.3v-6.2h5.4v6.2H22V10.3L12 2Z" />
        </symbol>
        <symbol id="i-user" viewBox="0 0 24 24">
          <circle cx="12" cy="7.6" r="4.2" fill="currentColor" />
          <path fill="currentColor" d="M3.6 21.4c0-4.6 3.8-7.4 8.4-7.4s8.4 2.8 8.4 7.4H3.6Z" />
        </symbol>
        <symbol id="i-eq" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M2 9.6h2.6v4.8H2zM6.6 5.6h2.6v12.8H6.6zM11.2 2.4h2.6v19.2h-2.6zM15.8 7.2h2.6v9.6h-2.6zM20.4 10.4H23v3.2h-2.6z"
          />
        </symbol>
        <symbol id="i-map" viewBox="0 0 24 24">
          <path fill="currentColor" d="M9 2.6 3 4.8v16.6l6-2.2 6 2.2 6-2.2V2.6l-6 2.2-6-2.2Z" />
        </symbol>
        <symbol id="i-bell" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2a1.6 1.6 0 0 0-1.6 1.6v.9A6.4 6.4 0 0 0 5.6 10.8v3.4L3.8 17.4c-.3.6.1 1.3.8 1.3h14.8c.7 0 1.1-.7.8-1.3l-1.8-3.2v-3.4a6.4 6.4 0 0 0-4.8-6.3v-.9A1.6 1.6 0 0 0 12 2ZM9.3 20a2.8 2.8 0 0 0 5.4 0H9.3Z"
          />
        </symbol>
        <symbol id="i-shield" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M12 1.8 3.6 4.9v6.8c0 5 3.5 9.4 8.4 10.5 4.9-1.1 8.4-5.5 8.4-10.5V4.9L12 1.8Zm-1.2 14-3.9-3.9L8.5 10.3l2.3 2.3 4.7-4.7 1.6 1.6-6.3 6.3Z"
          />
        </symbol>
        <symbol id="i-card" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M2 4.6h20v14.8H2V4.6Zm2.2 2.2v2.4h15.6V6.8H4.2Zm0 5.6v5h6v-5h-6Z"
          />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24">
          <path fill="currentColor" d="m9.5 15.6-3.9-3.9L4 13.3l5.5 5.5L20 8.3l-1.6-1.6-8.9 8.9Z" />
        </symbol>
        <symbol id="i-plus" viewBox="0 0 24 24">
          <path fill="currentColor" d="M10.9 3.6h2.2V11h7.3v2.2h-7.3v7.3h-2.2v-7.3H3.6V11h7.3V3.6Z" />
        </symbol>
        <symbol id="i-minus" viewBox="0 0 24 24">
          <path fill="currentColor" d="M3.6 11h16.8v2.2H3.6z" />
        </symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24">
          <path fill="currentColor" d="M3.6 10.9h11.1l-4-4 1.6-1.6 6.7 6.7-6.7 6.7-1.6-1.6 4-4H3.6v-2.2Z" />
        </symbol>
        <symbol id="i-back" viewBox="0 0 24 24">
          <path fill="currentColor" d="M20.4 10.9H9.3l4-4-1.6-1.6L5 12l6.7 6.7 1.6-1.6-4-4h11.1v-2.2Z" />
        </symbol>
        <symbol id="i-x" viewBox="0 0 24 24">
          <path fill="currentColor" d="m6.3 4.7 13 13-1.6 1.6-13-13 1.6-1.6Z" />
          <path fill="currentColor" d="M19.3 6.3 6.3 19.3 4.7 17.7l13-13 1.6 1.6Z" />
        </symbol>
        <symbol id="i-out" viewBox="0 0 24 24">
          <path fill="currentColor" d="M13 2.6h8.4V11h-2.2V6.4l-8.1 8.1-1.6-1.6 8.1-8.1H13V2.6Z" />
          <path fill="currentColor" d="M3.4 5.6h7v2.2H5.6v10.6h10.6V13.6h2.2v7.8H3.4V5.6Z" />
        </symbol>
        <symbol id="i-mark" viewBox="0 0 64 64">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M21 8h22a13 13 0 0 1 13 13v4.5a6.5 6.5 0 0 0 0 13V43a13 13 0 0 1-13 13H21A13 13 0 0 1 8 43v-4.5a6.5 6.5 0 0 0 0-13V21A13 13 0 0 1 21 8Zm16 5L18 37h11.5l-3.5 16 18-25H31l6-15Z"
          />
        </symbol>
      </defs>
    </svg>
  );
}

type IconProps = {
  name: IconName;
  /** 12–14 inline · 16–19 en botones · 20–22 en nav y badges · 28 en estados vacíos. */
  size?: number;
  className?: string;
  /** Solo si el ícono es la única etiqueta del control. Si va con texto, se deja decorativo. */
  title?: string;
};

export function Icon({ name, size = 20, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      style={{ flex: "none" }}
    >
      {title ? <title>{title}</title> : null}
      <use href={`#i-${name}`} />
    </svg>
  );
}

/** Isotipo. Caja de 64×64, fuera de la grilla de 24 de los íconos de interfaz. */
export function Mark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} aria-hidden="true" focusable="false" style={{ flex: "none" }}>
      <use href="#i-mark" />
    </svg>
  );
}
