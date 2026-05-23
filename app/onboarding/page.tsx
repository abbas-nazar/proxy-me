import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import Box from "@mui/material/Box"
import OnboardingFlow from "./OnboardingFlow"

export default async function OnboardingPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [existing] = await db.select().from(users).where(eq(users.clerkId, userId))
  if (existing) redirect("/dashboard")

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3, bgcolor: "#fff" }}>
      <Box sx={{ width: "100%", maxWidth: 440 }}>
        <OnboardingFlow />
      </Box>
    </Box>
  )
}
