import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, visitorContacts } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  const { slug, name, email } = await req.json()

  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 })
  if (!email?.trim()) return NextResponse.json({ error: "Email is required" }, { status: 400 })

  const [user] = await db.select().from(users).where(eq(users.slug, slug))
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db.insert(visitorContacts).values({ userId: user.id, name: name || null, email: email.trim() })

  return NextResponse.json({ ok: true })
}
