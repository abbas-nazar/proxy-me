import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { slug } = await req.json()
  const value = slug?.trim().toLowerCase()

  if (!value || !/^[a-z0-9-]+$/.test(value))
    return NextResponse.json({ error: "Only lowercase letters, numbers, and hyphens." }, { status: 400 })

  try {
    const [updated] = await db
      .update(users)
      .set({ slug: value })
      .where(eq(users.clerkId, userId))
      .returning()

    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 })
    return NextResponse.json({ slug: updated.slug })
  } catch {
    return NextResponse.json({ error: "That username is already taken." }, { status: 409 })
  }
}
