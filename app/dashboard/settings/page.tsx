import { getOrRedirectUser } from "@/app/actions/onboarding"
import SettingsForm from "./SettingsForm"

export default async function SettingsPage() {
  const user = await getOrRedirectUser()

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <SettingsForm user={{ id: user.id, slug: user.slug!, isPublic: user.isPublic ?? true }} />
    </div>
  )
}
