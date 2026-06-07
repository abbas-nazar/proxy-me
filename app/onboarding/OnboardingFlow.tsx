"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { BASE_URL } from "@/lib/baseUrl"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Paper from "@mui/material/Paper"
import CircularProgress from "@mui/material/CircularProgress"
import InputAdornment from "@mui/material/InputAdornment"
import type { ParsedProfile } from "@/lib/parser"

type Step = "slug" | "import" | "parsing"

export default function OnboardingFlow() {
  const router = useRouter()
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
      router.push("/dashboard/sections")
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
                  <Typography variant="caption" sx={{ color: "text.disabled" }}>{BASE_URL.replace(/^https?:\/\//, "")}/</Typography>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={slugPending}
          sx={{ bgcolor: "#8b6dff", color: "#0a0a0f", "&:hover": { bgcolor: "#7c5ef0" }, borderRadius: 2, py: 1.2 }}
        >
          {slugPending ? "Setting up…" : "Continue"}
        </Button>
      </Box>
    )
  }

  if (step === "parsing") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 10, gap: 2 }}>
        <CircularProgress size={28} sx={{ color: "#8b6dff" }} />
        <Typography variant="body2" sx={{ color: "text.secondary" }}>Extracting your profile…</Typography>
      </Box>
    )
  }

  // import step
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Upload your background</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Upload a PDF, your CV or a LinkedIn export to automatically extract your profile. You can also skip and add sections manually.
        </Typography>
      </Box>

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
            CV or LinkedIn export · PDF only
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
          sx={{ bgcolor: "#8b6dff", color: "#0a0a0f", "&:hover": { bgcolor: "#7c5ef0" }, borderRadius: 2, py: 1.2 }}
        >
          Extract profile
        </Button>
        <Button variant="text" onClick={() => router.push("/dashboard/sections")} sx={{ color: "text.secondary" }}>
          Skip, add manually
        </Button>
      </Box>
    </Box>
  )
}
