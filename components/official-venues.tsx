import { SealCheck } from "@phosphor-icons/react/dist/ssr";
import { credentials } from "@/lib/credentials";

/**
 * Credencial de RRPP oficial.
 *
 * Es la respuesta concreta a la pregunta que se hace todo el que llega desde Google: por qué
 * confiar en este sitio en vez de buscar la fecha en Bombo directo. Todo lo demás que dice la
 * home es una promesa ("links verificados", "te ayudamos"); esto es un hecho verificable, y
 * es lo único que ElectroTickets tiene y un agregador cualquiera no.
 *
 * Se alimenta de `lib/credentials.ts` y **devuelve `null` si la lista está vacía**, así que
 * el día que haya que sacar o agregar un venue se toca solo ese archivo. La regla del
 * proyecto sigue en pie: acá no entra ningún dato que no se pueda sostener.
 */
export function OfficialVenues({ className = "" }: { className?: string }) {
  const venues = credentials.officialVenues;
  if (!venues.length) return null;

  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      <SealCheck size={16} weight="fill" className="shrink-0 text-brand" aria-hidden="true" />
      <span className="text-[11px] uppercase tracking-[0.18em] text-white/48 sm:text-[12px]">
        RRPP oficial en
      </span>
      <span className="min-w-0 text-[12px] font-bold text-white/78 sm:text-[13px]">
        {formatVenueList(venues)}
      </span>
    </p>
  );
}

/** "Mute, Mandarine, Crobar, Rio y The Bow" — con la "y" antes del último, como se escribe. */
function formatVenueList(venues: string[]) {
  if (venues.length === 1) return venues[0];
  return `${venues.slice(0, -1).join(", ")} y ${venues[venues.length - 1]}`;
}
