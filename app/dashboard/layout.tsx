import { getOrRedirectUser } from "@/app/actions/onboarding"
import DashboardLayoutClient from "./DashboardLayoutClient"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getOrRedirectUser()
  return <DashboardLayoutClient slug={user.slug}>{children}</DashboardLayoutClient>
}
