"use client"

import { useEffect, useRef, useState } from "react"
import ChatBubble from "@/components/chat/ChatBubble"
import ChatHeader from "@/components/chat/ChatHeader"
import { BASE_URL } from "@/lib/baseUrl"

type Message = {
  role: "recruiter" | "proxy"
  text: string
  thinkMs?: number
}

const MESSAGES: Message[] = [
  {
    role: "recruiter",
    text: "Hi! I'm Jamie from Stripe. I came across your profile and wanted to reach out, are you open to hearing about senior frontend roles?",
  },
  {
    role: "proxy",
    text: "Hey Jamie! Yeah, I'm open to the right thing. Stripe's always been on my radar. What's the role focused on?",
    thinkMs: 1200,
  },
  {
    role: "recruiter",
    text: "We're building out the dashboard experience. React, TypeScript, performance-heavy work. You've been in that space?",
  },
  {
    role: "proxy",
    text: "That's pretty much what I've been doing. Lots of React and TypeScript, heavy focus on performance. Things like virtualized lists, bundle optimization, reducing LCP. It's work I genuinely enjoy.",
    thinkMs: 1500,
  },
  {
    role: "recruiter",
    text: "Nice. Are you looking for IC or would you consider a tech lead kind of role?",
  },
  {
    role: "proxy",
    text: "I'm open to both honestly. I've been doing a mix lately, hands-on coding but also mentoring and some architecture decisions. I don't want to fully move away from the code.",
    thinkMs: 1100,
  },
  {
    role: "recruiter",
    text: "That's exactly the kind of profile we're after. Want to jump on a quick call this week?",
  },
  {
    role: "proxy",
    text: "Sure, happy to. Drop your email and I'll follow up to find a time.",
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
        <ChatHeader displayName="Alex Rivera" handle={`${BASE_URL.replace(/^https?:\/\//, "")}/alexrivera`} />

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
