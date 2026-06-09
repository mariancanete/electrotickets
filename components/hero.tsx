"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { EventRecord } from "@/types/event";
import { getDayBadge } from "@/lib/dates";

function formatTime(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

function getPriceFromLabel(label: string | null) {
  if (!label) return null;
  if (label.toLowerCase().includes("desde")) return label;

  const match = label.match(/\$\s?[\d.]+(?:,\d+)?/);
  return match ? match[0].replace("$ ", "$") : label;
}

function TrustIcon({ type }: { type: "shield" | "price" | "venue" | "video" }) {
  if (type === "price") return <span className="text-lg text-amber-200">$</span>;
  if (type === "venue") return <span className="text-lg text-sky-200">⌖</span>;
  if (type === "video") return <span className="text-lg text-violet-200">▶</span>;

  return (
    <svg className="h-5 w-5 text-violet-200" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 5.5 6v5.2c0 4.1 2.6 7.8 6.5 9.3 3.9-1.5 6.5-5.2 6.5-9.3V6L12 3.5Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8.8 12 2.1 2.1 4.4-4.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeaturedHeroCard({ event, priority = false }: { event: EventRecord; priority?: boolean }) {
  const badge = getDayBadge(event.starts_at);
  const price = getPriceFromLabel(event.price_label);

  return (
    <article className="group overflow-hidden rounded-[1.7rem] border border-white/10 bg-black/35 shadow-2xl shadow-black/30 transition duration-300 hover:border-violet-300/30 hover:bg-white/[0.06]">
      <div className="grid gap-0 sm:grid-cols-[minmax(145px,0.82fr)_1.18fr]">
        <Link href={`/eventos/${event.slug}`} className="relative min-h-44 overflow-hidden bg-white/[0.04] sm:min-h-0" aria-label={`Ver detalle de ${event.title}`}>
          {event.flyer_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.flyer_url}
              alt={`Flyer de ${event.title}`}
              loading={priority ? "eager" : "lazy"}
              className="h-full min-h-44 w-full object-cover transition duration-500 group-hover:scale-105 sm:min-h-0"
            />
          ) : (
            <div className="grid h-full min-h-44 place-items-center bg-gradient-to-br from-violet-500/35 via-blue-500/15 to-white/5 text-3xl font-black text-white">
              ET
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
          {event.featured ? (
            <span className="absolute left-4 top-4 rounded-full bg-violet-600 px-3 py-1 text-[0.65rem] font-black uppercase tracking-wide text-white shadow-lg shadow-violet-950/40">
              Destacado
            </span>
          ) : null}
        </Link>

        <div className="grid gap-4 p-5 sm:grid-cols-[54px_1fr_auto] sm:items-center sm:gap-5">
          <div className="flex items-center gap-3 sm:block sm:text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">{badge.month}</p>
            <p className="text-3xl font-black leading-none text-white/80 sm:mt-1">{badge.day}</p>
          </div>

          <div className="min-w-0">
            <Link href={`/eventos/${event.slug}`} className="block transition hover:text-violet-100">
              <h3 className="line-clamp-2 text-xl font-black tracking-tight text-white sm:text-2xl">{event.title}</h3>
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
              <span>{formatTime(event.starts_at)} hs</span>
              <span>{event.venue_name || "Venue a confirmar"}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(event.genre ? [event.genre] : ["Electrónica"]).map((tag) => (
                <span key={tag} className="rounded-full border border-violet-300/15 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-100/80">
                  {tag}
                </span>
              ))}
              {event.video_url ? (
                <span className="rounded-full border border-blue-300/15 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-100/75">Videoset</span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
            {price ? (
              <div>
                <p className="text-xs text-white/45">Desde</p>
                <p className="text-lg font-black text-violet-200">{price}</p>
              </div>
            ) : null}
            <Link
              href={`/go/${event.slug}`}
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-950/35 transition hover:scale-[1.02] hover:bg-violet-500"
            >
              Comprar
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Hero({ featuredEvents, eventsCount, venuesCount }: { featuredEvents: EventRecord[]; eventsCount: number; venuesCount: number }) {
  const benefitChips = [
    { label: "Links oficiales", type: "shield" as const },
    { label: "Precios claros", type: "price" as const },
    { label: "Venue & ubicación", type: "venue" as const },
    { label: "Videoset", type: "video" as const }
  ];

  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-12 sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
      <div className="absolute inset-x-0 top-8 mx-auto h-72 max-w-5xl rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur">
            Tickets de electrónica · Argentina · Compra directa por Bombo
          </div>
          <h1 className="text-balance text-5xl font-black tracking-[-0.06em] text-white sm:text-6xl xl:text-7xl">
            Encontrá la próxima fecha antes que todos.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/64">
            Agenda de fiestas electrónicas con links <span className="font-semibold text-violet-200">oficiales</span>, lineup,
            ubicación y <span className="font-semibold text-violet-200">precios</span> para decidir rápido y comprar sin vueltas.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/eventos"
              className="rounded-full bg-violet-600 px-6 py-3 text-center text-sm font-black text-white shadow-lg shadow-violet-950/35 transition hover:scale-[1.01] hover:bg-violet-500"
            >
              Explorar eventos
            </Link>
            <a
              href="#destacados"
              className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-bold text-white/80 transition hover:border-white/35 hover:bg-white/10"
            >
              Ver destacados
            </a>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {benefitChips.map((chip) => (
              <div key={chip.label} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm font-semibold text-white/78 backdrop-blur">
                <TrustIcon type={chip.type} />
                <span>{chip.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-black/25 text-center backdrop-blur">
            <div className="p-4">
              <p className="text-2xl font-black text-violet-200">{eventsCount}</p>
              <p className="mt-1 text-xs text-white/50">Eventos disponibles</p>
            </div>
            <div className="border-x border-white/10 p-4">
              <p className="text-2xl font-black text-violet-200">{venuesCount}</p>
              <p className="mt-1 text-xs text-white/50">Venues cargados</p>
            </div>
            <div className="p-4">
              <p className="text-2xl font-black text-violet-200">RRPP</p>
              <p className="mt-1 text-xs text-white/50">Venta oficial BMB</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          id="destacados"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
          className="min-w-0"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-3 text-lg font-black tracking-tight text-white">
              <span className="text-violet-200">✦</span>
              Eventos destacados
            </h2>
            <Link href="/eventos" className="text-sm font-bold text-violet-200 transition hover:text-white">
              Ver todos →
            </Link>
          </div>

          {featuredEvents.length ? (
            <div className="space-y-3">
              {featuredEvents.map((event, index) => (
                <FeaturedHeroCard key={event.id} event={event} priority={index === 0} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-6 text-white/60">
              Muy pronto vamos a publicar nuevas fechas destacadas.
            </div>
          )}

          <div className="mt-4 flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-white/60">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-violet-300/20 bg-violet-500/10">
              <TrustIcon type="shield" />
            </div>
            <p><span className="font-semibold text-white/80">Compra directa por Bombo</span> · Tickets oficiales · Soporte real</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
