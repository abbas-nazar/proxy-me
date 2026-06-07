"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useRef, useEffect, useState, useCallback } from "react"
import ChatBubble from "./ChatBubble"
import ChatHeader from "./ChatHeader"
import TextField from "@mui/material/TextField"
import InputAdornment from "@mui/material/InputAdornment"
import IconButton from "@mui/material/IconButton"

type ContactCollection = { enabled: boolean; requireName: boolean; requireEmail: boolean }

type Props = {
  slug: string
  displayName: string
  headline?: string
  bio?: string
  suggestedQuestions?: string[]
  contactCollection?: ContactCollection
  imageUrl?: string
}

const INACTIVITY_MS = 5 * 60 * 1000
const COLLECT_TOKEN = "[COLLECT_CONTACT]"
const LS_SESSION = (slug: string) => `proxy-me:session:${slug}`

const BG = "#0a0a0f"
const SURFACE = "#14141f"
const BORDER = "rgba(255,255,255,0.09)"
const BORDER_STRONG = "rgba(255,255,255,0.16)"
const TEXT = "#f3f1ee"
const MUTED = "#9a9aae"
const MUTED2 = "#6e6e82"

type SavedSession = {
  sessionId: string
  name: string
  email: string
  introDone: boolean
  contactCaptured: boolean
  messages: { role: string; content: string }[]
  savedAt: number
}

function Avatar({ name, imageUrl }: { name: string; imageUrl?: string }) {
  const initial = name.charAt(0).toUpperCase()
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        style={{
          width: 72, height: 72, borderRadius: 20,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 0 24px rgba(139,109,255,0.4)",
          objectFit: "cover",
          marginBottom: 20,
        }}
      />
    )
  }
  return (
    <div style={{
      width: 72, height: 72, borderRadius: 20,
      background: "linear-gradient(135deg, #8b6dff 0%, #5a3fd4 100%)",
      border: `1px solid ${BORDER}`,
      boxShadow: "0 0 24px rgba(139,109,255,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 28, fontWeight: 700, color: TEXT,
      marginBottom: 20,
    }}>
      {initial}
    </div>
  )
}


export default function ChatInterface({ slug, displayName, headline, suggestedQuestions = [], contactCollection, imageUrl }: Props) {
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
  const [introNameError, setIntroNameError] = useState(false)
  const [introEmailError, setIntroEmailError] = useState(false)
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
        const sevenDays = 7 * 24 * 60 * 60 * 1000
        const expired = Date.now() - (saved.savedAt ?? 0) > sevenDays
        if (expired) {
          localStorage.removeItem(LS_SESSION(slug))
        } else if (saved.sessionId) {
          if (saved.name) setIntroName(saved.name)
          if (saved.email) { setIntroEmail(saved.email); setContactEmail(saved.email) }
          if (saved.email) setContactCaptured(true)
          if (saved.messages?.length > 0) {
            // Returning user with messages — restore full state
            if (saved.introDone) setIntrosDone(true)
            setResumeSession(saved)
            return
          }
          // No messages yet — restore session ID but don't skip the intro form
          // unless they already provided their email (contact captured)
          if (saved.email) setIntrosDone(true)
          setSessionId(saved.sessionId)
        }
      } catch { /* ignore */ }
    }
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

  const introNameRef = useRef(introName)
  const introEmailRef = useRef(introEmail)
  const contactNameRef = useRef(contactName)
  const contactEmailRef = useRef(contactEmail)
  useEffect(() => { introNameRef.current = introName }, [introName])
  useEffect(() => { introEmailRef.current = introEmail }, [introEmail])
  useEffect(() => { contactNameRef.current = contactName }, [contactName])
  useEffect(() => { contactEmailRef.current = contactEmail }, [contactEmail])

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        slug,
        sessionId,
        get visitorName() { return contactNameRef.current || introNameRef.current || null },
        get visitorEmail() { return contactEmailRef.current || introEmailRef.current || null },
      },
    }),
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

  // Persist session to localStorage whenever relevant state changes
  useEffect(() => {
    if (!sessionId) return
    // Only persist if there's something worth saving
    if (!introDone && messages.length === 0) return
    const saved: SavedSession = {
      sessionId,
      name: introName,
      email: introEmail,
      introDone,
      contactCaptured,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.parts?.filter((p) => p.type === "text").map((p) => p.text).join("") ?? "",
      })),
      savedAt: Date.now(),
    }
    localStorage.setItem(LS_SESSION(slug), JSON.stringify(saved))
  }, [messages, sessionId, introName, introEmail, introDone, contactCaptured, slug])

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  async function saveContact() {
    if (!showContactPrompt) return
    const emailToUse = contactEmail.trim()
    if (!emailToUse) { setContactError("Email is required."); return }
    if (!isValidEmail(emailToUse)) { setContactError("Please enter a valid email address."); return }
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
          sessionId,
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
    const requireName = contactCollection?.requireName !== false
    const requireEmail = contactCollection?.requireEmail === true

    if (requireName && !introName.trim()) { setIntroNameError(true); return }
    setIntroNameError(false)
    if (requireEmail && !introEmail.trim()) { setIntroEmailError(true); return }
    if (introEmail.trim() && !isValidEmail(introEmail.trim())) { setIntroEmailError(true); return }
    setIntroEmailError(false)

    const name = introName.trim()
    const email = introEmail.trim()
    if (name || email) {
      if (email) { setContactEmail(email); setContactCaptured(true) }
      if (name) setContactName(name)
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name: name || null, email: email || null, sessionId: null }),
      }).catch(() => {})
    }
    setIntrosDone(true)
  }

  const MAX_CHARS = 8000

  function submit(text?: string) {
    const t = text ?? inputValue.trim()
    if (!t || status === "streaming" || status === "submitted") return
    if (t.length > MAX_CHARS) return
    sendMessage({ parts: [{ type: "text", text: t }] })
    setInputValue("")
    setShowContactPrompt(false)
    startInactivityTimer()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit() }
  }

  const hasMessages = messages.length > 0

  // --- Resume banner ---
  if (resumeSession) {
    const preview = resumeSession.messages.filter((m) => m.role === "user")[0]?.content ?? ""
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, color: TEXT, alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 460, width: "100%", padding: "0 20px", boxSizing: "border-box" }}>
          <Avatar name={displayName} imageUrl={imageUrl} />
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
              style={{ background: "#8b6dff", color: "#0a0a0f", border: "none", borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
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
  const showIntroForm = !introDone && !hasMessages && sessionId && contactCollection?.enabled === true

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, color: TEXT }}>

      {/* Header */}
      <ChatHeader displayName={displayName} headline={headline} imageUrl={imageUrl} style={{ background: "#0e0e16", padding: "12px 20px" }} />

      {/* Message area */}
      <div style={{ flex: 1, overflowY: hasMessages ? "auto" : "hidden", padding: hasMessages ? "24px 0 0" : 0, display: "flex", flexDirection: "column" }}>
        <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", padding: "0 20px", flex: 1, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>

          {/* Empty state + optional intro form */}
          {!hasMessages && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 4px" }}>
              <Avatar name={displayName} imageUrl={imageUrl} />
              <h1 style={{ margin: 0, fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700, letterSpacing: "-1px", color: TEXT, fontStyle: "italic" }}>
                Talk to {displayName}
              </h1>
              {headline && (
                <p style={{ margin: "8px 0 0", fontSize: 14, color: MUTED }}>{headline}</p>
              )}

              {!showIntroForm && (
                <p style={{ margin: "16px auto 0", fontSize: 13, color: MUTED, maxWidth: 440, lineHeight: 1.6 }}>
                  Ask broad questions, follow up naturally, or paste a job description to check fit.
                </p>
              )}

              {suggestedQuestions.length > 0 && !showIntroForm && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 28, maxWidth: "100%" }}>
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => submit(q)}
                      style={{
                        background: "transparent",
                        border: `1px solid ${BORDER}`,
                        borderRadius: 100,
                        padding: "8px 14px",
                        fontSize: 13,
                        color: MUTED,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.28)"; (e.target as HTMLButtonElement).style.color = TEXT }}
                      onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.borderColor = BORDER; (e.target as HTMLButtonElement).style.color = MUTED }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => {
            const isUser = msg.role === "user"
            const text = msg.parts.filter((p) => p.type === "text").map((p) => p.text).join("").replace(COLLECT_TOKEN, "").trim()
            if (!text) return null
            return (
              <div key={msg.id} style={{ marginBottom: 12 }}>
                <ChatBubble role={isUser ? "user" : "assistant"} text={text} renderMarkdown={!isUser} />
              </div>
            )
          })}

          {status === "submitted" && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
              <div style={{ background: "#1b1b2a", border: `1px solid ${BORDER}`, borderRadius: "18px 18px 18px 4px", padding: "12px 16px", display: "flex", alignItems: "center", gap: 5 }}>
                {[0, 180, 360].map((delay) => (
                  <span key={delay} style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#8b6dff", animation: "chatDotBounce 1.1s ease-in-out infinite", animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
              <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", maxWidth: "78%", display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#f87171" }}>Something went wrong. The message wasn&apos;t sent.</p>
                <button
                  onClick={() => submit(inputValue || undefined)}
                  style={{ alignSelf: "flex-start", background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "5px 14px", fontSize: 12, color: "#f87171", cursor: "pointer" }}
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Contact prompt — only shown if email not already provided in intro */}
          {showContactPrompt && !contactCaptured && !contactDone && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "18px 18px 18px 4px", padding: "14px 18px", maxWidth: "78%" }}>
                <p style={{ margin: "0 0 12px", fontSize: 13, color: TEXT }}>
                  Would you mind leaving your email so we can follow up?
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {!introName && (
                    <TextField
                      size="small"
                      variant="outlined"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your name (optional)"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          background: "#14141f",
                          fontSize: 13,
                          "& fieldset": { borderColor: "rgba(255,255,255,0.09)" },
                          "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                          "&.Mui-focused fieldset": { borderColor: "rgba(139,109,255,0.6)", borderWidth: "1px" },
                        },
                        "& .MuiInputBase-input": { color: "#f3f1ee", padding: "8px 12px", "&::placeholder": { color: "#6e6e82", opacity: 1 } },
                      }}
                    />
                  )}
                  <TextField
                    size="small"
                    variant="outlined"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Your email *"
                    onKeyDown={(e) => e.key === "Enter" && saveContact()}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        background: "#14141f",
                        fontSize: 13,
                        "& fieldset": { borderColor: "rgba(255,255,255,0.09)" },
                        "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                        "&.Mui-focused fieldset": { borderColor: "rgba(139,109,255,0.6)", borderWidth: "1px" },
                      },
                      "& .MuiInputBase-input": { color: "#f3f1ee", padding: "8px 12px", "&::placeholder": { color: "#6e6e82", opacity: 1 } },
                    }}
                  />
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


          <div ref={bottomRef} style={{ height: hasMessages ? 120 : 0 }} />
        </div>
      </div>

      {/* Input bar / Intro form */}
      <div style={{ position: "sticky", bottom: 0, padding: "12px 12px 20px", background: `linear-gradient(to top, ${BG} 80%, transparent)` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {showIntroForm ? (
            /* Intro form — replaces textarea when contact collection is enabled */
            (() => {
              const reqName = contactCollection?.requireName !== false
              const reqEmail = contactCollection?.requireEmail === true
              const inputSx = {
                "& .MuiOutlinedInput-root": {
                  background: "#14141f", fontSize: 13,
                  "& fieldset": { borderColor: "rgba(255,255,255,0.09)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                  "&.Mui-focused fieldset": { borderColor: "rgba(139,109,255,0.6)", borderWidth: "1px" },
                },
                "& .MuiInputBase-input": { color: "#f3f1ee", padding: "8px 12px", "&::placeholder": { color: "#6e6e82", opacity: 1 } },
              }
              return (
            <div style={{ background: "#14141f", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "16px 18px", backdropFilter: "blur(12px)" }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: MUTED }}>
                Enter your details to start the conversation
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <TextField
                  autoFocus
                  size="small"
                  variant="outlined"
                  value={introName}
                  onChange={(e) => { setIntroName(e.target.value); if (e.target.value.trim()) setIntroNameError(false) }}
                  placeholder={reqName ? "Your name *" : "Your name (optional)"}
                  onKeyDown={(e) => e.key === "Enter" && submitIntro()}
                  error={introNameError}
                  helperText={introNameError ? "Please enter your name to continue" : undefined}
                  slotProps={{ formHelperText: { style: { color: "#f87171", margin: "4px 0 0", fontSize: 12 } } }}
                  sx={inputSx}
                />
                <TextField
                  size="small"
                  variant="outlined"
                  type="email"
                  value={introEmail}
                  onChange={(e) => { setIntroEmail(e.target.value); setIntroEmailError(false) }}
                  placeholder={reqEmail ? "Your email *" : "Your email (optional)"}
                  onKeyDown={(e) => e.key === "Enter" && submitIntro()}
                  error={introEmailError}
                  helperText={introEmailError ? reqEmail ? "Email is required." : "Please enter a valid email address." : undefined}
                  slotProps={{
                    htmlInput: { inputMode: "email", autoComplete: "email" },
                    formHelperText: { style: { color: "#f87171", margin: "4px 0 0", fontSize: 12 } },
                  }}
                  sx={inputSx}
                />
              </div>
              <button
                onClick={submitIntro}
                style={{ marginTop: 12, background: "#8b6dff", color: "#0a0a0f", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", touchAction: "manipulation" }}
              >
                Let's chat
              </button>
            </div>
              )
            })()
          ) : (
            <>
              <TextField
                inputRef={inputRef}
                fullWidth
                autoFocus
                multiline
                maxRows={6}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything, or paste a job description…"
                variant="outlined"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end" sx={{ alignSelf: "center", mr: "6px" }}>
                        <IconButton
                          onClick={() => submit()}
                          disabled={status === "streaming" || status === "submitted" || !inputValue.trim() || inputValue.length > MAX_CHARS}
                          size="small"
                          sx={{
                            width: 36, height: 36, borderRadius: "10px",
                            background: inputValue.trim() && inputValue.length <= MAX_CHARS && status !== "streaming" && status !== "submitted" ? "#8b6dff" : "rgba(255,255,255,0.08)",
                            boxShadow: inputValue.trim() && inputValue.length <= MAX_CHARS && status !== "streaming" && status !== "submitted" ? "0 0 16px rgba(139,109,255,0.4)" : "none",
                            "&:hover": { background: inputValue.trim() && inputValue.length <= MAX_CHARS ? "#7c5ef0" : "rgba(255,255,255,0.08)" },
                            "&.Mui-disabled": { background: "rgba(255,255,255,0.08)" },
                            transition: "background 0.15s",
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 19V5M5 12l7-7 7 7" stroke={inputValue.trim() && inputValue.length <= MAX_CHARS && status !== "streaming" && status !== "submitted" ? "#0a0a0f" : "rgba(255,255,255,0.3)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    background: "#14141f",
                    fontSize: 14,
                    color: TEXT,
                    backdropFilter: "blur(12px)",
                    alignItems: "center",
                    "& fieldset": { borderColor: BORDER_STRONG, transition: "border-color 0.15s" },
                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                    "&.Mui-focused fieldset": { borderColor: "rgba(139,109,255,0.6)", borderWidth: "1px" },
                  },
                  "& .MuiInputBase-input": {
                    padding: "10px 0 10px 18px",
                    color: TEXT,
                    lineHeight: 1.5,
                    "&::placeholder": { color: MUTED2, opacity: 1 },
                  },
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, padding: "0 4px" }}>
                <style>{`@media(max-width:640px){.kb-hint{display:none!important}}`}</style>
                <p className="kb-hint" style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", margin: 0 }}>
                  Enter to send · Shift+Enter for new line
                </p>
                {inputValue.length > MAX_CHARS * 0.8 && (
                  <p style={{ fontSize: 11, margin: 0, color: inputValue.length > MAX_CHARS ? "#f87171" : "rgba(255,255,255,0.3)" }}>
                    {inputValue.length}/{MAX_CHARS}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes chatDotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.4 }
        }
        ::placeholder { color: rgba(255,255,255,0.25) !important }
      `}</style>
    </div>
  )
}
