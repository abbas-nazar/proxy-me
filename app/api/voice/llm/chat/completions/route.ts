import { streamText, convertToModelMessages, type ModelMessage } from "ai"
import { anthropic } from "@/lib/claude"
import { db } from "@/lib/db"
import { users, profileSections } from "@/db/schema"
import { eq } from "drizzle-orm"
import { buildSystemPrompt } from "@/lib/systemPrompt"
import { NextResponse } from "next/server"

type OpenAIMessage = {
  role: "system" | "user" | "assistant" | "tool"
  content: string | Array<{ type: string; text?: string }>
}

type OpenAIChatBody = {
  model?: string
  messages: OpenAIMessage[]
  stream?: boolean
}

function verifySecret(req: Request): boolean {
  const expected = process.env.ELEVENLABS_LLM_SECRET
  if (!expected) return false
  const header = req.headers.get("authorization") ?? ""
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : header.trim()
  return token === expected
}

function messagesToText(messages: OpenAIMessage[]): { system: string | null; convo: OpenAIMessage[] } {
  let system: string | null = null
  const convo: OpenAIMessage[] = []
  for (const m of messages) {
    if (m.role === "system") {
      const text = typeof m.content === "string" ? m.content : m.content.map((p) => p.text ?? "").join("")
      system = system ? `${system}\n\n${text}` : text
    } else if (m.role === "user" || m.role === "assistant") {
      convo.push(m)
    }
  }
  return { system, convo }
}

function toModelMessages(convo: OpenAIMessage[]): ModelMessage[] {
  return convo.map((m) => ({
    role: m.role as "user" | "assistant",
    content: typeof m.content === "string"
      ? m.content
      : m.content.map((p) => p.text ?? "").join(""),
  }))
}

const VOICE_ADDENDUM = `
## Voice call rules
This is a live voice call. Your reply will be spoken out loud.
- Keep replies to 1 to 2 sentences whenever possible. Never write paragraphs.
- No lists, no bullet points, no headers, no markdown formatting of any kind.
- Speak numbers, dates, and abbreviations as words a person would say aloud.
- If the visitor asks to share their email or stay in touch, tell them to visit your public profile page to leave contact details. Do not use the [COLLECT_CONTACT] token in voice calls, it will be read out loud.
- If there is silence or the transcript is unclear, ask "Sorry, could you say that again?" once. Do not fill silence with rambling.
`

export async function POST(req: Request) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(req.url)
  const slug = url.searchParams.get("slug")?.trim()
  if (!slug) {
    return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 })
  }

  const body = (await req.json().catch(() => null)) as OpenAIChatBody | null
  if (!body?.messages?.length) {
    return NextResponse.json({ error: "Missing messages" }, { status: 400 })
  }

  const [user] = await db.select().from(users).where(eq(users.slug, slug))
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  if (!user.isPublic) return NextResponse.json({ error: "Profile is private" }, { status: 403 })

  const sections = await db.select().from(profileSections).where(eq(profileSections.userId, user.id))

  const basePrompt = buildSystemPrompt(user, sections, false, null, null)
  const system = `${basePrompt}\n${VOICE_ADDENDUM}`

  const { convo } = messagesToText(body.messages)
  const modelMessages = await convertToModelMessages(
    toModelMessages(convo).map((m) => ({
      role: m.role,
      parts: [{ type: "text" as const, text: m.content as string }],
    })) as unknown as Parameters<typeof convertToModelMessages>[0]
  )

  const created = Math.floor(Date.now() / 1000)
  const completionId = `chatcmpl-${crypto.randomUUID()}`
  const modelId = body.model ?? "claude-sonnet-4-6"

  if (body.stream === false) {
    // Non-streaming: return a single JSON object
    const result = streamText({
      model: anthropic("claude-sonnet-4-6"),
      system,
      messages: modelMessages,
    })
    let text = ""
    for await (const delta of result.textStream) text += delta
    return NextResponse.json({
      id: completionId,
      object: "chat.completion",
      created,
      model: modelId,
      choices: [{
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: "stop",
      }],
    })
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system,
    messages: modelMessages,
  })

  const encoder = new TextEncoder()
  const sseStream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
      const done = () => controller.enqueue(encoder.encode("data: [DONE]\n\n"))

      // First chunk announces the assistant role (OpenAI convention)
      send({
        id: completionId,
        object: "chat.completion.chunk",
        created,
        model: modelId,
        choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null }],
      })

      try {
        for await (const delta of result.textStream) {
          if (!delta) continue
          send({
            id: completionId,
            object: "chat.completion.chunk",
            created,
            model: modelId,
            choices: [{ index: 0, delta: { content: delta }, finish_reason: null }],
          })
        }
        send({
          id: completionId,
          object: "chat.completion.chunk",
          created,
          model: modelId,
          choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
        })
        done()
        controller.close()
      } catch (err) {
        console.error("voice llm stream error", err)
        try { controller.close() } catch { }
      }
    },
  })

  return new Response(sseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
