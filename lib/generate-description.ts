import Anthropic from "@anthropic-ai/sdk";
import { credentials } from "@/lib/credentials";
import { formatTime } from "@/lib/dates";
import { formatSeoDate, getEventArtists, getEventCityAndCountry } from "@/lib/event-seo";
import { normalizeText } from "@/lib/slugify";
import type { EventRecord } from "@/types/event";

/**
 * Descripción automática de una fecha, escrita por Claude al guardar el evento.
 *
 * Sin texto propio, todas las páginas muestran el mismo párrafo de plantilla y Google no
 * tiene nada que las distinga de Bombo o Ticketsound. Escribirlo a mano para cada fecha no
 * escala: el dueño carga varias por semana. Esto lo genera solo cuando la descripción llega
 * vacía; si el dueño escribe o edita una, nunca se pisa.
 *
 * Es opcional de punta a punta: sin `ANTHROPIC_API_KEY`, o si la llamada falla o tarda, el
 * evento se guarda igual sin descripción y la página cae al texto de plantilla de siempre.
 */

type DescriptionInput = Pick<
  EventRecord,
  "title" | "lineup" | "venue_name" | "venue_address" | "city" | "province" | "starts_at" | "genre"
>;

const SYSTEM = `Escribís la descripción de una fecha de música electrónica para ElectroTickets, una agenda de eventos de Argentina que deriva la compra al link oficial de Bombo.

El texto se publica tal cual en la página del evento, sin que nadie lo revise, y es lo que Google lee para decidir si la página merece aparecer cuando alguien busca "[artista] [venue]", "[artista] [ciudad]" o "[artista] entradas". Tiene que servirle a quien llega desde esa búsqueda: confirmarle que es la fecha que busca, contarle quién toca y cómo sacar la entrada.

Qué escribir:
- Tres párrafos cortos, entre 90 y 140 palabras en total, separados por una línea en blanco. Texto plano: sin markdown, sin títulos, sin listas, sin emojis, sin hashtags.
- Español rioplatense con voseo, tono directo de alguien que conoce la escena. Nada de frases de folleto ("una noche inolvidable", "no te lo podés perder").
- Primer párrafo: la primera oración nombra al artista principal, el venue, la ciudad y la fecha completa con año, como lo escribiría alguien en el buscador. Después, quién es el artista.
- Segundo párrafo: el sonido de la noche (género, resto del lineup si lo hay) y la logística: dónde queda y a qué hora abren las puertas.
- Tercer párrafo: cómo comprar. Desde la página se accede al link oficial de Bombo, donde están el precio y los lotes actualizados; por mesas VIP o consultas, WhatsApp. Si los datos dicen que ElectroTickets es RRPP oficial del venue, decilo acá; si no lo dicen, no lo menciones.

Precisión, porque nadie corrige antes de publicar:
- Sobre el artista, contá solo lo que sabés con certeza: de dónde es, su sello, residencias o hitos conocidos de su carrera. Si no lo conocés o dudás, no escribas nada biográfico y dedicá ese espacio al género y a la fecha. Un dato inventado sobre un DJ en una página de venta le cuesta credibilidad al sitio.
- No inventes precios, cantidad de público, entradas agotadas, horarios de cierre, edad mínima ni visitas anteriores al venue. Usá únicamente los datos de la fecha que recibís.
- No nombres otras ticketeras.

Respondé solo con el texto de la descripción.`;

/** Lo que tarda como mucho antes de guardar el evento sin descripción. */
const TIMEOUT_MS = 25_000;

function isOfficialVenue(venue: string | null) {
  const normalized = normalizeText(venue);
  if (!normalized) return false;
  return credentials.officialVenues.some((official) => {
    const name = normalizeText(official);
    return normalized === name || normalized.startsWith(`${name} `);
  });
}

export async function generateEventDescription(event: DescriptionInput): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const artists = getEventArtists(event);
  const facts = [
    `Título del evento: ${event.title}`,
    `Lineup: ${artists.length ? artists.join(", ") : "sin confirmar"}`,
    `Venue: ${event.venue_name || "a confirmar"}`,
    event.venue_address ? `Dirección: ${event.venue_address}` : "",
    `Ciudad: ${getEventCityAndCountry(event)}`,
    `Fecha: ${formatSeoDate(event.starts_at)}`,
    `Puertas: ${formatTime(event.starts_at)}`,
    event.genre ? `Género: ${event.genre}` : "",
    `ElectroTickets es RRPP oficial de este venue: ${isOfficialVenue(event.venue_name) ? "sí" : "no"}`
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = new Anthropic({ timeout: TIMEOUT_MS, maxRetries: 0 });
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      // Tarea corta y acotada: `low` alcanza y mantiene rápido el guardado del panel.
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      messages: [{ role: "user", content: `Datos de la fecha:\n\n${facts}` }]
    });

    if (response.stop_reason !== "end_turn") return null;

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    return text || null;
  } catch (error) {
    console.error("Event description generation failed", error instanceof Error ? error.message : error);
    return null;
  }
}
