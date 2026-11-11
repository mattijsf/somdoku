export type Shared = "shared" | "copied" | "failed"

// an iPad says it is a Mac, but a Mac has no touch screen
const isIphone = (): boolean =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1)

/**
 * As Woordle does it: on an iPhone the phone's own share sheet, which is short and familiar
 * there. Everywhere else the score is copied: on Android the browser's share sheet is a long menu
 * that gets in the way, and the score is one paste away. Closing the share sheet is not a failure.
 */
export async function shareScore(text: string): Promise<Shared> {
  if (isIphone() && "share" in navigator) {
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
