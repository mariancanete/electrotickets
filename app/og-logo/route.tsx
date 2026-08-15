import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ElectroTickets · Eventos electrónicos en Argentina";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630
};

/**
 * Monograma ET.
 *
 * Reemplaza las tres barras inclinadas con degradé del logo anterior. La imagen OG es lo que
 * se ve cuando alguien comparte una fecha por WhatsApp o Instagram, así que tiene que llevar
 * exactamente la misma marca que el header del sitio: si acá quedara el logo viejo, todos los
 * links compartidos seguirían mostrando una identidad que el sitio ya no usa.
 *
 * La metadata de la ruta (`alt`, `contentType`, `size`) no cambia: solo cambia el dibujo.
 */
function ElectroTicketsMark({ size = 152 }: { size?: number }) {
  return (
    <div
      style={{
        alignItems: "center",
        background: "rgba(61,232,245,0.10)",
        border: "2px solid rgba(61,232,245,0.38)",
        borderRadius: 32,
        boxShadow: "0 0 70px rgba(61,232,245,0.22)",
        color: "#3DE8F5",
        display: "flex",
        fontSize: size * 0.42,
        fontWeight: 600,
        height: size,
        justifyContent: "center",
        letterSpacing: size * 0.03,
        width: size
      }}
    >
      ET
    </div>
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
          <div
            style={{
              background: "#3DE8F5",
              borderRadius: 999,
              height: 6,
              width: 390
            }}
          />
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
