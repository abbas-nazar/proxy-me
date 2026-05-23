import { getOrRedirectUser } from "@/app/actions/onboarding"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import ImportFlow from "./ImportFlow"

export default async function ImportPage() {
  await getOrRedirectUser()
  return (
    <Box sx={{ px: { xs: 3, md: 5 }, py: 4, maxWidth: 900, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.3px" }}>
          Import your background
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Upload a CV PDF to automatically extract your profile sections.
        </Typography>
      </Box>
      <ImportFlow />
    </Box>
  )
}
