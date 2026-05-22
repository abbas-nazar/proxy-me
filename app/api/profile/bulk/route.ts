import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, profileSections } from "@/db/schema"
import { eq, and, inArray } from "drizzle-orm"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId))
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const { rows } = await req.json() as {
    rows: { type: string; title: string; content: unknown; source: string }[]
  }

  if (!rows?.length) return NextResponse.json({ error: "No rows" }, { status: 400 })

  const types = [...new Set(rows.map((r) => r.type))]

  await db
    .delete(profileSections)
    .where(and(eq(profileSections.userId, user.id), inArray(profileSections.type, types)))

  const created = await db
    .insert(profileSections)
    .values(rows.map((r) => ({ ...r, userId: user.id })))
    .returning()

  return NextResponse.json(created, { status: 201 })
}
