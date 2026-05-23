"use client"

import { useState } from "react"
import SectionCard from "./SectionCard"
import AddSection from "./AddSection"
import type { profileSections } from "@/db/schema"
import type { InferSelectModel } from "drizzle-orm"

type Section = InferSelectModel<typeof profileSections>

const CORE_TYPES: { type: string; title: string; emptyContent: unknown }[] = [
  { type: "bio", title: "Bio", emptyContent: { text: "" } },
  { type: "experience", title: "Experience", emptyContent: { items: [] } },
  { type: "education", title: "Education", emptyContent: { items: [] } },
  { type: "skills", title: "Skills", emptyContent: { items: [] } },
  { type: "projects", title: "Projects", emptyContent: { items: [] } },
]

function EmptySectionCard({ type, title, onSave }: { type: string; title: string; onSave: (s: Section) => void }) {
  async function handleCreate() {
    const core = CORE_TYPES.find((c) => c.type === type)!
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title, content: core.emptyContent, source: "manual" }),
    })
    if (!res.ok) return
    const section = await res.json()
    onSave(section)
  }

  return (
    <button
      onClick={handleCreate}
      className="w-full text-left border border-dashed rounded-lg px-4 py-3 text-sm text-gray-400 hover:border-black hover:text-black transition-colors"
    >
      + Add {title.toLowerCase()}
    </button>
  )
}

export default function SectionsList({ sections }: { sections: Section[] }) {
  const [items, setItems] = useState(sections)
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null)

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((s) => s.id !== id))
  }

  function handleUpdate(updated: Section) {
    setNewlyCreatedId(null)
    setItems((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  }

  function handleAdd(section: Section, openEditor = false) {
    if (openEditor) setNewlyCreatedId(section.id)
    setItems((prev) => [...prev, section])
  }

  const existingTypes = new Set(items.map((s) => s.type))

  const grouped = items.reduce<Record<string, Section[]>>((acc, s) => {
    const key = s.title ?? s.type
    acc[key] = acc[key] ?? []
    acc[key].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {CORE_TYPES.map(({ type, title }) =>
        existingTypes.has(type) ? (
          <div key={type} className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h2>
            {(grouped[title] ?? []).map((section) => (
              <SectionCard
                key={section.id + (section.id === newlyCreatedId ? "-new" : "")}
                section={section}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                initialEditing={section.id === newlyCreatedId}
              />
            ))}
          </div>
        ) : (
          <div key={type} className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h2>
            <EmptySectionCard type={type} title={title} onSave={(s) => handleAdd(s, true)} />
          </div>
        )
      )}

      {Object.entries(grouped)
        .filter(([label]) => !CORE_TYPES.some((c) => c.title === label))
        .map(([label, group]) => (
          <div key={label} className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</h2>
            {group.map((section) => (
              <SectionCard
                key={section.id + (section.id === newlyCreatedId ? "-new" : "")}
                section={section}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                initialEditing={section.id === newlyCreatedId}
              />
            ))}
          </div>
        ))}

      <AddSection onAdd={handleAdd} />
    </div>
  )
}
