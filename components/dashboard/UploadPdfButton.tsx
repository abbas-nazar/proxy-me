"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import Snackbar from "@mui/material/Snackbar"
import Alert from "@mui/material/Alert"
import FileUploadIcon from "@mui/icons-material/FileUpload"
import type { ParsedProfile } from "@/lib/parser"

export default function UploadPdfButton() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)
  const router = useRouter()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(false)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const parseRes = await fetch("/api/parse", { method: "POST", body: formData })
      if (!parseRes.ok) throw new Error()
      const parsed: ParsedProfile = await parseRes.json()
      const rows: { type: string; title: string; content: unknown; source: string }[] = []
      if (parsed.bio)
        rows.push({ type: "bio", title: "Bio", content: { text: parsed.bio }, source: "cv" })
      if (parsed.experience?.length)
        rows.push({ type: "experience", title: "Experience", content: { items: parsed.experience }, source: "cv" })
      if (parsed.education?.length)
        rows.push({ type: "education", title: "Education", content: { items: parsed.education }, source: "cv" })
      if (parsed.skills?.length)
        rows.push({ type: "skills", title: "Skills", content: { items: parsed.skills }, source: "cv" })
      if (parsed.projects?.length)
        rows.push({ type: "projects", title: "Projects", content: { items: parsed.projects }, source: "cv" })
      const bulkRes = await fetch("/api/profile/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      })
      if (!bulkRes.ok) throw new Error()
      setSuccess(true)
      router.refresh()
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <>
      <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handleFile} />
      <Button
        variant="outlined"
        size="small"
        startIcon={loading ? <CircularProgress size={12} sx={{ color: "inherit" }} /> : <FileUploadIcon fontSize="small" />}
        onClick={() => !loading && fileRef.current?.click()}
        disabled={loading}
        sx={{ fontSize: 13, borderRadius: 2, textTransform: "none", borderColor: "rgba(255,255,255,0.12)", color: "text.secondary", "&:hover": { borderColor: "rgba(255,255,255,0.25)" } }}
      >
        {loading ? "Extracting…" : "Upload PDF"}
      </Button>

      <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSuccess(false)} severity="success" variant="filled" sx={{ borderRadius: 2 }}>
          Profile updated and merged successfully.
        </Alert>
      </Snackbar>

      <Snackbar open={error} autoHideDuration={4000} onClose={() => setError(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setError(false)} severity="error" variant="filled" sx={{ borderRadius: 2 }}>
          Failed to extract profile. Please try again.
        </Alert>
      </Snackbar>
    </>
  )
}
