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
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">This profile is private.</p>
      </main>
    )
  }

  const sections = await db.select().from(profileSections).where(eq(profileSections.userId, user.id))
  const lastUpdated = sections.reduce<Date | null>((latest, s) => {
    if (!s.updatedAt) return latest
    const d = new Date(s.updatedAt)
    return !latest || d > latest ? d : latest
  }, null)

  const contactCollection = (user.contactCollection as { enabled: boolean; requireName: boolean; requireEmail: boolean }) ?? { enabled: false, requireName: false, requireEmail: false }
  const suggestedQuestions = (user.suggestedQuestions as string[]) ?? []

  return (
    <main className="min-h-screen flex flex-col max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{user.displayName}</h1>
        {user.headline && <p className="text-gray-500 text-sm mt-1">{user.headline}</p>}
        {lastUpdated && (
          <p className="text-xs text-gray-400 mt-1">
            Last updated {lastUpdated.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}
      </div>
      <div className="flex-1 min-h-0" style={{ height: "calc(100vh - 180px)" }}>
        <ChatInterface
          slug={slug}
          suggestedQuestions={suggestedQuestions}
          contactCollection={contactCollection}
        />
      </div>
    </main>
  )
}
