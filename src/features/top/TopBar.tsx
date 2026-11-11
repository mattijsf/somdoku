import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { MAX_CHECKS } from "../../lib/game"
import { BRAND, number, practice } from "../../stores/today"
import { useGameStore } from "../../stores/useGameStore"

/** The name, the puzzle's number and the checks used. */
export function TopBar(): ReactElement {
  const { t } = useTranslation()
  const used = useGameStore(game => game.checks.length)
  return (
    <header className="top">
      <a className="logo" href="./" aria-label={t("top.home")}>
        <span className="mark" aria-hidden="true">
          <i>3</i>
          <i className="b" />
          <i>1</i>
        </span>
        <b>{BRAND}</b>
      </a>
      <span id="nr" className="nr">
        {practice ? t("top.practice", { number: practice }) : `#${number}`}
      </span>
      <span id="tries" className="tries" aria-label={t("top.checks", { used, max: MAX_CHECKS })}>
        {used}/{MAX_CHECKS}
      </span>
    </header>
  )
}
