"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import CircularProgress from "@mui/material/CircularProgress"
import TextField from "@mui/material/TextField"
import InputAdornment from "@mui/material/InputAdornment"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import StopIcon from "@mui/icons-material/Stop"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import SearchIcon from "@mui/icons-material/Search"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"

type Voice = {
  voice_id: string
  name: string
  preview_url: string | null
  labels: Record<string, string>
  description: string | null
  category: string | null
}

type Props = {
  initialVoiceId: string | null
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

export default function VoicePicker({ initialVoiceId }: Props) {
  const router = useRouter()
  const [voices, setVoices] = useState<Voice[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(initialVoiceId)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [clearing, setClearing] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetch("/api/voice")
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error ?? "Failed to load")
        setVoices(data.voices as Voice[])
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load voices"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  function togglePreview(voice: Voice) {
    if (!voice.preview_url) return
    if (playingId === voice.voice_id) {
      audioRef.current?.pause()
      audioRef.current = null
      setPlayingId(null)
      return
    }
    audioRef.current?.pause()
    const audio = new Audio(voice.preview_url)
    audio.onended = () => setPlayingId(null)
    audio.onerror = () => setPlayingId(null)
    audio.play().catch(() => setPlayingId(null))
    audioRef.current = audio
    setPlayingId(voice.voice_id)
  }

  async function selectVoice(voice: Voice) {
    setSavingId(voice.voice_id)
    setError(null)
    try {
      const res = await fetch("/api/voice", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voiceId: voice.voice_id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to save")
      setSelectedId(voice.voice_id)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSavingId(null)
    }
  }

  async function clearVoice() {
    if (!confirm("Remove your selected voice? Your proxy won't be able to take voice calls until you pick one again.")) return
    setClearing(true)
    try {
      const res = await fetch("/api/voice", { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      setSelectedId(null)
      router.refresh()
    } catch {
      setError("Failed to clear voice.")
    } finally {
      setClearing(false)
    }
  }

  const filtered = (voices ?? []).filter((v) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    const bits = [v.name, v.description ?? "", ...Object.values(v.labels)].join(" ").toLowerCase()
    return bits.includes(q)
  })

  const selected = voices?.find((v) => v.voice_id === selectedId) ?? null

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 900 }}>

      {selected && (
        <Section title="Your voice is set" subtitle="Your proxy will use this voice on live calls.">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <CheckCircleIcon sx={{ color: "#4ade80", fontSize: 20 }} />
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{selected.name}</Typography>
              {selected.description && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {selected.description}
                </Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<DeleteForeverIcon fontSize="small" />}
              onClick={clearVoice}
              disabled={clearing}
            >
              {clearing ? "Removing…" : "Remove"}
            </Button>
          </Box>
        </Section>
      )}

      <Section
        title={selected ? "Change voice" : "Choose a voice"}
        subtitle="Preview any voice, then select the one you'd like your proxy to speak with."
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, accent, style…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2 }}
        />

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {error && (
          <Typography variant="caption" sx={{ color: "error.main", display: "block", mb: 2 }}>
            {error}
          </Typography>
        )}

        {!loading && voices && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            {filtered.map((v) => {
              const isSelected = v.voice_id === selectedId
              const isPlaying = v.voice_id === playingId
              const isSaving = v.voice_id === savingId
              return (
                <Box
                  key={v.voice_id}
                  sx={{
                    border: "1px solid",
                    borderColor: isSelected ? "rgba(139,109,255,0.5)" : "rgba(255,255,255,0.09)",
                    bgcolor: isSelected ? "rgba(139,109,255,0.06)" : "transparent",
                    borderRadius: 2,
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    transition: "border-color 0.15s, background-color 0.15s",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 0.75 }}>
                        {v.name}
                        {isSelected && <CheckCircleIcon sx={{ color: "#8b6dff", fontSize: 16 }} />}
                      </Typography>
                      {v.description && (
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
                          {v.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {Object.keys(v.labels).length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {Object.entries(v.labels).slice(0, 4).map(([k, val]) => (
                        <Chip
                          key={k}
                          label={val}
                          size="small"
                          sx={{ height: 20, fontSize: 10.5, bgcolor: "rgba(255,255,255,0.04)", color: "text.secondary" }}
                        />
                      ))}
                    </Box>
                  )}
                  <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => togglePreview(v)}
                      disabled={!v.preview_url}
                      startIcon={isPlaying ? <StopIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                      sx={{ borderColor: "rgba(255,255,255,0.16)", color: "text.primary", flex: 1 }}
                    >
                      {isPlaying ? "Stop" : "Preview"}
                    </Button>
                    <Button
                      size="small"
                      variant={isSelected ? "outlined" : "contained"}
                      onClick={() => selectVoice(v)}
                      disabled={isSelected || isSaving}
                      sx={{ flex: 1 }}
                    >
                      {isSelected ? "Selected" : isSaving ? "Saving…" : "Use"}
                    </Button>
                  </Box>
                </Box>
              )
            })}
            {filtered.length === 0 && (
              <Typography variant="caption" sx={{ color: "text.disabled", gridColumn: "1 / -1", textAlign: "center", py: 3 }}>
                No voices match &quot;{query}&quot;.
              </Typography>
            )}
          </Box>
        )}
      </Section>
    </Box>
  )
}
