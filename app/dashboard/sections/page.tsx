import { getOrRedirectUser } from "@/app/actions/onboarding"
import { db } from "@/lib/db"
import { profileSections } from "@/db/schema"
import { eq } from "drizzle-orm"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import SectionsList from "@/components/dashboard/SectionsList"
import UploadPdfButton from "@/components/dashboard/UploadPdfButton"

export default async function SectionsPage() {
  const user = await getOrRedirectUser()

  const sections = await db
    .select()
    .from(profileSections)
    .where(eq(profileSections.userId, user.id))
    .orderBy(profileSections.createdAt)

  return (
    <Box sx={{ px: { xs: 3, md: 5 }, py: 4, maxWidth: 900, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.3px" }}>
            Your profile
          </Typography>
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {sections.length} section{sections.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <UploadPdfButton />
      </Box>
      <SectionsList sections={sections} />
    </Box>
  )
}
