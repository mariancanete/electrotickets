import type { Metadata } from "next";
import { ScreenHeader } from "@/components/app-header";
import { BottomNav, NavSpacer } from "@/components/bottom-nav";
import { Icon } from "@/components/icons";
import { WhatsappLink } from "@/components/whatsapp-link";
import { siteConfig } from "@/lib/site";
import { buildGeneralWhatsappMessage, buildVipWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";
import { DesktopHeader } from "@/components/desktop-header";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contactá a ElectroTickets por consultas sobre eventos, tickets, mesas VIP y difusión."
};

/**
 * Contacto, en el sistema Hora Pico.
 *
 * Los tres canales van delineados y no rellenos: WhatsApp es siempre secundario en este
 * sistema. Rellenarlos de verde los pondría a competir con el chartreuse y la app dejaría
 * de tener un solo color de acción.
 */
export default function ContactPage() {
  const contactUrl = whatsappUrlOrGroup(buildGeneralWhatsappMessage());
  const vipUrl = whatsappUrlOrGroup(buildVipWhatsappMessage());

  return (
    <>
      <DesktopHeader />
      <main className="flex min-h-screen flex-col pt-2">
        <ScreenHeader title="Contacto" backHref="/" />

        <div className="flex flex-col gap-[14px] px-[18px]">
          <div>
            <h2 className="text-[24px] font-bold leading-[1.15] tracking-[-0.03em]">Hablemos por WhatsApp</h2>
            <p className="mt-3 text-[13.5px] leading-[1.65] text-white/60">
              Consultas sobre fechas, links de compra, precios, mesas VIP o novedades de próximos eventos.
            </p>
          </div>

          <WhatsappLink href={contactUrl} source="contact_page" className="block">
            <ChannelCard
              icon="chat"
              eyebrow="WhatsApp directo"
              title={`Consultar a ${siteConfig.whatsappContactName}`}
              text="Abrí un chat directo para preguntar por una fecha, un precio o disponibilidad."
            />
          </WhatsappLink>

          <WhatsappLink href={siteConfig.whatsappGroup} source="contact_group" kind="group" className="block">
            <ChannelCard
              icon="bell"
              eyebrow="Grupo de difusión"
              title="Sumarme al grupo"
              text="Recibí próximas fechas, preventas, últimas entradas y links de compra."
            />
          </WhatsappLink>

          <WhatsappLink href={vipUrl} source="home_vip" className="block">
            <ChannelCard
              icon="shield"
              eyebrow="Mesas y cortesías"
              title="Consultar por VIP"
              text="Disponibilidad y condiciones de mesas VIP y cortesías para la fecha que te interese."
            />
          </WhatsappLink>

          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center rounded-full border border-white/[0.18] text-[14px] font-bold text-white/[0.78]"
          >
            Instagram
          </a>
        </div>

        <NavSpacer />
      </main>
      <BottomNav />
    </>
  );
}

function ChannelCard({
  icon,
  eyebrow,
  title,
  text
}: {
  icon: "chat" | "bell" | "shield";
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-card border border-white/10 bg-surface p-[15px]">
      <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[11px] bg-marca text-white">
        <Icon name={icon} size={19} />
      </span>
      <span className="min-w-0">
        <span className="dato-seccion block">{eyebrow}</span>
        <span className="mt-[7px] block text-[16px] font-bold leading-[1.15] tracking-[-0.02em]">{title}</span>
        <span className="mt-[6px] block text-[12.5px] leading-[1.5] text-white/55">{text}</span>
      </span>
    </div>
  );
}
