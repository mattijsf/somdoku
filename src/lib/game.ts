// What a game of Somdoku is besides the puzzle: which puzzle belongs to which day, how the score
// is kept and the message that is shared afterwards. There is no clock and no button to check
// with: every step can be worked out and the sums can be added up by hand, so the game is simply
// over when the grid is right. The score is the number of changes: what had to be taken back.

import { at } from "./at"
import { generate, hash, rng, type Puzzle } from "./puzzle"

export const FIRST_DAY = "2026-11-11"
export const EMPTY = null
/** What a cell holds: a digit, BLACK, or EMPTY. */
export type Value = number | typeof EMPTY
/** How a cell went in the shared picture: 'g' right away, 'y' altered later. */
export type Mark = "g" | "y"
export interface Trail {
  order: number[]
  changed: boolean[]
  edits: number
}

const pad = (number: number): string => String(number).padStart(2, "0")

/** The day on the player's own clock, as 2026-11-11. */
export function dayString(date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const utc = (day: string): number => {
  const parts = day.split("-").map(Number)
  return Date.UTC(at(parts, 0), at(parts, 1) - 1, at(parts, 2))
}

/** Puzzle 1 is the one of FIRST_DAY. */
export const puzzleNumber = (day: string): number =>
  Math.round((utc(day) - utc(FIRST_DAY)) / 86400000) + 1

/**
 * How hard a day's puzzle is: the number of rounds of reasoning, row by row and column by column,
 * that it takes to finish. 3 is light, 5 (or more) is stiff. It is drawn from the date, so it
 * differs from day to day without a pattern and is still the same for everyone.
 */
export const LEVELS: readonly number[] = [3, 4, 5]
export const levelOf = (day: string): number =>
  at(LEVELS, Math.floor(rng(hash(`niveau ${day}`))() * LEVELS.length))

/**
 * Everyone gets the same puzzle on the same day: always 5 by 5 with the digits 1 to 4, so one
 * black cell in every row and column. Only how hard it is varies. The seed still says
 * "sommetje", the game's first name.
 */
export function dailyPuzzle(day: string): Puzzle {
  const level = levelOf(day)
  const hardest = level === LEVELS.at(-1)
  return generate(hash(`sommetje ${day}`), {
    n: 5,
    k: 4,
    minPasses: level,
    maxPasses: hardest ? 99 : level,
  })
}

export const isFilled = (value: Value): value is number => value !== EMPTY

/** The places in a line that hold a digit that is there twice: a broken rule anyone can see. */
export function doubles(values: readonly Value[]): Set<number> {
  const places = new Set<number>()
  values.forEach((value, i) => {
    if (isFilled(value) && value > 0 && values.indexOf(value) !== i) {
      places.add(i).add(values.indexOf(value))
    }
  })
  return places
}

/** The black cells in a line that has more of them than the rules allow: also plain to see. */
export function spare(values: readonly Value[], blacks: number): Set<number> {
  const places = values.flatMap((value, i) => (value === 0 ? [i] : []))
  return new Set(places.length > blacks ? places : [])
}

/** The grid is right: every cell holds what the solution holds. */
export const solved = (cells: readonly Value[], solution: readonly number[]): boolean =>
  cells.every((value, i) => value === solution[i])

/**
 * How a game went, kept as it is played. `order`: the cells in the order they were first filled.
 * `changed`: cells that were altered after they held a digit or a black cell. `edits`: the score.
 */
export const freshTrail = (cells: number): Trail => ({
  order: [],
  changed: new Array<boolean>(cells).fill(false),
  edits: 0,
})

/**
 * What putting `to` in a cell that held `from` does to the score. Filling an empty cell is free
 * and puts the cell on the timeline. Altering a digit or a black cell, also by wiping it, is one
 * change: the sums can be checked by hand before a cell is filled, so having to take something
 * back is what counts.
 */
export function noteMove(trail: Trail, cell: number, from: Value, to: Value): void {
  if (to === from) {
    return
  }
  if (isFilled(from)) {
    trail.edits += 1
    trail.changed[cell] = true
  } else if (!trail.order.includes(cell)) {
    trail.order.push(cell)
  }
}

/**
 * The timeline: for every cell, in the order they were filled, how it went. 'g' right away,
 * 'y' altered later. It says nothing about where a cell is, so it gives away nothing of the
 * solution.
 */
export const marks = (trail: Trail): Mark[] =>
  trail.order.map(cell => (trail.changed[cell] ? "y" : "g"))

const SQUARE: Record<Mark, string> = { g: "🟩", y: "🟨" }

/** "Somdoku 12 ✏️3" with the timeline under it, n squares to a line, ready for WhatsApp. */
export function shareText({
  name,
  trail,
  n,
  url,
}: {
  name: string
  trail: Trail
  n: number
  url?: string
}): string {
  const all = marks(trail).map(mark => SQUARE[mark])
  const lines: string[] = []
  for (let i = 0; i < all.length; i += n) {
    lines.push(all.slice(i, i + n).join(""))
  }
  return [`${name} ✏️${trail.edits}`, ...lines, ...(url ? [url] : [])].join("\n")
}
