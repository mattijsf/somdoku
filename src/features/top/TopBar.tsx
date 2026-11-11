import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { MAX_CHECKS } from "../../lib/game"
import { BRAND, number } from "../../stores/today"
import { useGameStore } from "../../stores/useGameStore"
import { useUiStore } from "../../stores/useUiStore"
import { Tally } from "./Tally"

/** The name, the puzzle's number, the checks so far as a picture, and the help button. */
export function TopBar(): ReactElement {
  const { t } = useTranslation()
  const used = useGameStore(game => game.checks.length)
  const openRules = useUiStore(ui => ui.openRules)
  return (
    <header className="top">
      <a className="logo" href="./" aria-label={t("top.home")}>
        <span className="mark" aria-hidden="true">
          <i>4</i>
          <i className="b" />
          <i className="b" />
          <i>1</i>
        </span>
        <b>{BRAND}</b>
      </a>
      <span id="nr" className="nr">
        #{number}
      </span>
      <span
        id="tries"
        className="tries"
        role="img"
        aria-label={t("top.checks", { used, max: MAX_CHECKS })}
      >
        <Tally />
        <span id="count" className="count" aria-hidden="true">
          {used}/{MAX_CHECKS}
        </span>
      </span>
      <button
        id="help"
        className="round"
        type="button"
        aria-label={t("top.help")}
        onClick={openRules}
      />
    </header>
  )
}
