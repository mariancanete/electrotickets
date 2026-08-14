import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl, siteConfig } from "@/lib/site";

/**
 * El sitio carga Google Analytics 4 y Microsoft Clarity, que dejan cookies y registran
 * comportamiento de navegación. Tener una página que lo declare es lo esperable y no
 * existía. Describe exactamente lo que hace el código, sin promesas que no se cumplan.
 *
 * PERSONALIZAR: si en algún momento se agrega un formulario de email o un CRM, hay que
 * actualizar esta página.
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
      <SiteHeader />
      <main className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200/70">Legales</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Política de privacidad</h1>
          <p className="mt-5 text-white/50">Última actualización: agosto de 2026.</p>

          <div className="mt-10 space-y-8 text-sm leading-7 text-white/62">
            <section>
              <h2 className="text-xl font-black text-white">Qué datos recopilamos</h2>
              <p className="mt-3">
                ElectroTickets no tiene cuentas de usuario y no te pide datos personales para navegar el sitio. No
                procesamos pagos ni almacenamos información de tarjetas: la compra se completa íntegramente en Bombo,
                bajo sus propias políticas.
              </p>
              <p className="mt-3">Recopilamos, de forma agregada y no nominal:</p>
              <ul className="mt-3 space-y-2">
                <li>· Páginas visitadas, origen del tráfico, tipo de dispositivo y navegador.</li>
                <li>
                  · Clics en los botones de compra, para saber qué fechas y qué secciones del sitio generan interés.
                </li>
                <li>
                  · Un identificador de sesión aleatorio guardado en una cookie propia, que sirve para no contar
                  varias veces al mismo visitante. No está asociado a tu identidad.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-white">Herramientas de terceros</h2>
              <p className="mt-3">
                Usamos <span className="font-semibold text-white/80">Google Analytics 4</span> para métricas de
                audiencia y <span className="font-semibold text-white/80">Microsoft Clarity</span> para entender cómo
                se usa el sitio. Ambas utilizan cookies y se rigen por sus propias políticas de privacidad. Podés
                bloquearlas desde la configuración de tu navegador sin que eso afecte el funcionamiento del sitio.
              </p>
              <p className="mt-3">
                Al tocar un botón de compra te redirigimos a Bombo agregando parámetros que identifican a
                ElectroTickets como origen de la visita. A partir de ahí aplican los términos y la política de
                privacidad de Bombo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-white">WhatsApp</h2>
              <p className="mt-3">
                Si nos escribís por WhatsApp, la conversación queda en esa plataforma bajo sus propias condiciones.
                Usamos tu número únicamente para responderte y, si te sumás al grupo de difusión, para avisarte de
                nuevas fechas. Podés pedir que te demos de baja en cualquier momento por el mismo canal.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-white">Para qué usamos esta información</h2>
              <p className="mt-3">
                Exclusivamente para entender qué eventos interesan y mejorar el sitio. No vendemos ni cedemos datos a
                terceros con fines publicitarios.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-white">Contacto</h2>
              <p className="mt-3">
                Para cualquier consulta sobre esta política, escribinos por WhatsApp o por{" "}
                <a
                  href={siteConfig.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-white underline decoration-white/25 underline-offset-4 transition hover:decoration-white"
                >
                  Instagram
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
