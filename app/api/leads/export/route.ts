import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, visitorContacts } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId))
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const contacts = await db
    .select()
    .from(visitorContacts)
    .where(eq(visitorContacts.userId, user.id))
    .orderBy(desc(visitorContacts.createdAt))

  const rows = [
    ["Name", "Email", "Date"],
    ...contacts.map((c) => [
      c.name ?? "",
      c.email ?? "",
      c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : "",
    ]),
  ]

  const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n")

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
