"use client"

import { useEffect, useRef, useState } from "react"
import ChatBubble from "@/components/chat/ChatBubble"

type Message = {
  role: "recruiter" | "proxy"
  text: string
  thinkMs?: number
}

const MESSAGES: Message[] = [
  {
    role: "recruiter",
    text: "Hey! I'm Jamie from Meridian, we're a fintech building payments infra. I came across Sarah's profile and wanted to reach out. Is she open to hearing about new roles?",
  },
  {
    role: "proxy",
    text: "Hey Jamie! Yeah, I'm open, been keeping an eye out for the right thing. Payments infra sounds interesting, what stage is Meridian at?",
    thinkMs: 1200,
  },
  {
    role: "recruiter",
    text: "Series B, about 80 people. We're looking for someone to lead the ledger and settlement side. Mostly Go and Postgres. Does that match what Sarah's been working on?",
  },
  {
    role: "proxy",
    text: "That's pretty much my wheelhouse honestly. I've been building ledger services in Go for the past couple years, at one point we were handling around 4M transactions a day. Settlement flows, reconciliation, the whole thing.",
    thinkMs: 1500,
  },
  {
    role: "recruiter",
    text: "That's exactly what we need. Is she open to a lead role, or is she more heads-down IC right now?",
  },
  {
    role: "proxy",
    text: "I'd be into a lead role if the scope is right. I've been doing a bit of both lately and I actually enjoy the mix. What does the team look like on that side?",
    thinkMs: 1100,
  },
  {
    role: "recruiter",
    text: "Small but growing. 3 engineers right now, you'd be the 4th and effectively leading the workstream. Want to jump on a quick call this week?",
  },
  {
    role: "proxy",
    text: "Yeah, I'm up for that. Leave your email and I'll make sure Sarah gets this, she'll follow up directly.",
    thinkMs: 900,
  },
]

const PAUSE_BETWEEN_MESSAGES = 800
const LOOP_PAUSE = 4000

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#14141f",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 0 60px rgba(139,109,255,0.15), 0 24px 60px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
    maxWidth: 420,
    width: "100%",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.09)",
    background: "#1b1b2a",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background:
      "repeating-linear-gradient(45deg, #2a2a3e 0px, #2a2a3e 4px, #1b1b2a 4px, #1b1b2a 8px)",
    border: "1px solid rgba(139,109,255,0.3)",
    flexShrink: 0,
  },
  headerMeta: {
    flex: 1,
    minWidth: 0,
  },
  headerName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#f3f1ee",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  proxyTag: {
    fontSize: 10,
    background: "rgba(139,109,255,0.2)",
    color: "#8b6dff",
    borderRadius: 4,
    padding: "1px 5px",
    fontFamily: "var(--font-jetbrains-mono, monospace)",
    letterSpacing: "0.04em",
    fontWeight: 500,
  },
  headerHandle: {
    fontSize: 11,
    color: "#6e6e82",
    fontFamily: "var(--font-jetbrains-mono, monospace)",
    marginTop: 1,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 6px #22c55e",
    flexShrink: 0,
  },
  messagesArea: {
    flex: 1,
    padding: "16px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    minHeight: 300,
    maxHeight: 300,
    overflowY: "auto",
    scrollBehavior: "smooth",
  },
  typingBubble: {
    background: "#1b1b2a",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "18px 18px 18px 4px",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
}

function TypingDot({ delay }: { delay: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "#8b6dff",
        animation: "chatDotBounce 1.1s ease-in-out infinite",
        animationDelay: `${delay}ms`,
      }}
    />
  )
}

type DisplayItem =
  | { type: "message"; msg: Message }
  | { type: "typing" }

export default function ChatDemo() {
  const [displayed, setDisplayed] = useState<DisplayItem[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    async function sleep(ms: number) {
      return new Promise<void>((res) => setTimeout(res, ms))
    }

    async function runLoop() {
      while (!cancelled) {
        setDisplayed([])
        await sleep(600)

        for (const msg of MESSAGES) {
          if (cancelled) return

          if (msg.role === "proxy" && msg.thinkMs) {
            // Show typing indicator
            setDisplayed((prev) => [...prev, { type: "typing" }])
            await sleep(msg.thinkMs)
            if (cancelled) return
            // Replace typing with actual message
            setDisplayed((prev) => {
              const next = prev.filter((i) => i.type !== "typing")
              return [...next, { type: "message", msg }]
            })
          } else {
            setDisplayed((prev) => [...prev, { type: "message", msg }])
          }

          await sleep(PAUSE_BETWEEN_MESSAGES)
        }

        await sleep(LOOP_PAUSE)
      }
    }

    runLoop()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [displayed])

  return (
    <>
      <style>{`
        @keyframes chatDotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.avatar} />
          <div style={styles.headerMeta}>
            <div style={styles.headerName}>
              Sarah Chen&apos;s Proxy
              <span style={styles.proxyTag}>proxy</span>
            </div>
            <div style={styles.headerHandle}>proxy-me.io/sarahchen</div>
          </div>
          <div style={styles.onlineDot} />
        </div>

        {/* Messages */}
        <div style={styles.messagesArea} ref={containerRef}>
          {displayed.map((item, i) =>
            item.type === "typing" ? (
              <div key={`typing-${i}`} style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={styles.typingBubble}>
                  <TypingDot delay={0} />
                  <TypingDot delay={180} />
                  <TypingDot delay={360} />
                </div>
              </div>
            ) : (
              <div key={`msg-${i}`}>
                <ChatBubble role={item.msg.role} text={item.msg.text} />
              </div>
            )
          )}
        </div>
      </div>
    </>
  )
}
