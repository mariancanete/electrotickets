"use client";

import { useMemo, useState } from "react";
import { EventCard } from "@/components/event-card";
import type { EventRecord } from "@/types/event";

export function EventBrowser({ events }: { events: EventRecord[] }) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("Todos");

  const genres = useMemo(() => {
    const unique = Array.from(new Set(events.map((event) => event.genre).filter(Boolean) as string[]));
    return ["Todos", ...unique];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return events.filter((event) => {
      const matchesGenre = genre === "Todos" || event.genre === genre;
      const haystack = [event.title, event.venue_name, event.city, event.genre, event.lineup?.join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesGenre && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [events, genre, query]);

  return (
    <div className="space-y-8">
      <div className="glass grid gap-3 rounded-[2rem] p-4 sm:grid-cols-[1fr_220px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por DJ, venue, género..."
          className="rounded-full border border-white/10 bg-black/30 px-5 py-3 text-sm outline-none transition placeholder:text-white/35 focus:border-white/30"
        />
        <select
          value={genre}
          onChange={(event) => setGenre(event.target.value)}
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
            <EventCard key={event.id} event={event} priority={index < 3} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-[2rem] p-10 text-center text-white/60">
          No encontramos eventos con esos filtros.
        </div>
      )}
    </div>
  );
}
