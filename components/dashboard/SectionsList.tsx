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
      style={{
        width: "100%", textAlign: "left", border: "1px dashed rgba(255,255,255,0.12)",
        borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#6e6e82",
        background: "transparent", cursor: "pointer", transition: "border-color 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,109,255,0.4)"; (e.currentTarget as HTMLButtonElement).style.color = "#c4b5fd" }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "#6e6e82" }}
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
    acc[s.type] = acc[s.type] ?? []
    acc[s.type].push(s)
    return acc
  }, {})

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {CORE_TYPES.map(({ type, title }) =>
        existingTypes.has(type) ? (
          <div key={type} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#6e6e82", textTransform: "uppercase" }}>{title}</div>
            {(grouped[type] ?? []).map((section) => (
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
          <div key={type} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#6e6e82", textTransform: "uppercase" }}>{title}</div>
            <EmptySectionCard type={type} title={title} onSave={(s) => handleAdd(s, true)} />
          </div>
        )
      )}

      {Object.entries(grouped)
        .filter(([type]) => !CORE_TYPES.some((c) => c.type === type))
        .map(([, group]) => (
          <div key={group[0].id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#6e6e82", textTransform: "uppercase" }}>{group[0].title ?? group[0].type}</div>
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
