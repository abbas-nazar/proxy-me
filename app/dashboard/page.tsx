import { getOrRedirectUser } from "@/app/actions/onboarding"
import { db } from "@/lib/db"
import { profileSections, chatSessions, visitorContacts } from "@/db/schema"
import { eq } from "drizzle-orm"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await getOrRedirectUser()

  const [sections, sessions, contacts] = await Promise.all([
    db.select().from(profileSections).where(eq(profileSections.userId, user.id)),
    db.select().from(chatSessions).where(eq(chatSessions.userId, user.id)),
    db.select().from(visitorContacts).where(eq(visitorContacts.userId, user.id)),
  ])

  const CORE_SECTIONS = ["bio", "experience", "skills"]
  const existingTypes = new Set(sections.map((s) => s.type))
  const missingSections = CORE_SECTIONS.filter((t) => !existingTypes.has(t))
  const profileComplete = missingSections.length === 0

  const stats = [
    { label: "Profile sections", value: sections.length, href: "/dashboard/sections" },
    { label: "Conversations", value: sessions.length, href: "/dashboard/conversations" },
    { label: "Leads", value: contacts.length, href: "/dashboard/leads" },
  ]

  const quickActions = [
    { label: "Edit profile", description: "Update what your AI twin knows about you.", href: "/dashboard/sections" },
    { label: "Import CV", description: "Upload a PDF and Claude will extract your profile.", href: "/dashboard/import" },
    { label: "Settings", description: "Configure personality, suggested questions, contact collection.", href: "/dashboard/settings" },
  ]

  return (
    <div>
      {/* Dark banner */}
      <div style={{ backgroundColor: "#111", color: "white", padding: "40px 40px 36px" }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.4px" }}>
          Welcome, <em style={{ fontWeight: 400 }}>{user.displayName}</em>
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
          Your AI twin is{" "}
          <span style={{ color: user.isPublic ? "#4ade80" : "rgba(255,255,255,0.35)", fontWeight: 500 }}>
            {user.isPublic ? "active" : "off"}
          </span>
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: "32px 40px", maxWidth: 860 }}>

        {/* Profile completeness nudge */}
        {!profileComplete && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 14,
            border: "1px solid rgba(139,109,255,0.35)",
            background: "rgba(139,109,255,0.08)",
            borderRadius: 12, padding: "16px 20px", marginBottom: 28,
          }}>
            <div style={{ fontSize: 18, lineHeight: 1, marginTop: 1 }}>⚠</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f3f1ee", marginBottom: 4 }}>
                Your profile is missing some key sections
              </div>
              <div style={{ fontSize: 12, color: "#9a9aae", lineHeight: 1.5 }}>
                Add{" "}
                {missingSections.map((s, i) => (
                  <span key={s}>
                    {i > 0 && (i === missingSections.length - 1 ? " and " : ", ")}
                    <span style={{ color: "#c4b5fd", fontWeight: 500 }}>{s}</span>
                  </span>
                ))}
                {" "}to give your AI twin enough context to answer well.{" "}
                <a href="/dashboard/sections" style={{ color: "#8b6dff", textDecoration: "underline", textUnderlineOffset: 2 }}>
                  Edit profile →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {stats.map(({ label, value, href }) => (
            <Link key={href} href={href} style={{ textDecoration: "none", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "18px 20px", display: "block", color: "inherit", transition: "border-color 0.15s", backgroundColor: "#14141f" }}
              className="stat-card">
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-1px", lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: "#9a9aae", marginTop: 6 }}>{label}</div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#6e6e82", marginBottom: 12, textTransform: "uppercase" }}>Quick actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {quickActions.map(({ label, description, href }) => (
            <Link
              key={href}
              href={href}
              style={{ textDecoration: "none", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "18px 20px", display: "block", color: "inherit", backgroundColor: "#14141f" }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 12, color: "#9a9aae", marginTop: 4 }}>{description}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
