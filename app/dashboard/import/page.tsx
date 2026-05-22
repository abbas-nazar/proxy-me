import { getOrRedirectUser } from "@/app/actions/onboarding"
import ImportFlow from "./ImportFlow"

export default async function ImportPage() {
  await getOrRedirectUser()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Import your background</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a CV PDF or paste your info. Review what Claude extracts before saving.
        </p>
      </div>
      <ImportFlow />
    </div>
  )
}
