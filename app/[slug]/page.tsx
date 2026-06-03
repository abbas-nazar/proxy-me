import { db } from "@/lib/db"
import { users, profileSections } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import ChatInterface from "@/components/chat/ChatInterface"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const [user] = await db.select().from(users).where(eq(users.slug, slug))
  if (!user) return {}
  const title = user.displayName ? `${user.displayName} — AI Twin` : `${slug} — AI Twin`
  const description = user.headline ?? `Chat with ${user.displayName ?? slug}'s AI twin on proxy-me.`
  return {
    title,
    description,
    openGraph: { title, description, url: `https://proxy-me.app/${slug}` },
    twitter: { card: "summary", title, description },
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = await params

  const [user] = await db.select().from(users).where(eq(users.slug, slug))
  if (!user) notFound()

  if (!user.isPublic) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0a0f", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(139,109,255,0.12)", border: "1px solid rgba(139,109,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 22 }}>
            🔒
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#f3f1ee", letterSpacing: "-0.3px" }}>
            This profile is private
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#6e6e82", lineHeight: 1.6 }}>
            {user.displayName ?? slug} hasn&apos;t made their profile public yet.
          </p>
        </div>
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
