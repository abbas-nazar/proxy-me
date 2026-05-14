import { getOrRedirectUser } from "@/app/actions/onboarding"
import CVUploader from "@/components/onboarding/CVUploader"
import ManualInput from "@/components/onboarding/ManualInput"

export default async function ImportPage() {
  await getOrRedirectUser()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Import your background</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a CV/LinkedIn PDF or paste your info manually. Existing sections will be added to, not replaced.
        </p>
      </div>
      <div className="space-y-6">
        <CVUploader />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400">
            <span className="bg-white px-2">or</span>
          </div>
        </div>
        <ManualInput />
      </div>
    </div>
  )
}
