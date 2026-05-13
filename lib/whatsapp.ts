export function buildWhatsappDirectUrl(phoneNumber: string, message: string) {
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  if (!cleanNumber) return null;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
