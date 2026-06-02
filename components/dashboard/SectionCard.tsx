"use client"

import { useState } from "react"
import type { profileSections } from "@/db/schema"
import type { InferSelectModel } from "drizzle-orm"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import TextField from "@mui/material/TextField"
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
    return (
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {c.text as string}
      </Typography>
    )
  }

  if (type === "skills") {
    const items = c.items as string[]
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {items.map((skill, i) => (
          <Chip key={i} label={skill} size="small" variant="outlined" sx={{ fontSize: 11 }} />
        ))}
      </Box>
    )
  }

  if (type === "experience") {
    const items = c.items as Array<{ title: string; company: string; dates: string; description: string; highlights: string[] }>
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((item, i) => (
          <Box key={i}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.title} · {item.company}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.disabled", whiteSpace: "nowrap" }}>
                {item.dates}
              </Typography>
            </Box>
            {item.description && (
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                {item.description}
              </Typography>
            )}
            {item.highlights?.length > 0 && (
              <Box component="ul" sx={{ pl: 2, mt: 0.5, mb: 0 }}>
                {item.highlights.map((h, j) => (
                  <Box component="li" key={j}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>{h}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    )
  }

  if (type === "education") {
    const items = c.items as Array<{ degree: string; institution: string; dates: string }>
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {items.map((item, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.degree}</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>{item.institution}</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "text.disabled", whiteSpace: "nowrap" }}>
              {item.dates}
            </Typography>
          </Box>
        ))}
      </Box>
    )
  }

  if (type === "projects") {
    const items = c.items as Array<{ name: string; description: string; highlights: string[] }>
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((item, i) => (
          <Box key={i}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
            {item.description && (
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>{item.description}</Typography>
            )}
            {item.highlights?.length > 0 && (
              <Box component="ul" sx={{ pl: 2, mt: 0.5, mb: 0 }}>
                {item.highlights.map((h, j) => (
                  <Box component="li" key={j}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>{h}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    )
  }

  // custom / fallback
  return (
    <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "pre-wrap" }}>
      {(c.text as string) ?? ""}
    </Typography>
  )
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
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
      {/* Meta row: chip + date */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
        <Chip label={section.source} size="small" variant="outlined" sx={{ fontSize: 10, height: 18, "& .MuiChip-label": { px: 0.75 } }} />
        {updatedAt && (
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            Updated {updatedAt}
          </Typography>
        )}
      </Box>

      {/* Edit mode: title field */}
      {editing && !CORE_TYPES.has(section.type) && (
        <TextField value={title} onChange={(e) => setTitle(e.target.value)} size="small" fullWidth sx={{ mb: 2 }} />
      )}

      {/* Content or editor */}
      {editing ? (
        <SectionEditForm type={section.type} content={editedContent} onChange={setEditedContent} />
      ) : (
        <SectionContent type={section.type} content={section.content} />
      )}

      {error && (
        <Typography variant="caption" sx={{ color: "error.main", display: "block", mt: 1 }}>
          {error}
        </Typography>
      )}

      {/* Action buttons at bottom */}
      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        {editing ? (
          <>
            <Button size="small" variant="contained" onClick={handleSave} disabled={saving}
              sx={{ bgcolor: "#8b6dff", "&:hover": { bgcolor: "#7a5ce8" }, fontSize: 12 }}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button size="small" variant="outlined" onClick={handleCancel}
              sx={{ fontSize: 12, borderColor: "rgba(255,255,255,0.09)", color: "text.primary" }}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button size="small" variant="outlined" onClick={() => setEditing(true)}
              sx={{ fontSize: 12, borderColor: "rgba(255,255,255,0.09)", color: "text.primary", "&:hover": { borderColor: "rgba(255,255,255,0.16)" } }}>
              Edit
            </Button>
            <Button size="small" variant="outlined" onClick={handleDelete} disabled={deleting}
              sx={{ fontSize: 12, borderColor: "rgba(255,255,255,0.09)", color: "error.main", "&:hover": { borderColor: "error.main" } }}>
              {deleting ? "…" : "Delete"}
            </Button>
          </>
        )}
      </Box>
    </Paper>
  )
}
