import { useEffect, type ReactElement } from "react"
import { DoneScreen } from "../features/done/DoneScreen"
import { PlayScreen } from "../features/play/PlayScreen"
import { RulesDialog } from "../features/rules/RulesDialog"
import { TopBar } from "../features/top/TopBar"
import { useKeyboard } from "../hooks/useKeyboard"
import { useNewDay } from "../hooks/useNewDay"
import { usePuzzleName } from "../hooks/usePuzzleName"
import { useGameStore, viewOf } from "../stores/useGameStore"

/**
 * Both screens are on the page; the stylesheet shows the one `body[data-view]` names: the
 * puzzle, or the result.
 */
export function App(): ReactElement {
  const view = useGameStore(viewOf)
  const name = usePuzzleName()
  useKeyboard()
  useNewDay()

  useEffect(() => {
    document.body.dataset.view = view
  }, [view])
  useEffect(() => {
    document.title = name
  }, [name])

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
