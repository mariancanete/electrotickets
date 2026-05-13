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

export function getDayBadge(date: string) {
  const value = new Date(date);
  return {
    day: new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", day: "2-digit" }).format(value),
    month: new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", month: "short" }).format(value)
  };
}
