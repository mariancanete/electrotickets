import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Preguntas frecuentes sobre ElectroTickets, compra de tickets y links oficiales."
};

const faqs = [
  [
    "¿ElectroTickets vende tickets directamente?",
    "No. ElectroTickets muestra eventos y te redirige al link oficial de compra de cada fecha."
  ],
  [
    "¿Dónde finalizo la compra?",
    "La compra se completa en Bombo o en la plataforma oficial configurada para el evento."
  ],
  [
    "¿Los links son oficiales?",
    "Sí. Cada evento usa el link de vendedor correspondiente para esa fecha."
  ],
  [
    "¿Qué hago si tengo un problema con mi ticket?",
    "Como la emisión del ticket se realiza fuera de ElectroTickets, el soporte principal corresponde a la plataforma donde completaste la compra."
  ],
  [
    "¿Cómo me entero de nuevas fechas?",
    "Podés sumarte al grupo de difusión de WhatsApp desde la página de contacto o desde cualquier evento."
  ]
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
            {faqs.map(([question, answer]) => (
              <details key={question} className="glass rounded-[1.6rem] p-5">
                <summary className="cursor-pointer text-lg font-bold text-white">{question}</summary>
                <p className="mt-4 leading-7 text-white/58">{answer}</p>
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
