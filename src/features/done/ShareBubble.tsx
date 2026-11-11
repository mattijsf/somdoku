import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import type { Check } from "../../lib/game"
import { n } from "../../stores/today"

/** What gets shared, drawn as the message it will be: the head, and a line of squares per check. */
export function ShareBubble({
  head,
  checks,
}: {
  head: string
  checks: readonly Check[]
}): ReactElement {
  const { t } = useTranslation()
  const lines = checks
    .map(found => t("done.rowsRight", { right: found.filter(Boolean).length, total: n }))
    .join(", ")
  return (
    <div id="bubble" className="bubble" role="img" aria-label={t("done.result", { head, lines })}>
      <b>{head}</b>
      {checks.map((found, line) => (
        <span key={line}>
          {found.map((right, r) => (
            <i key={r} className={right ? "g" : "x"} style={{ "--d": `${line * 90 + r * 30}ms` }} />
          ))}
        </span>
      ))}
    </div>
  )
}
