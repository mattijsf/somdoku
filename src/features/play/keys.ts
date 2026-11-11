import { EMPTY, WHITE, type Value } from "../../lib/game"
import { BLACK } from "../../lib/puzzle"
import { k } from "../../stores/today"

/** A key under the grid. */
export interface Key {
  value: Value
  kind: "digit" | "black" | "white" | "erase"
}

// Digits on one row, the three other keys below it.
export const keys: readonly Key[] = [
  ...Array.from({ length: k }, (_, i): Key => ({ value: i + 1, kind: "digit" })),
  { value: BLACK, kind: "black" },
  { value: WHITE, kind: "white" },
  { value: EMPTY, kind: "erase" },
]
