"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ManualInput() {
  const [text, setText] = useState("")
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle")
  const [message, setMessage] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return

    setStatus("saving")
    setMessage("")

    const formData = new FormData()
    formData.append("text", text)

    try {
      const res = await fetch("/api/ingest", { method: "POST", body: formData })
      if (!res.ok) throw new Error()
      setStatus("done")
      setMessage("Imported successfully.")
      router.push("/dashboard/sections")
    } catch {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-medium">Paste your background</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Paste your CV, LinkedIn summary, work history, skills — anything you want the AI to know about you."
        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-y"
      />
      <button
        type="submit"
        disabled={status === "saving" || !text.trim()}
        className="bg-black text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {status === "saving" ? "Importing…" : "Import text"}
      </button>
      {message && (
        <p className={`text-sm ${status === "error" ? "text-red-500" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </form>
  )
}
