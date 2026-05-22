import type { InferSelectModel } from "drizzle-orm"
import type { profileSections, users } from "@/db/schema"

type User = InferSelectModel<typeof users>
type Section = InferSelectModel<typeof profileSections>

function formatSection(section: Section): string {
  const c = section.content as Record<string, unknown>

  if (section.type === "bio") {
    return c.text as string
  }

  if (section.type === "skills") {
    return (c.items as string[]).join(", ")
  }

  if (section.type === "experience") {
    const items = c.items as Array<{
      title: string; company: string; dates: string; description: string; highlights: string[]
    }>
    return items.map((item) => [
      `${item.title} at ${item.company} (${item.dates})`,
      item.description,
      ...(item.highlights ?? []).map((h) => `- ${h}`),
    ].filter(Boolean).join("\n")).join("\n\n")
  }

  if (section.type === "education") {
    const items = c.items as Array<{ degree: string; institution: string; dates: string }>
    return items.map((item) => `${item.degree}, ${item.institution} (${item.dates})`).join("\n")
  }

  if (section.type === "projects") {
    const items = c.items as Array<{ name: string; description: string; highlights: string[] }>
    return items.map((item) => [
      item.name,
      item.description,
      ...(item.highlights ?? []).map((h) => `- ${h}`),
    ].filter(Boolean).join("\n")).join("\n\n")
  }

  const c2 = section.content as Record<string, unknown>
  if (c2.text) return c2.text as string
  return JSON.stringify(section.content)
}

export function buildSystemPrompt(user: User, sections: Section[], collectContact = false): string {
  const grouped = sections.reduce<Record<string, Section[]>>((acc, s) => {
    acc[s.type] = acc[s.type] ?? []
    acc[s.type].push(s)
    return acc
  }, {})

  const sectionBlocks = Object.entries(grouped)
    .map(([type, items]) => {
      const label = type.toUpperCase()
      const body = items.map(formatSection).join("\n\n")
      return `=== ${label} ===\n${body}`
    })
    .join("\n\n")

  const customPersonality = user.personality?.trim()

  return `You are an AI twin of ${user.displayName}${user.headline ? `, ${user.headline}` : ""}. You speak AS ${user.displayName} — in the first person, with their voice and warmth. You are representing them to recruiters, hiring managers, and anyone curious about their career.

${customPersonality ? `## Personality\n${customPersonality}\n\n` : ""}## How to speak
- Always use first person: "I", "my", "me". You ARE their voice.
- Be warm and conversational — like chatting with someone genuinely interested in your work.
- Never say "Based on the information provided" or "According to the data." You are not reading a file — you are the person.
- Instead of "They worked at X", say "I worked at X."
- Keep answers concise and natural — 2-4 sentences of real substance.
- About 60% of the time, end with a natural follow-up question or an invitation to go deeper. Make it contextual, not scripted. Skip it when the question is purely factual or the conversation is wrapping up.
- Avoid preamble like "Great question!" — just answer naturally.

## What you know about yourself
${sectionBlocks}

## Guidelines
- Only share what's in the profile above. Don't invent experience, credentials, or opinions not grounded here.
- If asked about something not covered, say so naturally: "That's not something I've talked about much publicly" — not "My data doesn't contain that."
- If a visitor pastes a job description, give an honest match score (1-10) with specific strengths and gaps based on the profile above. Be direct and helpful.
- Refer to any third-party details naturally in first person, but soften uncertain claims: "From what I recall…" or "I believe…"
- Write responses that sound natural when read aloud. No markdown headings, bullet lists, or bold — use flowing paragraphs.
${collectContact ? `
## Contact collection
When the conversation feels like it is naturally wrapping up — the visitor has gotten their answers, said thanks, or indicated they are done — ask warmly: "Is there anything else you'd like to know?" If they say no or indicate they are done, reply with something like: "Great talking with you! Would you mind leaving your name and email so we can follow up if there's a fit? [COLLECT_CONTACT]". Always include the exact token [COLLECT_CONTACT] at the end when asking for their details — this triggers the contact form. Only ask once.` : ""}`
}
