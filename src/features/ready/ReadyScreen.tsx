import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { BRAND, number } from "../../stores/today"
import { useGameStore } from "../../stores/useGameStore"

/**
 * Before the game: the name, the day and one button. The puzzle is not shown yet: looking at it
 * is playing, and playing is on the clock. A paused game comes back here, with Continue.
 */
export function ReadyScreen(): ReactElement {
  const { t } = useTranslation()
  const started = useGameStore(game => game.started)
  const start = useGameStore(game => game.start)
  const today = new Date().toLocaleDateString(t("dateLocale"), {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
  return (
    <section id="ready" className="ready">
      <div className="hero" aria-hidden="true">
        <i>4</i>
        <i className="b" />
        <i className="b" />
        <i>1</i>
      </div>
      <h1>
        {BRAND} <span id="ready-nr">#{number}</span>
      </h1>
      <p id="ready-day" className="lede">
        {today}
      </p>
      <button id="start" className="btn primary" type="button" onClick={start}>
        {started ? t("ready.resume") : t("ready.start")}
      </button>
      <p id="ready-hint" className="hint">
        {started ? t("ready.paused") : t("ready.clock")}
      </p>
    </section>
  )
}
