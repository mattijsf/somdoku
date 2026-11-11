import type { ReactElement } from "react"
import { useUiStore } from "../stores/useUiStore"

/** A line that comes up from the bottom for a moment. */
export function Toast(): ReactElement {
  const text = useUiStore(ui => ui.toast)
  const up = useUiStore(ui => ui.toastUp)
  return (
    <div id="toast" className={up ? "toast up" : "toast"} role="status">
      {text}
    </div>
  )
}
