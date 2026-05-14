"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

export default function CVUploader() {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle")
  const [message, setMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const file = inputRef.current?.files?.[0]
    if (!file) return

    setStatus("uploading")
    setMessage("")

    const formData = new FormData()
    formData.append("file", file)

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
      <label className="block text-sm font-medium">Upload PDF</label>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        required
        className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:border file:rounded file:text-sm file:font-medium file:cursor-pointer"
      />
      <button
        type="submit"
        disabled={status === "uploading"}
        className="bg-black text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {status === "uploading" ? "Importing…" : "Import PDF"}
      </button>
      {message && (
        <p className={`text-sm ${status === "error" ? "text-red-500" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </form>
  )
}
