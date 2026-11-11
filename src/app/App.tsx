import { useEffect, type ReactElement } from "react"
import { DoneScreen } from "../features/done/DoneScreen"
import { PlayScreen } from "../features/play/PlayScreen"
import { RulesDialog } from "../features/rules/RulesDialog"
import { TopBar } from "../features/top/TopBar"
import { useClock } from "../hooks/useClock"
import { useKeyboard } from "../hooks/useKeyboard"
import { name } from "../stores/today"
import { useGameStore, viewOf } from "../stores/useGameStore"

/**
 * Both screens are on the page; the stylesheet shows what `body[data-view]` names: the puzzle
 * with its sums covered before Start, the puzzle, or the result.
 */
export function App(): ReactElement {
  const view = useGameStore(viewOf)
  useClock()
  useKeyboard()

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
        <PlayScreen />
        <DoneScreen />
      </main>
      <RulesDialog />
    </>
  )
}
