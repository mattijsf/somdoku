import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { squares } from "../../lib/game"
import { useGameStore } from "../../stores/useGameStore"

/** The checks so far, a line of squares each, as they will be shared. */
export function History(): ReactElement {
  const { t } = useTranslation()
  const checks = useGameStore(game => game.checks)
  return (
    <pre id="history" className="history" aria-label={t("play.history")}>
      {checks.map(squares).join("\n")}
    </pre>
  )
}
