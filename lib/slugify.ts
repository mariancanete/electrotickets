export function slugify(value: string) {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function buildEventSlug(title: string, startsAt?: string) {
  const datePart = startsAt ? formatArgentinaDatePart(startsAt) : "";
  return slugify([title, datePart].filter(Boolean).join(" "));
}

function formatArgentinaDatePart(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return formatter.format(date);
}
