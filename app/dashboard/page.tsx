import { getOrRedirectUser } from "@/app/actions/onboarding"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await getOrRedirectUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {user.displayName}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your public link:{" "}
          <Link href={`/${user.slug}`} className="underline" target="_blank">
            proxy-me.app/{user.slug}
          </Link>
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/sections"
          className="border rounded-lg p-5 hover:border-black transition-colors"
        >
          <h2 className="font-medium">Your profile</h2>
          <p className="text-sm text-gray-500 mt-1">View and edit what the AI knows about you.</p>
        </Link>
        <Link
          href="/dashboard/import"
          className="border rounded-lg p-5 hover:border-black transition-colors"
        >
          <h2 className="font-medium">Import CV</h2>
          <p className="text-sm text-gray-500 mt-1">Upload a PDF or paste your background.</p>
        </Link>
      </div>
    </div>
  )
}
