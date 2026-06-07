import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Proxy-Me — Your AI proxy for recruiters"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0a0a0f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,109,255,0.15) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
        }} />

        {/* Grid lines */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(139,109,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,109,255,0.05) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          display: "flex",
        }} />

        {/* Logo + name row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: "rgba(139,109,255,0.15)",
            border: "1.5px solid rgba(139,109,255,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 38,
          }}>
            ⚡
          </div>
          <div style={{ fontSize: 52, fontWeight: 700, color: "#f3f1ee", letterSpacing: "-2px", display: "flex" }}>
            Proxy<span style={{ color: "#8b6dff" }}>-</span>Me
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 28,
          color: "#9a9aae",
          textAlign: "center",
          maxWidth: 720,
          lineHeight: 1.4,
          marginBottom: 48,
          display: "flex",
        }}>
          Your AI proxy for recruiters. Set up once, available 24/7.
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {["Upload your CV", "Share your link", "AI answers for you"].map((label) => (
            <div key={label} style={{
              fontSize: 15,
              color: "#8b6dff",
              background: "rgba(139,109,255,0.1)",
              border: "1px solid rgba(139,109,255,0.25)",
              borderRadius: 100,
              padding: "8px 20px",
              display: "flex",
            }}>
              {label}
            </div>
          ))}
        </div>

        {/* Bottom domain */}
        <div style={{
          position: "absolute", bottom: 36,
          fontSize: 16, color: "rgba(255,255,255,0.25)",
          fontFamily: "monospace",
          display: "flex",
        }}>
          proxy-me.app
        </div>
      </div>
    ),
    { ...size }
  )
}
