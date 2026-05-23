"use client"

import { useState } from "react"
import Button from "@mui/material/Button"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import CheckIcon from "@mui/icons-material/Check"

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      size="small"
      variant="outlined"
      onClick={handleCopy}
      startIcon={copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
      sx={{
        borderColor: "rgba(255,255,255,0.3)",
        color: "rgba(255,255,255,0.8)",
        fontSize: 12,
        py: 0.5,
        "&:hover": { borderColor: "rgba(255,255,255,0.7)", bgcolor: "rgba(255,255,255,0.08)" },
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </Button>
  )
}
