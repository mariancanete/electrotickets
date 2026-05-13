import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";
import { buildWhatsappDirectUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contactá a ElectroTickets por consultas sobre eventos, tickets y difusión."
};

export default function ContactPage() {
  const contactUrl = buildWhatsappDirectUrl(
    siteConfig.whatsappNumber,
    `Hola ${siteConfig.whatsappContactName}, quiero hacer una consulta sobre ElectroTickets.`
  );

  return (
    <>
      <SiteHeader />
      <main className="px-4 py-14 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200/70">Contacto</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">Hablemos por WhatsApp</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/58">
            Consultas sobre eventos, links de compra, grupos de difusión o novedades de próximas fechas.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {contactUrl ? (
              <a
                href={contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-[2rem] p-6 transition hover:bg-white/10"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">WhatsApp directo</p>
                <h2 className="mt-3 text-2xl font-black">Consultar a {siteConfig.whatsappContactName}</h2>
                <p className="mt-3 text-sm leading-6 text-white/55">Abrí un chat directo para hacer tu consulta.</p>
              </a>
            ) : null}

            <a
              href={siteConfig.whatsappGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-[2rem] p-6 transition hover:bg-white/10"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">Grupo de difusión</p>
              <h2 className="mt-3 text-2xl font-black">Sumarme al grupo</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">Recibí próximas fechas, novedades y links de compra.</p>
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
