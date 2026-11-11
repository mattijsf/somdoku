import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { MAX_CHECKS, isFilled } from "../../lib/game"
import { unchanged, useGameStore } from "../../stores/useGameStore"

/** The line under the keys while playing. */
export function Note(): ReactElement {
  const { t } = useTranslation()
  const open = useGameStore(game => game.cells.filter(value => !isFilled(value)).length)
  const used = useGameStore(game => game.checks.length)
  const same = useGameStore(unchanged)

  let text = t("note.next", { number: used + 1, max: MAX_CHECKS })
  if (open) {
    text = t("note.open", { count: open })
  } else if (same) {
    text = t("note.redRows")
  }
  return (
    <p id="note" className="hint note" aria-live="polite">
      {text}
    </p>
  )
}
