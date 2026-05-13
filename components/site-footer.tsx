import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 text-sm text-white/55 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-white">ElectroTickets</p>
            <p>Eventos electrónicos, links oficiales de compra y acceso rápido a cada fecha.</p>
          </div>
          <div className="flex gap-4">
            <Link className="hover:text-white" href="/eventos">Eventos</Link>
            <Link className="hover:text-white" href="/contacto">Contacto</Link>
            <Link className="hover:text-white" href="/preguntas-frecuentes">FAQ</Link>
          </div>
        </div>
        <p className="text-xs text-white/35">
          ElectroTickets no emite tickets propios. La compra se completa en la plataforma oficial del evento.
        </p>
      </div>
    </footer>
  );
}
