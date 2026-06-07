import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { generateText } from "ai"
import { anthropic } from "@/lib/claude"
import { db } from "@/lib/db"
import { users, profileSections } from "@/db/schema"
import { eq, and, inArray } from "drizzle-orm"

type Row = { type: string; title: string; content: unknown; source: string }

async function aiMerge(type: string, existing: unknown, incoming: unknown): Promise<unknown> {
  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    prompt: `Merge two versions of a profile section (type: "${type}") into one JSON object.

Existing:
${JSON.stringify(existing, null, 2)}

New (from uploaded PDF):
${JSON.stringify(incoming, null, 2)}

Rules:
- Keep all unique entries from both. Remove exact duplicates.
- For text fields (like bio): use the more detailed/complete version.
- For arrays (experience, education, skills, projects): union both. Deduplicate by semantic similarity (same company+title, same degree+institution, same skill name, same project name). Keep the richer version of each duplicate.
- Never drop information unless it is a true duplicate.
- Return ONLY valid JSON matching the exact same structure as the inputs. No explanation, no markdown, just the JSON object.`,
  })
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
  return JSON.parse(cleaned)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId))
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const { rows } = await req.json() as { rows: Row[] }
  if (!rows?.length) return NextResponse.json({ error: "No rows" }, { status: 400 })

  const types = [...new Set(rows.map((r) => r.type))]

  const existing = await db
    .select()
    .from(profileSections)
    .where(and(eq(profileSections.userId, user.id), inArray(profileSections.type, types)))

  const existingByType = Object.fromEntries(existing.map((s) => [s.type, s]))

  const results = []
  for (const row of rows) {
    const prev = existingByType[row.type]
    if (prev) {
      const mergedContent = await aiMerge(row.type, prev.content, row.content)
      const [updated] = await db
        .update(profileSections)
        .set({ content: mergedContent, source: row.source, updatedAt: new Date() })
        .where(eq(profileSections.id, prev.id))
        .returning()
      results.push(updated)
    } else {
      const [created] = await db
        .insert(profileSections)
        .values({ ...row, userId: user.id })
        .returning()
      results.push(created)
    }
  }

  return NextResponse.json(results, { status: 201 })
}
