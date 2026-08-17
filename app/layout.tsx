import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { IconSprite } from "@/components/icons";
import { absoluteUrl, siteConfig } from "@/lib/site";

/**
 * Space Grotesk cubre display y cuerpo desde una sola familia. En 700 y mayúsculas tiene la
 * densidad del afiche de fiesta; en 400 se lee parado, con una mano y en la cola.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap"
});

/**
 * El mono es **solo** para datos que genera la máquina: fechas, horas, contadores, estados,
 * IDs. Lo que escribe una persona va en Space Grotesk.
 */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-jetbrains-mono",
  display: "swap"
});

const homeTitle = "ElectroTickets · Tickets de electrónica en Argentina";
const homeImage = absoluteUrl("/og-logo");

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: homeTitle,
    template: "%s · ElectroTickets"
  },
  description: siteConfig.description,
  keywords: [
    "tickets electrónica",
    "fiestas techno Buenos Aires",
    "eventos electrónica Argentina",
    "tickets techno",
    "house Buenos Aires",
    "melodic techno Argentina"
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: homeTitle,
    description: siteConfig.description,
    images: [{ url: homeImage, width: 1200, height: 630, alt: "ElectroTickets" }]
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg"
  }
};

export const viewport: Viewport = {
  // Tiene que coincidir con el fondo del body (`ink`). Si no coincide, la barra del navegador
  // queda de un negro distinto al del sitio y en mobile se ve una costura arriba de todo,
  // justo en la plataforma de la que entra la mayoría del tráfico.
  themeColor: "#0A0A14",
  width: "device-width",
  initialScale: 1,
  // El diseño es mobile-first a 390px y el nav inferior se apoya en la safe area.
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <html lang="es-AR" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen antialiased">
        {/* El sprite de íconos va una sola vez por documento; cada ícono es un `<use>`. */}
        <IconSprite />
        {children}
        {gaId ? (
          <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <Script id="ga4">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}');`}
            </Script>
          </>
        ) : null}
        {clarityId ? (
          <Script id="clarity">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${clarityId}");`}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
