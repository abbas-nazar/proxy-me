"use client"

import { useState, useRef } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Paper from "@mui/material/Paper"
import CircularProgress from "@mui/material/CircularProgress"
import InputAdornment from "@mui/material/InputAdornment"
import type { ParsedProfile } from "@/lib/parser"

type Step = "slug" | "import" | "parsing" | "done"

export default function OnboardingFlow() {
  const [step, setStep] = useState<Step>("slug")
  const [slug, setSlug] = useState("")
  const [slugError, setSlugError] = useState("")
  const [slugPending, setSlugPending] = useState(false)
  const [error, setError] = useState("")
  const [fileName, setFileName] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSlugSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = slug.trim().toLowerCase()
    if (!value || !/^[a-z0-9-]+$/.test(value)) {
      setSlugError("Only lowercase letters, numbers, and hyphens.")
      return
    }
    setSlugPending(true)
    setSlugError("")
    try {
      const res = await fetch("/api/user/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: value }),
      })
      const data = await res.json()
      if (!res.ok) { setSlugError(data.error ?? "Something went wrong."); return }
      setStep("import")
    } finally {
      setSlugPending(false)
    }
  }

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
      await saveAll(parsed)
      setStep("done")
    } catch {
      setStep("import")
      setError("Failed to parse your CV. Please try again.")
    }
  }

  async function saveAll(p: ParsedProfile) {
    const rows: { type: string; title: string; content: unknown; source: string }[] = []
    if (p.bio)
      rows.push({ type: "bio", title: "Bio", content: { text: p.bio }, source: "cv" })
    if (p.experience?.length)
      rows.push({ type: "experience", title: "Experience", content: { items: p.experience }, source: "cv" })
    if (p.education?.length)
      rows.push({ type: "education", title: "Education", content: { items: p.education }, source: "cv" })
    if (p.skills?.length)
      rows.push({ type: "skills", title: "Skills", content: { items: p.skills }, source: "cv" })
    if (p.projects?.length)
      rows.push({ type: "projects", title: "Projects", content: { items: p.projects }, source: "cv" })
    await fetch("/api/profile/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    })
  }

  if (step === "slug") {
    return (
      <Box component="form" onSubmit={handleSlugSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.5px" }}>Welcome to proxy-me</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            First, pick a username for your public link.
          </Typography>
        </Box>
        <TextField
          label="Username"
          size="small"
          fullWidth
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="your-name"
          error={!!slugError}
          helperText={slugError || " "}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography variant="caption" sx={{ color: "text.disabled" }}>proxy-me.app/</Typography>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={slugPending}
          sx={{ bgcolor: "black", "&:hover": { bgcolor: "#222" }, borderRadius: 2, py: 1.2 }}
        >
          {slugPending ? "Setting up…" : "Continue"}
        </Button>
      </Box>
    )
  }

  if (step === "parsing") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 10, gap: 2 }}>
        <CircularProgress size={28} sx={{ color: "black" }} />
        <Typography variant="body2" sx={{ color: "text.secondary" }}>Extracting your profile…</Typography>
      </Box>
    )
  }

  if (step === "done") {
    const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${slug}`
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.5px" }}>You're all set!</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Your AI twin is ready. Review your profile or share your link.
          </Typography>
        </Box>
        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
          <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 1, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Your public link
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Box sx={{ flex: 1, fontFamily: "monospace", fontSize: 13, bgcolor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 1, px: 1.5, py: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {publicUrl}
            </Box>
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigator.clipboard.writeText(publicUrl)}
              sx={{ borderColor: "#e5e7eb", color: "text.primary", whiteSpace: "nowrap", height: 40, flexShrink: 0 }}
            >
              Copy
            </Button>
          </Box>
        </Paper>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="contained"
            href="/dashboard/sections"
            component="a"
            sx={{ bgcolor: "black", "&:hover": { bgcolor: "#222" }, borderRadius: 2, py: 1.2 }}
          >
            Review profile
          </Button>
          <Button
            variant="outlined"
            href={publicUrl}
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ borderColor: "#e5e7eb", color: "text.primary", borderRadius: 2, py: 1.2 }}
          >
            Preview my page
          </Button>
        </Box>
      </Box>
    )
  }

  // import step
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Import your CV</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Upload a PDF to automatically extract your profile. You can also skip and add sections manually.
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        onClick={() => fileRef.current?.click()}
        sx={{
          borderRadius: 2, borderStyle: "dashed", p: 4,
          textAlign: "center", cursor: "pointer",
          "&:hover": { borderColor: "black" }, transition: "border-color 0.15s",
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
          sx={{ bgcolor: "black", "&:hover": { bgcolor: "#222" }, borderRadius: 2, py: 1.2 }}
        >
          Import CV
        </Button>
        <Button variant="text" onClick={() => setStep("done")} sx={{ color: "text.secondary" }}>
          Skip — add manually
        </Button>
      </Box>
    </Box>
  )
}
