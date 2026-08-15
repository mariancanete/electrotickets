import Link from "next/link";
import { EventRow } from "@/components/event-row";
import { OfficialVenues } from "@/components/official-venues";
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
          <div className="mb-4 inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[11px] font-semibold text-white/78 sm:mb-5 sm:px-3.5 sm:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_18px_rgba(61,232,245,0.85)]" />
            Argentina · Compra por Bombo
          </div>

          {/* Tercera versión del titular, y las dos anteriores fallaron por motivos opuestos.
              "Las mejores fechas de electrónica, en un solo lugar" vendía la categoría: lo
              podía firmar cualquier agregador. "La lista de la electrónica argentina" se
              apoyaba en una metáfora muerta —la lista de RRPP es cosa del pasado y ya no le
              dice nada a nadie—.

              Este nombra el lugar, que es lo que construye recordación: la respuesta a
              "¿dónde miro qué hay?". "Suena" es lengua de la noche y no de marketplace, y
              rubro y país quedan explícitos para quien llega buscando exactamente eso. */}
          <h1 className="max-w-2xl text-balance text-[2.5rem] font-black leading-[0.95] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.6rem] xl:text-[4rem]">
            Dónde suena la electrónica en Argentina.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/62 sm:mt-5 sm:text-lg">
            Cada fecha con su <span className="font-semibold text-white">link oficial</span> de Bombo, lineup y
            ubicación. Y alguien que te contesta por{" "}
            <span className="font-semibold text-white">WhatsApp</span> antes y después de comprar.
          </p>

          {/* `order` sube la franja de confianza por encima de los botones en mobile.
              Estaba al final de la columna, en 12px, después de un h1 grande, un párrafo y
              dos botones: el argumento por el que alguien elige ElectroTickets en vez de
              buscar en Bombo directo llegaba último y en el cuerpo más chico de la página.
              En desktop vuelve al pie de la columna, donde cierra parejo con la otra. */}
          <div className="order-4 mt-6 max-w-2xl overflow-hidden rounded-[12px] border border-white/10 bg-black/20 sm:mt-7 lg:order-none lg:mt-auto">
            <div className="grid grid-cols-3 gap-0">
              {microBenefits.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col items-center gap-1.5 border-r border-white/10 px-2 py-3 text-center last:border-r-0 sm:flex-row sm:items-center sm:gap-3 sm:px-4 sm:text-left"
                >
                  <span className="shrink-0 text-brand">{item.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold leading-tight text-white sm:text-[13px]">
                      {item.title}
                    </span>
                    <span className="mt-1 hidden text-[12px] leading-snug text-white/62 sm:block">{item.text}</span>
                  </span>
                </div>
              ))}
            </div>
            {/* Va adentro de la misma caja y no como bloque aparte: las otras tres señales son
                promesas del sitio, esta es un hecho verificable, y juntas se leen como una
                sola credencial en vez de como dos avisos sueltos. Además mantiene intacto el
                `lg:mt-auto` que cierra las dos columnas del hero a la misma altura. */}
            <OfficialVenues className="border-t border-white/10 px-3 py-2.5 sm:px-4" />
          </div>

          {/* En fila también en mobile: apilados sumaban ~110px de alto y empujaban la
              primera fecha fuera de la primera pantalla, que es justo lo que el usuario vino
              a ver. */}
          <div className="order-5 mt-5 flex flex-row gap-3 sm:mt-7 lg:order-none">
            <Link
              href="/eventos"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-3 text-center text-[13px] font-black text-white transition sm:text-sm hover:border-white/40 hover:bg-white/10 sm:flex-none sm:px-7"
            >
              Ver todas las fechas
              {/* La flecha empujaba el rótulo a dos líneas en 390px y desalineaba los dos
                  botones. En desktop, donde sobra ancho, vuelve. */}
              <span className="hidden sm:inline" aria-hidden="true">
                →
              </span>
            </Link>
            <Link
              href="/destacados"
              className="inline-flex flex-1 items-center justify-center rounded-full border border-white/15 bg-black/20 px-4 py-3 text-center text-[13px] font-bold text-white/78 transition sm:text-sm hover:border-white/35 hover:bg-white/10 sm:flex-none sm:px-7"
            >
              Destacados
            </Link>
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
              className="inline-flex min-h-6 items-center gap-2 text-sm font-bold text-violet-200 transition hover:text-white"
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
