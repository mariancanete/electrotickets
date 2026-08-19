import Link from "next/link";
import { BottomNav, NavSpacer } from "@/components/bottom-nav";
import { Icon } from "@/components/icons";
import { DesktopHeader } from "@/components/desktop-header";

/**
 * 404 en el sistema Hora Pico. Reusa el patrón del estado vacío: nunca es un callejón, la
 * salida es la agenda. "Ver la agenda" va delineado, no chartreuse: no lleva a comprar.
 */
export default function NotFound() {
  return (
    <>
      <DesktopHeader />
      <main className="flex min-h-screen flex-col justify-center px-[18px]">
        <div className="flex flex-col items-center gap-3 rounded-block border border-dashed border-white/20 px-5 py-[26px] text-center">
          <span className="grid h-14 w-14 place-items-center rounded-card bg-surface text-white/35">
            <Icon name="search" size={28} />
          </span>
          <p className="font-mono text-[11px] font-bold uppercase leading-none tracking-[0.16em] text-white/45">404</p>
          <h1 className="text-[21px] font-bold leading-[1.2] tracking-[-0.025em]">No encontramos esa página</h1>
          <p className="text-[13.5px] leading-[1.55] text-white/55">Puede que la fecha ya no esté publicada.</p>
          <Link
            href="/"
            className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/40 text-white"
          >
            <Icon name="home" size={16} />
            <span className="text-[14px] font-bold leading-none">Ver la agenda</span>
          </Link>
        </div>
        <NavSpacer />
      </main>
      <BottomNav />
    </>
  );
}
