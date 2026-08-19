import type { Metadata } from "next";
import Link from "next/link";
import { ScreenHeader } from "@/components/app-header";
import { BottomNav, NavSpacer } from "@/components/bottom-nav";
import { DateCard } from "@/components/date-card";
import { getUpcomingPublishedEvents } from "@/lib/events";
import { DesktopHeader } from "@/components/desktop-header";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Eventos destacados de música electrónica",
  description: "Explorá eventos destacados de electrónica en Argentina y comprá desde links oficiales."
};

/**
 * `/destacados` no es una de las 9 pantallas del rediseño, pero es una URL indexada, así que
 * se conserva con su metadata intacta. Lo único que cambia es que pasa a usar la card de
 * fecha del sistema: antes montaba `EventBrowser`, que ahora es la pantalla Buscar completa
 * —con su header, su campo y su nav— y no tenía sentido acá.
 */
export default async function FeaturedEventsPage() {
  const events = await getUpcomingPublishedEvents();
  const featuredEvents = events.filter((event) => event.featured);

  return (
    <>
      <DesktopHeader />
      <main className="flex min-h-screen flex-col pt-2">
        <ScreenHeader title="Destacados" backHref="/" />

        <div className="flex flex-col gap-3 px-[18px]">
          {featuredEvents.length ? (
            featuredEvents.map((event, index) => (
              <DateCard key={event.id} event={event} placement="listado_card" priority={index === 0} />
            ))
          ) : (
            <div className="rounded-block border border-dashed border-white/20 p-6 text-center">
              <h2 className="text-[20px] font-bold leading-[1.2] tracking-[-0.025em]">
                No hay fechas destacadas ahora
              </h2>
              <Link
                href="/eventos"
                className="mt-4 flex h-12 items-center justify-center rounded-full border border-white/40 text-[14px] font-bold text-white"
              >
                Ver todos los eventos
              </Link>
            </div>
          )}
        </div>

        <NavSpacer />
      </main>
      <BottomNav />
    </>
  );
}
