import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AS UCSB Committee on Committees — every open seat, in public view.";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: 72,
          background: "linear-gradient(135deg, #00466f 0%, #003660 100%)",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 460,
            height: 460,
            borderRadius: "50%",
            background: "#febc11",
            opacity: 0.18,
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#febc11", display: "flex" }} />
          <div style={{ fontSize: 26, letterSpacing: 4, fontWeight: 700, color: "#febc11" }}>
            ASSOCIATED STUDENTS · UC SANTA BARBARA
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div style={{ fontSize: 82, fontWeight: 800, lineHeight: 1.04, maxWidth: 980 }}>
            Every seat in student government — in public view.
          </div>
          <div style={{ fontSize: 32, marginTop: 24, color: "#cfe4f4", maxWidth: 900 }}>
            Committee on Committees — open positions, the AS roster, and the budget.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
