import Link from "next/link";
import { Wordmark } from "@/components/app-header";
import { NavSpacer } from "@/components/bottom-nav";
import { BuySteps } from "@/components/buy-steps";
import { DateCarousel } from "@/components/date-carousel";
import { EventRow } from "@/components/event-row";
import { Icon } from "@/components/icons";
import { WhatsappLink } from "@/components/whatsapp-link";
import { formatDayHeading, getDayKey } from "@/lib/dates";
import type { EventRecord } from "@/types/event";

/** Cuántas fechas lista la agenda de la home antes de mandar a `/eventos`. */
const AGENDA_HOME = 12;

/**
 * Home — sistema Vidrio.
 *
 * De arriba abajo, en el orden en que escanea alguien que llega apurado desde Instagram:
 * quiénes somos y por qué confiar (titular + credencial + cantidad real de fechas), las
 * próximas fechas en carrusel con el botón de compra en cada card, cómo se compra en dos
 * pasos, y la agenda completa agrupada por noche.
 *
 * `activeCount` sale de la base (fechas vigentes publicadas): nunca es un número escrito.
 */
export function HomeScreen({
  events,
  carouselEvents,
  activeCount,
  alertsHref
}: {
  events: EventRecord[];
  carouselEvents: EventRecord[];
  activeCount: number;
  alertsHref: string;
}) {
  const agenda = events.slice(0, AGENDA_HOME);
  const groups = groupByNight(agenda);

  return (
    <div className="app-shell flex min-h-screen flex-col lg:hidden">
      <div className="gutter flex flex-none items-center justify-between pb-[6px] pt-[14px] lg:hidden">
        <Link href="/" aria-label="ElectroTickets, inicio" className="flex min-h-11 items-center">
          <Wordmark />
        </Link>
        <Link
          href="/buscar"
          aria-label="Buscar fechas"
          className="vidrio grid h-11 w-11 place-items-center rounded-full text-white"
        >
          <Icon name="search" size={19} />
        </Link>
      </div>

      <section className="gutter flex flex-none flex-col gap-[14px] pb-[26px] pt-[14px] lg:gap-5 lg:pb-10 lg:pt-14">
        <h1 className="text-balance text-[31px] font-extrabold leading-[1.08] tracking-[-0.03em] lg:max-w-[820px] lg:text-[60px] lg:leading-[1.02]">
          La electrónica en Argentina, con entrada oficial.
        </h1>
        <div className="flex flex-wrap gap-2">
          <span className="vidrio inline-flex h-9 items-center gap-[7px] rounded-full px-[13px] text-[12.5px] font-bold lg:h-10 lg:px-4 lg:text-[13.5px]">
            <Icon name="shield" size={15} className="text-cta" />
            RRPP oficial de Bombo
          </span>
          {activeCount > 0 ? (
            <span className="vidrio inline-flex h-9 items-center gap-[7px] rounded-full px-[13px] text-[12.5px] font-bold lg:h-10 lg:px-4 lg:text-[13.5px]">
              <span className="font-mono text-cta">{activeCount}</span>
              {activeCount === 1 ? "fecha en agenda" : "fechas en agenda"}
            </span>
          ) : null}
        </div>
      </section>

      {carouselEvents.length ? (
        <section aria-labelledby="proximas-titulo" className="flex flex-none flex-col gap-3 pb-[30px] lg:gap-5 lg:pb-12">
          <div className="gutter flex items-baseline justify-between">
            <h2 id="proximas-titulo" className="text-[19px] font-extrabold leading-none tracking-[-0.02em] lg:text-[26px]">
              Próximas fechas
            </h2>
            <Link href="/eventos" className="t150 py-3 text-[13px] font-bold text-white/75 hover:text-white lg:text-[14px]">
              Ver todas
            </Link>
          </div>
          <DateCarousel events={carouselEvents} />
        </section>
      ) : null}

      <section aria-labelledby="como-titulo" className="gutter flex flex-none flex-col gap-3 pb-[30px] lg:max-w-[720px] lg:pb-12">
        <h2 id="como-titulo" className="text-[19px] font-extrabold leading-none tracking-[-0.02em] lg:text-[26px]">
          Cómo comprás
        </h2>
        <BuySteps variant="panel" />
      </section>

      <section aria-labelledby="agenda-titulo" className="gutter flex flex-none flex-col gap-3 pb-[30px] lg:pb-12">
        <div className="flex items-baseline justify-between">
          <h2 id="agenda-titulo" className="text-[19px] font-extrabold leading-none tracking-[-0.02em] lg:text-[26px]">
            Agenda
          </h2>
          {events.length > agenda.length ? (
            <Link href="/eventos" className="t150 py-3 text-[13px] font-bold text-white/75 hover:text-white lg:text-[14px]">
              Ver las {events.length}
            </Link>
          ) : null}
        </div>

        {groups.length ? (
          <div className="flex flex-col gap-2">
            {groups.map((group) => (
              <div key={group.key} className="flex flex-col gap-2">
                <h3 className="dato-seccion mt-[10px]">Noche del {group.heading}</h3>
                <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-3 xl:grid-cols-3">
                  {group.events.map((event) => (
                    <EventRow key={event.id} event={event} placement="home_agenda" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-block border border-dashed border-white/25 p-6 text-center">
            <Icon name="cal" size={20} className="text-white/70" />
            <p className="text-[18px] font-extrabold leading-[1.2]">Todavía no hay fechas confirmadas</p>
            <p className="text-[14px] leading-[1.5] text-white/70">Cuando entra una fecha, aparece acá primero.</p>
          </div>
        )}

        {events.length > agenda.length ? (
          <Link
            href="/eventos"
            className="btn-out t150 mt-1 flex h-12 items-center justify-center rounded-full border border-white/30 text-[14.5px] font-extrabold text-white lg:w-fit lg:px-8"
          >
            Ver toda la agenda
          </Link>
        ) : null}
      </section>

      <section className="gutter flex-none pb-[30px] lg:max-w-[720px] lg:pb-12">
        <div className="vidrio flex flex-col gap-3 rounded-block p-[18px] lg:p-6">
          <h2 className="text-[18px] font-extrabold leading-none tracking-[-0.02em] lg:text-[22px]">Enterate antes</h2>
          <p className="text-[14px] leading-[1.4] text-white/75">Avisamos por WhatsApp cuando sale una fecha nueva.</p>
          <WhatsappLink
            href={alertsHref}
            source="home_alerts"
            kind="group"
            className="btn-out t150 flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 text-[14.5px] font-extrabold text-white"
          >
            <Icon name="chat" size={18} />
            Recibir alertas
          </WhatsappLink>
        </div>
      </section>

      <footer className="gutter mt-auto flex flex-none flex-col gap-[10px] pb-6">
        <p className="text-[12.5px] leading-[1.45] text-white/70">
          ElectroTickets es RRPP oficial de Bombo. La compra y el pago se hacen en Bombo.
        </p>
        <nav aria-label="Ayuda" className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-bold">
          <Link href="/preguntas-frecuentes" className="py-[10px]">
            Preguntas frecuentes
          </Link>
          <Link href="/quienes-somos" className="py-[10px]">
            Quiénes somos
          </Link>
          <Link href="/contacto" className="py-[10px]">
            Contacto
          </Link>
          <Link href="/privacidad" className="py-[10px]">
            Privacidad
          </Link>
        </nav>
      </footer>

      <NavSpacer />
    </div>
  );
}

/**
 * Agrupa por noche, no por día calendario: lo de las 03:00 del domingo es la noche del
 * sábado. La clave y el título salen de `lib/dates`, que ya hace esa corrección.
 */
function groupByNight(events: EventRecord[]) {
  const groups: { key: string; heading: string; events: EventRecord[] }[] = [];

  for (const event of events) {
    const key = getDayKey(event.starts_at);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.events.push(event);
    else groups.push({ key, heading: formatDayHeading(event.starts_at), events: [event] });
  }

  return groups;
}
