import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { isFilled } from "../../lib/game"
import { unchanged, useGameStore } from "../../stores/useGameStore"

/** Check, once everything is filled in and something changed since the last check. */
export function Actions(): ReactElement {
  const { t } = useTranslation()
  const ready = useGameStore(
    game => game.cells.every(isFilled) && !unchanged(game) && game.finished === null
  )
  const check = useGameStore(game => game.check)
  return (
    <div className="actions">
      <button id="check" className="btn primary" type="button" disabled={!ready} onClick={check}>
        {t("play.check")}
      </button>
    </div>
  )
}
