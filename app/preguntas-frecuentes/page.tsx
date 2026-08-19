import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { TabHeader } from "@/components/app-header";
import { BottomNav, NavSpacer } from "@/components/bottom-nav";
import { Icon } from "@/components/icons";
import { bomboAppLinks } from "@/lib/site";
import { buildGeneralWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";
import { DesktopHeader } from "@/components/desktop-header";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Preguntas frecuentes sobre ElectroTickets, compra de tickets y links oficiales."
};

type FaqItem = {
  question: string;
  answer: ReactNode;
};

/**
 * Los textos son los del sitio, sin reescribir. Son las respuestas que ya se dieron por
 * WhatsApp cientos de veces y están calibradas para no prometer lo que no se puede cumplir;
 * "mejorarlas" de memoria es la forma más rápida de introducir una promesa nueva.
 *
 * Los links dentro de una respuesta van subrayados en blanco, nunca como botón: un botón
 * dentro de una respuesta compite con el CTA de la pantalla, y esta pantalla justamente no
 * tiene CTA.
 */
const faqs: FaqItem[] = [
  {
    question: "¿ElectroTickets vende tickets directamente?",
    answer:
      "No. ElectroTickets es una agenda especializada: publicamos las fechas con toda su información y te llevamos al link oficial de compra de cada una. No emitimos entradas ni procesamos pagos."
  },
  {
    question: "¿Dónde finalizo la compra?",
    answer:
      "En Bombo, que es la plataforma oficial del evento. Ahí ves el precio y la disponibilidad actualizados, y completás el pago."
  },
  {
    question: "¿Por qué no veo los precios en la web?",
    answer:
      "Los precios y los lotes los define la productora y cambian seguido, así que mostrarlos acá podría desactualizarse. El valor vigente siempre está en Bombo. Si querés saberlo antes de salir del sitio, escribinos por WhatsApp y te lo pasamos."
  },
  {
    question: "¿Los links son oficiales?",
    answer:
      "Sí. Cada evento usa el link de vendedor que corresponde a esa fecha, y lo verificamos al publicarla."
  },
  {
    question: "¿Puedo consultar por mesas VIP o cortesías?",
    answer:
      "Sí, es parte de lo que hacemos. Escribinos por WhatsApp indicando la fecha y te pasamos disponibilidad y condiciones."
  },
  {
    question: "¿Qué hago si tengo un problema con mi ticket?",
    answer:
      "Como la emisión se realiza en Bombo, el soporte formal corresponde a esa plataforma. Igual escribinos: te ayudamos a encontrar el canal correcto y hacemos el seguimiento con vos."
  },
  {
    question: "¿Qué pasa si el evento se cancela o cambia de fecha?",
    answer:
      "Esas decisiones las toma la productora y se comunican a través de Bombo, que es donde está registrada tu compra. Cuando nos enteramos, lo avisamos por el grupo de difusión y actualizamos la página del evento."
  },
  {
    question: "¿Cómo me entero de nuevas fechas?",
    answer:
      "Sumate al grupo de difusión de WhatsApp o pedinos que te agreguemos a las alertas. Mandamos novedades importantes: nuevas fechas, preventas y últimas entradas."
  },
  {
    question: "¿Necesito la app de Bombo para comprar?",
    answer: (
      <>
        Sí. Para completar la compra necesitás tener la app de Bombo instalada. Podés descargarla desde{" "}
        <a
          href={bomboAppLinks.ios}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-white underline decoration-white/40 underline-offset-4"
        >
          App Store
        </a>{" "}
        o{" "}
        <a
          href={bomboAppLinks.android}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-white underline decoration-white/40 underline-offset-4"
        >
          Google Play
        </a>
        .
      </>
    )
  }
];

/**
 * Pantalla 09 — Ayuda.
 *
 * **Cero chartreuse, a propósito.** Esta pantalla no convierte: quien llega acá tiene una
 * duda, no una intención de compra, y ofrecerle un botón de comprar entre las respuestas
 * sería contestarle otra cosa. El único acento es el bloque ultramar de contacto, y el tab
 * activo del nav se resuelve en blanco en lugar del chartreuse habitual.
 *
 * El acordeón usa `<details>`: abre y cierra sin JavaScript, y el contenido de las respuestas
 * queda en el HTML aunque estén cerradas, que es lo que necesita el indexado.
 */
export default function FaqPage() {
  const contactUrl = whatsappUrlOrGroup(buildGeneralWhatsappMessage());

  const contacto = (
    <div className="flex flex-col gap-3 rounded-card border border-marca-edge bg-marca-tint p-[15px] lg:gap-[14px] lg:rounded-block lg:p-[22px]">
      <div className="flex items-start gap-[11px] lg:flex-col lg:gap-[14px]">
        <span className="flex-none text-marca-ink">
          <Icon name="chat" size={20} className="lg:hidden" />
          <Icon name="chat" size={24} className="hidden lg:block" />
        </span>
        <span>
          <span className="block text-[15px] font-bold leading-[1.2] lg:text-[18px] lg:tracking-[-0.02em]">
            ¿No estaba tu pregunta?
          </span>
          <span className="mt-[6px] block text-[12.5px] leading-[1.5] text-white/[0.72] lg:text-[13.5px] lg:leading-[1.6]">
            Escribinos por WhatsApp con la fecha y te respondemos.
          </span>
        </span>
      </div>
      <a
        href={contactUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-out t150 flex h-12 items-center justify-center gap-2 rounded-full border border-white/40 text-white"
      >
        <Icon name="chat" size={16} />
        <span className="text-[14px] font-bold leading-none">Hablar por WhatsApp</span>
      </a>
    </div>
  );

  return (
    <>
      <DesktopHeader />
      <main className="app-shell flex min-h-screen flex-col pt-2 lg:pt-0">
        <div className="col-ayuda gutter-lg lg:pb-[50px] lg:pt-[38px]">
          {/* Columna de título y contacto. En desktop se separa del acordeón; en mobile es
              simplemente la cabecera y el contacto queda al final, como estaba. */}
          <div className="flex flex-col lg:gap-4">
            <TabHeader eyebrow="Ayuda" title="Preguntas frecuentes" description="Compra, links oficiales y contacto." />

            {/* El contacto sube a la columna izquierda solo desde 1280: entre 1024 y 1279 la
                columna es demasiado angosta y el bloque queda mejor al final del acordeón. */}
            <div className="mt-[10px] hidden xl:block">{contacto}</div>
          </div>

          <div className="gutter flex flex-col gap-[9px] lg:px-0">
            {faqs.map((item, index) => (
              <details
                key={item.question}
                // La primera abre por defecto: deja ver de qué se trata el acordeón sin
                // obligar a un toque a ciegas.
                open={index === 0}
                // El ítem abierto sube el borde de .10 a .16 y **no cambia de fondo**: mover
                // el fondo haría saltar la lista entera cada vez que se abre algo.
                className="acc-hov t150 group rounded-card border border-white/10 bg-surface p-[14px] open:border-white/[0.16] lg:p-[18px]"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                  <span className="text-[14.5px] font-bold leading-[1.3] text-white lg:text-[16px]">
                    {item.question}
                  </span>
                  <span className="acc-icon t150 grid h-6 w-6 flex-none place-items-center text-white/50 group-open:text-white/85">
                    <span className="group-open:hidden">
                      <Icon name="plus" size={16} />
                    </span>
                    <span className="hidden group-open:block">
                      <Icon name="minus" size={16} />
                    </span>
                  </span>
                </summary>
                {/* El ancho de línea de las respuestas no pasa de 640px: más largo que eso el
                    ojo pierde el renglón al volver. */}
                <div className="mt-[10px] max-w-[640px] text-[13px] leading-[1.6] text-white/[0.62] lg:text-[14px]">
                  {item.answer}
                </div>
              </details>
            ))}

            <div className="xl:hidden">{contacto}</div>

            {/**
             * Enlaces al resto del sitio.
             *
             * Con el nav de 4 destinos no queda footer, y estas tres páginas se convertirían
             * en huérfanas: URLs indexadas a las que no llega ningún link interno. Ayuda es el
             * lugar natural para colgarlas —quien busca "quiénes son" o "cómo me contacto" ya
             * está acá—, y van en texto chico y blanco tenue para no competir con el bloque
             * de contacto.
             */}
            <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pt-2 text-[12px] leading-none text-white/45 lg:justify-start lg:pt-4">
              <Link href="/quienes-somos" className="t150 underline decoration-white/25 underline-offset-4 hover:text-white">
                Quiénes somos
              </Link>
              <span aria-hidden="true">·</span>
              <Link href="/contacto" className="t150 underline decoration-white/25 underline-offset-4 hover:text-white">
                Contacto
              </Link>
              <span aria-hidden="true">·</span>
              <Link href="/privacidad" className="t150 underline decoration-white/25 underline-offset-4 hover:text-white">
                Privacidad
              </Link>
            </nav>
          </div>
        </div>

        <NavSpacer />
      </main>
      <BottomNav />
    </>
  );
}
