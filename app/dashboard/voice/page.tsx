import { getOrRedirectUser } from "@/app/actions/onboarding"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import VoicePicker from "@/components/dashboard/VoicePicker"

export default async function VoicePage() {
  const user = await getOrRedirectUser()

  return (
    <Box sx={{ px: { xs: 3, md: 5 }, py: 4, maxWidth: 900, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.3px" }}>
          Voice
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Pick a voice for your proxy to speak with during live calls.
        </Typography>
      </Box>
      <VoicePicker initialVoiceId={user.voiceId ?? null} />
    </Box>
  )
}
