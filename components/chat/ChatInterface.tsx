"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useRef, useEffect } from "react"

type Props = {
  slug: string
}

export default function ChatInterface({ slug }: Props) {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { slug },
    }),
  })

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function submit() {
    const text = inputRef.current?.value.trim()
    if (!text || status === "streaming") return
    sendMessage({ parts: [{ type: "text", text }] })
    if (inputRef.current) inputRef.current.value = ""
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
          <p className="text-sm text-gray-400 text-center pt-8">
            Ask me anything about their background, skills, or paste a job description to check fit.
          </p>
        )}
        {messages.map((msg) => {
          const isUser = msg.role === "user"
          const text = msg.parts
            .filter((p) => p.type === "text")
            .map((p) => p.text)
            .join("")
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
