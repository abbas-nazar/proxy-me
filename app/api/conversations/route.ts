import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, chatSessions, visitorContacts } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId))
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const all = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.userId, user.id))
    .orderBy(desc(chatSessions.updatedAt))

  const sessions = all.filter((s) => Array.isArray(s.messages) && (s.messages as unknown[]).length > 0)

  // Fetch contacts keyed by sessionId
  const contacts = await db
    .select({ sessionId: visitorContacts.sessionId, name: visitorContacts.name, email: visitorContacts.email })
    .from(visitorContacts)
    .where(eq(visitorContacts.userId, user.id))

  const contactBySession = Object.fromEntries(
    contacts.filter((c) => c.sessionId).map((c) => [c.sessionId!, { name: c.name, email: c.email }])
  )

  const sessionsWithContact = sessions.map((s) => ({
    ...s,
    contact: contactBySession[s.id] ?? null,
  }))

  return NextResponse.json({ sessions: sessionsWithContact })
}
