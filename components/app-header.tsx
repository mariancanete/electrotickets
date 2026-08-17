import Link from "next/link";
import { Icon, Mark } from "@/components/icons";
import { credentials } from "@/lib/credentials";

/**
 * Lockup de marca. El logo *es* la tipografía: el isotipo en un troquel chartreuse, y el
 * nombre partido en "ELECTRO" (display) sobre una regla, con "TICKETS" en mono abajo.
 *
 * El chartreuse del troquel y de la regla es identidad de marca, no un CTA: es un filete y
 * un contenedor de 34px, nunca una superficie que se pueda confundir con un botón de compra.
 */
export function Wordmark() {
  return (
    <span className="flex items-center gap-[10px]">
      <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] bg-cta text-ink">
        <Mark size={22} />
      </span>
      <span className="flex flex-col items-start">
        <span className="wordmark-electro text-[17px] leading-none">ELECTRO</span>
        <span className="mt-[3px] h-[2px] w-full bg-cta" />
        <span className="wordmark-tickets mt-[3px] text-[8px] leading-none text-white/85">TICKETS</span>
      </span>
    </span>
  );
}

/**
 * Header de marca de la agenda — ultramar con trama de semitono.
 *
 * Ocupa el bloque superior entero y es lo único que compite con el flyer en la pantalla. La
 * trama de 7px es el gesto de afiche de festival del sistema y reemplaza a la foto cuando no
 * hay una: sin ella el header sería un rectángulo azul plano.
 */
export function AppHeader({
  title,
  showAlerts = true,
  showCredential = true
}: {
  title: React.ReactNode;
  showAlerts?: boolean;
  /**
   * El estado vacío la oculta. Es la pantalla más apretada del sistema —tiene que entrar el
   * punteado, la próxima fecha y el bloque de alertas completos arriba del nav— y la
   * credencial es lo único que puede salir sin costo: ahí no hay nada que comprar todavía,
   * así que la confianza sobre los links oficiales no está en juego.
   */
  showCredential?: boolean;
}) {
  const venues = showCredential ? credentials.officialVenues : [];

  return (
    <header className="trama flex-none px-[18px] pb-[22px] pt-2">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="ElectroTickets, ir a la agenda">
          <Wordmark />
        </Link>

        <span className="flex gap-[10px]">
          <Link
            href="/buscar"
            aria-label="Buscar fechas"
            className="grid h-[42px] w-[42px] place-items-center rounded-full bg-white/[0.16] text-white"
          >
            <Icon name="search" size={19} />
          </Link>
          {showAlerts ? (
            <Link
              href="/preguntas-frecuentes"
              aria-label="Ayuda y alertas"
              className="grid h-[42px] w-[42px] place-items-center rounded-full bg-white/[0.16] text-white"
            >
              <Icon name="bell" size={19} />
            </Link>
          ) : null}
        </span>
      </div>

      <h1 className="display mt-5 text-[36px]">{title}</h1>

      {/**
       * Credencial de RRPP. Sale de `lib/credentials.ts`, no de la tabla `events`, y lista
       * los venues reales de los que somos RRPP oficial. Si el archivo queda sin venues
       * cargados, la franja no se renderiza: es una afirmación pública sobre relaciones
       * comerciales, así que o es verdadera o no está.
       */}
      {venues.length ? (
        <p className="mt-[14px] inline-flex items-center gap-[7px] rounded-full bg-ink/35 px-[13px] py-2 text-[11.5px] font-semibold leading-none text-white">
          <Icon name="shield" size={14} className="text-cta" />
          <span className="truncate">RRPP oficial · {venues.join(" · ")}</span>
        </p>
      ) : null}
    </header>
  );
}

/** Cabecera simple de pantalla interna: flecha de volver + título. */
export function ScreenHeader({
  title,
  backHref,
  icon = "back"
}: {
  title: string;
  backHref: string;
  icon?: "back" | "x";
}) {
  return (
    <div className="flex flex-none items-center gap-3 px-[18px] pb-[14px] pt-1">
      <Link
        href={backHref}
        aria-label="Volver"
        className="grid h-[42px] w-[42px] flex-none place-items-center rounded-full border border-white/[0.16] text-white"
      >
        <Icon name={icon} size={19} />
      </Link>
      <h1 className="text-[22px] font-bold leading-none tracking-[-0.03em]">{title}</h1>
    </div>
  );
}

/** Cabecera de pantalla raíz de tab: título grande, sin volver. */
export function TabHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex-none px-[18px] pb-4 pt-1">
      {eyebrow ? (
        <p className="font-mono text-[10px] font-bold uppercase leading-none tracking-[0.22em] text-white/45">
          {eyebrow}
        </p>
      ) : null}
      <h1 className={`text-[26px] font-bold leading-none tracking-[-0.035em] ${eyebrow ? "mt-[9px]" : ""}`}>
        {title}
      </h1>
      {description ? <p className="mt-2 text-[13px] leading-[1.5] text-white/55">{description}</p> : null}
    </div>
  );
}
