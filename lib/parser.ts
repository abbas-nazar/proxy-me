import { generateObject } from "ai"
import { anthropic } from "@/lib/claude"
import { z } from "zod"

const profileSchema = z.object({
  bio: z.string().describe("A short professional summary"),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      dates: z.string(),
      description: z.string(),
      highlights: z.array(z.string()),
    })
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      dates: z.string(),
    })
  ),
  skills: z.array(z.string()),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      highlights: z.array(z.string()),
    })
  ),
})

export type ParsedProfile = z.infer<typeof profileSchema>

export async function parseCVText(text: string): Promise<ParsedProfile> {
  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-20250514"),
    schema: profileSchema,
    prompt: `Extract structured professional information from this CV/LinkedIn export.\n\n${text}`,
  })
  return object
}
