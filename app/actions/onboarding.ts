"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function completeOnboarding(_prev: unknown, formData: FormData) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const slug = (formData.get("slug") as string).trim().toLowerCase()

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return { error: "Slug can only contain lowercase letters, numbers, and hyphens." }
  }

  const clerkUser = await currentUser()
  const displayName = clerkUser?.fullName ?? clerkUser?.firstName ?? "Anonymous"

  try {
    await db.insert(users).values({
      clerkId: userId,
      slug,
      displayName,
    })
  } catch {
    return { error: "That username is already taken. Please choose another." }
  }

  redirect("/dashboard")
}

export async function getOrRedirectUser() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId))
  if (!user) redirect("/onboarding")

  return user
}
