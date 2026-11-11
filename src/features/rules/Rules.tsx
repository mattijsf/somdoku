import type { ReactElement } from "react"
import { Trans, useTranslation } from "react-i18next"
import { MAX_CHECKS } from "../../lib/game"
import { BLACK } from "../../lib/puzzle"
import { blacks, k } from "../../stores/today"

// The example follows the puzzle's own digits: the highest alone, the others together.
const lower = Array.from({ length: k - 1 }, (_, i) => i + 1)
const example = {
  line: [k, BLACK, ...lower, ...new Array<number>(blacks - 1).fill(BLACK)],
  sums: [k, (k * (k - 1)) / 2],
}

/** The three rules, one example, and how a game goes. */
export function Rules(): ReactElement {
  const { t } = useTranslation()
  return (
    <>
      <ol className="steps">
        <li>{t("rules.digits", { k })}</li>
        <li>{t("rules.blacks", { count: blacks })}</li>
        <li>{t("rules.sums")}</li>
      </ol>
      <div className="example">
        <div className="tiles" aria-hidden="true">
          <span className="sums">
            {example.sums.map((sum, j) => (
              <span key={j}>{sum}</span>
            ))}
          </span>
          {example.line.map((value, j) =>
            value === BLACK ? <i key={j} className="black" /> : <i key={j}>{value}</i>
          )}
        </div>
        <p className="hint">
          {t("rules.example", { k, parts: lower.join(" + "), sum: (k * (k - 1)) / 2 })}
        </p>
      </div>
      <ul className="legend">
        <li>
          <span className="swatch ring" aria-hidden="true" />
          <span>
            <Trans i18nKey="rules.note" components={{ b: <b /> }} />
          </span>
        </li>
        <li>
          <span className="swatch tick" aria-hidden="true" />
          <span>
            <Trans i18nKey="rules.check" values={{ max: MAX_CHECKS }} components={{ b: <b /> }} />
          </span>
        </li>
        <li>
          <span className="swatch calm" aria-hidden="true" />
          <span>{t("rules.noClock")}</span>
        </li>
      </ul>
    </>
  )
}
