// The game so far. Kept on the device: there is no clock, so it can be finished later today.
// `sums` says which puzzle it was played on: when the puzzle of a day changes, as it may while
// the game is still being made, a game kept from the earlier one is dropped.
import { EMPTY, freshTrail, type Trail, type Value } from "../lib/game"
import { isRecord, kept, store } from "../utils/storage"
import { day, k, n, puzzle } from "./today"

export interface Game {
  sums: string
  cells: Value[]
  trail: Trail
  finished: boolean
}

const storeKey = `somdoku:${day}`
const sums = JSON.stringify([puzzle.rows, puzzle.cols])

export const freshGame = (): Game => ({
  sums,
  cells: new Array<Value>(n * n).fill(EMPTY),
  trail: freshTrail(n * n), // how it went: the order of filling, what was altered, the score
  finished: false,
})

const fits = (value: unknown): value is Value =>
  value === EMPTY ||
  (Number.isInteger(value) && typeof value === "number" && value >= 0 && value <= k)
const isCell = (value: unknown): value is number =>
  Number.isInteger(value) && typeof value === "number" && value >= 0 && value < n * n

/** The trail of a kept game, or null when it is not one this version wrote. */
function keptTrail(trail: unknown): Trail | null {
  if (!isRecord(trail)) {
    return null
  }
  const { order, changed, edits } = trail
  if (!Array.isArray(order) || !order.every(isCell) || typeof edits !== "number") {
    return null
  }
  if (
    !Array.isArray(changed) ||
    changed.length !== n * n ||
    !changed.every(value => typeof value === "boolean")
  ) {
    return null
  }
  return { order, changed, edits }
}

/** The game as kept on this device, or a fresh one. */
export function loadGame(): Game {
  try {
    const saved = kept(storeKey)
    if (!isRecord(saved)) {
      return freshGame()
    }
    const { cells, checks } = saved
    const trail = keptTrail(saved.trail)
    // a game kept by an earlier version of the game (with checks, or with notes in cells) is dropped too
    if (
      saved.sums === sums &&
      Array.isArray(cells) &&
      cells.length === n * n &&
      cells.every(fits) &&
      trail &&
      !checks
    ) {
      return {
        sums,
        cells,
        trail,
        finished: saved.finished === true,
      }
    }
  } catch {
    /* no storage, or something else's data: start over */
  }
  return freshGame()
}

export function saveGame({ sums: played, cells, trail, finished }: Game): void {
  const game: Game = { sums: played, cells, trail, finished }
  store(storeKey, JSON.stringify(game))
}
