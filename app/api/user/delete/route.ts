import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { slug } = await req.json()

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId))
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  if (slug !== user.slug) {
    return NextResponse.json({ error: "Slug does not match." }, { status: 400 })
  }

  // Cascade deletes profile_sections, chat_sessions, visitor_contacts via FK
  await db.delete(users).where(eq(users.id, user.id))

  return NextResponse.json({ ok: true })
}
