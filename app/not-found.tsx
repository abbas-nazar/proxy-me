import Link from "next/link"

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0a0f", padding: "40px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 64, fontWeight: 700, color: "rgba(139,109,255,0.25)", lineHeight: 1, marginBottom: 24 }}>
          404
        </div>
        <h1 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#f3f1ee", letterSpacing: "-0.3px" }}>
          Page not found
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 13, color: "#6e6e82", lineHeight: 1.6 }}>
          This page doesn&apos;t exist or the link may have changed.
        </p>
        <Link
          href="/"
          style={{ display: "inline-block", background: "#8b6dff", color: "#0a0a0f", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
        >
          Go home
        </Link>
      </div>
    </main>
  )
}
