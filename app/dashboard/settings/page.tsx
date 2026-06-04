import { getOrRedirectUser } from "@/app/actions/onboarding"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import SettingsForm from "./SettingsForm"

export default async function SettingsPage() {
  const user = await getOrRedirectUser()

  return (
    <Box sx={{ px: { xs: 3, md: 5 }, py: 4, maxWidth: 900, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.3px" }}>
          Settings
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Configure your proxy.
        </Typography>
      </Box>
      <SettingsForm
        user={{
          id: user.id,
          slug: user.slug,
          displayName: user.displayName ?? "",
          headline: user.headline ?? "",
          isPublic: user.isPublic ?? true,
          personality: user.personality ?? "",
          suggestedQuestions: (user.suggestedQuestions as string[]) ?? [],
          contactCollection: (user.contactCollection as { enabled: boolean; requireName: boolean; requireEmail: boolean }) ?? {
            enabled: false,
            requireName: false,
            requireEmail: false,
          },
        }}
      />
    </Box>
  )
}
