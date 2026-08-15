"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EventCard } from "@/components/event-card";
import { WhatsappAlerts } from "@/components/whatsapp-alerts";
import { track, type CtaPlacement } from "@/lib/analytics";
import { normalizeText } from "@/lib/slugify";
import type { EventRecord } from "@/types/event";

const ALL_GENRES = "Todos";

export function EventBrowser({
  events,
  placement = "event_list"
}: {
  events: EventRecord[];
  placement?: CtaPlacement;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [genre, setGenre] = useState(searchParams.get("genero") || ALL_GENRES);

  /**
   * El género se compara normalizado. La base todavía puede tener variantes como
   * "Progressive House" y "Progressive house", y con comparación exacta cada variante
   * aparecía como una opción distinta que además dejaba afuera a la otra mitad de los
   * eventos.
   */
  const genres = useMemo(() => {
    const seen = new Map<string, string>();
    for (const event of events) {
      if (!event.genre) continue;
      const key = normalizeText(event.genre);
      if (key && !seen.has(key)) seen.set(key, event.genre.trim());
    }
    return [ALL_GENRES, ...Array.from(seen.values()).sort((a, b) => a.localeCompare(b, "es"))];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    const normalizedGenre = normalizeText(genre);

    return events.filter((event) => {
      const matchesGenre = genre === ALL_GENRES || normalizeText(event.genre) === normalizedGenre;
      if (!matchesGenre) return false;
      if (!normalizedQuery) return true;

      const haystack = normalizeText(
        [event.title, event.venue_name, event.city, event.genre, event.lineup?.join(" ")].filter(Boolean).join(" ")
      );
      return haystack.includes(normalizedQuery);
    });
  }, [events, genre, query]);

  // Los filtros viven en la URL: así el resultado se puede compartir por WhatsApp, se puede
  // volver con el botón atrás y queda registrado en la analítica qué busca la gente.
  const syncUrl = useCallback(
    (nextQuery: string, nextGenre: string) => {
      const params = new URLSearchParams();
      if (nextQuery.trim()) params.set("q", nextQuery.trim());
      if (nextGenre !== ALL_GENRES) params.set("genero", nextGenre);

      const search = params.toString();
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      syncUrl(query, genre);
      if (query.trim()) {
        track("search_event", { search_term: query.trim(), results: filteredEvents.length });
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, genre, syncUrl, filteredEvents.length]);

  function resetFilters() {
    setQuery("");
    setGenre(ALL_GENRES);
  }

  return (
    <div className="space-y-8">
      <div className="glass grid gap-3 rounded-[20px] p-4 sm:grid-cols-[1fr_220px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por DJ, venue, género..."
          className="rounded-full border border-white/10 bg-black/30 px-5 py-3 text-sm outline-none transition placeholder:text-white/48 focus:border-white/30"
        />
        <select
          value={genre}
          onChange={(event) => {
            setGenre(event.target.value);
            track("select_genre", { genre: event.target.value });
          }}
          className="rounded-full border border-white/10 bg-black/30 px-5 py-3 text-sm outline-none transition focus:border-white/30"
        >
          {genres.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      {filteredEvents.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event, index) => (
            <EventCard key={event.id} event={event} placement={placement} priority={index < 3} />
          ))}
        </div>
      ) : (
        // El estado vacío era un callejón sin salida: solo decía que no había resultados.
        <div className="space-y-5">
          <div className="glass rounded-[20px] p-8 text-center">
            <p className="text-lg font-bold text-white">No encontramos eventos con esos filtros.</p>
            <p className="mt-2 text-base leading-7 text-white/62">
              Probá con otro género o mirá la agenda completa.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-full bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-white/85"
            >
              Ver todos los eventos
            </button>
          </div>
          <WhatsappAlerts
            source="empty_results"
            title="¿Buscabas una fecha puntual?"
            text="Escribinos y te decimos si la tenemos o cuándo se publica. También te avisamos de las próximas."
            compact
          />
        </div>
      )}
    </div>
  );
}
