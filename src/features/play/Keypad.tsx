import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { EMPTY } from "../../lib/game"
import { useGameStore } from "../../stores/useGameStore"
import { KeyIcon } from "./KeyIcon"
import { keys, type Key } from "./keys"

/** Digits on one row, Black and Clear below it, each with its name. */
export function Keypad(): ReactElement {
  const { t } = useTranslation()
  const current = useGameStore(game =>
    game.selected === null ? undefined : game.cells[game.selected]
  )
  const put = useGameStore(game => game.put)

  const button = (key: Key): ReactElement => {
    const on = current !== undefined && key.value !== EMPTY && current === key.value
    const label = {
      digit: t("keys.digit", { digit: key.value }),
      black: t("keys.blackCell"),
      erase: t("keys.erase"),
    }[key.kind]
    return (
      <button
        key={key.kind === "digit" ? key.value : key.kind}
        type="button"
        className={`key ${key.kind === "digit" ? "digit" : `tool ${key.kind}`}${on ? " on" : ""}`}
        aria-label={label}
        onClick={() => put(key.value)}
      >
        {key.kind === "digit" ? (
          key.value
        ) : (
          <>
            <KeyIcon kind={key.kind} />
            <span className="cap">{key.kind === "black" ? t("keys.black") : t("keys.erase")}</span>
          </>
        )}
      </button>
    )
  }

  return (
    <div id="pad" className="pad" role="group" aria-label={t("keys.label")}>
      <div className="keys digits">{keys.filter(key => key.kind === "digit").map(button)}</div>
      <div className="keys tools">{keys.filter(key => key.kind !== "digit").map(button)}</div>
    </div>
  )
}
