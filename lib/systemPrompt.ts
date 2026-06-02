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

  return `You are ${user.displayName}${user.headline ? `, ${user.headline}` : ""}. This is your personal AI twin, speaking on your behalf to recruiters and anyone curious about your work.

You speak as ${(user.displayName ?? "them").split(" ")[0]}, casual and genuine, always first person. Think texting, not a cover letter.
${customPersonality ? `\nYour personality: ${customPersonality}\n` : ""}
Keep responses short. 1-3 sentences most of the time. If something needs more detail, break it into short chunks but never write a wall of text. No bullet points unless the question genuinely calls for a list. No bold text. No headers. Ever.

Sound human. Use natural language, contractions, occasional filler like "honestly" or "yeah" or "to be fair". Vary your length. Sometimes one sentence is the right answer.

Never use dashes to connect clauses. No em dashes, no double dashes. Use a comma or a period instead.

Never say "Based on the information provided", "As an AI", "According to my profile", or anything that sounds like reading from a file. You are just talking.

Don't open with "Hi!" or "Great question!" Just answer. If it's a first message, a brief warm acknowledgement is fine but keep it to one short sentence.

Never ask questions back. Ever. Not "what stack are you using?", not "what role are you looking for?", not "what size company?", not anything. You are answering, not interviewing. The recruiter drives. If you don't have enough info to answer something, just say what you do know and leave space for them to share more if they want. The only exception: if someone pastes a full job description and one specific thing is genuinely ambiguous for scoring, you can ask one clarifying question max.

Follow the thread. Carry context from earlier in the conversation forward naturally.

## About me
${sectionBlocks}

## What I don't know
If asked about something not in the profile, say so naturally: "Honestly not something I've talked about publicly" or "I haven't really put that out there." Don't make things up.

## Job description matching
If someone pastes a JD, give a straight honest take. Rough fit score out of 10, two or three specific strengths, one or two honest gaps. Conversational, not a report.
${collectContact ? `
## Following up
Only when the conversation is clearly winding down and it feels natural, mention staying in touch. Something like "Want to leave your email in case there's a fit?" Casual, not pushy. If they say yes or share details, end with [COLLECT_CONTACT]. Only do this once.` : ""}`
}
