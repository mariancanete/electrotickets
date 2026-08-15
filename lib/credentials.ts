/**
 * Credenciales de marca — PLACEHOLDERS.
 *
 * Este archivo existe para que la prueba social tenga un solo lugar donde vivir el día que
 * haya datos reales que la respalden. Hoy está **deliberadamente vacío**: la regla del
 * proyecto es no inventar testimonios, cantidades de clientes ni estadísticas, y una
 * credencial falsa en un negocio de RRPP cuesta más de lo que rinde.
 *
 * Mientras los valores estén vacíos, los componentes que los consumen **no renderizan nada**.
 * No hay que tocar ningún componente para activarlos: se completan acá y aparecen solos.
 *
 * Qué se puede completar, de mayor a menor impacto en confianza:
 *
 *   `officialVenues`  Los venues donde sos RRPP oficial. Es el activo más fuerte y el único
 *                     verificable de punta a punta: explica por qué los links son oficiales.
 *   `sinceYear`       Año desde el que operás. Sirve incluso si es reciente.
 *   `communitySize`   Tamaño real del grupo de WhatsApp, si querés mostrarlo.
 *
 * Nada de esto puede completarse "a ojo". Si el dato no se puede sostener, se deja vacío.
 */

export const credentials = {
  /** Ej.: ["Crobar", "Mandarine Park"]. Vacío = no se renderiza la línea de venues. */
  officialVenues: [] as string[],

  /** Ej.: 2023. `null` = no se renderiza. */
  sinceYear: null as number | null,

  /** Ej.: 1200. `null` = no se renderiza. */
  communitySize: null as number | null
};

/** Si no hay ninguna credencial cargada, la franja de confianza se omite entera. */
export const hasCredentials =
  credentials.officialVenues.length > 0 ||
  credentials.sinceYear !== null ||
  credentials.communitySize !== null;
