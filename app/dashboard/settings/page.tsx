import { getOrRedirectUser } from "@/app/actions/onboarding"
import SettingsForm from "./SettingsForm"

export default async function SettingsPage() {
  const user = await getOrRedirectUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your digital twin.</p>
      </div>
      <SettingsForm
        user={{
          id: user.id,
          slug: user.slug,
          isPublic: user.isPublic ?? true,
          personality: user.personality ?? "",
          suggestedQuestions: (user.suggestedQuestions as string[]) ?? [],
          contactCollection: (user.contactCollection as { enabled: boolean; requireName: boolean; requireEmail: boolean }) ?? { enabled: false, requireName: false, requireEmail: false },
        }}
      />
    </div>
  )
}
