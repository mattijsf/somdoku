import type { ReactElement } from "react"
import { Trans, useTranslation } from "react-i18next"
import { MAX_CHECKS } from "../../lib/game"
import { k } from "../../stores/today"

/** The three rules, one example, and how a game goes. */
export function Rules(): ReactElement {
  const { t } = useTranslation()
  return (
    <>
      <ol className="steps">
        <li>{t("rules.fill", { k })}</li>
        <li>{t("rules.once")}</li>
        <li>{t("rules.sums")}</li>
      </ol>
      <div className="example">
        <div className="tiles" aria-hidden="true">
          <span className="sums">
            <span>4</span>
            <span>6</span>
          </span>
          <i>4</i>
          <i className="black" />
          <i>1</i>
          <i>5</i>
          <i className="black" />
        </div>
        <p className="hint">{t("rules.example")}</p>
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
