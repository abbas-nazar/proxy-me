const API_BASE = "https://api.elevenlabs.io/v1"

function apiKey() {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) throw new Error("ELEVENLABS_API_KEY is not set")
  return key
}

export type ElevenVoice = {
  voice_id: string
  name: string
  preview_url: string | null
  labels: Record<string, string>
  description: string | null
  category: string | null
}

type RawVoice = {
  voice_id: string
  name: string
  preview_url?: string | null
  labels?: Record<string, string> | null
  description?: string | null
  category?: string | null
}

export async function listVoices(): Promise<ElevenVoice[]> {
  const res = await fetch(`${API_BASE}/voices`, {
    headers: { "xi-api-key": apiKey() },
    cache: "no-store",
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`ElevenLabs listVoices failed (${res.status}): ${text}`)
  }
  const data = (await res.json()) as { voices: RawVoice[] }
  return data.voices.map((v) => ({
    voice_id: v.voice_id,
    name: v.name,
    preview_url: v.preview_url ?? null,
    labels: v.labels ?? {},
    description: v.description ?? null,
    category: v.category ?? null,
  }))
}

export async function getVoice(voiceId: string): Promise<ElevenVoice | null> {
  const res = await fetch(`${API_BASE}/voices/${voiceId}`, {
    headers: { "xi-api-key": apiKey() },
    cache: "no-store",
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`ElevenLabs getVoice failed (${res.status}): ${text}`)
  }
  const v = (await res.json()) as RawVoice
  return {
    voice_id: v.voice_id,
    name: v.name,
    preview_url: v.preview_url ?? null,
    labels: v.labels ?? {},
    description: v.description ?? null,
    category: v.category ?? null,
  }
}
