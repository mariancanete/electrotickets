const formatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit"
});

const longFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

export function formatEventDate(date: string) {
  return formatter.format(new Date(date)).replace(",", " ·");
}

export function formatEventLongDate(date: string) {
  return longFormatter.format(new Date(date)).replace(",", " ·");
}

/* ------------------------------------------------------------------------------------- *
 * Sistema Hora Pico
 *
 * Todo lo de acá abajo se imprime en JetBrains Mono: son datos que genera la máquina. El
 * formato es siempre el mismo (día abreviado, número, mes o hora) para que la columna de la
 * agenda alinee y el ojo pueda saltear de fecha en fecha sin releer.
 * ------------------------------------------------------------------------------------- */

const TIME_ZONE = "America/Argentina/Buenos_Aires";

function part(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-AR", { timeZone: TIME_ZONE, ...options }).format(date);
}

/** Quita el punto que `es-AR` agrega en los días y meses abreviados ("sáb." → "SÁB"). */
function abbr(value: string) {
  return value.replace(".", "").toUpperCase();
}

/**
 * Riel izquierdo de la card de fecha: día de la semana, número y hora.
 *
 * El día de la semana va arriba porque es el dato que más pesa cuando alguien busca "qué hay
 * este finde": viernes y sábado se reconocen antes que el número.
 */
export function getDateRail(date: string) {
  const value = new Date(date);

  return {
    weekday: abbr(part(value, { weekday: "short" })),
    day: part(value, { day: "2-digit" }),
    month: abbr(part(value, { month: "short" })),
    time: part(value, { hour: "2-digit", minute: "2-digit", hour12: false })
  };
}

/** Dato corto de una fecha: `SÁB 31.10 · 23:00`. */
export function formatDato(date: string) {
  const value = new Date(date);
  const weekday = abbr(part(value, { weekday: "short" }));
  const day = part(value, { day: "2-digit" });
  const month = part(value, { month: "2-digit" });
  const time = part(value, { hour: "2-digit", minute: "2-digit", hour12: false });

  return `${weekday} ${day}.${month} · ${time}`;
}

/** Igual que `formatDato` pero con hora de cierre cuando el evento la tiene cargada. */
export function formatDatoRange(startsAt: string, endAt: string | null) {
  const base = formatDato(startsAt);
  if (!endAt) return base;

  const end = new Date(endAt);
  if (Number.isNaN(end.getTime())) return base;

  return `${base} — ${part(end, { hour: "2-digit", minute: "2-digit", hour12: false })}`;
}

/**
 * Encabezado de grupo del listado: `SÁBADO 31.10`.
 *
 * Usa la noche a la que pertenece la fecha, no su día calendario: si no, un grupo que
 * arranca con una fecha de las 03:00 se titularía con el día siguiente al de sus propias
 * cards.
 */
export function formatDayHeading(date: string) {
  const value = nightOf(date);
  const weekday = part(value, { weekday: "long" }).toUpperCase();
  const day = part(value, { day: "2-digit" });
  const month = part(value, { month: "2-digit" });

  return `${weekday} ${day}.${month}`;
}

/** Fila de fecha del detalle, en Space Grotesk: `Sábado 31 de octubre`. */
export function formatLongDay(date: string) {
  const value = new Date(date);
  const weekday = part(value, { weekday: "long" });

  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${part(value, { day: "numeric" })} de ${part(value, { month: "long" })}`;
}

export function formatTime(date: string) {
  return part(new Date(date), { hour: "2-digit", minute: "2-digit", hour12: false });
}

/**
 * Cuántas horas de la madrugada pertenecen a la noche anterior.
 *
 * Una fiesta que arranca 03:00 del domingo es, para todo el mundo menos para el calendario,
 * la noche del sábado: se sale el sábado, se vuelve el domingo. Agrupar por fecha calendario
 * partía cada finde en dos y dejaba fechas sueltas bajo un domingo que nadie buscaba.
 */
const NIGHT_HOURS = 6;

/** Corre la fecha a la noche a la que pertenece, para agrupar y titular. */
function nightOf(date: string) {
  return new Date(new Date(date).getTime() - NIGHT_HOURS * 60 * 60 * 1000);
}

/**
 * Clave de agrupación por noche **en horario argentino**.
 *
 * No se puede usar el ISO crudo: además de partir la noche, `toISOString()` correría el día
 * por el offset UTC. Se agrupa por la fecha ya corrida y ya formateada en la zona correcta.
 */
export function getDayKey(date: string) {
  return part(nightOf(date), { year: "numeric", month: "2-digit", day: "2-digit" });
}

/**
 * Misma clave de noche, en formato ISO (`2026-08-21`).
 *
 * Es la que viaja en la URL del filtro de día: `21/08/2026` sería ambigua para cualquiera que
 * lea el link, y además se ordena mal.
 */
export function getDayKeyIso(date: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(nightOf(date));
}

/** Hora local del evento, 0–23. La usa el filtro de horario. */
export function getHour(date: string) {
  return Number(part(new Date(date), { hour: "2-digit", hour12: false }));
}

/** Etiqueta corta de un día para el sidebar de filtros: `Viernes 21`. */
export function formatDayLabel(date: string) {
  const value = nightOf(date);
  const weekday = part(value, { weekday: "long" });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${part(value, { day: "2-digit" })}`;
}

/** Tile del selector de tres días de la home: `VIE` / `30`. */
export function getDayTile(date: Date) {
  return {
    weekday: abbr(part(date, { weekday: "short" })),
    day: part(date, { day: "2-digit" }),
    key: part(date, { year: "numeric", month: "2-digit", day: "2-digit" })
  };
}

/** Rango del bloque punteado del estado vacío: `30 OCT — 01 NOV`. */
export function formatRange(from: Date, to: Date) {
  const start = `${part(from, { day: "2-digit" })} ${abbr(part(from, { month: "short" }))}`;
  const end = `${part(to, { day: "2-digit" })} ${abbr(part(to, { month: "short" }))}`;

  return `${start} — ${end}`;
}

export function getDayBadge(date: string) {
  const value = new Date(date);
  return {
    day: new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", day: "2-digit" }).format(value),
    month: new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", month: "short" }).format(value),
    // El día de la semana es el dato que más pesa cuando alguien busca "qué hay este finde":
    // viernes y sábado se reconocen antes que el número.
    weekday: new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", weekday: "short" })
      .format(value)
      .replace(".", "")
  };
}
