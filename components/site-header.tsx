import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { Wordmark, WordmarkMonogram } from "@/components/wordmark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/35 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition hover:opacity-90"
          aria-label="Ir al inicio de ElectroTickets"
        >
          <WordmarkMonogram className="h-9 w-9 shrink-0" />
          <Wordmark size="md" />
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-white/62 sm:flex">
          <Link className="inline-flex min-h-6 items-center transition hover:text-white" href="/eventos">
            Eventos
          </Link>
          <Link className="inline-flex min-h-6 items-center transition hover:text-white" href="/destacados">
            Destacados
          </Link>
          <Link className="inline-flex min-h-6 items-center transition hover:text-white" href="/quienes-somos">
            Quiénes somos
          </Link>
          <Link className="inline-flex min-h-6 items-center transition hover:text-white" href="/contacto">
            Contacto
          </Link>
          <Link className="inline-flex min-h-6 items-center transition hover:text-white" href="/preguntas-frecuentes">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Navegación, no compra: va en contorno y no en cyan. El cyan significa una sola
              cosa en todo el sitio y deja de significarla en cuanto se usa para otra. */}
          <Link
            href="/eventos"
            className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/10 sm:px-5"
          >
            Ver fechas
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}