"use client"

import { useEffect, useRef, useState } from "react"
import ChatBubble from "@/components/chat/ChatBubble"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Collapse from "@mui/material/Collapse"
import Chip from "@mui/material/Chip"
import IconButton from "@mui/material/IconButton"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined"

type Message = { role: "user" | "assistant"; content: string }

type Session = {
  id: string
  messages: Message[]
  createdAt: string | null
  updatedAt: string | null
}

function ConversationRow({ session, defaultOpen }: { session: Session; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const rowRef = useRef<HTMLDivElement>(null)
  const messages = session.messages ?? []
  const firstUserMsg = messages.find((m) => m.role === "user")
  const msgCount = messages.length
  const date = session.updatedAt
    ? new Date(session.updatedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })
    : ""

  useEffect(() => {
    if (defaultOpen && rowRef.current) {
      setTimeout(() => rowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
    }
  }, [defaultOpen])

  return (
    <Paper id={`session-${session.id}`} ref={rowRef} variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", ...(defaultOpen ? { outline: "1px solid rgba(139,109,255,0.4)" } : {}) }}>
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          display: "flex", alignItems: "center", gap: 2, px: 2.5, py: 2,
          cursor: "pointer", userSelect: "none",
          "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
          transition: "background 0.15s",
        }}
      >
        <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 16, color: "text.disabled", flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {firstUserMsg?.content ?? "Empty conversation"}
          </Typography>
        </Box>
        <Chip
          label={`${msgCount} msg${msgCount !== 1 ? "s" : ""}`}
          size="small"
          variant="outlined"
          sx={{ fontSize: 11, height: 20, flexShrink: 0 }}
        />
        <Typography variant="caption" sx={{ color: "text.disabled", flexShrink: 0, minWidth: 72, textAlign: "right" }}>
          {date}
        </Typography>
        <IconButton size="small" sx={{ flexShrink: 0, ml: -0.5 }}>
          {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
        </IconButton>
      </Box>

      <Collapse in={open}>
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          {messages.map((m, i) => (
            <ChatBubble key={i} role={m.role} text={m.content} />
          ))}
        </Box>
      </Collapse>
    </Paper>
  )
}

export default function ConversationsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const targetId = typeof window !== "undefined"
    ? window.location.hash.startsWith("#session-")
      ? window.location.hash.replace("#session-", "")
      : null
    : null

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((data) => setSessions(data.sessions ?? []))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Box sx={{ px: { xs: 3, md: 5 }, py: 4, maxWidth: 900, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.3px" }}>
          Conversations
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {loading ? "Loading…" : `${sessions.length} conversation${sessions.length !== 1 ? "s" : ""} so far.`}
        </Typography>
      </Box>

      {!loading && fetchError && (
        <Paper variant="outlined" sx={{ borderRadius: 2, borderStyle: "dashed", px: 6, py: 8, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "error.main" }}>
            Failed to load conversations. Try refreshing the page.
          </Typography>
        </Paper>
      )}

      {!loading && !fetchError && sessions.length === 0 && (
        <Paper
          variant="outlined"
          sx={{ borderRadius: 2, borderStyle: "dashed", px: 6, py: 8, textAlign: "center" }}
        >
          <Typography variant="body2" sx={{ color: "text.disabled" }}>
            No conversations yet. Share your link to get started.
          </Typography>
        </Paper>
      )}

      {!loading && !fetchError && sessions.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {sessions.map((session) => (
            <ConversationRow key={session.id} session={session} defaultOpen={session.id === targetId} />
          ))}
        </Box>
      )}
    </Box>
  )
}
