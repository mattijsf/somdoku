// What a game of Somdoku is besides the puzzle: which puzzle belongs to which day, what a
// check tells the player, and the message that is shared afterwards. There is no clock: like
// Woordle, the score is how many tries it took, and a game may be spread over the day.

import { at } from "./at"
import { generate, hash, rng, type Puzzle } from "./puzzle"

export const FIRST_DAY = "2026-11-11"
export const MAX_CHECKS = 6
export const EMPTY = null
/** "A digit goes here, I don't know which yet." A note; counts as not filled in. */
export const WHITE = -1
/** What a cell holds: a digit, BLACK, WHITE, or EMPTY. */
export type Value = number | typeof EMPTY
/** What one check found: for each row, whether all of it was right. */
export type Check = boolean[]

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

export const isFilled = (value: Value): boolean => value !== EMPTY && value !== WHITE

/** The places in a line that hold a digit that is there twice: a broken rule anyone can see. */
export function doubles(values: readonly Value[]): Set<number> {
  const places = new Set<number>()
  values.forEach((value, i) => {
    if (value !== EMPTY && value > 0 && values.indexOf(value) !== i) {
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

/** What a check tells the player: for each row, whether all of it is right. Not which cell is wrong. */
export function rowsRight(cells: readonly Value[], solution: readonly number[], n: number): Check {
  return Array.from({ length: n }, (_, r) => {
    for (let c = 0; c < n; c++) {
      if (cells[r * n + c] !== solution[r * n + c]) {
        return false
      }
    }
    return true
  })
}

/** One line of the picture: a square per row of the puzzle, green when that row was right. */
export const squares = (check: Check): string => check.map(right => (right ? "🟩" : "⬛")).join("")

/**
 * "Somdoku 12 3/6" with a line of squares per check, ready for WhatsApp. The same shape as a
 * Woordle score, and it gives away nothing of the solution.
 */
export function shareText({
  name,
  checks,
  solved,
  url,
}: {
  name: string
  checks: readonly Check[]
  solved: boolean
  url?: string
}): string {
  const head = `${name} ${solved ? checks.length : "X"}/${MAX_CHECKS}`
  return [head, ...checks.map(squares), ...(url ? [url] : [])].join("\n")
}
