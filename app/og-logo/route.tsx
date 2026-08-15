import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ElectroTickets · Eventos electrónicos en Argentina";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630
};

/**
 * Marca: ticket troquelado con el rayo calado. Es la misma figura que `BrandMark` en
 * `components/wordmark.tsx` y que `public/favicon.svg`.
 *
 * La imagen OG es lo que se ve cuando alguien comparte una fecha por WhatsApp o Instagram,
 * así que tiene que llevar exactamente la misma marca que el header: si acá quedara otra
 * cosa, todos los links compartidos mostrarían una identidad que el sitio ya no usa.
 *
 * Va como `<img>` con data URI y no como SVG inline porque el renderer de `next/og` es
 * Satori, que no dibuja `path`. Rasteriza el SVG y lo compone como imagen, que sí soporta.
 *
 * La metadata de la ruta (`alt`, `contentType`, `size`) no cambia: solo cambia el dibujo.
 */
const MARK_PATH =
  "M21 8h22a13 13 0 0 1 13 13v4.5a6.5 6.5 0 0 0 0 13V43a13 13 0 0 1-13 13H21A13 13 0 0 1 8 43v-4.5a6.5 6.5 0 0 0 0-13V21A13 13 0 0 1 21 8Zm16 5L18 37h11.5l-3.5 16 18-25H31l6-15Z";

const MARK_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#3DE8F5" fill-rule="evenodd" d="${MARK_PATH}"/></svg>`
)}`;

function ElectroTicketsMark({ size = 152 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={MARK_DATA_URI} width={size} height={size} alt="" />
  );
}

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#0B0714",
          color: "white",
          display: "flex",
          fontFamily: "Inter, Arial, sans-serif",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          width: "100%"
        }}
      >
        <div
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.30) 0%, rgba(59,130,246,0) 66%)",
            borderRadius: 999,
            height: 680,
            left: -210,
            position: "absolute",
            top: -260,
            width: 680
          }}
        />
        <div
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.34) 0%, rgba(139,92,246,0) 68%)",
            borderRadius: 999,
            bottom: -300,
            height: 760,
            position: "absolute",
            right: -180,
            width: 760
          }}
        />
        <div
          style={{
            background: "linear-gradient(115deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 42,
            display: "flex",
            flexDirection: "column",
            gap: 32,
            height: 500,
            justifyContent: "center",
            padding: "58px 66px",
            position: "relative",
            width: 1040
          }}
        >
          <div style={{ alignItems: "center", display: "flex", gap: 34 }}>
            <ElectroTicketsMark />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 88, fontWeight: 950, letterSpacing: -3, lineHeight: 1 }}>
                ELECTRO
              </div>
              <div style={{ background: "#3DE8F5", borderRadius: 2, height: 5, width: 420 }} />
              <div
                style={{
                  color: "rgba(255,255,255,0.78)",
                  fontSize: 30,
                  fontWeight: 600,
                  letterSpacing: 14,
                  lineHeight: 1
                }}
              >
                TICKETS
              </div>
            </div>
          </div>
          {/* El lockup ya trae su propia regla cyan entre ELECTRO y TICKETS; la que había
              acá debajo quedaba como una segunda línea sin función. */}
          <div
            style={{
              color: "rgba(255,255,255,0.82)",
              fontSize: 38,
              fontWeight: 760,
              letterSpacing: -0.8,
              lineHeight: 1.22,
              maxWidth: 870
            }}
          >
            Tickets oficiales, fechas destacadas y acceso directo a compra
          </div>
        </div>
      </div>
    ),
    size
  );
}
