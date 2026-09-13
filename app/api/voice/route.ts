import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { rateLimit } from "@/lib/rateLimit"
import { getVoice, listVoices } from "@/lib/elevenlabs"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const voices = await listVoices()
    return NextResponse.json({ voices })
  } catch (err) {
    console.error("listVoices failed", err)
    return NextResponse.json({ error: "Failed to load voices." }, { status: 502 })
  }
}

export async function PUT(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!rateLimit(`voice-select:${userId}`, 20, 60_000))
    return NextResponse.json({ error: "Too many changes. Try again in a minute." }, { status: 429 })

  const body = (await req.json().catch(() => null)) as { voiceId?: string } | null
  const voiceId = body?.voiceId?.trim()
  if (!voiceId) return NextResponse.json({ error: "voiceId required" }, { status: 400 })

  const voice = await getVoice(voiceId).catch(() => null)
  if (!voice) return NextResponse.json({ error: "Unknown voice" }, { status: 400 })

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId))
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  await db
    .update(users)
    .set({ voiceId: voice.voice_id, voiceCreatedAt: new Date() })
    .where(eq(users.id, user.id))

  return NextResponse.json({ voiceId: voice.voice_id, name: voice.name })
}

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId))
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  await db.update(users).set({ voiceId: null, voiceCreatedAt: null }).where(eq(users.id, user.id))
  return NextResponse.json({ ok: true })
}
