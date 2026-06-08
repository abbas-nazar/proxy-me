import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, visitorContacts, chatSessions } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { rateLimit } from "@/lib/rateLimit"

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!rateLimit(`contact:${ip}`, 10, 60_000))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  const { slug, name, email, sessionId } = await req.json()

  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 })

  const trimmedEmail = email?.trim() || null
  const trimmedName = name?.trim() || null

  // Must have at least something to save
  if (!trimmedEmail && !trimmedName)
    return NextResponse.json({ error: "Name or email is required" }, { status: 400 })

  const [user] = await db.select().from(users).where(eq(users.slug, slug))
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Only use sessionId if the session actually exists — avoids FK violation
  let validSessionId: string | null = null
  if (sessionId) {
    const [session] = await db.select({ id: chatSessions.id }).from(chatSessions).where(eq(chatSessions.id, sessionId))
    if (session) validSessionId = sessionId
  }

  // Try to find existing row for this session first
  if (validSessionId) {
    const [bySession] = await db
      .select()
      .from(visitorContacts)
      .where(and(eq(visitorContacts.userId, user.id), eq(visitorContacts.sessionId, validSessionId)))

    if (bySession) {
      await db.update(visitorContacts)
        .set({
          name: trimmedName ?? bySession.name,
          email: trimmedEmail ?? bySession.email,
        })
        .where(eq(visitorContacts.id, bySession.id))
      return NextResponse.json({ ok: true })
    }
  }

  // Deduplicate by email if provided
  if (trimmedEmail) {
    const [byEmail] = await db
      .select()
      .from(visitorContacts)
      .where(and(eq(visitorContacts.userId, user.id), eq(visitorContacts.email, trimmedEmail)))

    if (byEmail) {
      await db.update(visitorContacts)
        .set({
          name: trimmedName ?? byEmail.name,
          sessionId: validSessionId ?? byEmail.sessionId,
        })
        .where(eq(visitorContacts.id, byEmail.id))
      return NextResponse.json({ ok: true })
    }
  }

  await db.insert(visitorContacts).values({
    userId: user.id,
    sessionId: validSessionId,
    name: trimmedName,
    email: trimmedEmail,
  })

  return NextResponse.json({ ok: true })
}
