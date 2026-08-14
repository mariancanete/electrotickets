import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { bomboAppLinks } from "@/lib/site";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Preguntas frecuentes sobre ElectroTickets, compra de tickets y links oficiales."
};

type FaqItem = {
  question: string;
  answer: ReactNode;
};

const faqs: FaqItem[] = [
  {
    question: "¿ElectroTickets vende tickets directamente?",
    answer: "No. ElectroTickets es una agenda especializada: publicamos las fechas con toda su información y te llevamos al link oficial de compra de cada una. No emitimos entradas ni procesamos pagos."
  },
  {
    question: "¿Dónde finalizo la compra?",
    answer: "En Bombo, que es la plataforma oficial del evento. Ahí ves el precio y la disponibilidad actualizados, y completás el pago."
  },
  {
    question: "¿Por qué no veo los precios en la web?",
    answer: "Los precios y los lotes los define la productora y cambian seguido, así que mostrarlos acá podría desactualizarse. El valor vigente siempre está en Bombo. Si querés saberlo antes de salir del sitio, escribinos por WhatsApp y te lo pasamos."
  },
  {
    question: "¿Los links son oficiales?",
    answer: "Sí. Cada evento usa el link de vendedor que corresponde a esa fecha, y lo verificamos al publicarla."
  },
  {
    question: "¿Puedo consultar por mesas VIP o cortesías?",
    answer: "Sí, es parte de lo que hacemos. Escribinos por WhatsApp indicando la fecha y te pasamos disponibilidad y condiciones."
  },
  {
    question: "¿Qué hago si tengo un problema con mi ticket?",
    answer: "Como la emisión se realiza en Bombo, el soporte formal corresponde a esa plataforma. Igual escribinos: te ayudamos a encontrar el canal correcto y hacemos el seguimiento con vos."
  },
  {
    question: "¿Qué pasa si el evento se cancela o cambia de fecha?",
    answer: "Esas decisiones las toma la productora y se comunican a través de Bombo, que es donde está registrada tu compra. Cuando nos enteramos, lo avisamos por el grupo de difusión y actualizamos la página del evento."
  },
  {
    question: "¿Cómo me entero de nuevas fechas?",
    answer: "Sumate al grupo de difusión de WhatsApp o pedinos que te agreguemos a las alertas. Mandamos novedades importantes: nuevas fechas, preventas y últimas entradas."
  },
  {
    question: "¿Necesito la app de Bombo para comprar?",
    answer: (
      <>
        Sí. Para completar la compra necesitás tener la app de Bombo instalada. Podés descargarla desde{" "}
        <a href={bomboAppLinks.ios} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline decoration-white/25 underline-offset-4 transition hover:decoration-white">
          App Store
        </a>{" "}
        o{" "}
        <a href={bomboAppLinks.android} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline decoration-white/25 underline-offset-4 transition hover:decoration-white">
          Google Play
        </a>
        .
      </>
    )
  }
];

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-4 py-14 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200/70">FAQ</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">Preguntas frecuentes</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/58">
            Respuestas rápidas sobre compra, links oficiales y contacto.
          </p>

          <div className="mt-10 space-y-4">
            {faqs.map((item) => (
              <details key={item.question} className="glass rounded-[1.6rem] p-5">
                <summary className="cursor-pointer text-lg font-bold text-white">{item.question}</summary>
                <p className="mt-4 leading-7 text-white/58">{item.answer}</p>
              </details>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contacto" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/85">
              Ir a contacto
            </Link>
            <Link
              href="/quienes-somos"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10"
            >
              Quiénes somos
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
