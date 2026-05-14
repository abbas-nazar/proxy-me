import { getOrRedirectUser } from "@/app/actions/onboarding"
import { db } from "@/lib/db"
import { profileSections } from "@/db/schema"
import { eq } from "drizzle-orm"
import SectionsList from "@/components/dashboard/SectionsList"

export default async function SectionsPage() {
  const user = await getOrRedirectUser()

  const sections = await db
    .select()
    .from(profileSections)
    .where(eq(profileSections.userId, user.id))
    .orderBy(profileSections.createdAt)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your profile</h1>
        <span className="text-sm text-gray-400">{sections.length} section{sections.length !== 1 ? "s" : ""}</span>
      </div>
      {sections.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No profile data yet.{" "}
          <a href="/onboarding" className="underline">Import your CV</a> to get started.
        </p>
      ) : (
        <SectionsList sections={sections} />
      )}
    </div>
  )
}
