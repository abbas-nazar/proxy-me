"use client"

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0a0a0f", color: "#f3f1ee", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 16, textAlign: "center", padding: "0 24px" }}>
        <div style={{ fontSize: 32 }}>⚡</div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ margin: 0, fontSize: 14, color: "#6e6e82" }}>An unexpected error occurred.</p>
        <button
          onClick={reset}
          style={{ marginTop: 8, padding: "8px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#f3f1ee", fontSize: 14, cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
