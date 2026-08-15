import Link from "next/link";
import { EventRow } from "@/components/event-row";
import type { EventRecord } from "@/types/event";

/**
 * Señales de confianza del hero.
 *
 * Antes decían "Sin intermediarios · Compra directa", que contradice el modelo real —
 * ElectroTickets es justamente el intermediario— y lo desmentía el propio footer. Ahora
 * dicen lo que sí es cierto y además es el diferencial frente a comprar directo en Bombo.
 */
const microBenefits = [
  {
    title: "Links verificados",
    text: "El link oficial de cada fecha",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M12 3.75 5.75 6.1v5.28c0 4.08 2.64 7.68 6.25 8.87 3.61-1.19 6.25-4.79 6.25-8.87V6.1L12 3.75Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path d="m9.25 12.05 1.75 1.7 3.9-4.05" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: "Compra en Bombo",
    text: "Ahí ves el precio y pagás",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M13 2.75 5.7 13.05h5.55L11 21.25l7.3-10.3h-5.55L13 2.75Z" fill="currentColor" />
      </svg>
    )
  },
  {
    title: "Te ayudamos",
    text: "Por WhatsApp, antes y después",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M20.25 11.7a8.1 8.1 0 0 1-11.9 7.19L4 20l1.15-4.2A8.1 8.1 0 1 1 20.25 11.7Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
];

export function Hero({ featuredEvents }: { featuredEvents: EventRecord[] }) {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pb-10 lg:pt-12">
      <div className="absolute left-1/2 top-0 h-80 w-[56rem] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute right-0 top-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Sin `items-start`: las dos columnas se estiran a la misma altura, así el `mt-auto`
          de los pies funciona en ambas y cierran parejas. */}
      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(560px,1.1fr)] xl:grid-cols-[minmax(0,0.88fr)_minmax(620px,1.12fr)]">
        <div className="flex flex-col pt-0 lg:pt-1">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-1.5 text-xs font-semibold text-white/78 sm:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_18px_rgba(139,92,246,0.85)]" />
            Agenda de electrónica · Argentina · Compra por Bombo
          </div>

          {/* El título anterior ("antes que todos") prometía anticipación que el sitio no
              sustentaba: no había alertas ni preventas. Ahora promete lo que sí entrega. */}
          {/* Archivo expandido es bastante más ancho por carácter que Arial, así que al
              tamaño anterior el titular pasaba a cinco líneas y desbalanceaba el hero. El
              peso visual lo aporta ahora el ancho de la letra, no el cuerpo. */}
          <h1 className="max-w-2xl text-balance text-[2.6rem] font-black leading-[0.98] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.6rem] xl:text-[4rem]">
            Las mejores fechas de electrónica, en un solo lugar.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/62 sm:text-lg">
            Descubrí eventos, revisá lineup y ubicación, y comprá con el{" "}
            <span className="font-semibold text-violet-200">link verificado</span> de Bombo de cada fecha. Te
            ayudamos por <span className="font-semibold text-violet-200">WhatsApp</span> antes y después de comprar.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/eventos"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-7 py-3 text-center text-sm font-black text-white shadow-[0_18px_45px_rgba(91,33,182,0.3)] transition hover:scale-[1.01] hover:from-violet-500 hover:to-blue-500"
            >
              Ver todas las fechas
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/destacados"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-black/20 px-7 py-3 text-center text-sm font-bold text-white/78 transition hover:border-white/35 hover:bg-white/10"
            >
              Ver destacados
            </Link>
          </div>

          <div className="mt-7 grid max-w-2xl gap-0 overflow-hidden rounded-[12px] border border-white/10 bg-black/20 sm:grid-cols-3 lg:mt-auto">
            {microBenefits.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 border-white/10 px-4 py-3 text-white/78 sm:border-r sm:last:border-r-0"
              >
                <span className="shrink-0 text-violet-200">{item.icon}</span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold leading-tight text-white">{item.title}</span>
                  <span className="mt-1 block text-[12px] leading-snug text-white/62">{item.text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* `flex flex-col` para que el recuadro de Bombo pueda empujarse con `mt-auto` y las
            dos columnas del hero cierren a la misma altura. */}
        <aside className="flex flex-col">
          <div className="mb-4 flex items-center justify-between gap-4 px-1">
            <h2 className="inline-flex items-center gap-2 text-base font-black tracking-tight text-white sm:text-lg">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-violet-200" fill="currentColor" aria-hidden="true">
                <path d="m12 2.75 1.7 6.05 6.05 1.7-6.05 1.7-1.7 6.05-1.7-6.05-6.05-1.7 6.05-1.7L12 2.75Z" />
              </svg>
              Eventos destacados
            </h2>
            <Link
              href="/destacados"
              className="inline-flex items-center gap-2 text-sm font-bold text-violet-200 transition hover:text-white"
            >
              Ver todos
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="space-y-3">
            {featuredEvents.length ? (
              featuredEvents.map((event, index) => (
                <EventRow key={event.id} event={event} placement="hero" priority={index === 0} />
              ))
            ) : (
              <div className="rounded-[20px] border border-dashed border-white/10 bg-black/20 p-5 text-base leading-7 text-white/62">
                Muy pronto vas a ver acá las fechas destacadas para comprar tickets.
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-[20px] border border-white/10 bg-white/[0.035] px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 lg:mt-auto">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-violet-300/30 bg-violet-500/10 text-violet-100">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="M12 3.75 5.75 6.1v5.28c0 4.08 2.64 7.68 6.25 8.87 3.61-1.19 6.25-4.79 6.25-8.87V6.1L12 3.75Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="m9.25 12.05 1.75 1.7 3.9-4.05"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/78 sm:text-base">La compra se completa en Bombo</p>
                <p className="mt-1 text-xs leading-5 text-white/48 sm:text-sm">
                  Link oficial de cada fecha · ElectroTickets no procesa el pago
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right text-sm font-black leading-[0.85] tracking-[0.18em] text-white sm:text-base">
              BOMBO
              <span className="block text-[9px] tracking-[0.28em] text-white/62 sm:text-[10px]">TICKETS</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
