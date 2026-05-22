"use client"

import { useState } from "react"
import type { profileSections } from "@/db/schema"
import type { InferSelectModel } from "drizzle-orm"

type Section = InferSelectModel<typeof profileSections>

const SUGGESTIONS = [
  { label: "Timezone", placeholder: "e.g. UTC+5, willing to overlap with EU and US East" },
  { label: "Languages", placeholder: "e.g. English (fluent), Urdu (native), French (basic)" },
  { label: "Open to relocation", placeholder: "e.g. Open to relocating to EU or North America" },
  { label: "Work preferences", placeholder: "e.g. Prefer remote-first, open to hybrid in Karachi" },
  { label: "Availability", placeholder: "e.g. Available from July 2026, 1 month notice period" },
]

type Props = {
  onAdd: (section: Section) => void
}

type ActiveForm = { title: string; placeholder: string }

export default function AddSection({ onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<ActiveForm | null>(null)
  const [customName, setCustomName] = useState("")
  const [text, setText] = useState("")
  const [saving, setSaving] = useState(false)

  function selectSuggestion(s: typeof SUGGESTIONS[number]) {
    setActive({ title: s.label, placeholder: s.placeholder })
    setText("")
  }

  function selectCustom() {
    if (!customName.trim()) return
    setActive({ title: customName.trim(), placeholder: "Add details…" })
    setText("")
  }

  async function save() {
    if (!active) return
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "custom", title: active.title, content: { text }, source: "manual" }),
      })
      if (!res.ok) throw new Error()
      const section = await res.json()
      onAdd(section)
      setOpen(false)
      setActive(null)
      setCustomName("")
      setText("")
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    setOpen(false)
    setActive(null)
    setCustomName("")
    setText("")
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setActive(null); setCustomName(""); setText("") }}
        className="w-full border border-dashed rounded-lg px-4 py-3 text-sm text-gray-400 hover:border-black hover:text-black transition-colors"
      >
        + Add section
      </button>
    )
  }

  if (active) {
    return (
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{active.title}</p>
          <button onClick={() => setActive(null)} className="text-xs text-gray-400 hover:text-black">← Back</button>
        </div>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={active.placeholder}
          autoFocus
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none"
        />
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={saving || !text.trim()}
            className="bg-black text-white rounded px-4 py-1.5 text-sm disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button onClick={cancel} className="text-sm text-gray-400 hover:text-black">Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Add a section</p>
        <button onClick={cancel} className="text-xs text-gray-400 hover:text-black">Cancel</button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-500">Suggestions</p>
        <div className="space-y-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => selectSuggestion(s)}
              className="w-full text-left border rounded-lg px-3 py-2 text-sm hover:border-black transition-colors"
            >
              <span className="font-medium">{s.label}</span>
              <span className="text-gray-400 ml-2 text-xs">{s.placeholder}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-500">Custom section</p>
        <div className="flex gap-2">
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && selectCustom()}
            placeholder="Section name"
            className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button
            disabled={!customName.trim()}
            onClick={selectCustom}
            className="border rounded px-3 py-1.5 text-sm hover:border-black disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
