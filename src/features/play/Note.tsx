import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { MAX_CHECKS, isFilled } from "../../lib/game"
import { n } from "../../stores/today"
import { unchanged, useGameStore } from "../../stores/useGameStore"

/** The line under the keys while playing. Once solved the result says it. */
export function Note(): ReactElement {
  const { t } = useTranslation()
  const open = useGameStore(game => game.cells.filter(value => !isFilled(value)).length)
  const used = useGameStore(game => game.checks.length)
  const selected = useGameStore(game => game.selected)
  const same = useGameStore(unchanged)
  const done = useGameStore(game => game.finished !== null)

  let text = ""
  if (!done) {
    if (selected === null && open === n * n) {
      text = t("note.start")
    } else if (open) {
      text = t("note.open", { count: open })
    } else if (same) {
      text = t("note.redRows")
    } else {
      text = t("note.next", { number: used + 1, max: MAX_CHECKS })
    }
  }
  return (
    <p id="note" className="hint note" aria-live="polite">
      {text}
    </p>
  )
}
