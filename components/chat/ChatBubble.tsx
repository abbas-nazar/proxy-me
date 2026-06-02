"use client"

import Markdown from "./Markdown"

type Props = {
  role: "user" | "assistant" | "recruiter" | "proxy"
  text: string
  renderMarkdown?: boolean
}

const isUserRole = (role: string) => role === "user" || role === "recruiter"

export default function ChatBubble({ role, text, renderMarkdown = false }: Props) {
  const isUser = isUserRole(role)

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div style={{
        maxWidth: "min(78%, 560px)",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        padding: "10px 16px",
        background: isUser
          ? "linear-gradient(135deg, rgba(139,109,255,0.25) 0%, rgba(139,109,255,0.12) 100%)"
          : "#1b1b2a",
        border: `1px solid ${isUser ? "rgba(139,109,255,0.45)" : "rgba(255,255,255,0.09)"}`,
        color: "#f3f1ee",
        wordBreak: "break-word",
        boxShadow: isUser ? "0 4px 20px rgba(139,109,255,0.15)" : "none",
      }}>
        {isUser || !renderMarkdown
          ? <span style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{text}</span>
          : <Markdown text={text} />
        }
      </div>
    </div>
  )
}
