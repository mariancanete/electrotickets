import { revalidatePath } from "next/cache";

/**
 * Publica al instante un cambio del panel en todas las páginas públicas.
 *
 * Las páginas se regeneran solas cada una hora (`revalidate = 3600`). Un evento nuevo, un
 * "Últimas entradas" o un "Agotado" no pueden esperar eso: aparecen en la home, en el
 * listado, en el detalle, en las fechas parecidas de otros eventos y en la página de cada
 * artista del lineup. Invalidar todo el layout cubre todas esas páginas sin tener que
 * listarlas; se regeneran recién cuando alguien las visita.
 */
export function revalidatePublicPages() {
  try {
    revalidatePath("/", "layout");
  } catch (error) {
    // Nunca hace fallar el guardado: en el peor caso el cambio aparece en una hora.
    console.error("revalidatePath failed", error);
  }
}
