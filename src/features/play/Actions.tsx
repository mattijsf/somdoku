import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { isFilled } from "../../lib/game"
import { unchanged, useGameStore } from "../../stores/useGameStore"
import { useUiStore } from "../../stores/useUiStore"

/** Check, once everything is filled in and something changed since the last check, and the rules. */
export function Actions(): ReactElement {
  const { t } = useTranslation()
  const ready = useGameStore(
    game => game.cells.every(isFilled) && !unchanged(game) && game.finished === null
  )
  const check = useGameStore(game => game.check)
  const openRules = useUiStore(ui => ui.openRules)
  return (
    <div className="actions">
      <button id="check" className="btn primary" type="button" disabled={!ready} onClick={check}>
        {t("play.check")}
      </button>
      <button id="help" className="btn" type="button" onClick={openRules}>
        {t("top.help")}
      </button>
    </div>
  )
}
