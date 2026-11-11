import type { ReactElement } from "react"
import { Trans, useTranslation } from "react-i18next"
import { MAX_CHECKS } from "../../lib/game"
import { k } from "../../stores/today"

/** The three rules, one example, and how a game goes. */
export function Rules(): ReactElement {
  const { t } = useTranslation()
  return (
    <>
      <ul>
        <li>{t("rules.fill", { k })}</li>
        <li>{t("rules.once")}</li>
        <li>{t("rules.sums")}</li>
      </ul>
      <div className="example" aria-hidden="true">
        <span className="clue row">
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
      <ul>
        <li>
          <Trans i18nKey="rules.check" values={{ max: MAX_CHECKS }} components={{ b: <b /> }} />
        </li>
        <li>{t("rules.note")}</li>
        <li>{t("rules.noClock")}</li>
      </ul>
    </>
  )
}
