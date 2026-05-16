import { streamText, convertToModelMessages } from "ai";
import { anthropic } from "@/lib/claude";
import { db } from "@/lib/db";
import { users, profileSections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { messages, slug } = await req.json();

  if (!slug)
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const [user] = await db.select().from(users).where(eq(users.slug, slug));
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!user.isPublic)
    return NextResponse.json({ error: "Profile is private" }, { status: 403 });

  const sections = await db
    .select()
    .from(profileSections)
    .where(eq(profileSections.userId, user.id));

  const system = buildSystemPrompt(user, sections);

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system,
    messages: modelMessages,
    providerOptions: {
      anthropic: { cacheControl: { type: "ephemeral" } },
    },
  });

  return result.toUIMessageStreamResponse();
}
