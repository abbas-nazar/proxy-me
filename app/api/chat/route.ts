import { streamText, convertToModelMessages } from "ai"
import { anthropic } from "@/lib/claude"
import { db } from "@/lib/db"
import { users, profileSections, chatSessions } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { buildSystemPrompt } from "@/lib/systemPrompt"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { messages, slug, sessionId } = await req.json()

  if (!slug)
    return NextResponse.json({ error: "Missing slug" }, { status: 400 })
  if (!sessionId)
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })

  const [user] = await db.select().from(users).where(eq(users.slug, slug))
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  if (!user.isPublic)
    return NextResponse.json({ error: "Profile is private" }, { status: 403 })

  const sections = await db
    .select()
    .from(profileSections)
    .where(eq(profileSections.userId, user.id))

  const contactCollection = user.contactCollection as { enabled: boolean } | null
  const system = buildSystemPrompt(user, sections, contactCollection?.enabled === true)
  const modelMessages = await convertToModelMessages(messages)

  // Save incoming messages immediately (creates session row if first message)
  const plainMessages = messages.map((m: { role: string; parts: { type: string; text: string }[] }) => ({
    role: m.role,
    content: m.parts?.filter((p: { type: string }) => p.type === "text").map((p: { text: string }) => p.text).join("") ?? "",
  }))

  await db.insert(chatSessions)
    .values({ id: sessionId, userId: user.id, messages: plainMessages })
    .onConflictDoUpdate({
      target: chatSessions.id,
      set: { messages: plainMessages, updatedAt: sql`now()` },
    })

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system,
    messages: modelMessages,
    providerOptions: {
      anthropic: { cacheControl: { type: "ephemeral" } },
    },
    onFinish: async ({ text }) => {
      const withReply = [...plainMessages, { role: "assistant", content: text }]
      await db.update(chatSessions)
        .set({ messages: withReply, updatedAt: sql`now()` })
        .where(eq(chatSessions.id, sessionId))
    },
  })

  return result.toUIMessageStreamResponse()
}
