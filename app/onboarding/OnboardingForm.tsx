"use client"

import { useActionState } from "react"

type Props = {
  action: (_prev: unknown, formData: FormData) => Promise<{ error: string } | void>
}

export default function OnboardingForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-1">
          Username
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">proxy-me.app/</span>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            placeholder="your-name"
            pattern="[a-z0-9-]+"
            className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        {state?.error && (
          <p className="text-red-500 text-sm mt-1">{state.error}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-black text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {pending ? "Setting up…" : "Continue"}
      </button>
    </form>
  )
}
