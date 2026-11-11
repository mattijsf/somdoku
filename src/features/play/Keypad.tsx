import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { k } from "../../stores/today"
import { useGameStore } from "../../stores/useGameStore"
import { keys, type Key } from "./keys"

/** The digits, Black, the note and Clear, two rows of them. Black and the note draw themselves. */
export function Keypad(): ReactElement {
  const { t } = useTranslation()
  const put = useGameStore(game => game.put)

  const button = (key: Key): ReactElement => {
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
        className={key.kind === "digit" ? "key" : `key ${key.kind}`}
        aria-label={label}
        onClick={() => put(key.value)}
      >
        {key.kind === "digit" && key.value}
        {key.kind === "erase" && "⌫"}
      </button>
    )
  }

  return (
    <div
      id="pad"
      className="pad"
      role="group"
      aria-label={t("keys.label")}
      style={{ "--cols": Math.ceil((k + 3) / 2) }}
    >
      {keys.map(button)}
    </div>
  )
}
