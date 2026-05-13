"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="absolute inset-x-0 top-12 mx-auto h-64 max-w-4xl rounded-full bg-violet-600/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur">
            Tickets de electrónica · Argentina · Compra directa por Bombo
          </div>
          <h1 className="text-balance text-5xl font-black tracking-[-0.06em] text-white sm:text-7xl lg:text-8xl">
            Encontrá la próxima fecha antes que todos.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/64 sm:text-xl">
            Agenda moderna de fiestas electrónicas con links oficiales, lineup, ubicación,
            precios y videosets para decidir rápido y comprar sin vueltas.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/eventos"
              className="rounded-full bg-white px-6 py-3 text-center text-sm font-bold text-black transition hover:scale-[1.01] hover:bg-white/85"
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
        </motion.div>
      </div>
    </section>
  );
}
