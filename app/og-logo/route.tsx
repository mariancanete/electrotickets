import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ElectroTickets · Eventos electrónicos en Argentina";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630
};

function ElectroTicketsMark({ size = 152 }: { size?: number }) {
  const scale = size / 64;

  return (
    <div
      style={{
        alignItems: "center",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 32,
        boxShadow: "0 0 70px rgba(129,140,248,0.28)",
        display: "flex",
        height: size,
        justifyContent: "center",
        width: size
      }}
    >
      <div
        style={{
          display: "flex",
          filter: "drop-shadow(0 0 26px rgba(139,92,246,0.62))",
          height: 64 * scale,
          position: "relative",
          transform: "skewX(-12deg) translateX(4px)",
          width: 64 * scale
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 52%, #8b5cf6 100%)",
            borderRadius: 5 * scale,
            height: 7 * scale,
            left: 18 * scale,
            position: "absolute",
            top: 16 * scale,
            width: 30 * scale
          }}
        />
        <div
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 52%, #8b5cf6 100%)",
            borderRadius: 5 * scale,
            height: 7 * scale,
            left: 18 * scale,
            position: "absolute",
            top: 28.5 * scale,
            width: 23 * scale
          }}
        />
        <div
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 52%, #8b5cf6 100%)",
            borderRadius: 5 * scale,
            height: 7 * scale,
            left: 18 * scale,
            position: "absolute",
            top: 41 * scale,
            width: 30 * scale
          }}
        />
      </div>
    </div>
  );
}

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#050507",
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
              <div
                style={{
                  color: "rgba(255,255,255,0.68)",
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: 5,
                  textTransform: "uppercase"
                }}
              >
                Eventos electrónicos en Argentina
              </div>
              <div style={{ fontSize: 88, fontWeight: 950, letterSpacing: -4, lineHeight: 1 }}>
                ElectroTickets
              </div>
            </div>
          </div>
          <div
            style={{
              background: "linear-gradient(90deg, rgba(147,197,253,0.95), rgba(139,92,246,0.95))",
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
