"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

type EventActionsProps = {
  title: string;
  slug: string;
  url: string;
  startsAt: string;
  endAt?: string | null;
  venue: string;
};

/**
 * Compartir y guardar en calendario.
 *
 * Compartir amplifica el alcance por WhatsApp e Instagram, que es de donde viene buena parte
 * del tráfico; el calendario recupera al usuario que decide ir pero no compra en el momento
 * — hoy esa persona simplemente se pierde.
 */
export function EventActions({ title, slug, url, startsAt, endAt, venue }: EventActionsProps) {
  const [copied, setCopied] = useState(false);

  async function share() {
    track("share_event", { event_slug: slug });

    const shareData = { title, text: `${title} · ${venue}`, url };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // El usuario canceló el diálogo nativo: se cae al copiado sin avisar nada.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={share}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white/78 transition hover:bg-white/10"
      >
        <ShareIcon />
        {copied ? "Link copiado" : "Compartir"}
      </button>
      <a
        href={googleCalendarUrl({ title, startsAt, endAt, venue, url })}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("add_to_calendar", { event_slug: slug })}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white/78 transition hover:bg-white/10"
      >
        <CalendarIcon />
        Guardar en calendario
      </a>
    </div>
  );
}

/**
 * Link de Google Calendar en vez de un archivo .ics: no requiere descargar nada y funciona
 * igual en Android y en iOS, que es por donde entra la mayor parte del tráfico.
 */
function googleCalendarUrl({
  title,
  startsAt,
  endAt,
  venue,
  url
}: {
  title: string;
  startsAt: string;
  endAt?: string | null;
  venue: string;
  url: string;
}) {
  const start = new Date(startsAt);
  const end = endAt ? new Date(endAt) : new Date(start.getTime() + 6 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toCalendarDate(start)}/${toCalendarDate(end)}`,
    details: `Más info y compra de entradas: ${url}`,
    location: venue
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function toCalendarDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M12 3.5v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m8.2 7.3 3.8-3.8 3.8 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 13v5.5a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 10h16M9 3.5v4M15 3.5v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
