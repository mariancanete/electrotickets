import Link from "next/link";
import { InstagramLogo, Megaphone, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { WhatsappLink } from "@/components/whatsapp-link";
import { Wordmark } from "@/components/wordmark";
import { siteConfig } from "@/lib/site";
import { buildGeneralWhatsappMessage, whatsappUrlOrGroup } from "@/lib/whatsapp";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 text-sm text-white/62 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Wordmark size="lg" />
            <p className="mt-4 leading-6">
              Agenda de música electrónica en Argentina. Centralizamos las fechas, el link oficial de compra de cada
              una y te asistimos por WhatsApp.
            </p>
          </div>

          <div>
            <p className="font-semibold text-white/78">Eventos</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link className="inline-block py-1.5 hover:text-white" href="/eventos">
                  Todas las fechas
                </Link>
              </li>
              <li>
                <Link className="inline-block py-1.5 hover:text-white" href="/destacados">
                  Destacados
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white/78">ElectroTickets</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link className="inline-block py-1.5 hover:text-white" href="/quienes-somos">
                  Quiénes somos
                </Link>
              </li>
              <li>
                <Link className="inline-block py-1.5 hover:text-white" href="/preguntas-frecuentes">
                  Cómo comprar
                </Link>
              </li>
              <li>
                <Link className="inline-block py-1.5 hover:text-white" href="/privacidad">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white/78">Contacto</p>
            <ul className="mt-3 space-y-2">
              <li>
                <WhatsappLink
                  href={whatsappUrlOrGroup(buildGeneralWhatsappMessage())}
                  source="footer"
                  className="inline-flex items-center gap-2 py-1.5 hover:text-white"
                >
                  <WhatsappLogo size={17} weight="fill" aria-hidden="true" />
                  WhatsApp
                </WhatsappLink>
              </li>
              <li>
                <WhatsappLink
                  href={siteConfig.whatsappGroup}
                  source="footer"
                  kind="group"
                  className="inline-flex items-center gap-2 py-1.5 hover:text-white"
                >
                  <Megaphone size={17} weight="fill" aria-hidden="true" />
                  Grupo de difusión
                </WhatsappLink>
              </li>
              <li>
                <a
                  href={siteConfig.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-1.5 hover:text-white"
                >
                  <InstagramLogo size={17} weight="fill" aria-hidden="true" />
                  Instagram
                </a>
              </li>
              <li>
                <Link className="inline-block py-1.5 hover:text-white" href="/contacto">
                  Página de contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="border-t border-white/5 pt-6 text-xs leading-6 text-white/48">
          ElectroTickets no emite tickets propios ni procesa pagos. La compra y la emisión de la entrada se completan
          en Bombo, la plataforma oficial de cada evento. Ante un problema con un ticket ya comprado, el soporte
          corresponde a Bombo, y podés escribirnos para que te ayudemos a gestionarlo.
        </p>
      </div>
    </footer>
  );
}
