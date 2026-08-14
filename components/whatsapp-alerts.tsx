import { WhatsappLink } from "@/components/whatsapp-link";
import type { WhatsappSource } from "@/lib/analytics";
import { siteConfig } from "@/lib/site";
import { buildAlertsWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";

/**
 * Bloque de captura por WhatsApp.
 *
 * Es el único mecanismo de retorno del sitio: la compra se completa en Bombo y de ahí el
 * usuario no vuelve. Quien llega desde Google, mira y no compra hoy, se iba sin dejar
 * ningún punto de contacto. Va en la home, en los estados vacíos, en los Sold Out y en las
 * fechas ya finalizadas, cada uno con su propio `source` para saber cuál captura.
 */
export function WhatsappAlerts({
  source,
  title = "No te pierdas la próxima fecha",
  text = "Recibí nuevas fechas, preventas, cambios de lote y últimas entradas por WhatsApp.",
  compact = false
}: {
  source: WhatsappSource;
  title?: string;
  text?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.75rem] border border-emerald-300/20 bg-emerald-400/[0.06] ${
        compact ? "p-5" : "p-6 sm:p-7"
      }`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className={`font-black tracking-tight text-white ${compact ? "text-lg" : "text-2xl"}`}>{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">{text}</p>
          <p className="mt-2 text-xs text-white/40">Solo novedades importantes. Sin mensajes todos los días.</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <WhatsappLink
            href={whatsappUrlOrGroup(buildAlertsWhatsappMessage())}
            source={source}
            className="rounded-full bg-emerald-400 px-5 py-3 text-center text-sm font-black text-black transition hover:bg-emerald-300"
          >
            Recibir alertas
          </WhatsappLink>
          <WhatsappLink
            href={siteConfig.whatsappGroup}
            source={source}
            kind="group"
            className="rounded-full border border-emerald-300/30 px-5 py-3 text-center text-sm font-bold text-emerald-100 transition hover:bg-emerald-300/10"
          >
            Grupo de difusión
          </WhatsappLink>
        </div>
      </div>
    </div>
  );
}

/**
 * Mesas VIP y cortesías.
 *
 * Es lo único que se vende de punta a punta en canal propio: la consulta entra por WhatsApp
 * y se cierra ahí, así que a diferencia del ticket —que se completa en Bombo y solo se puede
 * conciliar a mano— este embudo se ve entero. Es además la razón visible para elegir
 * ElectroTickets en vez de ir directo a Bombo.
 */
export function VipTables({
  source,
  eventTitle,
  eventSlug,
  href
}: {
  source: WhatsappSource;
  eventTitle?: string;
  eventSlug?: string;
  href: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-amber-200/20 bg-gradient-to-br from-amber-300/[0.09] to-transparent p-6 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200/80">Atención personalizada</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Mesas VIP y cortesías</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
            {eventTitle
              ? `Consultá disponibilidad de mesas y cortesías para ${eventTitle}. Te respondemos por WhatsApp.`
              : "Consultá disponibilidad de mesas y cortesías para las próximas fechas. Te respondemos por WhatsApp."}
          </p>
        </div>
        <WhatsappLink
          href={href}
          source={source}
          eventSlug={eventSlug}
          className="shrink-0 rounded-full bg-amber-200 px-6 py-3 text-center text-sm font-black text-black transition hover:bg-amber-100"
        >
          Consultar mesas
        </WhatsappLink>
      </div>
    </div>
  );
}
