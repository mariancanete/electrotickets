"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";


const links = [
  { href: "/eventos", label: "Eventos" },
  { href: "/destacados", label: "Destacados" },
  { href: "/quienes-somos", label: "Quiénes somos" },
  { href: "/preguntas-frecuentes", label: "Cómo comprar" },
  { href: "/contacto", label: "Contacto" }
];

/**
 * Menú de navegación para mobile.
 *
 * El header ocultaba la navegación entera por debajo del breakpoint `sm`, así que en
 * teléfono solo quedaban el logo y un botón. Todas las páginas que construyen confianza
 * —quiénes somos, cómo comprar, contacto— eran inalcanzables salvo bajando hasta el footer.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white transition hover:bg-white/10"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open ? (
        <div className="fixed inset-x-0 top-[73px] z-40 border-b border-white/10 bg-black/95 px-4 pb-6 pt-2 backdrop-blur-xl">
          <nav className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`border-b border-white/5 py-4 text-base font-semibold transition ${
                  pathname === link.href ? "text-white" : "text-white/78 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/eventos"
            onClick={() => setOpen(false)}
            className="mt-5 block rounded-full border border-white/20 px-5 py-3.5 text-center text-sm font-black text-white transition hover:border-white/40 hover:bg-white/10"
          >
            Ver todas las fechas
          </Link>
        </div>
      ) : null}
    </div>
  );
}
