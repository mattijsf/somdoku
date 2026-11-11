import { Timer } from "lucide-react"
import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { clock, marks } from "../../lib/game"
import { BRAND, n, number } from "../../stores/today"
import { useGameStore } from "../../stores/useGameStore"
import { useUiStore } from "../../stores/useUiStore"
import { Tally } from "./Tally"

/** The name, the puzzle's number, the picture beside it, and the help button. */
export function TopBar(): ReactElement {
  const { t } = useTranslation()
  const done = useGameStore(game => game.finished)
  const active = useGameStore(game => game.active)
  const filled = useGameStore(game => marks(game.trail).length)
  const openRules = useUiStore(ui => ui.openRules)
  // the time is only shown once the game is over: no clock to keep an eye on while playing
  const time = clock(active / 1000)
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
        aria-label={done ? t("solvedIn", { time }) : t("top.filled", { filled, total: n * n })}
      >
        <Tally />
        <span className="count" aria-hidden="true">
          <span data-icon="timer">
            <Timer className="icon" aria-hidden="true" />
          </span>
          <span id="count">{done ? time : ""}</span>
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
