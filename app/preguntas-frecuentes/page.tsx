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
    answer: "No. ElectroTickets muestra eventos y te redirige al link oficial de compra de cada fecha."
  },
  {
    question: "¿Dónde finalizo la compra?",
    answer: "La compra se completa en Bombo o en la plataforma oficial configurada para el evento."
  },
  {
    question: "¿Los links son oficiales?",
    answer: "Sí. Cada evento usa el link de vendedor correspondiente para esa fecha."
  },
  {
    question: "¿Qué hago si tengo un problema con mi ticket?",
    answer: "Como la emisión del ticket se realiza fuera de ElectroTickets, el soporte principal corresponde a la plataforma donde completaste la compra."
  },
  {
    question: "¿Cómo me entero de nuevas fechas?",
    answer: "Podés sumarte al grupo de difusión de WhatsApp desde la página de contacto o desde cualquier evento."
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

          <div className="mt-8">
            <Link href="/contacto" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/85">
              Ir a contacto
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
