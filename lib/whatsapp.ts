import { siteConfig } from "@/lib/site";

export function buildWhatsappDirectUrl(phoneNumber: string, message: string) {
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  if (!cleanNumber) return null;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Saludo del mensaje pregenerado. Usa `NEXT_PUBLIC_CONTACT_NAME` cuando trae el nombre real
 * de quien atiende; si quedó en el valor por defecto, saluda sin nombre en vez de escribir
 * "Hola ElectroTickets", que suena a formulario automático.
 */
function greeting() {
  const name = siteConfig.whatsappContactName?.trim();
  return !name || name.toLowerCase() === "electrotickets" ? "Hola" : `Hola ${name}`;
}

export function buildEventWhatsappMessage(eventTitle: string) {
  return `${greeting()}, quiero consultar por ${eventTitle}. ¿Hay disponibilidad de entradas?`;
}

/**
 * La web no muestra precios por decisión comercial. Sin este mensaje, la duda de precio se
 * resuelve saliendo del sitio hacia Bombo (donde ya no se puede medir nada); con él, se
 * resuelve en un canal propio y queda como lead.
 */
export function buildPriceWhatsappMessage(eventTitle: string) {
  return `${greeting()}, quiero consultar precio y disponibilidad para ${eventTitle}.`;
}

export function buildVipWhatsappMessage(eventTitle?: string) {
  return eventTitle
    ? `${greeting()}, quiero consultar por mesas VIP y cortesías para ${eventTitle}.`
    : `${greeting()}, quiero consultar por mesas VIP y cortesías para próximas fechas.`;
}

export function buildWaitlistWhatsappMessage(eventTitle: string) {
  return `${greeting()}, ${eventTitle} figura como Sold Out. ¿Me avisás si se libera alguna entrada o si quedan mesas?`;
}

export function buildAlertsWhatsappMessage(topic?: string) {
  return topic
    ? `${greeting()}, quiero recibir avisos de nuevas fechas de ${topic}.`
    : `${greeting()}, quiero recibir avisos de nuevas fechas, preventas y últimas entradas.`;
}

export function buildGeneralWhatsappMessage() {
  return `${greeting()}, quiero hacer una consulta sobre ElectroTickets.`;
}

/**
 * Contacto directo, con fallback al grupo de difusión cuando `NEXT_PUBLIC_CONTACT_WHATSAPP`
 * no está configurado. Antes cada componente resolvía este fallback por su cuenta y uno de
 * ellos terminaba enlazando a la propia página en la que ya estaba el usuario.
 */
export function whatsappUrlOrGroup(message: string) {
  return buildWhatsappDirectUrl(siteConfig.whatsappNumber, message) || siteConfig.whatsappGroup;
}
