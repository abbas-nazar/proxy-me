"use client"

import { useState } from "react"

type ExperienceItem = { title: string; company: string; dates: string; description: string; highlights: string[] }
type EducationItem = { degree: string; institution: string; dates: string }
type ProjectItem = { name: string; description: string; highlights: string[] }

function HighlightsEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-500">Highlights (one per line)</label>
      <textarea
        rows={3}
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
      />
    </div>
  )
}

function field(label: string, value: string, onChange: (v: string) => void, multiline = false) {
  const cls = "w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-500">{label}</label>
      {multiline
        ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      }
    </div>
  )
}

export function BioEditor({ content, onChange }: { content: { text: string }; onChange: (c: unknown) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-500">Bio</label>
      <textarea
        rows={4}
        value={content.text}
        onChange={(e) => onChange({ text: e.target.value })}
        className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
      />
    </div>
  )
}

export function SkillsEditor({ content, onChange }: { content: { items: string[] }; onChange: (c: unknown) => void }) {
  const [raw, setRaw] = useState(() => content.items.join(", "))

  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-500">Skills (comma-separated)</label>
      <textarea
        rows={3}
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value)
          onChange({ items: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
        }}
        className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
      />
    </div>
  )
}

export function ExperienceEditor({ content, onChange }: { content: { items: ExperienceItem[] }; onChange: (c: unknown) => void }) {
  const [items, setItems] = useState<ExperienceItem[]>(content.items)

  function update(i: number, patch: Partial<ExperienceItem>) {
    const next = items.map((item, idx) => idx === i ? { ...item, ...patch } : item)
    setItems(next)
    onChange({ items: next })
  }

  function remove(i: number) {
    const next = items.filter((_, idx) => idx !== i)
    setItems(next)
    onChange({ items: next })
  }

  function add() {
    const next = [...items, { title: "", company: "", dates: "", description: "", highlights: [] }]
    setItems(next)
    onChange({ items: next })
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">Position {i + 1}</span>
            <button onClick={() => remove(i)} className="text-xs text-red-500 hover:underline">Remove</button>
          </div>
          {field("Job title", item.title, (v) => update(i, { title: v }))}
          {field("Company", item.company, (v) => update(i, { company: v }))}
          {field("Dates", item.dates, (v) => update(i, { dates: v }))}
          {field("Description", item.description, (v) => update(i, { description: v }), true)}
          <HighlightsEditor value={item.highlights} onChange={(v) => update(i, { highlights: v })} />
        </div>
      ))}
      <button onClick={add} className="text-xs border rounded px-3 py-1.5 hover:border-black">+ Add position</button>
    </div>
  )
}

export function EducationEditor({ content, onChange }: { content: { items: EducationItem[] }; onChange: (c: unknown) => void }) {
  const [items, setItems] = useState<EducationItem[]>(content.items)

  function update(i: number, patch: Partial<EducationItem>) {
    const next = items.map((item, idx) => idx === i ? { ...item, ...patch } : item)
    setItems(next)
    onChange({ items: next })
  }

  function remove(i: number) {
    const next = items.filter((_, idx) => idx !== i)
    setItems(next)
    onChange({ items: next })
  }

  function add() {
    const next = [...items, { degree: "", institution: "", dates: "" }]
    setItems(next)
    onChange({ items: next })
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">Entry {i + 1}</span>
            <button onClick={() => remove(i)} className="text-xs text-red-500 hover:underline">Remove</button>
          </div>
          {field("Degree", item.degree, (v) => update(i, { degree: v }))}
          {field("Institution", item.institution, (v) => update(i, { institution: v }))}
          {field("Dates", item.dates, (v) => update(i, { dates: v }))}
        </div>
      ))}
      <button onClick={add} className="text-xs border rounded px-3 py-1.5 hover:border-black">+ Add entry</button>
    </div>
  )
}

export function ProjectsEditor({ content, onChange }: { content: { items: ProjectItem[] }; onChange: (c: unknown) => void }) {
  const [items, setItems] = useState<ProjectItem[]>(content.items)

  function update(i: number, patch: Partial<ProjectItem>) {
    const next = items.map((item, idx) => idx === i ? { ...item, ...patch } : item)
    setItems(next)
    onChange({ items: next })
  }

  function remove(i: number) {
    const next = items.filter((_, idx) => idx !== i)
    setItems(next)
    onChange({ items: next })
  }

  function add() {
    const next = [...items, { name: "", description: "", highlights: [] }]
    setItems(next)
    onChange({ items: next })
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">Project {i + 1}</span>
            <button onClick={() => remove(i)} className="text-xs text-red-500 hover:underline">Remove</button>
          </div>
          {field("Name", item.name, (v) => update(i, { name: v }))}
          {field("Description", item.description, (v) => update(i, { description: v }), true)}
          <HighlightsEditor value={item.highlights} onChange={(v) => update(i, { highlights: v })} />
        </div>
      ))}
      <button onClick={add} className="text-xs border rounded px-3 py-1.5 hover:border-black">+ Add project</button>
    </div>
  )
}

export function CustomEditor({ content, onChange }: { content: { text: string }; onChange: (c: unknown) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-500">Details</label>
      <textarea
        rows={4}
        value={content.text ?? ""}
        onChange={(e) => onChange({ text: e.target.value })}
        className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
      />
    </div>
  )
}
