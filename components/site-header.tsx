import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";

function ElectroTicketsLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[12px] border border-white/15 bg-white/[0.06] shadow-[0_0_30px_rgba(129,140,248,0.18)]">
        <svg
          viewBox="0 0 64 64"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="electroGradient"
              x1="18"
              y1="14"
              x2="46"
              y2="50"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFFFFF" />
              <stop offset="0.5" stopColor="#93C5FD" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          <g transform="skewX(-12) translate(6 0)">
            <rect
              x="18"
              y="16"
              width="30"
              height="7"
              rx="2"
              fill="url(#electroGradient)"
            />
            <rect
              x="18"
              y="28.5"
              width="23"
              height="7"
              rx="2"
              fill="url(#electroGradient)"
            />
            <rect
              x="18"
              y="41"
              width="30"
              height="7"
              rx="2"
              fill="url(#electroGradient)"
            />
          </g>
        </svg>
      </div>

      <span className="text-lg font-black tracking-tight text-white sm:text-xl">
        ElectroTickets
      </span>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/35 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="transition hover:opacity-90"
          aria-label="Ir al inicio de ElectroTickets"
        >
          <ElectroTicketsLogo />
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-white/62 sm:flex">
          <Link className="transition hover:text-white" href="/eventos">
            Eventos
          </Link>
          <Link className="transition hover:text-white" href="/destacados">
            Destacados
          </Link>
          <Link className="transition hover:text-white" href="/quienes-somos">
            Quiénes somos
          </Link>
          <Link className="transition hover:text-white" href="/contacto">
            Contacto
          </Link>
          <Link className="transition hover:text-white" href="/preguntas-frecuentes">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/eventos"
            className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/85"
          >
            Ver fechas
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}