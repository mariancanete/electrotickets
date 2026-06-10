"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getDayBadge } from "@/lib/dates";
import type { EventRecord } from "@/types/event";

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23"
});

const microBenefits = [
  {
    title: "Links oficiales",
    text: "Compra segura",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M12 3.75 5.75 6.1v5.28c0 4.08 2.64 7.68 6.25 8.87 3.61-1.19 6.25-4.79 6.25-8.87V6.1L12 3.75Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="m9.25 12.05 1.75 1.7 3.9-4.05" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: "Actualizado 24/7",
    text: "Nuevas fechas siempre",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M13 2.75 5.7 13.05h5.55L11 21.25l7.3-10.3h-5.55L13 2.75Z" fill="currentColor" />
      </svg>
    )
  },
  {
    title: "Sin intermediarios",
    text: "Compra directa",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <rect x="5" y="10" width="14" height="10" rx="2.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.5 10V7.7a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12 14v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }
];

export function Hero({ featuredEvents }: { featuredEvents: EventRecord[] }) {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pb-10 lg:pt-12">
      <div className="absolute left-1/2 top-0 h-80 w-[56rem] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute right-0 top-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(560px,1.1fr)] xl:grid-cols-[minmax(0,0.88fr)_minmax(620px,1.12fr)]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="flex flex-col pt-0 lg:min-h-[604px] lg:pt-1 xl:min-h-[612px]"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-1.5 text-xs font-semibold text-white/68 backdrop-blur sm:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_18px_rgba(139,92,246,0.85)]" />
            Tickets de electrónica · Argentina · Compra directa por Bombo
          </div>
          <h1 className="max-w-3xl text-balance text-4xl font-black tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl xl:text-[4.9rem] xl:leading-[0.95]">
            Encontrá la próxima fecha antes que todos.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/64 sm:text-lg">
            Agenda de fiestas electrónicas con links <span className="font-semibold text-violet-200">oficiales</span>, lineup, ubicación y <span className="font-semibold text-violet-200">videosets</span> para decidir rápido y comprar sin vueltas.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/eventos"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-7 py-3 text-center text-sm font-black text-white shadow-[0_18px_45px_rgba(91,33,182,0.3)] transition hover:scale-[1.01] hover:from-violet-500 hover:to-blue-500"
            >
              Explorar eventos
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/destacados"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-black/20 px-7 py-3 text-center text-sm font-bold text-white/82 transition hover:border-white/35 hover:bg-white/10"
            >
              Ver destacados
            </Link>
          </div>

          <div className="mt-7 grid max-w-2xl gap-0 overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur sm:grid-cols-3 lg:mt-auto">
            {microBenefits.map((item) => (
              <div key={item.title} className="flex items-center gap-3 border-white/10 px-4 py-3 text-white/78 sm:border-r sm:last:border-r-0">
                <span className="text-violet-200">{item.icon}</span>
                <span>
                  <span className="block text-sm font-bold leading-tight text-white">{item.title}</span>
                  <span className="mt-0.5 block text-xs leading-tight text-white/50">{item.text}</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }}
        >
          <div className="mb-4 flex items-center justify-between gap-4 px-1">
            <h2 className="inline-flex items-center gap-2 text-base font-black tracking-tight text-white sm:text-lg">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-violet-200" fill="currentColor" aria-hidden="true">
                <path d="m12 2.75 1.7 6.05 6.05 1.7-6.05 1.7-1.7 6.05-1.7-6.05-6.05-1.7 6.05-1.7L12 2.75Z" />
              </svg>
              Eventos destacados
            </h2>
            <Link href="/destacados" className="inline-flex items-center gap-2 text-sm font-bold text-violet-200 transition hover:text-white">
              Ver todos
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="space-y-3">
            {featuredEvents.length ? (
              featuredEvents.map((event, index) => <FeaturedEventRow key={event.id} event={event} priority={index === 0} />)
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-5 text-sm leading-6 text-white/60">
                Muy pronto vas a ver acá las fechas destacadas para comprar tickets.
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-3xl border border-white/10 bg-white/[0.035] px-4 py-3.5 backdrop-blur sm:flex-row sm:items-center sm:gap-4 lg:mt-16">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-violet-300/30 bg-violet-500/10 text-violet-100">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M12 3.75 5.75 6.1v5.28c0 4.08 2.64 7.68 6.25 8.87 3.61-1.19 6.25-4.79 6.25-8.87V6.1L12 3.75Z" stroke="currentColor" strokeWidth="1.7" />
                  <path d="m9.25 12.05 1.75 1.7 3.9-4.05" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/78 sm:text-base">Compra desde Bombo</p>
                <p className="mt-1 text-xs leading-5 text-white/48 sm:text-sm">Links oficiales · Compra segura · Consulta por WhatsApp</p>
              </div>
            </div>
            <div className="shrink-0 text-right text-sm font-black leading-[0.85] tracking-[0.18em] text-white sm:text-base">
              BOMBO
              <span className="block text-[9px] tracking-[0.28em] text-white/60 sm:text-[10px]">TICKETS</span>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

function FeaturedEventRow({ event, priority }: { event: EventRecord; priority: boolean }) {
  const badge = getDayBadge(event.starts_at);
  const eventTime = formatHeroEventTime(event.starts_at);
  const tags = [event.genre, event.city].filter(Boolean).slice(0, 2) as string[];

  return (
    <article className="group w-full max-w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/15 backdrop-blur transition duration-300 hover:border-violet-300/30 hover:bg-white/[0.06]">
      <div className="flex min-w-0 flex-col gap-3 p-3 sm:grid sm:min-h-[128px] sm:grid-cols-[180px_56px_minmax(0,1fr)_auto] sm:items-center sm:gap-4 lg:grid-cols-[190px_58px_minmax(0,1fr)_auto] xl:grid-cols-[210px_60px_minmax(0,1fr)_auto]">
        <Link href={`/eventos/${event.slug}`} className="relative h-32 w-full overflow-hidden rounded-2xl bg-white/5 sm:h-[108px] sm:w-full">
          {event.flyer_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.flyer_url}
              alt={`Flyer de ${event.title}`}
              loading={priority ? "eager" : "lazy"}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center bg-gradient-to-br from-violet-500/30 via-cyan-500/10 to-white/5 text-2xl font-black">
              ET
            </div>
          )}
          {event.featured ? <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">Destacado</span> : null}
        </Link>

        <div className="hidden text-center sm:block">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">{badge.month}</p>
          <p className="mt-1 text-3xl font-black leading-none text-white/78">{badge.day}</p>
        </div>

        <div className="min-w-0 px-1 sm:px-0">
          <Link href={`/eventos/${event.slug}`}>
            <h3 className="truncate text-lg font-black leading-tight tracking-tight text-white sm:text-xl">{event.title}</h3>
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/52">
            <span className="inline-flex items-center gap-1">
              <ClockIcon />
              {eventTime} hs
            </span>
            <span className="inline-flex min-w-0 items-center gap-1">
              <PinIcon />
              <span className="min-w-0 break-words sm:truncate">{event.venue_name || "Venue a confirmar"}</span>
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.length ? tags.map((tag) => <span key={tag} className="rounded-full border border-violet-300/15 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-100/80">{tag}</span>) : null}
          </div>
        </div>

        <div className="flex min-w-0 px-1 sm:justify-end sm:px-0">
          <Link
            href={`/go/${event.slug}`}
            className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-[0_14px_30px_rgba(91,33,182,0.28)] transition hover:from-violet-500 hover:to-blue-500 sm:w-auto"
          >
            Comprar
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatHeroEventTime(date: string) {
  return timeFormatter.format(new Date(date)).replace(/[^\d:]/g, "").padStart(5, "0");
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5V12l3 1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" aria-hidden="true">
      <path d="M12 21s6-5.15 6-11a6 6 0 1 0-12 0c0 5.85 6 11 6 11Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
