import { auth, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/db/schema"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { slug } = await req.json()

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Slug can only contain lowercase letters, numbers, and hyphens." }, { status: 400 })
  }

  const clerkUser = await currentUser()
  const displayName = clerkUser?.fullName ?? clerkUser?.firstName ?? "Anonymous"

  try {
    await db.insert(users).values({ clerkId: userId, slug, displayName })
  } catch {
    return NextResponse.json({ error: "That username is already taken. Please choose another." }, { status: 409 })
  }

  return NextResponse.json({ success: true })
}
