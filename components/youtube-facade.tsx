"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

/**
 * Miniatura con botón de play que solo carga el iframe de YouTube después del clic.
 *
 * El embed directo trae ~1 MB de JavaScript de terceros y varias conexiones externas en
 * cuanto se renderiza la página, aunque nadie mire el video. Con el facade, esa carga solo
 * ocurre si al usuario efectivamente le interesa el set.
 */
export function YoutubeFacade({
  embedUrl,
  videoId,
  title,
  eventSlug
}: {
  embedUrl: string;
  videoId: string;
  title: string;
  eventSlug: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`${embedUrl}?autoplay=1`}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setPlaying(true);
        track("play_videoset", { event_slug: eventSlug });
      }}
      className="group relative h-full w-full"
      aria-label={`Reproducir ${title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
      />
      <span className="absolute inset-0 grid place-items-center bg-black/35 transition group-hover:bg-black/20">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 shadow-2xl transition group-hover:scale-105">
          <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 text-black" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13l11-6.5L8 5.5Z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
