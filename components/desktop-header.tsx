"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/app-header";
import { Icon } from "@/components/icons";

const destinos = [
  { href: "/", label: "Agenda", match: (p: string) => p === "/" || p.startsWith("/eventos") },
  { href: "/buscar", label: "Buscar", match: (p: string) => p.startsWith("/buscar") },
  { href: "/mis-entradas", label: "Mis entradas", match: (p: string) => p.startsWith("/mis-entradas") },
  { href: "/preguntas-frecuentes", label: "Ayuda", match: (p: string) => p.startsWith("/preguntas-frecuentes") }
];

/**
 * Header superior de desktop — 76px, a partir de 1024px.
 *
 * Es el mismo contenido que la barra inferior de mobile, en el mismo orden: Agenda, Buscar,
 * Mis entradas, Ayuda. **La transición ocurre exactamente en 1024px y no hay estado
 * intermedio**: o está la barra abajo o está el header arriba, nunca los dos.
 *
 * Se implementa con `sticky top-0` y no con `fixed`. Para una barra pegada al borde superior
 * el resultado visual es idéntico, pero `sticky` ocupa su lugar en el flujo, así que ninguna
 * pantalla necesita compensar 76px de padding para no quedar tapada — y ese padding, si se
 * olvida en una sola pantalla, se nota enseguida.
 *
 * El destino activo usa chartreuse con subrayado de 2px. Es la excepción que ya declara la
 * tabla de color de la §2 ("CTA de compra y tab activo del nav"), la misma que en mobile.
 */
export function DesktopHeader() {
  const pathname = usePathname() || "/";

  // En Buscar el campo del header se omite: el de la pantalla lo reemplaza y tener dos
  // campos de búsqueda en la misma vista es una pregunta que el usuario no debería hacerse.
  const enBuscar = pathname.startsWith("/buscar");

  // Ayuda es la única pantalla sin chartreuse propio. Su tab activo sigue el sistema y usa
  // chartreuse igual que los demás: el header es cromo de la app, no contenido de la pantalla.
  return (
    <header className="sticky top-0 z-50 hidden h-[76px] flex-none items-center justify-between gap-7 border-b border-white/10 bg-ink lg:flex gutter-lg">
      <Link href="/" aria-label="ElectroTickets, ir a la agenda">
        <Wordmark size="md" />
      </Link>

      <nav aria-label="Navegación principal" className="flex items-center gap-[30px]">
        {destinos.map((destino) => {
          const activo = destino.match(pathname);

          return (
            <Link
              key={destino.href}
              href={destino.href}
              aria-current={activo ? "page" : undefined}
              className={`nav-link t150 flex flex-col items-center gap-[7px] text-[14px] leading-none ${
                activo ? "font-bold text-cta" : "font-medium text-white/60"
              }`}
            >
              {destino.label}
              <span className={`h-[2px] w-full ${activo ? "bg-cta" : "bg-transparent"}`} />
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        {enBuscar ? null : (
          <Link
            href="/buscar"
            className="btn-out t150 flex h-[42px] min-w-[210px] items-center gap-[10px] rounded-full border border-white/[0.18] bg-black/30 px-4"
          >
            <Icon name="search" size={17} className="text-white/[0.48]" />
            <span className="text-[13.5px] leading-none text-white/[0.42]">Buscar artista o club</span>
          </Link>
        )}
        <Link
          href="/preguntas-frecuentes"
          aria-label="Ayuda y alertas"
          className="btn-out t150 grid h-[42px] w-[42px] flex-none place-items-center rounded-full border border-white/[0.18] text-white"
        >
          <Icon name="bell" size={18} />
        </Link>
      </div>
    </header>
  );
}
