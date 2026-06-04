import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { absoluteUrl, siteConfig } from "@/lib/site";

const homeTitle = "ElectroTickets · Tickets de electrónica en Argentina";
const homeImage = absoluteUrl("/og-home.png");

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
  }
};

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <html lang="es-AR">
      <body className="noise min-h-screen antialiased">
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
