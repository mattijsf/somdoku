import { Delete } from "lucide-react"
import type { ReactElement } from "react"
import type { Key } from "./keys"

/** What a key shows besides its name: a black swatch, or the erase icon. */
export function KeyIcon({ kind }: { kind: Exclude<Key["kind"], "digit"> }): ReactElement {
  return kind === "black" ? (
    <span className="swatch black" />
  ) : (
    <Delete className="icon" aria-hidden="true" />
  )
}
