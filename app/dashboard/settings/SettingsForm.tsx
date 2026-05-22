"use client"

import { useState } from "react"
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

type ContactCollection = { enabled: boolean; requireName: boolean; requireEmail: boolean }

type Props = {
  user: {
    id: string
    slug: string
    isPublic: boolean
    personality: string
    suggestedQuestions: string[]
    contactCollection: ContactCollection
  }
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 3 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>{title}</Typography>
      {subtitle && <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>{subtitle}</Typography>}
      {children}
    </Box>
  )
}

export default function SettingsForm({ user }: Props) {
  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/${user.slug}` : `/${user.slug}`

  const [isPublic, setIsPublic] = useState(user.isPublic)
  const [copied, setCopied] = useState(false)
  const [togglingPublic, setTogglingPublic] = useState(false)

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
      <Section title="Twin Status" subtitle="Control whether visitors can access your AI twin.">
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {isPublic ? "Twin is active" : "Twin is off"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {isPublic ? "Anyone with your link can chat with you." : "Your profile is hidden from visitors."}
            </Typography>
          </Box>
          <Switch
            checked={isPublic}
            onChange={togglePublic}
            disabled={togglingPublic}
            sx={{ "& .MuiSwitch-thumb": { bgcolor: "white" }, "& .Mui-checked .MuiSwitch-track": { bgcolor: "black" } }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>Public URL</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Box sx={{ flex: 1, bgcolor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 1, px: 1.5, py: 1, fontFamily: "monospace", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {publicUrl}
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={copyLink}
            startIcon={copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            sx={{ borderColor: "#e5e7eb", color: "text.primary", whiteSpace: "nowrap" }}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </Box>
      </Section>

      {/* Personality */}
      <Section title="Personality" subtitle="Customize how your twin speaks. Leave blank to use the default career-focused persona.">
        <TextField
          multiline
          rows={5}
          fullWidth
          size="small"
          placeholder="Describe your personality, tone, or any extra instructions for how your twin should respond…"
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={savePersonality}
          disabled={savingPersonality}
          sx={{ bgcolor: "black", "&:hover": { bgcolor: "#222" } }}
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
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
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
            sx={{ borderColor: "#e5e7eb", color: "text.primary", minWidth: 40 }}
          >
            <AddIcon fontSize="small" />
          </Button>
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={saveQuestions}
          disabled={savingQuestions}
          sx={{ bgcolor: "black", "&:hover": { bgcolor: "#222" } }}
        >
          {questionsSaved ? "Saved!" : savingQuestions ? "Saving…" : "Save Questions"}
        </Button>
      </Section>

      {/* Contact Collection */}
      <Section title="Contact Collection" subtitle="After 5 minutes of inactivity, your twin will naturally ask the visitor for their name and email in the chat. Collected contacts appear on the Conversations page.">
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {contact.enabled ? "Enabled" : "Disabled"}
          </Typography>
          <Switch
            checked={contact.enabled}
            onChange={(e) => setContact((c) => ({ ...c, enabled: e.target.checked }))}
            size="small"
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={saveContact}
            disabled={savingContact}
            sx={{ bgcolor: "black", "&:hover": { bgcolor: "#222" } }}
          >
            {contactSaved ? "Saved!" : savingContact ? "Saving…" : "Save"}
          </Button>
        </Box>
      </Section>

    </Box>
  )
}
