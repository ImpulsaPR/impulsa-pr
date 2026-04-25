import { ImageResponse } from "next/og";

export const alt = "Impulsa PR — Dashboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #064e3b 60%, #0e6d52 100%)",
          color: "#fafaf5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 900,
              color: "#0a0a0a",
            }}
          >
            I
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.02em" }}>Impulsa</span>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.08em", color: "#eab308" }}>PR</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 78,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              maxWidth: 1000,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Automatización inteligente</span>
            <span style={{ color: "#eab308", fontStyle: "italic" }}>para WhatsApp.</span>
          </div>
          <div style={{ fontSize: 28, color: "#8a8a93", maxWidth: 960 }}>
            Leads, pipeline y conversaciones en un solo panel.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#64748b",
          }}
        >
          <span>cliente.impulsapr.com</span>
          <span>🇵🇷 Hecho en Puerto Rico</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
