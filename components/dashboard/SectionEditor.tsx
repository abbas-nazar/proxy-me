"use client"

import { useState } from "react"
import TextField from "@mui/material/TextField"

type ExperienceItem = { title: string; company: string; dates: string; description: string; highlights: string[] }
type EducationItem = { degree: string; institution: string; dates: string }
type ProjectItem = { name: string; description: string; highlights: string[] }

const entryBoxStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8,
  padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10,
  background: "#0e0e16",
}

const addBtnStyle: React.CSSProperties = {
  fontSize: 12, color: "#8b6dff", background: "transparent",
  border: "1px solid rgba(139,109,255,0.3)", borderRadius: 6,
  padding: "6px 14px", cursor: "pointer", alignSelf: "flex-start",
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    background: "#0a0a0f",
    fontSize: 13,
    "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.22)" },
    "&.Mui-focused fieldset": { borderColor: "rgba(139,109,255,0.5)", borderWidth: "1px" },
  },
  "& .MuiInputBase-input": { color: "#f3f1ee", padding: "7px 10px", "&::placeholder": { color: "#6e6e82", opacity: 1 } },
  "& .MuiInputLabel-root": { color: "#6e6e82", fontSize: 11 },
  "& .MuiInputLabel-root.Mui-focused": { color: "#8b6dff" },
}

const multilineSx = {
  ...fieldSx,
  "& .MuiInputBase-inputMultiline": { padding: "7px 10px" },
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  if (multiline) {
    return (
      <TextField
        label={label}
        size="small"
        variant="outlined"
        fullWidth
        multiline
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={multilineSx}
      />
    )
  }
  return (
    <TextField
      label={label}
      size="small"
      variant="outlined"
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={fieldSx}
    />
  )
}

function HighlightsEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <TextField
      label="Highlights (one per line)"
      size="small"
      variant="outlined"
      fullWidth
      multiline
      rows={3}
      value={value.join("\n")}
      onChange={(e) => onChange(e.target.value.split("\n"))}
      sx={multilineSx}
    />
  )
}

export function BioEditor({ content, onChange }: { content: { text: string }; onChange: (c: unknown) => void }) {
  return (
    <TextField
      size="small"
      variant="outlined"
      fullWidth
      multiline
      rows={4}
      value={content.text}
      onChange={(e) => onChange({ text: e.target.value })}
      sx={multilineSx}
    />
  )
}

export function SkillsEditor({ content, onChange }: { content: { items: string[] }; onChange: (c: unknown) => void }) {
  const [raw, setRaw] = useState(() => content.items.join(", "))
  return (
    <TextField
      label="Comma-separated"
      size="small"
      variant="outlined"
      fullWidth
      multiline
      rows={3}
      value={raw}
      onChange={(e) => {
        setRaw(e.target.value)
        onChange({ items: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
      }}
      sx={multilineSx}
    />
  )
}

export function ExperienceEditor({ content, onChange }: { content: { items: ExperienceItem[] }; onChange: (c: unknown) => void }) {
  const [items, setItems] = useState<ExperienceItem[]>(content.items)

  function update(i: number, patch: Partial<ExperienceItem>) {
    const next = items.map((item, idx) => idx === i ? { ...item, ...patch } : item)
    setItems(next); onChange({ items: next })
  }
  function remove(i: number) {
    const next = items.filter((_, idx) => idx !== i)
    setItems(next); onChange({ items: next })
  }
  function add() {
    const next = [...items, { title: "", company: "", dates: "", description: "", highlights: [] }]
    setItems(next); onChange({ items: next })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item, i) => (
        <div key={i} style={entryBoxStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#9a9aae" }}>Position {i + 1}</span>
            <button onClick={() => remove(i)} style={{ fontSize: 12, color: "#f87171", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
          </div>
          <Field label="Job title" value={item.title} onChange={(v) => update(i, { title: v })} />
          <Field label="Company" value={item.company} onChange={(v) => update(i, { company: v })} />
          <Field label="Dates" value={item.dates} onChange={(v) => update(i, { dates: v })} />
          <Field label="Description" value={item.description} onChange={(v) => update(i, { description: v })} multiline />
          <HighlightsEditor value={item.highlights} onChange={(v) => update(i, { highlights: v })} />
        </div>
      ))}
      <button onClick={add} style={addBtnStyle}>+ Add position</button>
    </div>
  )
}

export function EducationEditor({ content, onChange }: { content: { items: EducationItem[] }; onChange: (c: unknown) => void }) {
  const [items, setItems] = useState<EducationItem[]>(content.items)

  function update(i: number, patch: Partial<EducationItem>) {
    const next = items.map((item, idx) => idx === i ? { ...item, ...patch } : item)
    setItems(next); onChange({ items: next })
  }
  function remove(i: number) {
    const next = items.filter((_, idx) => idx !== i)
    setItems(next); onChange({ items: next })
  }
  function add() {
    const next = [...items, { degree: "", institution: "", dates: "" }]
    setItems(next); onChange({ items: next })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item, i) => (
        <div key={i} style={entryBoxStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#9a9aae" }}>Entry {i + 1}</span>
            <button onClick={() => remove(i)} style={{ fontSize: 12, color: "#f87171", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
          </div>
          <Field label="Degree" value={item.degree} onChange={(v) => update(i, { degree: v })} />
          <Field label="Institution" value={item.institution} onChange={(v) => update(i, { institution: v })} />
          <Field label="Dates" value={item.dates} onChange={(v) => update(i, { dates: v })} />
        </div>
      ))}
      <button onClick={add} style={addBtnStyle}>+ Add entry</button>
    </div>
  )
}

export function ProjectsEditor({ content, onChange }: { content: { items: ProjectItem[] }; onChange: (c: unknown) => void }) {
  const [items, setItems] = useState<ProjectItem[]>(content.items)

  function update(i: number, patch: Partial<ProjectItem>) {
    const next = items.map((item, idx) => idx === i ? { ...item, ...patch } : item)
    setItems(next); onChange({ items: next })
  }
  function remove(i: number) {
    const next = items.filter((_, idx) => idx !== i)
    setItems(next); onChange({ items: next })
  }
  function add() {
    const next = [...items, { name: "", description: "", highlights: [] }]
    setItems(next); onChange({ items: next })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item, i) => (
        <div key={i} style={entryBoxStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#9a9aae" }}>Project {i + 1}</span>
            <button onClick={() => remove(i)} style={{ fontSize: 12, color: "#f87171", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
          </div>
          <Field label="Name" value={item.name} onChange={(v) => update(i, { name: v })} />
          <Field label="Description" value={item.description} onChange={(v) => update(i, { description: v })} multiline />
          <HighlightsEditor value={item.highlights} onChange={(v) => update(i, { highlights: v })} />
        </div>
      ))}
      <button onClick={add} style={addBtnStyle}>+ Add project</button>
    </div>
  )
}

export function CustomEditor({ content, onChange }: { content: { text: string }; onChange: (c: unknown) => void }) {
  return (
    <TextField
      label="Details"
      size="small"
      variant="outlined"
      fullWidth
      multiline
      rows={4}
      value={content.text ?? ""}
      onChange={(e) => onChange({ text: e.target.value })}
      sx={multilineSx}
    />
  )
}
