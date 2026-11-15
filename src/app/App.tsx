import { useEffect, type ReactElement } from "react"
import { Toast } from "../components/Toast"
import { DoneScreen } from "../features/done/DoneScreen"
import { PlayScreen } from "../features/play/PlayScreen"
import { ReadyScreen } from "../features/ready/ReadyScreen"
import { RulesDialog } from "../features/rules/RulesDialog"
import { TopBar } from "../features/top/TopBar"
import { useClock } from "../hooks/useClock"
import { useKeyboard } from "../hooks/useKeyboard"
import { name } from "../stores/today"
import { isLive, useGameStore, viewOf } from "../stores/useGameStore"

/** Clicks outside the cells and keys let go of the chosen cell. */
function useLetGoOutside(): void {
  useEffect(() => {
    const onClick = (event: MouseEvent): void => {
      const game = useGameStore.getState()
      if (game.selected === null || !isLive(game)) {
        return
      }
      if (
        event.target instanceof Element &&
        event.target.closest(".cell, #pad, .picker, dialog, .top")
      ) {
        return
      }
      game.select(null)
    }
    document.addEventListener("click", onClick)
    return (): void => document.removeEventListener("click", onClick)
  }, [])
}

/**
 * All three screens are on the page; the stylesheet shows the one `body[data-view]` names: the
 * start (or pause) screen, the puzzle, or the result.
 */
export function App(): ReactElement {
  const view = useGameStore(viewOf)
  useClock()
  useKeyboard()
  useLetGoOutside()

  useEffect(() => {
    document.body.dataset.view = view
  }, [view])
  useEffect(() => {
    document.title = name
  }, [])

  return (
    <>
      <TopBar />
      <main className="wrap">
        <ReadyScreen />
        <PlayScreen />
        <DoneScreen />
      </main>
      <Toast />
      <RulesDialog />
    </>
  )
}
