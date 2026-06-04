export const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? "https://proxy-me.app").replace(/\/$/, "")

export function profileUrl(slug: string) {
  return `${BASE_URL}/${slug}`
}
