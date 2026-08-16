import type { Metadata } from "next";
import Link from "next/link";
import { ScreenHeader } from "@/components/app-header";
import { BottomNav, NavSpacer } from "@/components/bottom-nav";
import { InfoBlock } from "@/components/chips";
import { Icon } from "@/components/icons";
import { WhatsappLink } from "@/components/whatsapp-link";
import { credentials } from "@/lib/credentials";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { buildGeneralWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";

/**
 * PERSONALIZAR ANTES DE PRODUCCIÓN:
 * esta página dice solamente lo que el proyecto puede sostener hoy. No incluye cantidad de
 * clientes, años de experiencia ni testimonios porque no hay dato real que los respalde, y
 * una credencial inventada destruye exactamente la confianza que la página busca construir.
 *
 * Ya cargado: los venues donde ElectroTickets es RRPP oficial, que viven en
 * `lib/credentials.ts`.
 *
 * Lo que sigue faltando es lo que solo vos podés agregar: nombre completo, una foto y el
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

const weDo = [
  "Publicamos y mantenemos la agenda de fechas.",
  "Verificamos el link de compra de cada evento.",
  "Consolidamos lineup, venue, horario y ubicación.",
  "Respondemos consultas por WhatsApp.",
  "Gestionamos mesas VIP y cortesías.",
  "Avisamos de nuevas fechas y últimas entradas."
];

const weDont = [
  "No emitimos las entradas.",
  "No procesamos el pago.",
  "No definimos precios ni lotes.",
  "No organizamos los eventos."
];

/**
 * Página de confianza, en el sistema Hora Pico.
 *
 * **Cero chartreuse**, igual que Ayuda: acá no se compra, se decide si confiar. El único
 * acento es el bloque ultramar de la credencial, y los dos botones de WhatsApp van
 * delineados porque WhatsApp es siempre secundario.
 */
export default function AboutPage() {
  const contactUrl = whatsappUrlOrGroup(buildGeneralWhatsappMessage());
  const venues = credentials.officialVenues;

  return (
    <>
      <main className="flex min-h-screen flex-col pt-2">
        <ScreenHeader title="Quiénes somos" backHref="/" />

        <div className="flex flex-col gap-5 px-[18px]">
          <div>
            <h2 className="text-[24px] font-bold leading-[1.15] tracking-[-0.03em]">
              Una agenda de electrónica con asistencia real
            </h2>
            <p className="mt-3 text-[13.5px] leading-[1.65] text-white/60">
              ElectroTickets es una agenda especializada en música electrónica en Argentina. Centralizamos las fechas
              que importan, verificamos el link de compra de cada una y te acompañamos por WhatsApp antes y después
              de comprar.
            </p>
          </div>

          {/* Los venues donde somos RRPP oficial son la razón concreta por la que los links
              son oficiales y no una promesa. Si el archivo queda vacío, no se renderiza. */}
          {venues.length ? (
            <InfoBlock icon="shield">
              Somos RRPP oficial de {venues.length === 1 ? venues[0] : `${venues.slice(0, -1).join(", ")} y ${venues[venues.length - 1]}`}.
            </InfoBlock>
          ) : null}

          <section>
            <h3 className="dato-seccion">Qué hacemos</h3>
            <ul className="mt-3 flex flex-col gap-2 rounded-card border border-white/10 bg-surface p-[15px]">
              {weDo.map((item) => (
                <li key={item} className="flex gap-[10px] text-[13.5px] leading-[1.5] text-white/[0.72]">
                  <span className="mt-[2px] flex-none text-white">
                    <Icon name="check" size={15} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="dato-seccion">Qué no hacemos</h3>
            <ul className="mt-3 flex flex-col gap-2 rounded-card border border-white/10 bg-surface p-[15px]">
              {weDont.map((item) => (
                <li key={item} className="flex gap-[10px] text-[13.5px] leading-[1.5] text-white/55">
                  <span className="mt-[2px] flex-none text-white/40">
                    <Icon name="x" size={15} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12.5px] leading-[1.5] text-white/45">
              Todo eso ocurre en Bombo, que es la plataforma oficial donde se completa la compra.
            </p>
          </section>

          <section>
            <h3 className="dato-seccion">Cómo funciona la compra</h3>
            <ol className="mt-3 flex flex-col gap-[13px]">
              {steps.map((step, index) => (
                <li key={step.title} className="flex items-start gap-3">
                  <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-full bg-marca font-mono text-[12px] font-extrabold leading-none">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-[14px] font-bold leading-[1.2]">{step.title}</span>
                    <span className="mt-[5px] block text-[13px] leading-[1.5] text-white/60">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h3 className="dato-seccion">Si algo sale mal</h3>
            <div className="mt-3 flex flex-col gap-3">
              <Note title="Problemas con una entrada ya comprada.">
                Como la emisión se hace en Bombo, el soporte formal corresponde a esa plataforma. De todos modos,
                escribinos: te ayudamos a encontrar el canal correcto y a hacer el seguimiento.
              </Note>
              <Note title="Cancelaciones o cambios de fecha.">
                Las define la productora del evento y se comunican a través de Bombo. Cuando nos enteramos, lo
                avisamos por el grupo de difusión y actualizamos la página del evento.
              </Note>
              <Note title="Dudas antes de comprar.">
                Escribinos por WhatsApp. Es el canal más rápido y el que usamos para consultas de precio,
                disponibilidad y mesas.
              </Note>
            </div>
          </section>

          <div className="flex flex-col gap-3 rounded-card border border-marca-edge bg-marca-tint p-[15px]">
            <div className="flex items-start gap-[11px]">
              <span className="flex-none text-marca-ink">
                <Icon name="chat" size={20} />
              </span>
              <span>
                <span className="block text-[15px] font-bold leading-[1.2]">Hablemos</span>
                <span className="mt-[6px] block text-[12.5px] leading-[1.5] text-white/[0.72]">
                  Consultas sobre fechas, links de compra, mesas VIP o cortesías.
                </span>
              </span>
            </div>
            <WhatsappLink
              href={contactUrl}
              source="contact_page"
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/40 text-[14px] font-bold text-white"
            >
              <Icon name="chat" size={16} />
              Escribir por WhatsApp
            </WhatsappLink>
            <WhatsappLink
              href={siteConfig.whatsappGroup}
              source="contact_group"
              kind="group"
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/[0.18] text-[14px] font-bold text-white/[0.78]"
            >
              <Icon name="bell" size={16} />
              Grupo de difusión
            </WhatsappLink>
          </div>

          <Link
            href="/eventos"
            className="flex h-12 items-center justify-center rounded-full border border-white/40 text-[14px] font-bold text-white"
          >
            Ver próximas fechas
          </Link>
        </div>

        <NavSpacer />
      </main>
      <BottomNav />
    </>
  );
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-white/10 bg-surface p-[14px]">
      <p className="text-[13.5px] leading-[1.55] text-white/60">
        <span className="font-bold text-white">{title}</span> {children}
      </p>
    </div>
  );
}
