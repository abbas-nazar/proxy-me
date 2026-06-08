import { ImageResponse } from "next/og"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [user] = await db.select().from(users).where(eq(users.slug, slug))

  const name = user?.displayName ?? slug
  const headline = user?.headline ?? "AI Proxy for Recruiters"

  return new ImageResponse(
    (
      <div style={{
        width: 1200, height: 630,
        background: "#0a0a0f",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,109,255,0.12) 0%, transparent 70%)",
          top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex",
        }} />
        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(139,109,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,109,255,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px", display: "flex",
        }} />

        {/* Avatar circle */}
        <div style={{
          width: 96, height: 96, borderRadius: "50%",
          background: "rgba(139,109,255,0.15)",
          border: "2px solid rgba(139,109,255,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 42, fontWeight: 700, color: "#8b6dff",
          marginBottom: 28,
        }}>
          {name.charAt(0).toUpperCase()}
        </div>

        {/* Name */}
        <div style={{ fontSize: 56, fontWeight: 700, color: "#f3f1ee", letterSpacing: "-2px", marginBottom: 14, display: "flex" }}>
          {name}
        </div>

        {/* Headline */}
        <div style={{ fontSize: 24, color: "#9a9aae", marginBottom: 40, display: "flex" }}>
          {headline}
        </div>

        {/* CTA */}
        <div style={{
          fontSize: 18, color: "#8b6dff",
          background: "rgba(139,109,255,0.1)",
          border: "1px solid rgba(139,109,255,0.3)",
          borderRadius: 100, padding: "12px 32px",
          display: "flex",
        }}>
          Chat with my AI proxy →
        </div>

        {/* Branding */}
        <div style={{
          position: "absolute", bottom: 32,
          fontSize: 15, color: "rgba(255,255,255,0.2)",
          fontFamily: "monospace", display: "flex",
        }}>
          proxy-me.app
        </div>
      </div>
    ),
    { ...size }
  )
}
