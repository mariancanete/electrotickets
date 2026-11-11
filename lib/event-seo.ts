import { siteConfig } from "@/lib/site";
import { normalizeText, slugify } from "@/lib/slugify";
import type { EventRecord } from "@/types/event";

/**
 * Piezas de texto SEO que comparten el detalle de evento y la página de artista.
 *
 * El informe de Search Console de octubre 2026 marcó el rumbo: el 38 % de las impresiones
 * venían de búsquedas con "argentina" ("solomun argentina", "miss monique argentina 2026") y
 * el 23 % con "buenos aires", pero ningún título del sitio nombraba la ciudad de las fechas
 * porteñas ni el país. Las búsquedas con año eran las que mejor posicionaban (4,2 de
 * promedio contra 6,2 de las de "buenos aires").
 */

/**
 * Nombres de lineup que no son artistas. "TBA" estaba en el lineup de Kevin de Vries en
 * Mandarine: sin este filtro contaba como "el mismo artista" que cualquier fecha con TBA, y
 * además generaría una página `/artistas/tba`.
 */
const PLACEHOLDER_ARTISTS = new Set([
  "tba",
  "tbc",
  "tbd",
  "a confirmar",
  "invitados",
  "invitado sorpresa",
  "special guest",
  "special guests",
  "y mas",
  "and more"
]);

export function isRealArtist(name: string | null | undefined) {
  const key = normalizeText(name);
  return Boolean(key) && !PLACEHOLDER_ARTISTS.has(key);
}

/** Artistas reales del lineup, sin repetidos ni placeholders. */
export function getEventArtists(event: Pick<EventRecord, "lineup">) {
  const seen = new Set<string>();
  const artists: string[] = [];

  for (const raw of event.lineup || []) {
    const name = raw?.trim();
    if (!name || !isRealArtist(name)) continue;
    const key = normalizeText(name);
    if (seen.has(key)) continue;
    seen.add(key);
    artists.push(name);
  }

  return artists;
}

export function artistSlug(name: string) {
  return slugify(name);
}

export function artistPath(name: string) {
  return `/artistas/${artistSlug(name)}`;
}

/**
 * Artistas del lineup que el título nombra: "MASSANO B2B KEVIN DE VRIES" → MASSANO y KEVIN DE
 * VRIES (EMILIANO DEMARCO no). Son los nombres con los que se busca la fecha. Si el título no
 * nombra a nadie ("MUSIC ON"), el primero del lineup, que es como se carga el headliner.
 */
export function getHeadliners(event: Pick<EventRecord, "title" | "lineup">) {
  const artists = getEventArtists(event);
  const title = normalizeText(event.title);
  const named = artists.filter((artist) => title.includes(normalizeText(artist)));

  if (named.length) return named;
  return artists.slice(0, 1);
}

export function getEventPrimaryPlace(event: Pick<EventRecord, "venue_name" | "city">) {
  return event.venue_name?.trim() || event.city?.trim() || "";
}

export function shouldAppendPlaceToTitle(title: string, place: string) {
  if (!place) return false;
  return !normalizeText(title).includes(normalizeText(place));
}

/** "SOLOMUN en Mute". Si el título ya nombra el lugar, queda como está. */
export function getEventLabel(event: Pick<EventRecord, "title" | "venue_name" | "city">) {
  const place = getEventPrimaryPlace(event);
  return shouldAppendPlaceToTitle(event.title, place) ? `${event.title} en ${place}` : event.title;
}

/** Formas en que el panel carga Capital. Todas se muestran como "Buenos Aires". */
const CABA_CITIES = new Set(["caba", "buenos aires", "ciudad de buenos aires", "ciudad autonoma de buenos aires", "capital federal", "bs as", "bsas"]);

/** Valores de provincia, no de ciudad: si aparecen en `province`, `city` ya es la ciudad. */
const PROVINCE_LEVEL = new Set([...CABA_CITIES, "provincia de buenos aires", "pba"]);

/** Fechas fuera del país: el panel carga el país en `city` o en `province` ("URUGUAY"). */
const COUNTRIES: Record<string, string> = {
  argentina: "Argentina",
  uruguay: "Uruguay",
  chile: "Chile",
  brasil: "Brasil",
  brazil: "Brasil",
  paraguay: "Paraguay"
};

type Place = Pick<EventRecord, "city" | "province" | "venue_name">;

/**
 * Ciudad y país reales a partir de lo que cargó el panel, que no siempre respeta los campos.
 * La regla es provincia = "Buenos Aires" y ciudad = "CABA", "Mar del Plata"…, pero en vivo
 * había filas invertidas (Miss Monique: ciudad "Buenos Aires", provincia "Mar del plata") y
 * una en Uruguay con el país en la ciudad ("URUGUAY", provincia "Maldonado"). Sin esto, el
 * título decía "Mute, Buenos Aires" y la descripción "(URUGUAY, Argentina)".
 */
function resolvePlace(event: Place) {
  let city = event.city?.trim() || "";
  let province = event.province?.trim() || "";
  let country = "Argentina";

  const cityCountry = COUNTRIES[normalizeText(city)];
  const provinceCountry = COUNTRIES[normalizeText(province)];
  if (cityCountry) {
    country = cityCountry;
    city = province;
    province = "";
  } else if (provinceCountry) {
    country = provinceCountry;
    province = "";
  }

  // Campos invertidos: "Buenos Aires" en ciudad y la ciudad real en provincia.
  if (normalizeText(city) === "buenos aires" && province && !PROVINCE_LEVEL.has(normalizeText(province))) {
    city = province;
  }

  if (!city && country === "Argentina") city = siteConfig.defaultCity;

  return { city: CABA_CITIES.has(normalizeText(city)) ? "Buenos Aires" : formatCityName(city), country };
}

/**
 * La ciudad tal como se busca. "CABA" pasa a "Buenos Aires": es como escribe la gente
 * ("solomun buenos aires", 3.000 impresiones en octubre, ninguna con "caba"). Vacía si el
 * venue ya la nombra, para no repetirla.
 */
export function getEventCity(event: Place) {
  const { city } = resolvePlace(event);
  if (!city || normalizeText(event.venue_name).includes(normalizeText(city))) return "";
  return city;
}

/** "Argentina" salvo que la fecha sea en otro país. */
export function getEventCountry(event: Place) {
  return resolvePlace(event).country;
}

/** "Mar del Plata" o, fuera del país, "Maldonado, Uruguay". Para títulos y listados. */
export function getEventCityLine(event: Place) {
  const city = getEventCity(event);
  const country = getEventCountry(event);
  if (country === "Argentina") return city;
  return city ? `${city}, ${country}` : country;
}

/** "Mar del Plata, Argentina" o "Maldonado, Uruguay". Para descripciones. */
export function getEventCityAndCountry(event: Place) {
  const city = getEventCity(event);
  const country = getEventCountry(event);
  return city ? `${city}, ${country}` : country;
}

/** "Mar del plata" → "Mar del Plata". El admin la carga a mano y llega con mayúsculas sueltas. */
export function formatCityName(city: string) {
  if (!city) return "";
  const minor = new Set(["de", "del", "la", "las", "los", "y"]);

  return city
    .split(/\s+/)
    .map((word, index) =>
      index > 0 && minor.has(word.toLowerCase()) ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

const seoDateFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

const shortSeoDateFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "numeric",
  month: "long",
  year: "numeric"
});

const yearFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Argentina/Buenos_Aires",
  year: "numeric"
});

/** "sábado 2 de enero de 2027". Con año: las fechas de enero se venden desde octubre. */
export function formatSeoDate(date: string) {
  return seoDateFormatter.format(new Date(date)).replace(",", "");
}

/** "2 de enero de 2027". */
export function formatShortSeoDate(date: string) {
  return shortSeoDateFormatter.format(new Date(date));
}

/** Año en horario argentino: una fecha del 31/12 a las 23:00 es de ese año, no del siguiente. */
export function getEventYear(date: string) {
  return yearFormatter.format(new Date(date));
}

/** "A, B y C". */
export function joinList(items: string[]) {
  if (items.length <= 1) return items[0] || "";
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}
