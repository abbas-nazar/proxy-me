"use client"

import { useState } from "react"
import type { profileSections } from "@/db/schema"
import type { InferSelectModel } from "drizzle-orm"

type Section = InferSelectModel<typeof profileSections>

type Props = {
  section: Section
  onDelete: (id: string) => void
  onUpdate: (updated: Section) => void
}

function SectionContent({ type, content }: { type: string; content: unknown }) {
  const c = content as Record<string, unknown>

  if (type === "bio") {
    return <p className="text-sm text-gray-700">{c.text as string}</p>
  }

  if (type === "skills") {
    const items = c.items as string[]
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map((skill, i) => (
          <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
            {skill}
          </span>
        ))}
      </div>
    )
  }

  if (type === "experience") {
    const items = c.items as Array<{
      title: string; company: string; dates: string; description: string; highlights: string[]
    }>
    return (
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{item.title} · {item.company}</p>
              <span className="text-xs text-gray-400 shrink-0">{item.dates}</span>
            </div>
            {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
            {item.highlights?.length > 0 && (
              <ul className="list-disc list-inside space-y-0.5">
                {item.highlights.map((h, j) => (
                  <li key={j} className="text-sm text-gray-600">{h}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (type === "education") {
    const items = c.items as Array<{ degree: string; institution: string; dates: string }>
    return (
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">{item.degree}</p>
              <p className="text-sm text-gray-500">{item.institution}</p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">{item.dates}</span>
          </div>
        ))}
      </div>
    )
  }

  if (type === "projects") {
    const items = c.items as Array<{ name: string; description: string; highlights: string[] }>
    return (
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="space-y-1">
            <p className="text-sm font-medium">{item.name}</p>
            {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
            {item.highlights?.length > 0 && (
              <ul className="list-disc list-inside space-y-0.5">
                {item.highlights.map((h, j) => (
                  <li key={j} className="text-sm text-gray-600">{h}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    )
  }

  return <pre className="text-xs text-gray-600 whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</pre>
}

export default function SectionCard({ section, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(section.title ?? "")
  const [content, setContent] = useState(JSON.stringify(section.content, null, 2))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  const updatedAt = section.updatedAt
    ? new Date(section.updatedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })
    : null

  async function handleSave() {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: section.id, title, content: JSON.parse(content) }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      onUpdate(updated)
      setEditing(false)
    } catch {
      setError("Failed to save. Check that the content is valid JSON.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this section?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/profile/${section.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      onDelete(section.id)
    } catch {
      setError("Failed to delete.")
      setDeleting(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-full"
            />
          ) : (
            <p className="font-medium text-sm">{section.title ?? section.type}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="border rounded px-1.5 py-0.5">{section.source}</span>
            {updatedAt && <span>Updated {updatedAt}</span>}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs px-3 py-1 bg-black text-white rounded disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => { setEditing(false); setError("") }}
                className="text-xs px-3 py-1 border rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="text-xs px-3 py-1 border rounded hover:border-black"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs px-3 py-1 border rounded text-red-500 hover:border-red-500 disabled:opacity-50"
              >
                {deleting ? "…" : "Delete"}
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full border rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black"
        />
      ) : (
        <SectionContent type={section.type} content={section.content} />
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}
