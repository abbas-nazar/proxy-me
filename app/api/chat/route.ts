import { streamText, convertToModelMessages } from "ai"
import { anthropic } from "@/lib/claude"
import { db } from "@/lib/db"
import { users, profileSections, chatSessions, visitorContacts } from "@/db/schema"
import { eq, sql, and, isNull } from "drizzle-orm"
import { buildSystemPrompt } from "@/lib/systemPrompt"
import { rateLimit } from "@/lib/rateLimit"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!rateLimit(`chat:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { messages, slug, sessionId, visitorName: clientVisitorName, visitorEmail: clientVisitorEmail } = await req.json()

  const lastMessage = messages?.[messages.length - 1]
  const lastText = lastMessage?.parts?.filter((p: { type: string }) => p.type === "text").map((p: { text: string }) => p.text).join("") ?? ""
  if (lastText.length > 8000)
    return NextResponse.json({ error: "Message too long. Please keep it under 8000 characters." }, { status: 400 })

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

  // Look up visitor contact by sessionId to tell the AI if we already have their info
  const [visitorContact] = sessionId
    ? await db.select({ name: visitorContacts.name, email: visitorContacts.email })
        .from(visitorContacts)
        .where(eq(visitorContacts.sessionId, sessionId))
    : [undefined]

  // Client-side state is more up-to-date than DB (contact may not be linked yet)
  const resolvedName = visitorContact?.name ?? clientVisitorName ?? null
  const resolvedEmail = visitorContact?.email ?? clientVisitorEmail ?? null

  const system = buildSystemPrompt(user, sections, contactCollection?.enabled === true, resolvedName, resolvedEmail)
  const modelMessages = await convertToModelMessages(messages)

  // Save incoming messages immediately (creates session row if first message)
  const plainMessages = messages.map((m: { role: string; parts: { type: string; text: string }[] }) => ({
    role: m.role,
    content: m.parts?.filter((p: { type: string }) => p.type === "text").map((p: { text: string }) => p.text).join("") ?? "",
  }))

  const isFirstMessage = plainMessages.length === 1

  await db.insert(chatSessions)
    .values({ id: sessionId, userId: user.id, messages: plainMessages })
    .onConflictDoUpdate({
      target: chatSessions.id,
      set: { messages: plainMessages, updatedAt: sql`now()` },
    })

  // On first message, link the unlinked contact for this session to the session row
  if (isFirstMessage && resolvedEmail) {
    await db.update(visitorContacts)
      .set({ sessionId })
      .where(and(
        eq(visitorContacts.userId, user.id),
        eq(visitorContacts.email, resolvedEmail),
        isNull(visitorContacts.sessionId),
      ))
  } else if (isFirstMessage && resolvedName && !resolvedEmail) {
    // Name-only contact: match by name, link to session
    await db.update(visitorContacts)
      .set({ sessionId })
      .where(and(
        eq(visitorContacts.userId, user.id),
        eq(visitorContacts.name, resolvedName),
        isNull(visitorContacts.sessionId),
      ))
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system,
    messages: modelMessages,
    providerOptions: {
      anthropic: { cacheControl: { type: "ephemeral" } },
    },
    onFinish: async ({ text }) => {
      const cleanText = text.replace("[COLLECT_CONTACT]", "").trim()
      const withReply = [...plainMessages, { role: "assistant", content: cleanText }]
      await db.update(chatSessions)
        .set({ messages: withReply, updatedAt: sql`now()` })
        .where(eq(chatSessions.id, sessionId))
    },
  })

  return result.toUIMessageStreamResponse()
}
