export type Shared = "shared" | "copied" | "failed"

/**
 * On a phone its own share sheet; elsewhere, or when that is not there, the score is copied.
 * Closing the share sheet is not a failure.
 */
export async function shareScore(text: string): Promise<Shared> {
  const phone = matchMedia("(pointer: coarse)").matches
  if (phone && "share" in navigator) {
    try {
      await navigator.share({ text })
      return "shared"
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return "shared"
      }
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return "copied"
  } catch {
    return "failed"
  }
}
