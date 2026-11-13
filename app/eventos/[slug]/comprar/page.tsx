import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getEventBySlug } from "@/lib/events";

// Una hora; los cambios del panel se publican al instante (ver `revalidatePublicPages`).
export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  return {
    title: event ? `Comprar entradas para ${event.title}` : "Comprar entradas",
    // Es una pantalla de paso, no una landing: si se indexara competiría con el detalle,
    // que es la URL que tiene el canonical, el JSON-LD y los backlinks.
    robots: { index: false, follow: true }
  };
}

/**
 * Antes era una pantalla intermedia entre el detalle y Bombo. Repetía lo que ya dice la barra
 * de compra (los pasos y la credencial) y sumaba un toque más antes de comprar, así que salió
 * del camino: "Comprar en Bombo" va directo desde el detalle. La URL se conserva para que los
 * links viejos no den 404 y lleva al detalle de la fecha.
 */
export default async function BuyPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  redirect(`/eventos/${event.slug}`);
}
