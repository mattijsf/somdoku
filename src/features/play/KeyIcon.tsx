import type { ReactElement } from "react"
import type { Key } from "./keys"

/** What a key shows besides its name: a black swatch, or the erase icon. */
export function KeyIcon({ kind }: { kind: Exclude<Key["kind"], "digit"> }): ReactElement {
  return kind === "black" ? (
    <span className="swatch black" />
  ) : (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7z" />
      <path d="m12.5 9.5 5 5m0-5-5 5" />
    </svg>
  )
}
