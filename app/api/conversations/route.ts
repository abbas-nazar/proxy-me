import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, chatSessions } from "@/db/schema"
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

  // Drop sessions with no messages
  const sessions = all.filter((s) => Array.isArray(s.messages) && (s.messages as unknown[]).length > 0)

  return NextResponse.json({ sessions })
}
