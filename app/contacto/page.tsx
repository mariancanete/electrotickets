import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { VipTables } from "@/components/whatsapp-alerts";
import { WhatsappLink } from "@/components/whatsapp-link";
import { siteConfig } from "@/lib/site";
import { buildGeneralWhatsappMessage, buildVipWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contactá a ElectroTickets por consultas sobre eventos, tickets, mesas VIP y difusión."
};

export default function ContactPage() {
  const contactUrl = whatsappUrlOrGroup(buildGeneralWhatsappMessage());

  return (
    <>
      <SiteHeader />
      <main className="px-4 py-14 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-4xl space-y-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200/70">Contacto</p>
            <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">Hablemos por WhatsApp</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/62">
              Consultas sobre fechas, links de compra, precios, mesas VIP o novedades de próximos eventos.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <WhatsappLink href={contactUrl} source="contact_page" className="glass rounded-[20px] p-6 transition hover:bg-white/10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">WhatsApp directo</p>
              <h2 className="mt-3 text-2xl font-black">Consultar a {siteConfig.whatsappContactName}</h2>
              <p className="mt-3 text-base leading-7 text-white/62">
                Abrí un chat directo para preguntar por una fecha, un precio o disponibilidad.
              </p>
            </WhatsappLink>

            <WhatsappLink
              href={siteConfig.whatsappGroup}
              source="contact_group"
              kind="group"
              className="glass rounded-[20px] p-6 transition hover:bg-white/10"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">Grupo de difusión</p>
              <h2 className="mt-3 text-2xl font-black">Sumarme al grupo</h2>
              <p className="mt-3 text-base leading-7 text-white/62">
                Recibí próximas fechas, preventas, últimas entradas y links de compra.
              </p>
            </WhatsappLink>
          </div>

          <VipTables source="home_vip" href={whatsappUrlOrGroup(buildVipWhatsappMessage())} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
