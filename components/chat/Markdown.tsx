"use client"

import React from "react"

const TEXT = "rgba(255,255,255,0.9)"
const MUTED = "rgba(255,255,255,0.55)"

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  // links [text](url), bold, italic, inline code
  const re = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)|(https?:\/\/[^\s<>"]+)|(\*\*|__)(.*?)\4|(\*|_)(.*?)\6|(`)(.*?)\8/g
  let last = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    if (match[1] !== undefined) {
      // [text](url)
      parts.push(
        <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer"
          style={{ color: "rgba(255,255,255,0.75)", textDecoration: "underline", textUnderlineOffset: 2 }}>
          {match[1]}
        </a>
      )
    } else if (match[3]) {
      // bare URL
      parts.push(
        <a key={key++} href={match[3]} target="_blank" rel="noopener noreferrer"
          style={{ color: "rgba(255,255,255,0.75)", textDecoration: "underline", textUnderlineOffset: 2 }}>
          {match[3]}
        </a>
      )
    } else if (match[4]) {
      parts.push(<strong key={key++} style={{ fontWeight: 600, color: TEXT }}>{match[5]}</strong>)
    } else if (match[6]) {
      parts.push(<em key={key++}>{match[7]}</em>)
    } else if (match[8]) {
      parts.push(
        <code key={key++} style={{ fontFamily: "monospace", fontSize: "0.9em", background: "rgba(255,255,255,0.1)", borderRadius: 4, padding: "1px 5px" }}>
          {match[9]}
        </code>
      )
    }
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

export default function Markdown({ text }: { text: string }) {
  const lines = text.split("\n")
  const nodes: React.ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // Blank line
    if (line.trim() === "") {
      i++
      continue
    }

    // Heading ### / ## / #
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const sizes = ["1.1em", "1.05em", "1em"]
      nodes.push(
        <p key={key++} style={{ margin: "10px 0 4px", fontWeight: 700, fontSize: sizes[level - 1], color: TEXT }}>
          {parseInline(headingMatch[2])}
        </p>
      )
      i++
      continue
    }

    // Unordered list — collect consecutive bullet lines
    if (/^[-*•]\s/.test(line)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && /^[-*•]\s/.test(lines[i])) {
        items.push(
          <li key={i} style={{ marginBottom: 2 }}>
            {parseInline(lines[i].replace(/^[-*•]\s+/, ""))}
          </li>
        )
        i++
      }
      nodes.push(
        <ul key={key++} style={{ margin: "6px 0", paddingLeft: 20, color: TEXT }}>
          {items}
        </ul>
      )
      continue
    }

    // Ordered list — collect consecutive numbered lines
    if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(
          <li key={i} style={{ marginBottom: 2 }}>
            {parseInline(lines[i].replace(/^\d+\.\s+/, ""))}
          </li>
        )
        i++
      }
      nodes.push(
        <ol key={key++} style={{ margin: "6px 0", paddingLeft: 20, color: TEXT }}>
          {items}
        </ol>
      )
      continue
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      nodes.push(<hr key={key++} style={{ border: "none", borderTop: `1px solid rgba(255,255,255,0.1)`, margin: "8px 0" }} />)
      i++
      continue
    }

    // Regular paragraph — collect consecutive non-special lines
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,3}\s|[-*•]\s|\d+\.\s)/.test(lines[i]) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      nodes.push(
        <p key={key++} style={{ margin: "0 0 6px", lineHeight: 1.6, color: TEXT }}>
          {paraLines.map((l, idx) => (
            <React.Fragment key={idx}>
              {parseInline(l)}
              {idx < paraLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      )
    }
  }

  return <div style={{ fontSize: 14 }}>{nodes}</div>
}
