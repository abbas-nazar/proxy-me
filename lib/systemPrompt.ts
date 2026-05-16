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

  return JSON.stringify(section.content)
}

export function buildSystemPrompt(user: User, sections: Section[]): string {
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

  return `You are a professional AI representative for ${user.displayName}${user.headline ? `, ${user.headline}` : ""}.
Your role is to answer questions about their background honestly and helpfully on their behalf.

Here is everything you know about them:

${sectionBlocks}

Guidelines:
- Answer questions about their background accurately based only on the information above
- If asked to evaluate a job description, give an honest match score (1-10) with specific reasons, strengths, and gaps
- Do not make up or exaggerate anything not mentioned above
- If you don't know something, say so clearly
- Keep answers conversational, not robotic
- Refer to them in third person (e.g. "Abbas has experience in...")`
}
