"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useRef, useEffect, useState, useCallback } from "react"

type ContactCollection = { enabled: boolean; requireName: boolean; requireEmail: boolean }

type Props = {
  slug: string
  suggestedQuestions?: string[]
  contactCollection?: ContactCollection
}

const INACTIVITY_MS = 5 * 60 * 1000
const COLLECT_TOKEN = "[COLLECT_CONTACT]"

export default function ChatInterface({ slug, suggestedQuestions = [], contactCollection }: Props) {
  const [sessionId] = useState<string>(() => crypto.randomUUID())
  const [contactCaptured, setContactCaptured] = useState(false)
  const [showContactPrompt, setShowContactPrompt] = useState(false)
  const [contactDone, setContactDone] = useState(false)
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactSaving, setContactSaving] = useState(false)
  const [contactError, setContactError] = useState("")
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { slug, sessionId },
    }),
  })

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, showContactPrompt])

  // Watch for [COLLECT_CONTACT] token in assistant messages
  useEffect(() => {
    if (!contactCollection?.enabled || contactCaptured) return
    const lastMsg = messages[messages.length - 1]
    if (!lastMsg || lastMsg.role !== "assistant") return
    const text = lastMsg.parts?.filter((p) => p.type === "text").map((p) => p.text).join("") ?? ""
    if (text.includes(COLLECT_TOKEN)) {
      setShowContactPrompt(true)
    }
  }, [messages, contactCollection, contactCaptured])

  const startInactivityTimer = useCallback(() => {
    if (!contactCollection?.enabled || contactCaptured) return
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => {
      if (!contactCaptured) setShowContactPrompt(true)
    }, INACTIVITY_MS)
  }, [contactCollection, contactCaptured])

  useEffect(() => {
    return () => { if (inactivityTimer.current) clearTimeout(inactivityTimer.current) }
  }, [])

  async function saveContact() {
    if (!contactEmail.trim()) {
      setContactError("Email is required.")
      return
    }
    setContactSaving(true)
    setContactError("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name: contactName.trim() || null, email: contactEmail.trim() }),
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

  function submit(text?: string) {
    const t = text ?? inputRef.current?.value.trim()
    if (!t || status === "streaming") return
    sendMessage({ parts: [{ type: "text", text: t }] })
    if (!text && inputRef.current) inputRef.current.value = ""
    setShowContactPrompt(false)
    startInactivityTimer()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="space-y-4 pt-4">
            <p className="text-sm text-gray-400 text-center">
              Ask me anything about my background, or paste a job description to check fit.
            </p>
            {suggestedQuestions.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => submit(q)}
                    className="text-xs border rounded-full px-3 py-1.5 text-gray-600 hover:border-black hover:text-black transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {messages.map((msg) => {
          const isUser = msg.role === "user"
          const text = msg.parts
            .filter((p) => p.type === "text")
            .map((p) => p.text)
            .join("")
            .replace(COLLECT_TOKEN, "")
            .trim()
          if (!text) return null
          return (
            <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  isUser ? "bg-black text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                {text}
              </div>
            </div>
          )
        })}
        {status === "streaming" && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-400">…</div>
          </div>
        )}
        {error && (
          <p className="text-red-500 text-xs text-center">{error.message}</p>
        )}

        {/* Contact prompt — shown after AI signals end of conversation or inactivity */}
        {showContactPrompt && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 text-sm space-y-2 max-w-[80%]">
              <p>Would you mind leaving your details so we can follow up?</p>
              <div className="flex flex-col gap-1.5">
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white"
                />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Your email *"
                  className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white"
                  onKeyDown={(e) => e.key === "Enter" && saveContact()}
                />
                {contactError && <p className="text-red-500 text-xs">{contactError}</p>}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={saveContact}
                    disabled={contactSaving}
                    className="bg-black text-white rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                  >
                    {contactSaving ? "Saving…" : "Send"}
                  </button>
                  <button
                    onClick={() => { setShowContactPrompt(false); setContactCaptured(true); setContactDone(false) }}
                    className="text-xs text-gray-400 hover:text-black"
                  >
                    No thanks
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thank you message after contact submitted */}
        {contactDone && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-900">
              Thanks for sharing your details — we'll be in touch!
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit() }} className="flex gap-2 pt-2 border-t">
        <textarea
          ref={inputRef}
          rows={1}
          onKeyDown={handleKeyDown}
          placeholder="Ask about experience, skills, or paste a job description…"
          className="flex-1 resize-none border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="submit"
          disabled={status === "streaming"}
          className="bg-black text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  )
}
