import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  const patch: Partial<typeof users.$inferInsert> = {}
  if ("isPublic" in body) patch.isPublic = body.isPublic
  if ("personality" in body) patch.personality = body.personality
  if ("suggestedQuestions" in body) patch.suggestedQuestions = body.suggestedQuestions
  if ("contactCollection" in body) patch.contactCollection = body.contactCollection
  if ("headline" in body) patch.headline = body.headline

  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })

  const [updated] = await db
    .update(users)
    .set(patch)
    .where(eq(users.clerkId, userId))
    .returning()

  if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 })

  return NextResponse.json(updated)
}
