import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, profileSections } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId))
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const [deleted] = await db
    .delete(profileSections)
    .where(and(eq(profileSections.id, id), eq(profileSections.userId, user.id)))
    .returning()

  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ success: true })
}
