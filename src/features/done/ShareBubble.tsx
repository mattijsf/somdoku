import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import type { Mark } from "../../lib/game"
import { n } from "../../stores/today"

/** What gets shared, drawn as the message it will be: the time, and the timeline n squares to a line. */
export function ShareBubble({ head, trail }: { head: string; trail: Mark[] }): ReactElement {
  const { t } = useTranslation()
  const count = (mark: Mark): number => trail.filter(m => m === mark).length
  const lines = Array.from({ length: Math.ceil(trail.length / n) }, (_, line) =>
    trail.slice(line * n, line * n + n)
  )
  return (
    <div
      id="bubble"
      className="bubble"
      role="img"
      aria-label={t("done.result", { head, first: count("g"), later: count("y") })}
    >
      <b>{head}</b>
      {lines.map((marks, line) => (
        <span key={line}>
          {marks.map((mark, j) => (
            <i key={j} className={mark} style={{ "--d": `${line * 90 + j * 30}ms` }} />
          ))}
        </span>
      ))}
    </div>
  )
}
