import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import Link from "next/link"
import ChatDemoClient from "@/components/landing/ChatDemoClient"
import { BASE_URL } from "@/lib/baseUrl"

// ─── Design tokens ────────────────────────────────────────────────────────────
const accent = "#8b6dff"
const bg = "#0a0a0f"
const bg2 = "#0e0e16"
const surface = "#14141f"
const surface2 = "#1b1b2a"
const border = "rgba(255,255,255,0.09)"
const borderStrong = "rgba(255,255,255,0.16)"
const text = "#f3f1ee"
const muted = "#9a9aae"
const muted2 = "#6e6e82"
const radius = "18px"

// ─── Shared style objects ─────────────────────────────────────────────────────
const sectionWrap: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  padding: "0 24px",
  width: "100%",
}

const pill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "rgba(139,109,255,0.1)",
  border: `1px solid rgba(139,109,255,0.25)`,
  borderRadius: 100,
  padding: "5px 14px",
  fontSize: 11,
  fontFamily: "var(--font-jetbrains-mono, monospace)",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: accent,
  marginBottom: 22,
}

const accentDot: React.CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: accent,
  boxShadow: `0 0 8px ${accent}`,
  display: "inline-block",
  flexShrink: 0,
}

const ctaButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: accent,
  color: "#fff",
  borderRadius: 12,
  padding: "12px 26px",
  fontWeight: 600,
  fontSize: 15,
  textDecoration: "none",
  boxShadow: `0 0 24px rgba(139,109,255,0.4)`,
  border: "none",
  cursor: "pointer",
  transition: "box-shadow 0.2s, background 0.2s",
  whiteSpace: "nowrap" as const,
}

const ghostButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  color: text,
  borderRadius: 12,
  padding: "11px 22px",
  fontWeight: 500,
  fontSize: 14,
  textDecoration: "none",
  border: `1px solid ${borderStrong}`,
  cursor: "pointer",
  whiteSpace: "nowrap" as const,
}

// ─── Handle input shared ──────────────────────────────────────────────────────
function HandleField({ size = "md" }: { size?: "md" | "lg" }) {
  const isLg = size === "lg"
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: surface,
        border: `1px solid ${borderStrong}`,
        borderRadius: 14,
        overflow: "hidden",
        maxWidth: isLg ? 520 : 460,
        width: "100%",
      }}
    >
      <span
        style={{
          padding: isLg ? "14px 14px 14px 18px" : "12px 10px 12px 16px",
          fontFamily: "var(--font-jetbrains-mono, monospace)",
          fontSize: isLg ? 14 : 13,
          color: muted2,
          whiteSpace: "nowrap",
          flexShrink: 0,
          borderRight: `1px solid ${border}`,
        }}
      >
        {BASE_URL.replace(/^https?:\/\//, "")}/
      </span>
      <input
        type="text"
        placeholder="yourname"
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: text,
          fontSize: isLg ? 14 : 13,
          fontFamily: "var(--font-hanken-grotesk, system-ui, sans-serif)",
          padding: isLg ? "14px 12px" : "12px 10px",
        }}
      />
      <Link
        href="/sign-up"
        style={{
          ...ctaButton,
          borderRadius: "0 12px 12px 0",
          fontSize: isLg ? 14 : 13,
          padding: isLg ? "14px 22px" : "12px 18px",
          boxShadow: "none",
        }}
      >
        Claim handle
      </Link>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        background: "rgba(10,10,15,0.8)",
        borderBottom: `1px solid ${border}`,
      }}
    >
      <div
        style={{
          ...sectionWrap,
          display: "flex",
          alignItems: "center",
          height: 60,
          gap: 0,
        }}
      >
        {/* Brand mark */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: `linear-gradient(135deg, #8b6dff 0%, #6040e0 100%)`,
              boxShadow: `0 0 10px rgba(139,109,255,0.5)`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-space-grotesk, system-ui, sans-serif)",
              fontWeight: 600,
              fontSize: 16,
              color: text,
              letterSpacing: "-0.02em",
            }}
          >
            Proxy<span style={{ color: accent }}>-</span>Me
          </span>
        </Link>

        {/* Nav links — hidden on mobile via inline style trick */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginLeft: 40,
            flex: 1,
          }}
          className="nav-links-desktop"
        >
          {["How it works", "Setup", "For recruiters"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/ /g, "-")}`}
              style={{
                color: muted,
                textDecoration: "none",
                fontSize: 14,
                padding: "6px 12px",
                borderRadius: 8,
                fontWeight: 400,
              }}
            >
              {label}
            </a>
          ))}
        </div>

        <div style={{ marginLeft: "auto" }}>
          <Link href="/sign-up" style={ctaButton}>
            Claim handle
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      style={{
        padding: "96px 0 80px",
      }}
    >
      <div
        style={{
          ...sectionWrap,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
        className="hero-grid"
      >
        {/* Copy */}
        <div>
          <div style={pill}>
            <span style={accentDot} />
            AI career proxy
          </div>

          <h1
            style={{
              fontFamily: "var(--font-space-grotesk, system-ui, sans-serif)",
              fontWeight: 600,
              fontSize: "clamp(36px, 5vw, 62px)",
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              color: text,
              margin: "0 0 22px",
            }}
          >
            Your AI proxy talks to recruiters. You just show up for the good ones.
          </h1>

          <p
            style={{
              fontSize: 17,
              color: muted,
              lineHeight: 1.65,
              margin: "0 0 36px",
              maxWidth: 520,
            }}
          >
            Claim your handle, drop in your CV or LinkedIn export, and Proxy-Me builds a profile recruiters can chat with any hour, any question, any language.
          </p>

          <HandleField size="lg" />

          <p
            style={{
              fontSize: 12.5,
              color: muted2,
              marginTop: 14,
              fontFamily: "var(--font-jetbrains-mono, monospace)",
              letterSpacing: "0.02em",
            }}
          >
            ✓ Free to claim · Live in under 5 minutes · Always sounds like you
          </p>
        </div>

        {/* Chat demo */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ChatDemoClient />
        </div>
      </div>
    </section>
  )
}

// ─── How it works ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    icon: "🔗",
    title: "Claim your handle",
    desc: `Pick ${BASE_URL.replace(/^https?:\/\//, "")}/yourname in seconds. Your personal link, yours forever.`,
  },
  {
    num: "02",
    icon: "📄",
    title: "Upload your CV or LinkedIn",
    desc: "Drop in a PDF or LinkedIn export. Proxy-Me extracts your experience, skills, and projects automatically.",
  },
  {
    num: "03",
    icon: "🚀",
    title: "Share your link",
    desc: "Send it to recruiters. Your proxy handles every question 24/7, any timezone, any language.",
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: "80px 0" }}>
      <div style={sectionWrap}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={pill}>How it works</div>
          <h2
            style={{
              fontFamily: "var(--font-space-grotesk, system-ui, sans-serif)",
              fontWeight: 600,
              fontSize: "clamp(28px, 3.5vw, 42px)",
              letterSpacing: "-0.025em",
              color: text,
              margin: 0,
            }}
          >
            Up and running in minutes
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
          className="steps-grid"
        >
          {STEPS.map((step) => (
            <div
              key={step.num}
              style={{
                background: surface,
                border: `1px solid ${border}`,
                borderRadius: radius,
                padding: "32px 28px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-jetbrains-mono, monospace)",
                  fontSize: 11,
                  color: accent,
                  letterSpacing: "0.1em",
                  marginBottom: 16,
                  fontWeight: 500,
                }}
              >
                {step.num}
              </div>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{step.icon}</div>
              <h3
                style={{
                  fontFamily: "var(--font-space-grotesk, system-ui, sans-serif)",
                  fontWeight: 600,
                  fontSize: 18,
                  color: text,
                  margin: "0 0 10px",
                  letterSpacing: "-0.02em",
                }}
              >
                {step.title}
              </h3>
              <p style={{ fontSize: 14, color: muted, lineHeight: 1.6, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Setup section ─────────────────────────────────────────────────────────────
const SECTION_CHIPS = [
  { label: "Bio", accent: true },
  { label: "Experience", accent: true },
  { label: "Education", accent: true },
  { label: "Skills", accent: true },
  { label: "Projects", accent: true },
]

function ProfileCardMockup() {
  return (
    <div
      style={{
        background: surface,
        border: `1px solid ${border}`,
        borderRadius: radius,
        padding: 28,
        maxWidth: 360,
        width: "100%",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${accent} 0%, #6040e0 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 18,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          SC
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16, color: text, fontFamily: "var(--font-space-grotesk, system-ui, sans-serif)" }}>
            Sarah Chen
          </div>
          <div
            style={{
              fontSize: 12,
              color: muted2,
              fontFamily: "var(--font-jetbrains-mono, monospace)",
            }}
          >
            {BASE_URL.replace(/^https?:\/\//, "")}/sarahchen
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontSize: 11,
            fontWeight: 600,
            background: "rgba(34,197,94,0.12)",
            color: "#22c55e",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: 100,
            padding: "3px 10px",
          }}
        >
          Published
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: border, marginBottom: 18 }} />

      {/* Section chips */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 11,
            color: muted2,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 10,
            fontFamily: "var(--font-jetbrains-mono, monospace)",
          }}
        >
          Profile sections
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SECTION_CHIPS.map((chip) => (
            <span
              key={chip.label}
              style={{
                fontSize: 12,
                padding: "4px 12px",
                borderRadius: 100,
                background: chip.accent
                  ? "rgba(139,109,255,0.15)"
                  : surface2,
                border: `1px solid ${chip.accent ? "rgba(139,109,255,0.3)" : border}`,
                color: chip.accent ? accent : muted,
                fontWeight: chip.accent ? 500 : 400,
              }}
            >
              {chip.label}
            </span>
          ))}
        </div>
      </div>

      {/* CV parse note */}
      <div
        style={{
          background: surface2,
          border: `1px solid ${border}`,
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 12,
          color: muted,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 14 }}>✨</span>
        CV parsed · 5 sections extracted
      </div>
    </div>
  )
}

function Setup() {
  return (
    <section id="setup" style={{ padding: "80px 0" }}>
      <div style={sectionWrap}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
          className="two-col-grid"
        >
          {/* Copy */}
          <div>
            <div style={pill}>Setup</div>
            <h2
              style={{
                fontFamily: "var(--font-space-grotesk, system-ui, sans-serif)",
                fontWeight: 600,
                fontSize: "clamp(26px, 3vw, 38px)",
                letterSpacing: "-0.025em",
                color: text,
                margin: "0 0 18px",
              }}
            >
              Your whole career, in one shareable profile.
            </h2>
            <p style={{ fontSize: 16, color: muted, lineHeight: 1.65, margin: "0 0 24px" }}>
              Upload a PDF or paste your LinkedIn export. Proxy-Me reads everything experience, education, skills, projects and turns it into a structured profile your proxy can speak from.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Instant CV parsing takes seconds",
                "Edit or add sections manually",
                "Always up to date re-import anytime",
              ].map((item) => (
                <li
                  key={item}
                  style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: muted }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "rgba(139,109,255,0.15)",
                      border: "1px solid rgba(139,109,255,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      color: accent,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Profile card mockup */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ProfileCardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── What it handles ─────────────────────────────────────────────────────────
const ANSWER_CARDS = [
  { category: "Availability", q: "Are you open to new roles right now?" },
  { category: "Tech fit", q: "Do you have experience with distributed systems?" },
  { category: "Location", q: "Are you open to relocation or remote?" },
  { category: "Compensation", q: "What are your salary expectations?" },
  { category: "Notice", q: "What is your current notice period?" },
  { category: "JD match", q: "How well do you match this job description?" },
]

function WhatItHandles() {
  return (
    <section style={{ padding: "80px 0" }}>
      <div style={sectionWrap}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={pill}>What it handles</div>
          <h2
            style={{
              fontFamily: "var(--font-space-grotesk, system-ui, sans-serif)",
              fontWeight: 600,
              fontSize: "clamp(26px, 3.5vw, 40px)",
              letterSpacing: "-0.025em",
              color: text,
              margin: 0,
            }}
          >
            Every recruiter question, answered.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
          className="answers-grid"
        >
          {ANSWER_CARDS.map((card) => (
            <div
              key={card.q}
              style={{
                background: surface,
                border: `1px solid ${border}`,
                borderRadius: 14,
                padding: "22px 20px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: accent,
                  textTransform: "uppercase",
                  fontFamily: "var(--font-jetbrains-mono, monospace)",
                  marginBottom: 10,
                }}
              >
                {card.category}
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: text,
                  margin: 0,
                  lineHeight: 1.5,
                  fontStyle: "italic",
                }}
              >
                &ldquo;{card.q}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── For recruiters ────────────────────────────────────────────────────────────
function ForRecruiters() {
  return (
    <section id="for-recruiters" style={{ padding: "80px 0" }}>
      <div style={sectionWrap}>
        <div
          style={{
            background: `linear-gradient(135deg, ${surface} 0%, ${surface2} 100%)`,
            border: `1px solid ${borderStrong}`,
            borderRadius: radius,
            padding: "56px 48px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse at 80% 20%, rgba(139,109,255,0.12) 0%, transparent 60%)`,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 40,
            }}
          >
            <div>
              <div style={{ ...pill, margin: "0 auto 20px" }}>For recruiters</div>
              <h2
                style={{
                  fontFamily: "var(--font-space-grotesk, system-ui, sans-serif)",
                  fontWeight: 600,
                  fontSize: "clamp(26px, 3vw, 38px)",
                  letterSpacing: "-0.025em",
                  color: text,
                  margin: 0,
                }}
              >
                Instant answers. No scheduling needed.
              </h2>
            </div>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                gap: 64,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {[
                { stat: "24/7", label: "Available every hour" },
                { stat: "0", label: "Scheduling calls to pre-screen" },
                { stat: "1", label: "Link to know everything" },
              ].map(({ stat, label }) => (
                <div key={stat} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-space-grotesk, system-ui, sans-serif)",
                      fontWeight: 700,
                      fontSize: 48,
                      color: accent,
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                      marginBottom: 8,
                    }}
                  >
                    {stat}
                  </div>
                  <div style={{ fontSize: 13, color: muted, maxWidth: 160 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section style={{ padding: "80px 0 100px" }}>
      <div style={sectionWrap}>
        <div
          style={{
            background: surface,
            border: `1px solid ${borderStrong}`,
            borderRadius: radius,
            padding: "72px 48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              top: -80,
              left: "50%",
              transform: "translateX(-50%)",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(139,109,255,0.15) 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <h2
              style={{
                fontFamily: "var(--font-space-grotesk, system-ui, sans-serif)",
                fontWeight: 600,
                fontSize: "clamp(28px, 4vw, 48px)",
                letterSpacing: "-0.025em",
                color: text,
                margin: "0 0 18px",
              }}
            >
              Stop repeating yourself to recruiters.
            </h2>
            <p style={{ fontSize: 16, color: muted, margin: "0 0 36px", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
              Set up once, share your link, and let your proxy handle the rest.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <HandleField size="lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${border}`,
        padding: "36px 0",
        background: bg2,
      }}
    >
      <div
        style={{
          ...sectionWrap,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        {/* Brand */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              background: `linear-gradient(135deg, ${accent} 0%, #6040e0 100%)`,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-space-grotesk, system-ui, sans-serif)",
              fontWeight: 600,
              fontSize: 14,
              color: text,
              letterSpacing: "-0.02em",
            }}
          >
            Proxy<span style={{ color: accent }}>-</span>Me
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 24 }}>
          {["How it works", "Setup", "For recruiters"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/ /g, "-")}`}
              style={{ fontSize: 13, color: muted2, textDecoration: "none" }}
            >
              {label}
            </a>
          ))}
          <Link href="/sign-in" style={{ fontSize: 13, color: muted2, textDecoration: "none" }}>
            Sign in
          </Link>
        </div>

        {/* Copyright */}
        <div
          style={{
            fontSize: 12,
            color: muted2,
            fontFamily: "var(--font-jetbrains-mono, monospace)",
          }}
        >
          © {new Date().getFullYear()} Proxy-Me
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    const [user] = await db.select().from(users).where(eq(users.clerkId, userId))
    redirect(user ? "/dashboard" : "/onboarding")
  }

  return (
    <>
      <style>{`
        /* Responsive: single column below 920px */
        @media (max-width: 920px) {
          .hero-grid,
          .two-col-grid {
            grid-template-columns: 1fr !important;
          }
          .steps-grid,
          .answers-grid {
            grid-template-columns: 1fr !important;
          }
          .nav-links-desktop {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .steps-grid,
          .answers-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 640px) and (max-width: 920px) {
          .steps-grid,
          .answers-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
      <div
        style={{
          background: bg,
          minHeight: "100vh",
          color: text,
          fontFamily: "var(--font-hanken-grotesk, system-ui, sans-serif)",
          position: "relative",
        }}
      >
        {/* Background radial glows */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            background: `
              radial-gradient(ellipse 80% 60% at 85% 0%, rgba(139,109,255,0.09) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 15% 5%, rgba(139,109,255,0.06) 0%, transparent 55%)
            `,
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Nav />
          <Hero />
          <HowItWorks />
          <Setup />
          <WhatItHandles />
          <ForRecruiters />
          <FinalCTA />
          <Footer />
        </div>
      </div>
    </>
  )
}
