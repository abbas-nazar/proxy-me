import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { completeOnboarding } from "@/app/actions/onboarding"
import OnboardingForm from "./OnboardingForm"

export default async function OnboardingPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [existing] = await db.select().from(users).where(eq(users.clerkId, userId))
  if (existing) redirect("/dashboard")

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Set up your profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Choose a username — this will be your public link.
          </p>
        </div>
        <OnboardingForm action={completeOnboarding} />
      </div>
    </main>
  )
}
