import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, profileSections } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId))
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const sections = await db
    .select()
    .from(profileSections)
    .where(eq(profileSections.userId, user.id))
    .orderBy(profileSections.createdAt)

  return NextResponse.json(sections)
}

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId))
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const { id, title, content } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const [updated] = await db
    .update(profileSections)
    .set({ title, content, updatedAt: new Date() })
    .where(and(eq(profileSections.id, id), eq(profileSections.userId, user.id)))
    .returning()

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(updated)
}
