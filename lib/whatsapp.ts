export function buildWhatsappDirectUrl(phoneNumber: string, message: string) {
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  if (!cleanNumber) return null;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}


export function buildEventWhatsappMessage(eventTitle: string) {
  return `Hola Marian, quiero consultar por ${eventTitle}. ¿Hay disponibilidad de entradas o mesas VIP?`;
}
