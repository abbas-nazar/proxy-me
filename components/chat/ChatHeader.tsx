import type { CSSProperties } from "react"

type Props = {
  displayName: string
  headline?: string
  handle?: string
  imageUrl?: string
  style?: CSSProperties
}

const TEXT = "#f3f1ee"
const MUTED2 = "#6e6e82"
const BORDER = "rgba(255,255,255,0.09)"

export default function ChatHeader({ displayName, headline, handle, imageUrl, style }: Props) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 16px",
      borderBottom: `1px solid ${BORDER}`,
      background: "#1b1b2a",
      flexShrink: 0,
      ...style,
    }}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={displayName}
          style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #8b6dff 0%, #5a3fd4 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 700, color: TEXT,
        }}>
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: TEXT }}>
          {displayName}
          <span style={{
            fontSize: 10, background: "rgba(139,109,255,0.2)", color: "#8b6dff",
            borderRadius: 4, padding: "1px 5px",
            fontFamily: "var(--font-jetbrains-mono, monospace)",
            letterSpacing: "0.04em", fontWeight: 500,
          }}>
            proxy
          </span>
        </div>
        {(headline || handle) && (
          <div style={{ fontSize: 11, color: MUTED2, marginTop: 1, fontFamily: handle ? "var(--font-jetbrains-mono, monospace)" : undefined }}>
            {handle ?? headline}
          </div>
        )}
      </div>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e", flexShrink: 0 }} />
    </div>
  )
}
