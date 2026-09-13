# Voice feature — on hold

Paused on 2026-09-14 mid-integration. Backend + DB are shipped and live; the ElevenLabs agent config is incomplete and the in-chat Call button was never built. Sidebar link is hidden so `/dashboard/voice` isn't reachable from the UI (route still works if you go to the URL directly).

## What's done

- **DB migration applied to prod** — `users.voice_id` and `users.voice_created_at` columns exist (`db/migrations/0001_aromatic_triton.sql`, ran via `drizzle-kit migrate` against prod `DATABASE_URL`).
- **Voice selection UI** at `app/dashboard/voice/page.tsx` + `components/dashboard/VoicePicker.tsx` — user can pick an ElevenLabs voice, saved to `users.voice_id`.
- **Voice CRUD API** at `app/api/voice/route.ts` — `GET` (list voices from ElevenLabs), `PUT` (save selection), `DELETE`.
- **ElevenLabs helper** at `lib/elevenlabs.ts` — reads `ELEVENLABS_API_KEY`, calls the ElevenLabs voices API.
- **LLM webhook** at `app/api/voice/llm/[slug]/chat/completions/route.ts` — OpenAI-compatible Chat Completions endpoint that ElevenLabs' Custom LLM calls into. Slug is a **path segment** (moved from query param in commit `5007415` because ElevenLabs auto-appends `/chat/completions` and doesn't expose a query-param field). Verifies `ELEVENLABS_LLM_SECRET` via Bearer auth, loads user + profile sections, streams SSE with Claude Sonnet 4.6. Includes a voice-specific system prompt addendum (1–2 sentence replies, no markdown, speak numbers as words).
- **Env vars set on Vercel (prod)**: `ELEVENLABS_API_KEY`, `ELEVENLABS_LLM_SECRET`.
- **Committed and deployed** on `main`: `1d56a52 feat: voice added`, `5007415 refactor: move voice llm slug from query param to path segment`, `e58d837 chore: hide voice nav link while feature is on hold`.

## What's on hold

- **ElevenLabs agent setup incomplete**
  - The agent whose ID lived in `ELEVENLABS_AGENT_ID` (server-side env var) no longer exists.
  - A new agent exists in workspace "Proxy Me Dev" — ID `agent_6101ky2wbvgrfq4tz8a57rbzqexb`.
  - Its Custom LLM was configured with URL `https://proxy-me.app/api/voice/llm/abbas` (slug hardcoded), but changes were **not published** — they were discarded.
  - Primary LLM is still `Gemini 2.5 Flash` (deprecated). Needs switching to Custom LLM.
- **"Call" button in chat UI not built** — plan was to add it in `components/chat/ChatInterface.tsx` next to the send button, visible only when `voiceId` is set on the user. Would use `@elevenlabs/react` (not yet installed) and require `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` (not yet set — needs `NEXT_PUBLIC_` prefix so the browser can read it).
- **Sidebar link hidden** in `app/dashboard/DashboardLayoutClient.tsx` (commit `e58d837`). Un-hide by re-adding the nav entry:
  ```tsx
  { label: "Voice", href: "/dashboard/voice", icon: <GraphicEqIcon fontSize="small" /> },
  ```
  and its icon import (`import GraphicEqIcon from "@mui/icons-material/GraphicEq"`).

## Open questions to resolve before resuming

1. **Single-user or multi-tenant?** If multi-tenant, the LLM URL slug must be passed via ElevenLabs SDK **override** at session start (agent needs "Override LLM URL" enabled in Security settings), not hardcoded on the agent.
2. **Voice ID override.** The user's chosen `voice_id` needs to be passed via ElevenLabs override at session start. Confirm that override is enabled in agent Security settings.
3. **Domain allowlist.** Set `https://proxy-me.app` (and `http://localhost:3000` for dev) as allowed origins in the agent's Security settings before shipping — otherwise anyone with the agent ID can burn your ElevenLabs credits from any site.

## Checklist to resume

1. In ElevenLabs, either finish configuring the existing agent (`agent_6101ky2wbvgrfq4tz8a57rbzqexb`) or create a new one.
2. Switch primary LLM from Gemini 2.5 Flash to **Custom LLM** → Chat Completions, URL `https://proxy-me.app/api/voice/llm` (no slug — use override), API Key = value of `ELEVENLABS_LLM_SECRET`.
3. Enable "Override LLM URL" and "Override voice ID" in agent Security settings.
4. Set domain allowlist.
5. **Publish** the agent (unpublished changes don't apply).
6. Add `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` on Vercel with the agent ID; redeploy so the var is baked into the build.
7. Install `@elevenlabs/react` and add a Call button to `ChatInterface.tsx` — only render when `voiceId` is truthy. Wire it to start a session with:
   ```ts
   overrides: {
     agent: { prompt: { llm: { url: `/api/voice/llm/${slug}/chat/completions` } } },
     tts: { voiceId: user.voiceId },
   }
   ```
8. Pass `voiceId` from `app/[slug]/page.tsx` into `ChatInterface` as a new prop.
9. Un-hide the Voice link in the sidebar (see snippet above).
