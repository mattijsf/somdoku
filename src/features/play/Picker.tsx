import type { ReactElement } from "react"
import { createPortal } from "react-dom"
import { EMPTY } from "../../lib/game"
import { useGameStore } from "../../stores/useGameStore"
import { KeyIcon } from "./KeyIcon"
import { keys } from "./keys"
import { registerPicker } from "./usePickerGestures"
import { usePickerStore } from "./usePickerStore"

/** The row of values above a held cell. It sits on the body: fixed, above everything. */
export function Picker(): ReactElement {
  const { open, left, top, lit } = usePickerStore()
  const current = useGameStore(game => (open === null ? undefined : game.cells[open]))
  return createPortal(
    // a gesture for the finger; the keys under the grid do the same for everyone
    <div
      ref={registerPicker}
      className="picker"
      hidden={open === null}
      aria-hidden="true"
      style={{ left: `${left}px`, top: `${top}px` }}
    >
      {keys.map((key, j) => (
        <span
          key={j}
          className={[
            "pick",
            key.kind,
            key.value !== EMPTY && current === key.value && "on",
            j === lit && "hot",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {key.kind === "digit" ? key.value : <KeyIcon kind={key.kind} />}
        </span>
      ))}
    </div>,
    document.body
  )
}
