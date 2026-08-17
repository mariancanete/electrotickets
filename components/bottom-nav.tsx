"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";

const tabs: { href: string; label: string; icon: IconName; match: (path: string) => boolean }[] = [
  { href: "/", label: "Agenda", icon: "home", match: (p) => p === "/" || p.startsWith("/eventos") },
  { href: "/buscar", label: "Buscar", icon: "search", match: (p) => p.startsWith("/buscar") },
  { href: "/mis-entradas", label: "Mis entradas", icon: "ticket", match: (p) => p.startsWith("/mis-entradas") },
  { href: "/preguntas-frecuentes", label: "Ayuda", icon: "chat", match: (p) => p.startsWith("/preguntas-frecuentes") }
];

/**
 * Nav inferior — 74px más la safe area del dispositivo.
 *
 * El tab activo usa chartreuse, que es la única excepción a "el chartreuse es el color de
 * comprar": el nav es la superficie donde el usuario se ubica, y el color de marca de la app
 * marca dónde está parado.
 *
 * **Salvo en Ayuda.** Esa pantalla no convierte y está definida como la única con cero
 * chartreuse, así que su tab activo se resuelve en blanco. Es una inconsistencia deliberada:
 * si Ayuda encendiera el chartreuse en el nav, la pantalla dejaría de cumplir su propia
 * regla justo en el elemento más visible.
 */
export function BottomNav() {
  const pathname = usePathname() || "/";
  const noChartreuse = pathname.startsWith("/preguntas-frecuentes");

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 items-center border-t border-white/10 bg-ink pb-3 pt-1"
      style={{ minHeight: 74, paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
    >
      {tabs.map((tab) => {
        const active = tab.match(pathname);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 flex-col items-center justify-center gap-[5px] ${
              active ? (noChartreuse ? "text-white" : "text-cta") : "text-white/[0.42]"
            }`}
          >
            <Icon name={tab.icon} size={22} />
            <span className={`text-[10px] leading-none ${active ? "font-bold" : "font-medium"}`}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Espaciador que reserva el alto del nav al final de cada pantalla.
 *
 * El nav es `fixed`, así que sin esto tapa el último bloque de contenido — y el último bloque
 * suele ser justamente el CTA o el botón de alertas.
 */
export function NavSpacer() {
  return <div aria-hidden="true" style={{ height: "calc(86px + env(safe-area-inset-bottom))" }} />;
}
