import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="grid min-h-[70vh] place-items-center px-4 text-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200/70">404</p>
          <h1 className="mt-4 text-5xl font-black">Evento no encontrado</h1>
          <p className="mt-4 text-white/62">Puede que la fecha ya no esté publicada.</p>
          <Link href="/eventos" className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-bold text-black">
            Ver eventos activos
          </Link>
        </div>
      </main>
    </>
  );
}
