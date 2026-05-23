"use client"

import { useEffect, useState } from "react"
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

function ConversationRow({ session }: { session: Session }) {
  const [open, setOpen] = useState(false)
  const messages = session.messages ?? []
  const firstUserMsg = messages.find((m) => m.role === "user")
  const msgCount = messages.length
  const date = session.updatedAt
    ? new Date(session.updatedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })
    : ""

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          display: "flex", alignItems: "center", gap: 2, px: 2.5, py: 2,
          cursor: "pointer", userSelect: "none",
          "&:hover": { bgcolor: "#fafafa" },
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
            <Box key={i} sx={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <Box
                sx={{
                  fontSize: 13,
                  px: 1.5, py: 1,
                  borderRadius: 2,
                  maxWidth: "80%",
                  bgcolor: m.role === "user" ? "#111" : "#f3f4f6",
                  color: m.role === "user" ? "white" : "#374151",
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Paper>
  )
}

export default function ConversationsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions ?? []))
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

      {!loading && sessions.length === 0 && (
        <Paper
          variant="outlined"
          sx={{ borderRadius: 2, borderStyle: "dashed", px: 6, py: 8, textAlign: "center" }}
        >
          <Typography variant="body2" sx={{ color: "text.disabled" }}>
            No conversations yet. Share your link to get started.
          </Typography>
        </Paper>
      )}

      {!loading && sessions.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {sessions.map((session) => (
            <ConversationRow key={session.id} session={session} />
          ))}
        </Box>
      )}
    </Box>
  )
}
