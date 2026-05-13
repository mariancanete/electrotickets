import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/35 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-sm font-black text-black transition group-hover:scale-105">
            ET
          </span>
          <span className="text-lg font-semibold tracking-tight">ElectroTickets</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/65 sm:flex">
          <Link className="transition hover:text-white" href="/eventos">Eventos</Link>
          <a className="transition hover:text-white" href="/#destacados">Destacados</a>
          <Link className="transition hover:text-white" href="/contacto">Contacto</Link>
          <Link className="transition hover:text-white" href="/preguntas-frecuentes">FAQ</Link>
        </nav>
        <Link
          href="/eventos"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/85"
        >
          Ver tickets
        </Link>
      </div>
    </header>
  );
}
