import { useEffect } from "react"
import { dayString } from "../lib/game"
import { saveGame } from "../stores/savedGame"
import { day } from "../stores/today"
import { isPlaying, useGameStore } from "../stores/useGameStore"

/**
 * Runs the clock while the game is on screen. Putting the game away pauses it: the same pause as
 * the button, not a second kind. An installed app stays open for days; coming back to it on a
 * later day starts that day's puzzle.
 */
export function useClock(): void {
  useEffect(() => {
    const { tick, pause } = useGameStore.getState()
    tick() // a game that was under way picks the clock up again
    let beats = 0
    const timer = setInterval(() => {
      const game = useGameStore.getState()
      game.tick()
      if (isPlaying(game) && ++beats % 5 === 0) {
        saveGame(game) // so that a phone that dies takes little time with it
      }
    }, 1000)
    const onVisibility = (): void => {
      if (document.hidden) {
        pause()
      } else if (dayString() !== day) {
        location.reload()
      }
    }
    document.addEventListener("visibilitychange", onVisibility)
    addEventListener("pagehide", pause)
    return (): void => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisibility)
      removeEventListener("pagehide", pause)
    }
  }, [])
}
