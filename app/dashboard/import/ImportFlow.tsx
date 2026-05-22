"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
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
      setError("Failed to parse. Please try again.")
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
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Parsing your profile…</p>
      </div>
    )
  }

  if (step === "review") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-medium">Review extracted sections</h2>
          <p className="text-sm text-gray-500 mt-1">Uncheck any sections you don't want to save.</p>
        </div>
        <div className="space-y-3">
          {reviewSections.map((s) => (
            <label key={s.key} className="flex items-start gap-3 border rounded-lg p-3 cursor-pointer hover:border-black transition-colors">
              <input type="checkbox" checked={s.included} onChange={() => toggleSection(s.key)} className="mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-gray-400 truncate">{s.preview}</p>
              </div>
            </label>
          ))}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || reviewSections.every((s) => !s.included)}
            className="bg-black text-white rounded-md px-5 py-2 text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save selected sections"}
          </button>
          <button onClick={() => setStep("upload")} className="border rounded-md px-5 py-2 text-sm">
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:border file:rounded file:text-sm file:font-medium file:cursor-pointer"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-3">
        <button onClick={handleParse} className="bg-black text-white rounded-md px-5 py-2 text-sm font-medium">
          Parse CV
        </button>
        <button onClick={() => router.push("/dashboard/sections")} className="text-sm text-gray-400 hover:text-black">
          Skip — add sections manually
        </button>
      </div>
    </div>
  )
}
