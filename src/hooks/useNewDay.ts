import { useEffect } from "react"
import { dayString } from "../lib/game"
import { day } from "../stores/today"

/** An installed app stays open for days. Coming back to it on a later day starts that day's puzzle. */
export function useNewDay(): void {
  useEffect(() => {
    const onVisibility = (): void => {
      if (!document.hidden && dayString() !== day) {
        location.reload()
      }
    }
    document.addEventListener("visibilitychange", onVisibility)
    return (): void => document.removeEventListener("visibilitychange", onVisibility)
  }, [])
}
