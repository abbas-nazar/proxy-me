import { getOrRedirectUser } from "@/app/actions/onboarding"
import { db } from "@/lib/db"
import { visitorContacts, chatSessions } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export default async function LeadsPage() {
  const user = await getOrRedirectUser()

  const [contacts, sessions] = await Promise.all([
    db.select().from(visitorContacts).where(eq(visitorContacts.userId, user.id)).orderBy(desc(visitorContacts.createdAt)),
    db.select().from(chatSessions).where(eq(chatSessions.userId, user.id)).orderBy(desc(chatSessions.updatedAt)),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Leads</h1>
        <p className="text-sm text-gray-500 mt-1">{contacts.length} contact{contacts.length !== 1 ? "s" : ""} collected.</p>
      </div>

      {contacts.length === 0 ? (
        <div className="border border-dashed rounded-xl px-6 py-12 text-center text-gray-400 text-sm">
          No leads yet. Enable contact collection in Settings to start capturing visitor details.
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Conversation</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contacts.map((c) => {
                const session = sessions.find((s) => {
                  const created = s.createdAt ? new Date(s.createdAt).getTime() : 0
                  const contactTime = c.createdAt ? new Date(c.createdAt).getTime() : 0
                  return Math.abs(created - contactTime) < 60 * 60 * 1000
                })
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{c.name ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }) : ""}
                    </td>
                    <td className="px-4 py-3">
                      {session ? (
                        <a
                          href={`/dashboard/conversations#session-${session.id}`}
                          className="text-xs text-black underline underline-offset-2 hover:opacity-60"
                        >
                          View chat
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
