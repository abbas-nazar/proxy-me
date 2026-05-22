import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { extractText, getDocumentProxy } from "unpdf"
import { parseCVText } from "@/lib/parser"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const buffer = new Uint8Array(await file.arrayBuffer())
  const pdf = await getDocumentProxy(buffer)
  const { text: rawText } = await extractText(pdf, { mergePages: true })

  const profile = await parseCVText(rawText)
  return NextResponse.json(profile)
}
