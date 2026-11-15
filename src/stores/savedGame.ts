// The game so far. Kept on the device, so it can be put away and finished later today: only the
// time it is on screen counts. `sums` says which puzzle it was played on: when the puzzle of a
// day changes, as it may while the game is still being made, a game kept from the earlier one
// is dropped.
import { EMPTY, freshTrail, type Trail, type Value } from "../lib/game"
import { isRecord, kept, store } from "../utils/storage"
import { day, k, n, puzzle } from "./today"

export interface Game {
  sums: string
  cells: Value[]
  trail: Trail
  started: boolean
  paused: boolean
  active: number
  finished: boolean
}

const storeKey = (someDay: string): string => `somdoku:${someDay}`
const sums = JSON.stringify([puzzle.rows, puzzle.cols])

export const freshGame = (): Game => ({
  sums,
  cells: new Array<Value>(n * n).fill(EMPTY),
  trail: freshTrail(n * n), // how it went: the order of filling and what was altered later
  started: false, // the puzzle stays out of sight until Start: looking at it is playing
  paused: false, // out of sight again, with the clock stopped, until Continue
  active: 0, // ms played so far, the score
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

/** Today's game as kept on this device, or a fresh one. */
export function loadGame(): Game {
  try {
    const saved = kept(storeKey(day))
    if (!isRecord(saved)) {
      return freshGame()
    }
    const { cells, active, checks } = saved
    const trail = keptTrail(saved.trail)
    // a game kept by an earlier version of the game (with checks, notes in cells, or no clock) is dropped too
    if (
      saved.sums === sums &&
      Array.isArray(cells) &&
      cells.length === n * n &&
      cells.every(fits) &&
      trail &&
      !checks &&
      typeof active === "number"
    ) {
      return {
        sums,
        cells,
        trail,
        active,
        started: saved.started === true,
        paused: saved.paused === true,
        finished: saved.finished === true,
      }
    }
  } catch {
    /* no storage, or something else's data: start over */
  }
  return freshGame()
}

export function saveGame({
  sums: played,
  cells,
  trail,
  started,
  paused,
  active,
  finished,
}: Game): void {
  const game: Game = { sums: played, cells, trail, started, paused, active, finished }
  store(storeKey(day), JSON.stringify(game))
}

/**
 * Whether the puzzle of an earlier day was solved on this device. The games of earlier days are
 * still kept, each under its own day, so the streak needs nothing of its own to be stored.
 */
export function solvedBefore(someDay: string): boolean {
  try {
    const game = kept(storeKey(someDay))
    return isRecord(game) && game.finished === true
  } catch {
    return false
  }
}
