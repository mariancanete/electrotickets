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
export function Wordmark({ size = "sm" }: { size?: "sm" | "md" }) {
  // `md` es el del header superior de desktop, un punto más grande. `sm` es el de siempre y
  // es el valor por defecto: nada de mobile cambia por existir esta variante.
  const md = size === "md";

  return (
    <span className="flex items-center gap-[10px]">
      <span
        className={`grid flex-none place-items-center rounded-[10px] bg-cta text-ink ${
          md ? "h-[38px] w-[38px] rounded-[11px]" : "h-[34px] w-[34px]"
        }`}
      >
        <Mark size={md ? 25 : 22} />
      </span>
      <span className="flex flex-col items-start">
        <span className={`wordmark-electro leading-none ${md ? "text-[19px]" : "text-[17px]"}`}>ELECTRO</span>
        <span className="mt-[3px] h-[2px] w-full bg-cta" />
        <span
          className={`wordmark-tickets mt-[3px] leading-none text-white/85 ${
            md ? "text-[8.6px]" : "text-[8px]"
          }`}
        >
          TICKETS
        </span>
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
  showCredential = true,
  aside
}: {
  title: React.ReactNode;
  showAlerts?: boolean;
  /**
   * El estado vacío la oculta **en mobile**. Es la pantalla más apretada del sistema —tiene
   * que entrar el punteado, la próxima fecha y el bloque de alertas completos arriba del
   * nav— y la credencial es lo único que puede salir sin costo: ahí no hay nada que comprar
   * todavía, así que la confianza sobre los links oficiales no está en juego.
   *
   * En desktop no hay presupuesto de alto que respetar, así que se muestra siempre.
   */
  showCredential?: boolean;
  /**
   * Bloque que en desktop viaja a la derecha del titular, dentro del mismo campo ultramar.
   * Hoy lo usa el selector de tres días de la home. En mobile no se renderiza: ahí el
   * selector vive debajo del header, como estaba.
   */
  aside?: React.ReactNode;
}) {
  const venues = credentials.officialVenues;

  return (
    <header className="trama gutter flex-none pb-[22px] pt-2 lg:py-10">
      {/* La fila de marca desaparece en desktop: el logo, la búsqueda y la campana ya están
          en el header superior de 76px, y repetirlos sería tener dos veces lo mismo. */}
      <div className="flex items-center justify-between lg:hidden">
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

      {/* En desktop el hero pasa a una sola fila: titular y credencial a la izquierda, el
          selector de días a la derecha. En mobile sigue siendo una columna. */}
      <div className="lg:flex lg:items-end lg:justify-between lg:gap-12">
        <div className="lg:flex lg:flex-col lg:gap-[18px]">
          <h1 className="display titular-hero mt-5 text-[36px] lg:mt-0">{title}</h1>

          {/**
           * Credencial de RRPP. Sale de `lib/credentials.ts`, no de la tabla `events`, y lista
           * los venues reales de los que somos RRPP oficial. Si el archivo queda sin venues
           * cargados, la franja no se renderiza: es una afirmación pública sobre relaciones
           * comerciales, así que o es verdadera o no está.
           */}
          {venues.length ? (
            <p
              className={`mt-[14px] items-center gap-[7px] rounded-full bg-ink/35 px-[13px] py-2 text-[11.5px] font-semibold leading-none text-white lg:mt-0 lg:w-fit lg:gap-2 lg:px-[15px] lg:py-[10px] lg:text-[12.5px] ${
                showCredential ? "inline-flex" : "hidden lg:inline-flex"
              }`}
            >
              <Icon name="shield" size={14} className="text-cta lg:hidden" />
              <Icon name="shield" size={15} className="hidden text-cta lg:block" />
              <span className="truncate">RRPP oficial · {venues.join(" · ")}</span>
            </p>
          ) : null}
        </div>

        {aside ? <div className="hidden flex-none lg:block">{aside}</div> : null}
      </div>
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
    <div className="gutter flex flex-none items-center gap-3 pb-[14px] pt-1 lg:pb-6 lg:pt-8">
      <Link
        href={backHref}
        aria-label="Volver"
        className="grid h-[42px] w-[42px] flex-none place-items-center rounded-full border border-white/[0.16] text-white"
      >
        <Icon name={icon} size={19} />
      </Link>
      <h1 className="text-[22px] font-bold leading-none tracking-[-0.03em] lg:text-[32px]">{title}</h1>
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
    <div className="gutter flex-none pb-4 pt-1 lg:pb-6 lg:pt-[34px]">
      {eyebrow ? (
        <p className="font-mono text-[10px] font-bold uppercase leading-none tracking-[0.22em] text-white/45">
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={`text-[26px] font-bold leading-none tracking-[-0.035em] lg:text-[40px] ${
          eyebrow ? "mt-[9px]" : ""
        }`}
      >
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-[13px] leading-[1.5] text-white/55 lg:mt-3 lg:text-[14px]">{description}</p>
      ) : null}
    </div>
  );
}
