import { getOrRedirectUser } from "@/app/actions/onboarding"
import { db } from "@/lib/db"
import { profileSections, chatSessions, visitorContacts } from "@/db/schema"
import { eq } from "drizzle-orm"
import Link from "next/link"
import CopyLinkButton from "@/components/dashboard/CopyLinkButton"

export default async function DashboardPage() {
  const user = await getOrRedirectUser()

  const [sections, sessions, contacts] = await Promise.all([
    db.select().from(profileSections).where(eq(profileSections.userId, user.id)),
    db.select().from(chatSessions).where(eq(chatSessions.userId, user.id)),
    db.select().from(visitorContacts).where(eq(visitorContacts.userId, user.id)),
  ])

  const publicUrl = `/${user.slug}`
  const absoluteUrl = `proxy-me.app${publicUrl}`

  const stats = [
    { label: "Profile sections", value: sections.length, href: "/dashboard/sections" },
    { label: "Conversations", value: sessions.length, href: "/dashboard/conversations" },
    { label: "Leads", value: contacts.length, href: "/dashboard/leads" },
  ]

  const quickActions = [
    { label: "Edit profile", description: "Update what your AI twin knows about you.", href: "/dashboard/sections" },
    { label: "Import CV", description: "Upload a PDF and Claude will extract your profile.", href: "/dashboard/import" },
    { label: "Settings", description: "Configure personality, suggested questions, contact collection.", href: "/dashboard/settings" },
    { label: "Share your link", description: absoluteUrl, href: publicUrl, external: true },
  ]

  return (
    <div>
      {/* Dark banner */}
      <div style={{ backgroundColor: "#111", color: "white", padding: "40px 40px 36px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.4px" }}>
            Welcome, <em style={{ fontWeight: 400 }}>{user.displayName}</em>
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            Your AI twin is{" "}
            <span style={{ color: user.isPublic ? "#4ade80" : "rgba(255,255,255,0.35)", fontWeight: 500 }}>
              {user.isPublic ? "active" : "off"}
            </span>
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <code style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 10px" }}>
              {absoluteUrl}
            </code>
            <CopyLinkButton url={`https://${absoluteUrl}`} />
          </div>
        </div>
        <Link
          href={publicUrl}
          target="_blank"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid rgba(255,255,255,0.35)", color: "white", borderRadius: 8, padding: "8px 16px", fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}
        >
          Open my page →
        </Link>
      </div>

      {/* Content */}
      <div style={{ padding: "32px 40px", maxWidth: 860 }}>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {stats.map(({ label, value, href }) => (
            <Link key={href} href={href} style={{ textDecoration: "none", border: "1px solid #e5e7eb", borderRadius: 12, padding: "18px 20px", display: "block", color: "inherit", transition: "border-color 0.15s" }}
              className="stat-card">
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-1px", lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>{label}</div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#9ca3af", marginBottom: 12, textTransform: "uppercase" }}>Quick actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {quickActions.map(({ label, description, href, external }) => (
            <Link
              key={href}
              href={href}
              target={external ? "_blank" : undefined}
              style={{ textDecoration: "none", border: "1px solid #e5e7eb", borderRadius: 12, padding: "18px 20px", display: "block", color: "inherit" }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: external ? "monospace" : "inherit" }}>
                {description}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
