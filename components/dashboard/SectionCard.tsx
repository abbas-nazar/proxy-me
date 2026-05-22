"use client"

import { useState } from "react"
import type { profileSections } from "@/db/schema"
import type { InferSelectModel } from "drizzle-orm"
import {
  BioEditor, SkillsEditor, ExperienceEditor,
  EducationEditor, ProjectsEditor, CustomEditor,
} from "./SectionEditor"

type Section = InferSelectModel<typeof profileSections>

type Props = {
  section: Section
  onDelete: (id: string) => void
  onUpdate: (updated: Section) => void
  initialEditing?: boolean
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
          <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{skill}</span>
        ))}
      </div>
    )
  }

  if (type === "experience") {
    const items = c.items as Array<{ title: string; company: string; dates: string; description: string; highlights: string[] }>
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
                {item.highlights.map((h, j) => <li key={j} className="text-sm text-gray-600">{h}</li>)}
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
                {item.highlights.map((h, j) => <li key={j} className="text-sm text-gray-600">{h}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (type === "custom") {
    return <p className="text-sm text-gray-700 whitespace-pre-wrap">{(c.text as string) ?? ""}</p>
  }

  return <p className="text-sm text-gray-700 whitespace-pre-wrap">{(c.text as string) ?? ""}</p>
}

function SectionEditForm({
  type, content, onChange,
}: {
  type: string
  content: unknown
  onChange: (c: unknown) => void
}) {
  if (type === "bio") return <BioEditor content={content as { text: string }} onChange={onChange} />
  if (type === "skills") return <SkillsEditor content={content as { items: string[] }} onChange={onChange} />
  if (type === "experience") return <ExperienceEditor content={content as { items: never[] }} onChange={onChange} />
  if (type === "education") return <EducationEditor content={content as { items: never[] }} onChange={onChange} />
  if (type === "projects") return <ProjectsEditor content={content as { items: never[] }} onChange={onChange} />
  return <CustomEditor content={content as { text: string }} onChange={onChange} />
}

const CORE_TYPES = new Set(["bio", "experience", "education", "skills", "projects"])

export default function SectionCard({ section, onDelete, onUpdate, initialEditing = false }: Props) {
  const [editing, setEditing] = useState(initialEditing)
  const [title, setTitle] = useState(section.title ?? "")
  const [editedContent, setEditedContent] = useState<unknown>(section.content)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  const updatedAt = section.updatedAt
    ? new Date(section.updatedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })
    : null

  function handleCancel() {
    setEditedContent(section.content)
    setTitle(section.title ?? "")
    setEditing(false)
    setError("")
  }

  async function handleSave() {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: section.id, title, content: editedContent }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      onUpdate(updated)
      setEditing(false)
    } catch {
      setError("Failed to save.")
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
        <div className="space-y-0.5 min-w-0">
          {editing && !CORE_TYPES.has(section.type) ? (
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
              <button onClick={handleSave} disabled={saving} className="text-xs px-3 py-1 bg-black text-white rounded disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={handleCancel} className="text-xs px-3 py-1 border rounded">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="text-xs px-3 py-1 border rounded hover:border-black">
                Edit
              </button>
              <button onClick={handleDelete} disabled={deleting} className="text-xs px-3 py-1 border rounded text-red-500 hover:border-red-500 disabled:opacity-50">
                {deleting ? "…" : "Delete"}
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <SectionEditForm type={section.type} content={editedContent} onChange={setEditedContent} />
      ) : (
        <SectionContent type={section.type} content={section.content} />
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}
