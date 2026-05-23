export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    </main>
  )
}
