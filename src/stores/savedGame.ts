// The game so far. Kept on the device: there is no clock, so it can be finished later today.
// `sums` says which puzzle it was played on: when the puzzle of a day changes, as it may while
// the game is still being made, a game kept from the earlier one is dropped.
import { EMPTY, WHITE, type Check, type Value } from "../lib/game"
import { isRecord, kept, store } from "../utils/storage"
import { day, k, n, puzzle } from "./today"

export interface Game {
  sums: string
  cells: Value[]
  checks: Check[]
  stale: boolean[]
  finished: "won" | "lost" | null
}

const storeKey = `somdoku:${day}`
const sums = JSON.stringify([puzzle.rows, puzzle.cols])

export const freshGame = (): Game => ({
  sums,
  cells: new Array<Value>(n * n).fill(EMPTY),
  checks: [], // per check: for each row, whether it was right
  stale: new Array<boolean>(n).fill(false), // rows changed since the last check
  finished: null, // 'won' or 'lost'
})

const fits = (value: unknown): value is Value =>
  value === EMPTY ||
  value === WHITE ||
  (Number.isInteger(value) && typeof value === "number" && value >= 0 && value <= k)
const isFlags = (value: unknown, length: number): value is boolean[] =>
  Array.isArray(value) && value.length === length && value.every(flag => typeof flag === "boolean")
const isCheck = (value: unknown): value is Check => isFlags(value, n)

/** The game as kept on this device, or a fresh one. */
export function loadGame(): Game {
  try {
    const saved = kept(storeKey)
    if (!isRecord(saved)) {
      return freshGame()
    }
    const { cells, checks, stale, finished } = saved
    if (
      saved.sums === sums &&
      Array.isArray(cells) &&
      cells.length === n * n &&
      cells.every(fits) &&
      Array.isArray(checks) &&
      checks.every(isCheck)
    ) {
      return {
        sums,
        cells,
        checks,
        stale: isFlags(stale, n) ? stale : freshGame().stale,
        finished: finished === "won" || finished === "lost" ? finished : null,
      }
    }
  } catch {
    /* no storage, or something else's data: start over */
  }
  return freshGame()
}

export function saveGame({ sums: played, cells, checks, stale, finished }: Game): void {
  const game: Game = { sums: played, cells, checks, stale, finished }
  store(storeKey, JSON.stringify(game))
}
