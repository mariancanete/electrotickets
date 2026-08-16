import type { Metadata } from "next";
import { ScreenHeader } from "@/components/app-header";
import { BottomNav, NavSpacer } from "@/components/bottom-nav";
import { absoluteUrl, siteConfig } from "@/lib/site";

/**
 * El sitio carga Google Analytics 4 y Microsoft Clarity, que dejan cookies y registran
 * comportamiento de navegación. Tener una página que lo declare es lo esperable, y además es
 * requisito de las plataformas de ads si en algún momento se hace campaña. Describe
 * exactamente lo que hace el código, sin promesas que no se cumplan.
 *
 * PERSONALIZAR: si en algún momento se agrega un formulario de email o un CRM, hay que
 * actualizar esta página. Lo mismo si cambia lo que guarda "Mis entradas".
 */

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Qué datos recopila ElectroTickets, con qué herramientas y cómo contactarnos al respecto.",
  alternates: { canonical: absoluteUrl("/privacidad") },
  robots: { index: true, follow: true }
};

export default function PrivacyPage() {
  return (
    <>
      <main className="flex min-h-screen flex-col pt-2">
        <ScreenHeader title="Privacidad" backHref="/" />

        <div className="flex flex-col gap-5 px-[18px]">
          <div>
            <h2 className="text-[24px] font-bold leading-[1.15] tracking-[-0.03em]">Política de privacidad</h2>
            <p className="mt-2 font-mono text-[11px] font-bold uppercase leading-none tracking-[0.16em] text-white/45">
              Última actualización: agosto 2026
            </p>
          </div>

          <Section title="Qué datos recopilamos">
            <p>
              ElectroTickets no tiene cuentas de usuario y no te pide datos personales para navegar el sitio. No
              procesamos pagos ni almacenamos información de tarjetas: la compra se completa íntegramente en Bombo,
              bajo sus propias políticas.
            </p>
            <p>Recopilamos, de forma agregada y no nominal:</p>
            <ul className="flex flex-col gap-2">
              <li>· Páginas visitadas, origen del tráfico, tipo de dispositivo y navegador.</li>
              <li>· Clics en los botones de compra, para saber qué fechas y qué secciones del sitio generan interés.</li>
              <li>
                · Un identificador de sesión aleatorio guardado en una cookie propia, que sirve para no contar varias
                veces al mismo visitante. No está asociado a tu identidad.
              </li>
            </ul>
          </Section>

          {/* Bloque nuevo: "Mis entradas" guarda algo en el dispositivo, y aunque no sea un
              dato personal ni salga del teléfono, una política de privacidad que no lo
              menciona está incompleta. */}
          <Section title="Mis entradas">
            <p>
              Cuando tocás comprar, guardamos la fecha en la memoria de tu propio navegador para poder mostrártela
              después en &laquo;Mis entradas&raquo;. Esa lista no viaja a ningún servidor, no está asociada a tu identidad y no
              la podemos ver. Se borra si limpiás los datos del navegador.
            </p>
          </Section>

          <Section title="Herramientas de terceros">
            <p>
              Usamos <strong className="font-semibold text-white/[0.78]">Google Analytics 4</strong> para métricas de
              audiencia y <strong className="font-semibold text-white/[0.78]">Microsoft Clarity</strong> para entender
              cómo se usa el sitio. Ambas utilizan cookies y se rigen por sus propias políticas de privacidad. Podés
              bloquearlas desde la configuración de tu navegador sin que eso afecte el funcionamiento del sitio.
            </p>
            <p>
              Al tocar un botón de compra te redirigimos a Bombo agregando parámetros que identifican a
              ElectroTickets como origen de la visita. A partir de ahí aplican los términos y la política de
              privacidad de Bombo.
            </p>
          </Section>

          <Section title="WhatsApp">
            <p>
              Si nos escribís por WhatsApp, la conversación queda en esa plataforma bajo sus propias condiciones.
              Usamos tu número únicamente para responderte y, si te sumás al grupo de difusión, para avisarte de
              nuevas fechas. Podés pedir que te demos de baja en cualquier momento por el mismo canal.
            </p>
          </Section>

          <Section title="Para qué usamos esta información">
            <p>
              Exclusivamente para entender qué eventos interesan y mejorar el sitio. No vendemos ni cedemos datos a
              terceros con fines publicitarios.
            </p>
          </Section>

          <Section title="Contacto">
            <p>
              Para cualquier consulta sobre esta política, escribinos por WhatsApp o por{" "}
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-white underline decoration-white/40 underline-offset-4"
              >
                Instagram
              </a>
              .
            </p>
          </Section>
        </div>

        <NavSpacer />
      </main>
      <BottomNav />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-white/10 bg-surface p-[15px]">
      <h3 className="text-[15px] font-bold leading-[1.2]">{title}</h3>
      <div className="mt-3 flex flex-col gap-3 text-[13px] leading-[1.6] text-white/[0.62]">{children}</div>
    </section>
  );
}
