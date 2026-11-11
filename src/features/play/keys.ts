import { EMPTY, type Value } from "../../lib/game"
import { BLACK } from "../../lib/puzzle"
import { k } from "../../stores/today"

/** A key under the grid, and the same value in the row above a held cell. */
export interface Key {
  value: Value
  kind: "digit" | "black" | "erase"
}

// Digits on one row, the other keys below it.
export const keys: readonly Key[] = [
  ...Array.from({ length: k }, (_, i): Key => ({ value: i + 1, kind: "digit" })),
  { value: BLACK, kind: "black" },
  { value: EMPTY, kind: "erase" },
]
