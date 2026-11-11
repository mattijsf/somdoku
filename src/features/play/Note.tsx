import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { isFilled } from "../../lib/game"
import { n } from "../../stores/today"
import { useGameStore } from "../../stores/useGameStore"

/** The line under the keys while playing. Once solved the result says it. */
export function Note(): ReactElement {
  const { t } = useTranslation()
  const open = useGameStore(game => game.cells.filter(value => !isFilled(value)).length)
  const selected = useGameStore(game => game.selected)
  const done = useGameStore(game => game.finished)
  const started = useGameStore(game => game.started)

  let text = ""
  if (!started) {
    text = t("note.covered")
  } else if (!done) {
    if (selected === null && open === n * n) {
      text = t("note.start")
    } else {
      text = open ? t("note.open", { count: open }) : t("note.wrong")
    }
  }
  return (
    <p id="note" className="hint note" aria-live="polite">
      {text}
    </p>
  )
}
