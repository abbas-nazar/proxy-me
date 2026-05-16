import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { isPublic } = await req.json()

  const [updated] = await db
    .update(users)
    .set({ isPublic })
    .where(eq(users.clerkId, userId))
    .returning()

  if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 })

  return NextResponse.json(updated)
}
