import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsappLink } from "@/components/whatsapp-link";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { buildGeneralWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";

/**
 * PERSONALIZAR ANTES DE PRODUCCIÓN:
 * esta página dice solamente lo que el proyecto puede sostener hoy. No incluye cantidad de
 * clientes, años de experiencia ni testimonios porque no hay dato real que los respalde, y
 * una credencial inventada destruye exactamente la confianza que la página busca construir.
 *
 * Lo que más suma acá es lo que solo vos podés agregar: nombre completo, una foto y el
 * tiempo típico de respuesta por WhatsApp. En un negocio de RRPP, la cara es el producto.
 */

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Qué es ElectroTickets, cómo funciona la compra a través de Bombo y qué soporte ofrecemos antes y después de comprar.",
  alternates: { canonical: absoluteUrl("/quienes-somos") }
};

const steps = [
  {
    title: "Publicamos la fecha",
    text: "Cargamos cada evento con lineup, venue, horario y el link oficial de venta que corresponde a esa fecha."
  },
  {
    title: "Vos elegís",
    text: "Revisás la información, escuchás el videoset y consultás lo que necesites por WhatsApp antes de decidir."
  },
  {
    title: "Comprás en Bombo",
    text: "Al tocar comprar te abrimos el evento en Bombo. Ahí ves el precio, la disponibilidad y completás el pago."
  },
  {
    title: "Seguimos disponibles",
    text: "Si tenés un problema con la entrada, escribinos y te ayudamos a gestionarlo con la plataforma."
  }
];

export default function AboutPage() {
  const contactUrl = whatsappUrlOrGroup(buildGeneralWhatsappMessage());

  return (
    <>
      <SiteHeader />
      <main className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200/70">Quiénes somos</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            Una agenda de electrónica con asistencia real
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/60">
            ElectroTickets es una agenda especializada en música electrónica en Argentina. Centralizamos las fechas
            que importan, verificamos el link de compra de cada una y te acompañamos por WhatsApp antes y después de
            comprar.
          </p>

          <section className="glass mt-10 rounded-[2rem] p-6 sm:p-8">
            <h2 className="text-2xl font-black">Qué somos y qué no somos</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/[0.06] p-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200/80">Sí hacemos</p>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-white/65">
                  <li>· Publicamos y mantenemos la agenda de fechas.</li>
                  <li>· Verificamos el link de compra de cada evento.</li>
                  <li>· Consolidamos lineup, venue, horario y ubicación.</li>
                  <li>· Respondemos consultas por WhatsApp.</li>
                  <li>· Gestionamos mesas VIP y cortesías.</li>
                  <li>· Avisamos de nuevas fechas y últimas entradas.</li>
                </ul>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/45">No hacemos</p>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-white/55">
                  <li>· No emitimos las entradas.</li>
                  <li>· No procesamos el pago.</li>
                  <li>· No definimos precios ni lotes.</li>
                  <li>· No organizamos los eventos.</li>
                </ul>
                <p className="mt-4 text-sm leading-6 text-white/45">
                  Todo eso ocurre en Bombo, que es la plataforma oficial donde se completa la compra.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">Cómo funciona la compra</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {steps.map((step, index) => (
                <div key={step.title} className="glass rounded-[1.6rem] p-5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-xs font-black text-black">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{step.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass mt-8 rounded-[2rem] p-6 sm:p-8">
            <h2 className="text-2xl font-black">Si algo sale mal</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-white/60">
              <p>
                <span className="font-bold text-white">Problemas con una entrada ya comprada.</span> Como la emisión
                se hace en Bombo, el soporte formal corresponde a esa plataforma. De todos modos, escribinos: te
                ayudamos a encontrar el canal correcto y a hacer el seguimiento.
              </p>
              <p>
                <span className="font-bold text-white">Cancelaciones o cambios de fecha.</span> Las define la
                productora del evento y se comunican a través de Bombo. Cuando nos enteramos, lo avisamos por el
                grupo de difusión y actualizamos la página del evento.
              </p>
              <p>
                <span className="font-bold text-white">Dudas antes de comprar.</span> Escribinos por WhatsApp. Es el
                canal más rápido y el que usamos para consultas de precio, disponibilidad y mesas.
              </p>
            </div>
          </section>

          <section className="glass mt-8 rounded-[2rem] p-6 sm:p-8">
            <h2 className="text-2xl font-black">Hablemos</h2>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Consultas sobre fechas, links de compra, mesas VIP o cortesías.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <WhatsappLink
                href={contactUrl}
                source="contact_page"
                className="rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-black text-black transition hover:bg-emerald-300"
              >
                Escribir por WhatsApp
              </WhatsappLink>
              <WhatsappLink
                href={siteConfig.whatsappGroup}
                source="contact_group"
                kind="group"
                className="rounded-full border border-emerald-300/30 px-6 py-3.5 text-sm font-bold text-emerald-100 transition hover:bg-emerald-300/10"
              >
                Grupo de difusión
              </WhatsappLink>
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 px-6 py-3.5 text-sm font-bold text-white/80 transition hover:bg-white/10"
              >
                Instagram
              </a>
            </div>
          </section>

          <div className="mt-10">
            <Link
              href="/eventos"
              className="rounded-full bg-white px-6 py-3.5 text-sm font-black text-black transition hover:bg-white/85"
            >
              Ver próximas fechas
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
