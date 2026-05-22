import { getOrRedirectUser } from "@/app/actions/onboarding"
import { db } from "@/lib/db"
import { chatSessions, visitorContacts } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import Link from "next/link"

type Message = { role: "user" | "assistant"; content: string }

export default async function ConversationsPage() {
  const user = await getOrRedirectUser()

  const [sessions, contacts] = await Promise.all([
    db.select().from(chatSessions).where(eq(chatSessions.userId, user.id)).orderBy(desc(chatSessions.updatedAt)),
    db.select().from(visitorContacts).where(eq(visitorContacts.userId, user.id)).orderBy(desc(visitorContacts.createdAt)),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Conversations</h1>
        <p className="text-sm text-gray-500 mt-1">{sessions.length} conversation{sessions.length !== 1 ? "s" : ""} so far.</p>
      </div>

      {contacts.length > 0 && (
        <div className="border rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-semibold">Collected contacts</h2>
          <div className="divide-y">
            {contacts.map((c) => {
              const session = sessions.find((s) => {
                const created = s.createdAt ? new Date(s.createdAt).getTime() : 0
                const contactTime = c.createdAt ? new Date(c.createdAt).getTime() : 0
                return Math.abs(created - contactTime) < 60 * 60 * 1000
              })
              return (
                <div key={c.id} className="py-2 flex items-center gap-4 text-sm">
                  {c.name && <span className="font-medium">{c.name}</span>}
                  {c.email && <span className="text-gray-500">{c.email}</span>}
                  <span className="text-xs text-gray-400 ml-auto">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }) : ""}
                  </span>
                  {session && (
                    <a href={`#session-${session.id}`} className="text-xs text-black underline underline-offset-2 hover:opacity-60 shrink-0">
                      View chat
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="border border-dashed rounded-xl px-6 py-12 text-center text-gray-400 text-sm">
          No conversations yet. Share your link to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const messages = (session.messages as Message[]) ?? []
            const msgCount = messages.length
            return (
              <div key={session.id} id={`session-${session.id}`} className="border rounded-xl p-4 space-y-2 scroll-mt-6">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{msgCount} message{msgCount !== 1 ? "s" : ""}</span>
                  <span>
                    {session.updatedAt ? new Date(session.updatedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }) : ""}
                  </span>
                </div>
                {messages.length > 0 && (
                  <div className="space-y-1 pt-1 max-h-48 overflow-y-auto">
                    {messages.map((m, i) => (
                      <div key={i} className={`text-xs px-3 py-1.5 rounded-lg max-w-[85%] ${m.role === "user" ? "bg-black text-white ml-auto" : "bg-gray-100 text-gray-800"}`}>
                        {m.content}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
