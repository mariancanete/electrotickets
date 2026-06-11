export const bomboAppLinks = {
  ios: "https://apps.apple.com/ar/app/bombo/id6444416394",
  android: "https://play.google.com/store/apps/details?id=com.infinixsoft.bombo&hl=es_AR"
};

export const siteConfig = {
  name: "ElectroTickets",
  description:
    "Agenda premium de fiestas electrónicas, techno, house y eventos underground en Argentina.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://electrotickets.com.ar",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/electrotickets",
  whatsappGroup:
    process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ||
    "https://chat.whatsapp.com/LVWQjAe4r0EAtprDPObqnH?mode=gi_t",
  whatsappNumber: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "",
  whatsappContactName: process.env.NEXT_PUBLIC_CONTACT_NAME || "ElectroTickets",
  defaultCity: "Buenos Aires"
};

export function absoluteUrl(pathOrUrl: string) {
  try {
    return new URL(pathOrUrl).toString();
  } catch {
    return new URL(pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`, siteConfig.url).toString();
  }
}
