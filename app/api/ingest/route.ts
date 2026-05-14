import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { PDFParse } from "pdf-parse"
import { db } from "@/lib/db"
import { users, profileSections } from "@/db/schema"
import { parseCVText, type ParsedProfile } from "@/lib/parser"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const manualText = formData.get("text") as string | null
  const source = file ? "cv" : "manual"

  let rawText: string

  if (file) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    rawText = result.text
  } else if (manualText) {
    rawText = manualText
  } else {
    return NextResponse.json({ error: "No file or text provided" }, { status: 400 })
  }

  const profile = await parseCVText(rawText)

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId))
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  await saveSections(user.id, profile, source)

  return NextResponse.json({ success: true })
}

async function saveSections(
  userId: string,
  profile: ParsedProfile,
  source: string
) {
  const rows: (typeof profileSections.$inferInsert)[] = []

  if (profile.bio) {
    rows.push({ userId, type: "bio", title: "Bio", content: { text: profile.bio }, source })
  }

  if (profile.experience?.length) {
    rows.push({
      userId,
      type: "experience",
      title: "Experience",
      content: { items: profile.experience },
      source,
    })
  }

  if (profile.education?.length) {
    rows.push({
      userId,
      type: "education",
      title: "Education",
      content: { items: profile.education },
      source,
    })
  }

  if (profile.skills?.length) {
    rows.push({
      userId,
      type: "skills",
      title: "Skills",
      content: { items: profile.skills },
      source,
    })
  }

  if (profile.projects?.length) {
    rows.push({
      userId,
      type: "projects",
      title: "Projects",
      content: { items: profile.projects },
      source,
    })
  }

  if (!rows.length) return

  await db
    .insert(profileSections)
    .values(rows)
    .onConflictDoNothing()
}
