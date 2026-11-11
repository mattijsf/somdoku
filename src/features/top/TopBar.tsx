import { Pencil } from "lucide-react"
import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { BRAND, number } from "../../stores/today"
import { useGameStore } from "../../stores/useGameStore"
import { useUiStore } from "../../stores/useUiStore"
import { Tally } from "./Tally"

/** The name, the puzzle's number, the picture beside it with the score, and the help button. */
export function TopBar(): ReactElement {
  const { t } = useTranslation()
  const edits = useGameStore(game => game.trail.edits)
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
      <span id="tries" className="tries" role="img" aria-label={t("edits", { count: edits })}>
        <Tally />
        <span className="count" aria-hidden="true">
          <span data-icon="pencil">
            <Pencil className="icon" aria-hidden="true" />
          </span>
          <span id="count">{edits}</span>
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
