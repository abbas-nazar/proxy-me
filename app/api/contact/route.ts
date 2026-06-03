import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, visitorContacts } from "@/db/schema"
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

  // Deduplicate by email if provided — update name/sessionId instead of inserting a duplicate
  if (trimmedEmail) {
    const [existing] = await db
      .select()
      .from(visitorContacts)
      .where(and(eq(visitorContacts.userId, user.id), eq(visitorContacts.email, trimmedEmail)))

    if (existing) {
      await db.update(visitorContacts)
        .set({
          name: trimmedName ?? existing.name,
          sessionId: sessionId || existing.sessionId,
        })
        .where(eq(visitorContacts.id, existing.id))
      return NextResponse.json({ ok: true })
    }
  }

  await db.insert(visitorContacts).values({
    userId: user.id,
    sessionId: sessionId || null,
    name: trimmedName,
    email: trimmedEmail,
  })

  return NextResponse.json({ ok: true })
}
