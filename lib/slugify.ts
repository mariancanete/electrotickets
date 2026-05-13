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
  const datePart = startsAt ? new Date(startsAt).toISOString().slice(0, 10) : "";
  return slugify([title, datePart].filter(Boolean).join(" "));
}
