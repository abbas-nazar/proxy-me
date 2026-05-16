"use client"

import { useState } from "react"

type Props = {
  user: { id: string; slug: string; isPublic: boolean }
}

export default function SettingsForm({ user }: Props) {
  const [isPublic, setIsPublic] = useState(user.isPublic)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${user.slug}`

  async function togglePublic() {
    setSaving(true)
    try {
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      })
      setIsPublic((v) => !v)
    } finally {
      setSaving(false)
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-md">
      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-medium">Shareable link</h2>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm bg-gray-50 border rounded px-3 py-2 truncate">
            {publicUrl}
          </code>
          <button
            onClick={copyLink}
            className="text-sm px-3 py-2 border rounded hover:border-black shrink-0"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="border rounded-lg p-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium">Public profile</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isPublic ? "Anyone with the link can chat with your AI." : "Your profile is hidden from visitors."}
          </p>
        </div>
        <button
          onClick={togglePublic}
          disabled={saving}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            isPublic ? "bg-black" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transition-transform ${
              isPublic ? "translate-x-5.5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  )
}
