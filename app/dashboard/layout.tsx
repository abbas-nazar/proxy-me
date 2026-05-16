import Link from "next/link"
import { UserButton } from "@clerk/nextjs"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="font-semibold">proxy-me</Link>
          <Link href="/dashboard/sections" className="text-gray-500 hover:text-black">Profile</Link>
          <Link href="/dashboard/import" className="text-gray-500 hover:text-black">Import</Link>
          <Link href="/dashboard/settings" className="text-gray-500 hover:text-black">Settings</Link>
        </nav>
        <UserButton />
      </header>
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
