export const siteConfig = {
  name: "ElectroTickets",
  description:
    "Agenda premium de fiestas electrónicas, techno, house y eventos underground en Argentina.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/electrotickets",
  whatsappGroup:
    process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ||
    "https://chat.whatsapp.com/LVWQjAe4r0EAtprDPObqnH?mode=gi_t",
  whatsappNumber: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "",
  whatsappContactName: process.env.NEXT_PUBLIC_CONTACT_NAME || "ElectroTickets",
  defaultCity: "Buenos Aires"
};
