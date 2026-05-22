"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import type { ParsedProfile } from "@/lib/parser"

type Step = "slug" | "import" | "parsing" | "review"

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

export default function OnboardingFlow() {
  const [step, setStep] = useState<Step>("slug")
  const [slug, setSlug] = useState("")
  const [slugError, setSlugError] = useState("")
  const [slugPending, setSlugPending] = useState(false)
  const [profile, setProfile] = useState<ParsedProfile | null>(null)
  const [reviewSections, setReviewSections] = useState<ReviewSection[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

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
      setProfile(parsed)
      setReviewSections(profileToReviewSections(parsed))
      setStep("review")
    } catch {
      setStep("import")
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

  if (step === "slug") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Welcome to proxy-me</h1>
          <p className="text-sm text-gray-500 mt-1">First, pick a username for your public link.</p>
        </div>
        <form onSubmit={handleSlugSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Username</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm shrink-0">proxy-me.app/</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="your-name"
                required
                className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            {slugError && <p className="text-red-500 text-sm">{slugError}</p>}
          </div>
          <button
            type="submit"
            disabled={slugPending}
            className="w-full bg-black text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {slugPending ? "Setting up…" : "Continue"}
          </button>
        </form>
      </div>
    )
  }

  if (step === "parsing") {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Parsing your CV…</p>
      </div>
    )
  }

  if (step === "review") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Review extracted sections</h2>
          <p className="text-sm text-gray-500 mt-1">Uncheck anything you don't want to save.</p>
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
            {saving ? "Saving…" : "Save and continue"}
          </button>
          <button onClick={() => router.push("/dashboard/sections")} className="text-sm text-gray-400 hover:text-black">
            Skip
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Import your CV</h2>
        <p className="text-sm text-gray-500 mt-1">Upload a PDF and Claude will extract your profile. You can also skip and add sections manually.</p>
      </div>
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
          Skip — add manually
        </button>
      </div>
    </div>
  )
}
