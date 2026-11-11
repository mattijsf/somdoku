import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { EMPTY } from "../../lib/game"
import { rowOf } from "../../stores/today"
import { locked, useGameStore } from "../../stores/useGameStore"
import { KeyIcon } from "./KeyIcon"
import { keys, type Key } from "./keys"

/** Digits on one row, Black, the note and Clear below it, each with its name. */
export function Keypad(): ReactElement {
  const { t } = useTranslation()
  const selected = useGameStore(game => game.selected)
  // a row that is right can't be changed
  const editable = useGameStore(
    game => game.selected !== null && !locked(game, rowOf(game.selected))
  )
  const current = useGameStore(game =>
    game.selected === null ? undefined : game.cells[game.selected]
  )
  const put = useGameStore(game => game.put)

  const button = (key: Key): ReactElement => {
    const on = editable && current !== undefined && key.value !== EMPTY && current === key.value
    const label = {
      digit: t("keys.digit", { digit: key.value }),
      black: t("keys.blackCell"),
      white: t("keys.note"),
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
            <span className="cap">
              {
                { black: t("keys.black"), white: t("keys.noteCap"), erase: t("keys.erase") }[
                  key.kind
                ]
              }
            </span>
          </>
        )}
      </button>
    )
  }

  return (
    <div
      id="pad"
      className={selected !== null && !editable ? "pad idle" : "pad"}
      role="group"
      aria-label={t("keys.label")}
    >
      <div className="keys digits">{keys.filter(key => key.kind === "digit").map(button)}</div>
      <div className="keys tools">{keys.filter(key => key.kind !== "digit").map(button)}</div>
    </div>
  )
}
