"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useRef, useEffect, useState, useCallback } from "react"

type ContactCollection = { enabled: boolean; requireName: boolean; requireEmail: boolean }

type Props = {
  slug: string
  displayName: string
  headline?: string
  bio?: string
  suggestedQuestions?: string[]
  contactCollection?: ContactCollection
}

const INACTIVITY_MS = 5 * 60 * 1000
const COLLECT_TOKEN = "[COLLECT_CONTACT]"
const LS_SESSION = (slug: string) => `proxy-me:session:${slug}`

const BG = "#0f1117"
const SURFACE = "rgba(255,255,255,0.06)"
const BORDER = "rgba(255,255,255,0.1)"
const TEXT = "rgba(255,255,255,0.9)"
const MUTED = "rgba(255,255,255,0.45)"

type SavedSession = {
  sessionId: string
  name: string
  email: string
  messages: { role: string; content: string }[]
  savedAt: number
}

function Avatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div style={{
      width: 72, height: 72, borderRadius: 20,
      background: "linear-gradient(135deg, #3b3b3b 0%, #1a1a1a 100%)",
      border: `1px solid ${BORDER}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 28, fontWeight: 700, color: TEXT,
      marginBottom: 20,
    }}>
      {initial}
    </div>
  )
}

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    background: "rgba(255,255,255,0.07)",
    border: `1px solid ${focused ? "rgba(255,255,255,0.3)" : BORDER}`,
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    color: TEXT,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  }
}

export default function ChatInterface({ slug, displayName, headline, suggestedQuestions = [], contactCollection }: Props) {
  // --- session state ---
  // Initialise with a fresh UUID synchronously; overwritten if a saved session is resumed
  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID())
  const [contactCaptured, setContactCaptured] = useState(false)
  const [showContactPrompt, setShowContactPrompt] = useState(false)
  const [contactDone, setContactDone] = useState(false)
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactSaving, setContactSaving] = useState(false)
  const [contactError, setContactError] = useState("")

  // --- intro form (name required, email optional) ---
  const [introName, setIntroName] = useState("")
  const [introEmail, setIntroEmail] = useState("")
  const [introFocused, setIntroFocused] = useState<string | null>(null)
  const [introNameError, setIntroNameError] = useState(false)
  const [introDone, setIntrosDone] = useState(false)

  // --- resume banner ---
  const [resumeSession, setResumeSession] = useState<SavedSession | null>(null)
  const pendingRestoreRef = useRef<SavedSession | null>(null)

  const [inputValue, setInputValue] = useState("")
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load saved session from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem(LS_SESSION(slug))
    if (raw) {
      try {
        const saved: SavedSession = JSON.parse(raw)
        if (saved.sessionId && saved.messages?.length > 0) {
          setResumeSession(saved)
          // Pre-fill intro fields from saved contact info
          if (saved.name) setIntroName(saved.name)
          if (saved.email) setIntroEmail(saved.email)
          return
        }
      } catch { /* ignore */ }
    }
    // No saved session — keep the UUID already initialised in useState
  }, [slug])

  function startFresh() {
    const newId = crypto.randomUUID()
    setSessionId(newId)
    setResumeSession(null)
    setIntrosDone(false)
  }

  function continueSession(saved: SavedSession) {
    setSessionId(saved.sessionId)
    if (saved.name) { setIntroName(saved.name); setContactName(saved.name) }
    if (saved.email) { setIntroEmail(saved.email); setContactEmail(saved.email); setContactCaptured(true) }
    pendingRestoreRef.current = saved
    setResumeSession(null)
    setIntrosDone(true)
  }

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat", body: { slug, sessionId } }),
  })

  // Restore messages after "Continue conversation" is clicked
  useEffect(() => {
    const saved = pendingRestoreRef.current
    if (!saved || messages.length > 0) return
    pendingRestoreRef.current = null
    setMessages(
      saved.messages.map((m, i) => ({
        id: `restored-${i}`,
        role: m.role as "user" | "assistant",
        parts: [{ type: "text" as const, text: m.content }],
        metadata: {},
      }))
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeSession])

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, showContactPrompt])

  // Detect [COLLECT_CONTACT] token
  useEffect(() => {
    if (!contactCollection?.enabled || contactCaptured) return
    const lastMsg = messages[messages.length - 1]
    if (!lastMsg || lastMsg.role !== "assistant") return
    const text = lastMsg.parts?.filter((p) => p.type === "text").map((p) => p.text).join("") ?? ""
    if (text.includes(COLLECT_TOKEN)) setShowContactPrompt(true)
  }, [messages, contactCollection, contactCaptured])

  // Inactivity timer
  const startInactivityTimer = useCallback(() => {
    if (!contactCollection?.enabled || contactCaptured) return
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => {
      if (!contactCaptured) setShowContactPrompt(true)
    }, INACTIVITY_MS)
  }, [contactCollection, contactCaptured])

  useEffect(() => () => { if (inactivityTimer.current) clearTimeout(inactivityTimer.current) }, [])

  // Persist session to localStorage whenever messages change
  useEffect(() => {
    if (!sessionId || messages.length === 0) return
    const saved: SavedSession = {
      sessionId,
      name: introName,
      email: introEmail,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.parts?.filter((p) => p.type === "text").map((p) => p.text).join("") ?? "",
      })),
      savedAt: Date.now(),
    }
    localStorage.setItem(LS_SESSION(slug), JSON.stringify(saved))
  }, [messages, sessionId, introName, introEmail, slug])

  async function saveContact() {
    const emailToUse = contactEmail.trim() || introEmail.trim()
    if (!emailToUse) { setContactError("Email is required."); return }
    setContactSaving(true)
    setContactError("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: (contactName.trim() || introName.trim()) || null,
          email: emailToUse,
        }),
      })
      if (!res.ok) throw new Error()
      setContactCaptured(true)
      setContactDone(true)
      setShowContactPrompt(false)
    } catch {
      setContactError("Something went wrong. Please try again.")
    } finally {
      setContactSaving(false)
    }
  }

  function submitIntro() {
    if (!introName.trim()) { setIntroNameError(true); return }
    setIntroNameError(false)
    // Only save to DB if email was provided
    if (introEmail.trim()) {
      setContactEmail(introEmail)
      setContactName(introName)
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name: introName.trim(), email: introEmail.trim() }),
      }).then((r) => { if (r.ok) setContactCaptured(true) }).catch(() => {})
    }
    setIntrosDone(true)
  }

  function submit(text?: string) {
    const t = text ?? inputValue.trim()
    if (!t || status === "streaming" || status === "submitted") return
    sendMessage({ parts: [{ type: "text", text: t }] })
    setInputValue("")
    setShowContactPrompt(false)
    startInactivityTimer()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit() }
  }

  const hasMessages = messages.length > 0

  // --- Resume banner ---
  if (resumeSession) {
    const preview = resumeSession.messages.filter((m) => m.role === "user")[0]?.content ?? ""
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, color: TEXT, alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 460, width: "100%", padding: "0 24px" }}>
          <Avatar name={displayName} />
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" }}>Welcome back{resumeSession.name ? `, ${resumeSession.name}` : ""}!</h2>
          <p style={{ margin: "0 0 24px", fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
            You have a previous conversation with {displayName}.
          </p>
          {preview && (
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 16px", fontSize: 13, color: MUTED, marginBottom: 24, lineHeight: 1.5 }}>
              "{preview.length > 100 ? preview.slice(0, 100) + "…" : preview}"
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => continueSession(resumeSession)}
              style={{ background: "white", color: "#111", border: "none", borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Continue conversation
            </button>
            <button
              onClick={startFresh}
              style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 20px", fontSize: 14, color: MUTED, cursor: "pointer" }}
            >
              Start fresh
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- Intro form (shown before first message, skippable) ---
  const showIntroForm = !introDone && !hasMessages && sessionId

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, color: TEXT }}>

      {/* Message area */}
      <div style={{ flex: 1, overflowY: "auto", padding: hasMessages ? "24px 0 0" : 0 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px" }}>

          {/* Empty state + optional intro form */}
          {!hasMessages && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center" }}>
              <Avatar name={displayName} />
              <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, letterSpacing: "-1px", color: TEXT, fontStyle: "italic" }}>
                Talk to {displayName}
              </h1>
              {headline && (
                <p style={{ margin: "8px 0 0", fontSize: 14, color: MUTED }}>{headline}</p>
              )}

              {!showIntroForm && (
                <>
                  <p style={{ margin: "16px auto 0", fontSize: 13, color: MUTED, maxWidth: 440, lineHeight: 1.6 }}>
                    Ask broad questions, follow up naturally, or paste a job description to check fit.
                  </p>
                  {suggestedQuestions.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 28, maxWidth: 600 }}>
                      {suggestedQuestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => submit(q)}
                          style={{
                            background: "transparent",
                            border: `1px solid ${BORDER}`,
                            borderRadius: 100,
                            padding: "8px 16px",
                            fontSize: 13,
                            color: MUTED,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.4)"; (e.target as HTMLButtonElement).style.color = TEXT }}
                          onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.borderColor = BORDER; (e.target as HTMLButtonElement).style.color = MUTED }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => {
            const isUser = msg.role === "user"
            const text = msg.parts.filter((p) => p.type === "text").map((p) => p.text).join("").replace(COLLECT_TOKEN, "").trim()
            if (!text) return null
            return (
              <div key={msg.id} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12 }}>
                <div style={{
                  maxWidth: "78%",
                  borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  padding: "10px 16px",
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  background: isUser ? "rgba(255,255,255,0.12)" : SURFACE,
                  border: `1px solid ${isUser ? "rgba(255,255,255,0.15)" : BORDER}`,
                  color: TEXT,
                }}>
                  {text}
                </div>
              </div>
            )
          })}

          {/* Skeleton — only while waiting for first token, not during active streaming */}
          {status === "submitted" && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "18px 18px 18px 4px", padding: "14px 18px", width: 180 }}>
                <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)", marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", marginBottom: 8, width: "80%", animation: "pulse 1.5s ease-in-out infinite 0.1s" }} />
                <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", width: "60%", animation: "pulse 1.5s ease-in-out infinite 0.2s" }} />
              </div>
            </div>
          )}

          {error && <p style={{ color: "#f87171", fontSize: 12, textAlign: "center" }}>{error.message}</p>}

          {/* Contact prompt — only shown if email not already provided in intro */}
          {showContactPrompt && !contactCaptured && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "18px 18px 18px 4px", padding: "14px 18px", maxWidth: "78%" }}>
                <p style={{ margin: "0 0 12px", fontSize: 13, color: TEXT }}>
                  Would you mind leaving your email so we can follow up?
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {!introName && (
                    <input value={contactName} onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your name (optional)"
                      style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: TEXT, outline: "none" }} />
                  )}
                  <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Your email *"
                    onKeyDown={(e) => e.key === "Enter" && saveContact()}
                    style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: TEXT, outline: "none" }} />
                  {contactError && <p style={{ margin: 0, color: "#f87171", fontSize: 12 }}>{contactError}</p>}
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button onClick={saveContact} disabled={contactSaving}
                      style={{ background: "rgba(255,255,255,0.15)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, color: TEXT, cursor: "pointer" }}>
                      {contactSaving ? "Saving…" : "Send"}
                    </button>
                    <button onClick={() => { setShowContactPrompt(false); setContactCaptured(true) }}
                      style={{ background: "transparent", border: "none", fontSize: 13, color: MUTED, cursor: "pointer" }}>
                      No thanks
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Thank you */}
          {contactDone && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "18px 18px 18px 4px", padding: "10px 16px", fontSize: 14, color: TEXT }}>
                Thanks for sharing your details — we'll be in touch!
              </div>
            </div>
          )}

          <div ref={bottomRef} style={{ height: 120 }} />
        </div>
      </div>

      {/* Input bar / Intro form */}
      <div style={{ position: "sticky", bottom: 0, padding: "16px 20px 24px", background: `linear-gradient(to top, ${BG} 80%, transparent)` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {showIntroForm ? (
            /* Intro form — replaces textarea until name is entered */
            <div style={{
              background: "rgba(255,255,255,0.07)",
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              padding: "16px 18px",
              backdropFilter: "blur(12px)",
            }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: MUTED }}>
                Enter your details to start the conversation
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  <input
                    autoFocus
                    value={introName}
                    onChange={(e) => { setIntroName(e.target.value); if (e.target.value.trim()) setIntroNameError(false) }}
                    onFocus={() => setIntroFocused("name")}
                    onBlur={() => setIntroFocused(null)}
                    placeholder="Your name *"
                    onKeyDown={(e) => e.key === "Enter" && submitIntro()}
                    style={{ ...inputStyle(introFocused === "name"), borderColor: introNameError ? "#f87171" : introFocused === "name" ? "rgba(255,255,255,0.3)" : BORDER }}
                  />
                  {introNameError && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#f87171" }}>Please enter your name to continue</p>}
                </div>
                <input
                  type="email"
                  value={introEmail}
                  onChange={(e) => setIntroEmail(e.target.value)}
                  onFocus={() => setIntroFocused("email")}
                  onBlur={() => setIntroFocused(null)}
                  placeholder="Your email (optional)"
                  onKeyDown={(e) => e.key === "Enter" && submitIntro()}
                  style={inputStyle(introFocused === "email")}
                />
              </div>
              <button
                onClick={submitIntro}
                style={{ marginTop: 12, background: "white", color: "#111", border: "none", borderRadius: 8, padding: "9px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Let's chat
              </button>
            </div>
          ) : (
            <>
              <div style={{
                display: "flex", alignItems: "flex-end", gap: 12,
                background: "rgba(255,255,255,0.07)",
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: "12px 12px 12px 18px",
                backdropFilter: "blur(12px)",
              }}>
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    e.target.style.height = "auto"
                    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask ${displayName} anything…`}
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: TEXT, fontSize: 14, lineHeight: 1.5, resize: "none",
                    fontFamily: "inherit", minHeight: 22, maxHeight: 140,
                  }}
                />
                <button
                  onClick={() => submit()}
                  disabled={status === "streaming" || status === "submitted" || !inputValue.trim()}
                  style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: inputValue.trim() && status !== "streaming" && status !== "submitted" ? "white" : "rgba(255,255,255,0.12)",
                    border: "none", cursor: inputValue.trim() ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 19V5M5 12l7-7 7 7" stroke={inputValue.trim() && status !== "streaming" && status !== "submitted" ? "#111" : "rgba(255,255,255,0.3)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 10 }}>
                Enter to send · Shift+Enter for new line
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.4 }
        }
        ::placeholder { color: rgba(255,255,255,0.25) !important }
      `}</style>
    </div>
  )
}
