@AGENTS.md

# proxy-me — The AI agent representing you

A personal AI agent representing you: set up your profile once, share a link, and let visitors chat with an AI that knows everything about you.

## Tech stack

- **Framework**: Next.js 16 (App Router)
- **Auth + slugs**: Clerk
- **AI**: Vercel AI SDK + `claude-sonnet-4-6` via Anthropic SDK
- **Database**: Neon (Postgres)
- **ORM**: Drizzle
- **File parsing**: `pdf-parse` (server-side only)
- **Deployment**: Vercel

## Folder structure

```
/app
  /[slug]              ← public chat page (no auth)
  /dashboard
    /sections          ← "what we know" list + edit
  /onboarding          ← import flow (auth required)
  /settings            ← visibility, link sharing
  /api
    /chat/route.ts     ← streaming chat (Vercel AI SDK)
    /ingest/route.ts   ← parse + embed + save profile data
    /profile/route.ts  ← CRUD for profile sections

/components
  /chat                ← ChatInterface, MessageBubble
  /dashboard           ← SectionCard, SectionEditor, LastUpdatedBadge
  /onboarding          ← CVUploader, ManualInput

/lib
  db.ts                ← Neon DB client
  claude.ts            ← Anthropic SDK client
  parser.ts            ← PDF → structured data via Claude
  systemPrompt.ts      ← builds agent system prompt from DB rows
```

## Key patterns

### Ingest (`/api/ingest`)
1. Accept PDF → extract text with `pdf-parse` (server only)
2. Send to Claude with structured extraction prompt → returns `{ bio, experience[], education[], skills[], projects[] }`
3. Save each top-level key as a separate `profile_sections` row

### System prompt (`/lib/systemPrompt.ts`)
Built dynamically at chat time from all `profile_sections` rows for the user. Format:
```
You are a professional AI representative for [display_name].
=== BIO === / === EXPERIENCE === / === SKILLS === / === PROJECTS ===
[content per section]
Guidelines: answer accurately, score JD matches 1-10, never fabricate, say "I don't know" when uncertain.
```

### JD matching
Visitor pastes a job description → load all `profile_sections` for the user → inject into Claude context with the JD → Claude scores match with specific strengths/gaps.

### Public page `/[slug]`
- No auth. If `is_public = false`, show "This profile is private."
- "Last updated" = most recent `updated_at` across all sections
- Stream chat with Vercel AI SDK `useChat`

## Environment variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
ANTHROPIC_API_KEY=
```

## Build order

1. Next.js + Clerk + Neon setup, run schema migrations
2. Ingest pipeline — `/api/ingest`, PDF parsing, Claude extraction, DB save
3. Dashboard — `/dashboard/sections`, section cards, edit/delete
4. Onboarding — CV upload + manual input forms
5. Public chat — `/[slug]`, `/api/chat` streaming, system prompt builder
6. JD matching — full profile context + match scoring in Claude
7. Settings — public/private toggle, shareable link
8. Polish — loading states, error handling, mobile
