import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import Link from "next/link"

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    const [user] = await db.select().from(users).where(eq(users.clerkId, userId))
    redirect(user ? "/dashboard" : "/onboarding")
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-3xl font-semibold">proxy-me</h1>
        <p className="text-gray-500">Your personal AI recruiter agent. Set up once, share your link.</p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/sign-up"
            className="bg-black text-white rounded-md px-5 py-2 text-sm font-medium"
          >
            Get started
          </Link>
          <Link
            href="/sign-in"
            className="border rounded-md px-5 py-2 text-sm font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
