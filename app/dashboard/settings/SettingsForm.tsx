"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { BASE_URL, profileUrl } from "@/lib/baseUrl"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Switch from "@mui/material/Switch"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Divider from "@mui/material/Divider"
import Chip from "@mui/material/Chip"
import FormControlLabel from "@mui/material/FormControlLabel"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import CheckIcon from "@mui/icons-material/Check"
import AddIcon from "@mui/icons-material/Add"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"

type ContactCollection = { enabled: boolean; requireName: boolean; requireEmail: boolean }

const TONE_PRESETS = [
  {
    label: "Professional",
    value: `Tone: Speak professionally and confidently. Keep answers structured and precise. Avoid slang or overly casual language.

Example: "I have five years of backend experience, primarily in distributed systems and API design. Happy to walk through the specifics if that would be helpful."`,
  },
  {
    label: "Casual & warm",
    value: `Tone: Be conversational and friendly, like chatting with someone over coffee. Use natural language, contractions, and a bit of warmth.

Example: "Yeah, I've been doing backend work for about five years, mostly APIs and distributed systems. Always happy to chat more about it!"`,
  },
  {
    label: "Direct & concise",
    value: `Tone: Be direct and to the point. Skip pleasantries. Keep answers short.

Example: "Five years backend. Distributed systems, API design. Open to discussing details."`,
  },
  {
    label: "Technical",
    value: `Tone: Lean into technical depth. Use correct terminology, reference specific tools and architectures, don't over-simplify.

Example: "Five years backend mostly event-driven architectures, REST and gRPC APIs, Postgres at scale. Can go deep on any of those if useful."`,
  },
  {
    label: "Storyteller",
    value: `Tone: Answer with narrative and context. Share the why behind decisions, not just the what. Make it engaging and human.

Example: "I got into backend work almost by accident, started fixing slow queries on a side project and got hooked. Five years later I'm still chasing that same problem at much larger scale."`,
  },
]

type Props = {
  user: {
    id: string
    slug: string
    displayName: string
    headline: string
    isPublic: boolean
    personality: string
    suggestedQuestions: string[]
    contactCollection: ContactCollection
  }
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Box sx={{ border: "1px solid rgba(255,255,255,0.09)", borderRadius: 2, p: 3 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>{title}</Typography>
      {subtitle && <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>{subtitle}</Typography>}
      {children}
    </Box>
  )
}

export default function SettingsForm({ user }: Props) {
  const router = useRouter()
  const { signOut } = useClerk()
  const publicUrl = profileUrl(user.slug)

  const [isPublic, setIsPublic] = useState(user.isPublic)
  const [copied, setCopied] = useState(false)
  const [togglingPublic, setTogglingPublic] = useState(false)

  const [displayName, setDisplayName] = useState(user.displayName)
  const [headline, setHeadline] = useState(user.headline)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  const [personality, setPersonality] = useState(user.personality)
  const [savingPersonality, setSavingPersonality] = useState(false)
  const [personalitySaved, setPersonalitySaved] = useState(false)

  const [questions, setQuestions] = useState<string[]>(user.suggestedQuestions)
  const [newQuestion, setNewQuestion] = useState("")
  const [savingQuestions, setSavingQuestions] = useState(false)
  const [questionsSaved, setQuestionsSaved] = useState(false)

  const [contact, setContact] = useState<ContactCollection>(user.contactCollection)
  const [savingContact, setSavingContact] = useState(false)
  const [contactSaved, setContactSaved] = useState(false)

  const [newSlug, setNewSlug] = useState(user.slug)
  const [slugError, setSlugError] = useState("")
  const [savingSlug, setSavingSlug] = useState(false)
  const [slugSaved, setSlugSaved] = useState(false)

  const [deleteSlug, setDeleteSlug] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [deleting, setDeleting] = useState(false)

  async function patch(body: Record<string, unknown>) {
    await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  }

  async function togglePublic() {
    setTogglingPublic(true)
    try {
      await patch({ isPublic: !isPublic })
      setIsPublic((v) => !v)
    } finally {
      setTogglingPublic(false)
    }
  }

  async function saveProfile() {
    setSavingProfile(true)
    try {
      await patch({ displayName, headline })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePersonality() {
    setSavingPersonality(true)
    try {
      await patch({ personality })
      setPersonalitySaved(true)
      setTimeout(() => setPersonalitySaved(false), 2000)
    } finally {
      setSavingPersonality(false)
    }
  }

  async function saveQuestions() {
    setSavingQuestions(true)
    try {
      await patch({ suggestedQuestions: questions })
      setQuestionsSaved(true)
      setTimeout(() => setQuestionsSaved(false), 2000)
    } finally {
      setSavingQuestions(false)
    }
  }

  async function deleteAccount() {
    if (deleteSlug !== user.slug) {
      setDeleteError(`Type your handle "${user.slug}" to confirm.`)
      return
    }
    setDeleting(true)
    setDeleteError("")
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: deleteSlug }),
      })
      const data = await res.json()
      if (!res.ok) { setDeleteError(data.error ?? "Failed to delete."); return }
      await signOut({ redirectUrl: "/" })
    } catch {
      setDeleteError("Something went wrong.")
    } finally {
      setDeleting(false)
    }
  }

  async function saveContact() {
    setSavingContact(true)
    try {
      await patch({ contactCollection: contact })
      setContactSaved(true)
      setTimeout(() => setContactSaved(false), 2000)
    } finally {
      setSavingContact(false)
    }
  }

  async function saveSlug() {
    const value = newSlug.trim().toLowerCase()
    if (!value || !/^[a-z0-9-]+$/.test(value)) {
      setSlugError("Only lowercase letters, numbers, and hyphens.")
      return
    }
    setSavingSlug(true)
    setSlugError("")
    try {
      const res = await fetch("/api/user/slug", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: value }),
      })
      const data = await res.json()
      if (!res.ok) { setSlugError(data.error ?? "Something went wrong."); return }
      setSlugSaved(true)
      setTimeout(() => setSlugSaved(false), 2000)
      router.refresh()
    } finally {
      setSavingSlug(false)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function addQuestion() {
    const q = newQuestion.trim()
    if (!q || questions.includes(q)) return
    setQuestions((prev) => [...prev, q])
    setNewQuestion("")
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 600 }}>

      {/* Twin Status */}
      <Section title="Proxy Status" subtitle="Control whether visitors can access your proxy.">
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {isPublic ? "Proxy is active" : "Proxy is off"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {isPublic ? "Anyone with your link can chat with you." : "Your profile is hidden from visitors."}
            </Typography>
          </Box>
          <Switch
            checked={isPublic}
            onChange={togglePublic}
            disabled={togglingPublic}
            sx={{  }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>Public URL</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Box sx={{ flex: 1, bgcolor: "#1b1b2a", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 1, px: 1.5, py: 1, fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#9a9aae" }}>
            {publicUrl}
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={copyLink}
            startIcon={copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            sx={{ borderColor: "rgba(255,255,255,0.16)", color: "text.primary", whiteSpace: "nowrap", height: 40, flexShrink: 0 }}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </Box>
      </Section>

      {/* Handle */}
      <Section title="Handle" subtitle="Change your public URL. All existing links to the old handle will stop working.">
        <TextField
          fullWidth
          size="small"
          label="Username"
          value={newSlug}
          onChange={(e) => { setNewSlug(e.target.value); setSlugError("") }}
          error={!!slugError}
          helperText={slugError || " "}
          slotProps={{ input: { startAdornment: <Typography variant="caption" sx={{ color: "text.disabled", mr: 0.5, whiteSpace: "nowrap" }}>{BASE_URL.replace(/^https?:\/\//, "")}/</Typography> } }}
          sx={{ mb: 1 }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={saveSlug}
          disabled={savingSlug || !newSlug.trim() || newSlug.trim() === user.slug}
        >
          {slugSaved ? "Saved!" : savingSlug ? "Saving…" : "Change handle"}
        </Button>
      </Section>

      {/* Profile */}
      <Section title="Profile" subtitle="Your name and headline shown on your public page.">
        <TextField
          fullWidth
          size="small"
          label="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          size="small"
          label="Headline"
          placeholder="e.g. Senior Engineer at Acme"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={saveProfile}
          disabled={savingProfile || !displayName.trim()}
                  >
          {profileSaved ? "Saved!" : savingProfile ? "Saving…" : "Save"}
        </Button>
      </Section>

      {/* Voice & Tone */}
      <Section title="Voice & Tone" subtitle="Pick a preset or write your own. Each entry has a tone description and an example reply,  edit the example to sound more like you.">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {TONE_PRESETS.map((preset) => (
            <Chip
              key={preset.label}
              label={preset.label}
              size="small"
              onClick={() => setPersonality(preset.value)}
              variant={personality === preset.value ? "filled" : "outlined"}
              sx={{
                cursor: "pointer",
                ...(personality === preset.value
                  ? { bgcolor: "rgba(139,109,255,0.15)", borderColor: "rgba(139,109,255,0.4)", color: "#8b6dff" }
                  : { bgcolor: "transparent" }),
              }}
            />
          ))}
        </Box>
        <TextField
          multiline
          rows={6}
          fullWidth
          size="small"
          placeholder={"Tone: [describe how you want to come across]\n\nExample: \"[write a sentence or two exactly as you'd say it, your proxy will match this]\""}
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          sx={{ mb: 1 }}
        />
        <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 2 }}>
          The example is the most important part, write it in your own words and your proxy will sound like you.
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={savePersonality}
          disabled={savingPersonality}
        >
          {personalitySaved ? "Saved!" : savingPersonality ? "Saving…" : "Save"}
        </Button>
      </Section>

      {/* Suggested Questions */}
      <Section title="Suggested Questions" subtitle="These appear as clickable chips on your public page to help visitors start a conversation.">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {questions.length === 0 && (
            <Typography variant="caption" color="text.secondary">No questions yet.</Typography>
          )}
          {questions.map((q) => (
            <Chip
              key={q}
              label={q}
              size="small"
              onDelete={() => setQuestions((prev) => prev.filter((x) => x !== q))}
              sx={{ maxWidth: 300 }}
            />
          ))}
        </Box>
        <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center" }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Add a question…"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addQuestion()}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={addQuestion}
            disabled={!newQuestion.trim()}
            sx={{ borderColor: "rgba(255,255,255,0.16)", color: "text.primary", minWidth: 40, height: 40, flexShrink: 0 }}
          >
            <AddIcon fontSize="small" />
          </Button>
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={saveQuestions}
          disabled={savingQuestions}
                  >
          {questionsSaved ? "Saved!" : savingQuestions ? "Saving…" : "Save Questions"}
        </Button>
      </Section>

      {/* Contact Collection */}
      <Section title="Contact Collection" subtitle="When enabled, visitors are asked for their name and email before they start chatting. Collected contacts appear on the Leads page.">
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {contact.enabled ? "Enabled" : "Disabled"}
          </Typography>
          <Switch
            checked={contact.enabled}
            onChange={(e) => setContact((c) => ({ ...c, enabled: e.target.checked }))}
            size="small"
          />
        </Box>
        {contact.enabled && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2, pl: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>Require name</Typography>
              <Switch
                checked={contact.requireName}
                onChange={(e) => setContact((c) => ({ ...c, requireName: e.target.checked }))}
                size="small"
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>Require email</Typography>
              <Switch
                checked={contact.requireEmail}
                onChange={(e) => setContact((c) => ({ ...c, requireEmail: e.target.checked }))}
                size="small"
              />
            </Box>
          </Box>
        )}
        <Button
          variant="contained"
          size="small"
          onClick={saveContact}
          disabled={savingContact}
        >
          {contactSaved ? "Saved!" : savingContact ? "Saving…" : "Save"}
        </Button>
      </Section>

      {/* Danger Zone */}
      <Section title="Danger Zone" subtitle="Permanently delete your account and all data. This cannot be undone.">
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Type your handle{" "}
          <Box component="code" sx={{ bgcolor: "#1b1b2a", border: "1px solid rgba(255,255,255,0.09)", px: 0.75, py: 0.25, borderRadius: 1, fontSize: 12, fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
            {user.slug}
          </Box>{" "}
          to confirm.
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder={user.slug}
            value={deleteSlug}
            onChange={(e) => { setDeleteSlug(e.target.value); setDeleteError("") }}
            sx={{ width: 200 }}
          />
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<DeleteForeverIcon fontSize="small" />}
            onClick={deleteAccount}
            disabled={deleting}
            sx={{ height: 40, flexShrink: 0 }}
          >
            {deleting ? "Deleting…" : "Delete account"}
          </Button>
        </Box>
        {deleteError && (
          <Typography variant="caption" sx={{ color: "error.main", display: "block", mt: 1 }}>
            {deleteError}
          </Typography>
        )}
      </Section>

    </Box>
  )
}
