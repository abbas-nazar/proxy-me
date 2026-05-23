"use client"

import { useState } from "react"
import type { profileSections } from "@/db/schema"
import type { InferSelectModel } from "drizzle-orm"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import AddIcon from "@mui/icons-material/Add"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

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

  function selectSuggestion(s: (typeof SUGGESTIONS)[number]) {
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

  // Closed state — dashed add button
  if (!open) {
    return (
      <Button
        fullWidth
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => { setOpen(true); setActive(null); setCustomName(""); setText("") }}
        sx={{
          borderStyle: "dashed",
          borderColor: "#d1d5db",
          color: "text.secondary",
          py: 1.25,
          fontSize: 13,
          "&:hover": { borderColor: "#111", color: "#111", borderStyle: "dashed" },
        }}
      >
        Add section
      </Button>
    )
  }

  // Active — text input for the chosen section
  if (active) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {active.title}
          </Typography>
          <Button
            size="small"
            startIcon={<ArrowBackIcon fontSize="small" />}
            onClick={() => setActive(null)}
            sx={{ color: "text.secondary", fontSize: 12 }}
          >
            Back
          </Button>
        </Box>
        <TextField
          multiline
          rows={3}
          fullWidth
          size="small"
          placeholder={active.placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Button
            variant="contained"
            size="small"
            onClick={save}
            disabled={saving || !text.trim()}
            sx={{ bgcolor: "#111", "&:hover": { bgcolor: "#333" } }}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            size="small"
            onClick={cancel}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    )
  }

  // Open — pick from suggestions or enter custom name
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Add a section
        </Typography>
        <Button size="small" onClick={cancel} sx={{ color: "text.secondary", fontSize: 12 }}>
          Cancel
        </Button>
      </Box>

      {/* Suggestions */}
      <Typography variant="overline" sx={{ color: "text.disabled", fontWeight: 700, letterSpacing: "0.08em", fontSize: 10 }}>
        Suggestions
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 0.75, mb: 2.5 }}>
        {SUGGESTIONS.map((s) => (
          <Button
            key={s.label}
            variant="outlined"
            fullWidth
            onClick={() => selectSuggestion(s)}
            sx={{
              justifyContent: "flex-start",
              borderColor: "#e5e7eb",
              color: "text.primary",
              textTransform: "none",
              py: 1,
              px: 1.5,
              "&:hover": { borderColor: "#111" },
            }}
          >
            <Box component="span" sx={{ fontWeight: 600, fontSize: 13, mr: 1 }}>
              {s.label}
            </Box>
            <Box component="span" sx={{ color: "text.disabled", fontSize: 12 }}>
              {s.placeholder}
            </Box>
          </Button>
        ))}
      </Box>

      {/* Custom section */}
      <Typography variant="overline" sx={{ color: "text.disabled", fontWeight: 700, letterSpacing: "0.08em", fontSize: 10 }}>
        Custom section
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mt: 0.75, alignItems: "center" }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Section name"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && selectCustom()}
        />
        <Button
          variant="outlined"
          size="small"
          disabled={!customName.trim()}
          onClick={selectCustom}
          sx={{ borderColor: "#e5e7eb", color: "text.primary", "&:hover": { borderColor: "#111" }, whiteSpace: "nowrap", height: 40, flexShrink: 0 }}
        >
          Next
        </Button>
      </Box>
    </Paper>
  )
}
