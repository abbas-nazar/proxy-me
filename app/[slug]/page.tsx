import { db } from "@/lib/db"
import { users, profileSections } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import ChatInterface from "@/components/chat/ChatInterface"

type Props = { params: Promise<{ slug: string }> }

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = await params

  const [user] = await db.select().from(users).where(eq(users.slug, slug))
  if (!user) notFound()

  if (!user.isPublic) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#0f1117" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>This profile is private.</p>
      </main>
    )
  }

  const sections = await db.select().from(profileSections).where(eq(profileSections.userId, user.id))
  const bio = sections.find((s) => s.type === "bio")?.content as { text?: string } | undefined

  const contactCollection = (user.contactCollection as { enabled: boolean; requireName: boolean; requireEmail: boolean }) ?? { enabled: false, requireName: false, requireEmail: false }
  const suggestedQuestions = (user.suggestedQuestions as string[]) ?? []

  return (
    <ChatInterface
      slug={slug}
      displayName={user.displayName ?? slug}
      headline={user.headline ?? undefined}
      bio={bio?.text ?? undefined}
      suggestedQuestions={suggestedQuestions}
      contactCollection={contactCollection}
    />
  )
}
