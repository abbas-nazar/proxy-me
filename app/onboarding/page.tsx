import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import OnboardingFlow from "./OnboardingFlow"

export default async function OnboardingPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [existing] = await db.select().from(users).where(eq(users.clerkId, userId))
  if (existing) redirect("/dashboard")

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <OnboardingFlow />
      </div>
    </main>
  )
}
