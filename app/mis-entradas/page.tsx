import type { Metadata } from "next";
import { BottomNav } from "@/components/bottom-nav";
import { MyTicketsScreen } from "@/components/my-tickets-screen";
import { getDayKey } from "@/lib/dates";
import { getUpcomingPublishedEvents } from "@/lib/events";
import { getWeekendDays } from "@/lib/weekend";
import { DesktopHeader } from "@/components/desktop-header";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Mis entradas",
  description: "Las fechas que guardaste al tocar comprar, para que no se te pasen.",
  // La lista vive en el dispositivo: para un buscador esta página está siempre vacía y no
  // hay nada que indexar.
  robots: { index: false, follow: true }
};

/**
 * Ruta de Mis entradas (pantallas 06 y 07).
 *
 * El servidor manda **todos** los eventos próximos publicados y el cliente se queda con los
 * que tiene guardados. No hay endpoint que reciba la lista del usuario: mandarla al servidor
 * para filtrar del otro lado convertiría en dato de servidor justamente lo que se decidió
 * que no saliera del dispositivo.
 */
export default async function MyTicketsPage() {
  const events = await getUpcomingPublishedEvents();

  const weekendKeys = new Set(getWeekendDays().map((date) => getDayKey(date.toISOString())));
  const weekendEvents = events.filter((event) => weekendKeys.has(getDayKey(event.starts_at)) && !event.sold_out);

  return (
    <>
      <DesktopHeader />
      <main>
        <MyTicketsScreen events={events} weekendEvents={weekendEvents} />
      </main>
      <BottomNav />
    </>
  );
}
