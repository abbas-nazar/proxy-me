"use client"

import { useState } from "react"
import SectionCard from "./SectionCard"
import type { profileSections } from "@/db/schema"
import type { InferSelectModel } from "drizzle-orm"

type Section = InferSelectModel<typeof profileSections>

export default function SectionsList({ sections }: { sections: Section[] }) {
  const [items, setItems] = useState(sections)

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((s) => s.id !== id))
  }

  function handleUpdate(updated: Section) {
    setItems((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  }

  const grouped = items.reduce<Record<string, Section[]>>((acc, s) => {
    acc[s.type] = acc[s.type] ?? []
    acc[s.type].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([type, group]) => (
        <div key={type} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{type}</h2>
          {group.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
