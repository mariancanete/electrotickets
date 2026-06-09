"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatEventDate, getDayBadge } from "@/lib/dates";
import type { EventRecord } from "@/types/event";

export function Hero({ featuredEvents }: { featuredEvents: EventRecord[] }) {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pb-10 lg:pt-12">
      <div className="absolute inset-x-0 top-0 mx-auto h-72 max-w-5xl rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute right-0 top-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-start gap-7 lg:grid-cols-[minmax(0,1.02fr)_minmax(410px,0.78fr)] xl:grid-cols-[minmax(0,1.08fr)_minmax(430px,0.72fr)]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="pt-0 lg:pt-1"
        >
          <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/70 backdrop-blur sm:text-sm">
            Tickets de electrónica · Argentina · Links oficiales
          </div>
          <h1 className="max-w-4xl text-balance text-4xl font-black tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl xl:text-[5.15rem] xl:leading-[0.9]">
            Encontrá la próxima fecha antes que todos.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/64 sm:text-lg lg:mt-5">
            Agenda premium de fiestas electrónicas con tickets oficiales, lineup, ubicación y precios para decidir rápido y comprar sin vueltas.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="#destacados"
              className="rounded-full bg-white px-6 py-3 text-center text-sm font-bold text-black transition hover:scale-[1.01] hover:bg-white/85"
            >
              Comprar tickets
            </a>
            <Link
              href="/contacto"
              className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-bold text-white/80 transition hover:border-white/35 hover:bg-white/10"
            >
              Consultar por WhatsApp
            </Link>
          </div>

          <div className="mt-7 grid max-w-2xl grid-cols-3 gap-2.5 sm:gap-3">
            {[
              ["Links", "oficiales"],
              ["Compra", "por Bombo"],
              ["Fechas", "curadas"]
            ].map(([value, label]) => (
              <div key={value} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 backdrop-blur">
                <p className="text-sm font-black text-white sm:text-base">{value}</p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.aside
          id="destacados"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }}
          className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-3 shadow-2xl shadow-black/25 backdrop-blur lg:p-4"
        >
          <div className="mb-3 flex items-end justify-between gap-3 px-1">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-violet-200/80">Eventos destacados</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">Comprá tu próxima fecha</h2>
            </div>
            <Link href="/eventos" className="hidden text-xs font-bold text-white/55 transition hover:text-white sm:block">
              Ver todos
            </Link>
          </div>

          <div className="space-y-2.5">
            {featuredEvents.length ? (
              featuredEvents.map((event, index) => <FeaturedEventRow key={event.id} event={event} priority={index === 0} />)
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-5 text-sm leading-6 text-white/60">
                Muy pronto vas a ver acá las fechas destacadas para comprar tickets.
              </div>
            )}
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

function FeaturedEventRow({ event, priority }: { event: EventRecord; priority: boolean }) {
  const badge = getDayBadge(event.starts_at);

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-black/22 transition duration-300 hover:border-white/20 hover:bg-white/[0.07]">
      <div className="flex min-h-[118px] gap-3 p-2.5 sm:min-h-[126px]">
        <Link href={`/eventos/${event.slug}`} className="relative w-[92px] shrink-0 overflow-hidden rounded-2xl bg-white/5 sm:w-[104px]">
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
          <div className="absolute left-2 top-2 rounded-xl bg-black/70 px-2 py-1 text-center backdrop-blur">
            <p className="text-base font-black leading-none">{badge.day}</p>
            <p className="text-[10px] uppercase leading-tight text-white/60">{badge.month}</p>
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between py-1 pr-1">
          <Link href={`/eventos/${event.slug}`} className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              {event.featured ? <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-black">Top</span> : null}
              <span className="truncate text-xs font-semibold text-violet-200/80">{event.genre || "Electrónica"}</span>
            </div>
            <h3 className="line-clamp-2 text-base font-black leading-tight tracking-tight text-white sm:text-lg">{event.title}</h3>
            <div className="mt-1.5 space-y-0.5 text-xs leading-5 text-white/55">
              <p className="truncate">{formatEventDate(event.starts_at)}</p>
              <p className="truncate">{event.venue_name || "Venue a confirmar"}{event.city ? ` · ${event.city}` : ""}</p>
            </div>
          </Link>

          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs font-bold text-white/75">{event.price_label || "Tickets disponibles"}</p>
            <Link
              href={`/go/${event.slug}`}
              className="shrink-0 rounded-full bg-white px-3.5 py-2 text-xs font-black text-black transition hover:bg-white/85"
            >
              Comprar
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
