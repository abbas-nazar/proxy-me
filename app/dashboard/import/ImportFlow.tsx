"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Paper from "@mui/material/Paper"
import CircularProgress from "@mui/material/CircularProgress"
import Checkbox from "@mui/material/Checkbox"
import FormControlLabel from "@mui/material/FormControlLabel"
import type { ParsedProfile } from "@/lib/parser"

type Step = "upload" | "parsing" | "review"

type ReviewSection = {
  key: keyof ParsedProfile
  label: string
  included: boolean
  preview: string
}

function profileToReviewSections(profile: ParsedProfile): ReviewSection[] {
  const sections: ReviewSection[] = []
  if (profile.bio)
    sections.push({ key: "bio", label: "Bio", included: true, preview: profile.bio.slice(0, 120) + (profile.bio.length > 120 ? "…" : "") })
  if (profile.experience?.length)
    sections.push({ key: "experience", label: `Experience (${profile.experience.length} positions)`, included: true, preview: profile.experience.map((e) => `${e.title} at ${e.company}`).join(", ") })
  if (profile.education?.length)
    sections.push({ key: "education", label: `Education (${profile.education.length} entries)`, included: true, preview: profile.education.map((e) => `${e.degree}, ${e.institution}`).join(", ") })
  if (profile.skills?.length)
    sections.push({ key: "skills", label: `Skills (${profile.skills.length})`, included: true, preview: profile.skills.slice(0, 8).join(", ") + (profile.skills.length > 8 ? "…" : "") })
  if (profile.projects?.length)
    sections.push({ key: "projects", label: `Projects (${profile.projects.length})`, included: true, preview: profile.projects.map((p) => p.name).join(", ") })
  return sections
}

export default function ImportFlow() {
  const [step, setStep] = useState<Step>("upload")
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ParsedProfile | null>(null)
  const [reviewSections, setReviewSections] = useState<ReviewSection[]>([])
  const [error, setError] = useState("")
  const [fileName, setFileName] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleParse() {
    const file = fileRef.current?.files?.[0]
    if (!file) { setError("Please select a PDF file."); return }
    setError("")
    setStep("parsing")
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/parse", { method: "POST", body: formData })
      if (!res.ok) throw new Error()
      const parsed: ParsedProfile = await res.json()
      setProfile(parsed)
      setReviewSections(profileToReviewSections(parsed))
      setStep("review")
    } catch {
      setStep("upload")
      setError("Failed to parse your CV. Please try again.")
    }
  }

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    setError("")
    const included = new Set(reviewSections.filter((s) => s.included).map((s) => s.key))
    const rows: { type: string; title: string; content: unknown; source: string }[] = []
    if (included.has("bio") && profile.bio)
      rows.push({ type: "bio", title: "Bio", content: { text: profile.bio }, source: "cv" })
    if (included.has("experience") && profile.experience?.length)
      rows.push({ type: "experience", title: "Experience", content: { items: profile.experience }, source: "cv" })
    if (included.has("education") && profile.education?.length)
      rows.push({ type: "education", title: "Education", content: { items: profile.education }, source: "cv" })
    if (included.has("skills") && profile.skills?.length)
      rows.push({ type: "skills", title: "Skills", content: { items: profile.skills }, source: "cv" })
    if (included.has("projects") && profile.projects?.length)
      rows.push({ type: "projects", title: "Projects", content: { items: profile.projects }, source: "cv" })
    try {
      await fetch("/api/profile/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      })
      router.push("/dashboard/sections")
    } catch {
      setError("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  function toggleSection(key: keyof ParsedProfile) {
    setReviewSections((prev) => prev.map((s) => s.key === key ? { ...s, included: !s.included } : s))
  }

  if (step === "parsing") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 10, gap: 2 }}>
        <CircularProgress size={28} sx={{ color: "#8b6dff" }} />
        <Typography variant="body2" sx={{ color: "text.secondary" }}>Extracting your profile…</Typography>
      </Box>
    )
  }

  if (step === "review") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 600 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Review extracted sections</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Uncheck anything you don't want to save.</Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {reviewSections.map((s) => (
            <Paper
              key={s.key}
              variant="outlined"
              sx={{
                px: 2, py: 1.5, borderRadius: 2, cursor: "pointer",
                "&:hover": { borderColor: "rgba(255,255,255,0.25)" }, transition: "border-color 0.15s",
                borderColor: s.included ? "rgba(139,109,255,0.5)" : "divider",
              }}
              onClick={() => toggleSection(s.key)}
            >
              <FormControlLabel
                control={<Checkbox checked={s.included} size="small" sx={{ color: "#8b6dff", "&.Mui-checked": { color: "#8b6dff" } }} />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{s.label}</Typography>
                    <Typography variant="caption" sx={{ color: "text.disabled" }}>{s.preview}</Typography>
                  </Box>
                }
                sx={{ m: 0, width: "100%", pointerEvents: "none" }}
              />
            </Paper>
          ))}
        </Box>
        {error && <Typography variant="caption" sx={{ color: "error.main" }}>{error}</Typography>}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || reviewSections.every((s) => !s.included)}
            sx={{ bgcolor: "#8b6dff", color: "#0a0a0f", "&:hover": { bgcolor: "#8b6dff" }, borderRadius: 2, py: 1.2 }}
          >
            {saving ? "Saving…" : "Save sections"}
          </Button>
          <Button variant="text" onClick={() => setStep("upload")} sx={{ color: "text.secondary" }}>
            Back
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 600 }}>
      <Paper
        variant="outlined"
        onClick={() => fileRef.current?.click()}
        sx={{
          borderRadius: 2, borderStyle: "dashed", p: 4,
          textAlign: "center", cursor: "pointer",
          "&:hover": { borderColor: "rgba(255,255,255,0.25)" }, transition: "border-color 0.15s",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {fileName || "Click to select a PDF"}
        </Typography>
        {!fileName && (
          <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mt: 0.5 }}>
            PDF only
          </Typography>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          style={{ display: "none" }}
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
        />
      </Paper>

      {error && <Typography variant="caption" sx={{ color: "error.main" }}>{error}</Typography>}

      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
        <Button
          variant="contained"
          onClick={handleParse}
          disabled={!fileName}
          sx={{ bgcolor: "#8b6dff", color: "#0a0a0f", "&:hover": { bgcolor: "#8b6dff" }, borderRadius: 2, py: 1.2 }}
        >
          Import CV
        </Button>
        <Button variant="text" onClick={() => router.push("/dashboard/sections")} sx={{ color: "text.secondary" }}>
          Skip
        </Button>
      </Box>
    </Box>
  )
}
