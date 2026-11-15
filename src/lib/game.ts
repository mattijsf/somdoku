// What a game of Somdoku is besides the puzzle: which puzzle belongs to which day, how the score
// is kept and the message that is shared afterwards. There is no button to check with: every
// step can be worked out and the sums can be added up by hand, so the game is simply over when
// the grid is right. The score is the time spent playing, the one thing that always differs
// between players of a puzzle with a single answer. What had to be taken back shows in the picture.

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

/** The day before, as 2026-11-10. */
export const dayBefore = (day: string): string =>
  new Date(utc(day) - 86400000).toISOString().slice(0, 10)

/**
 * The streak: how many days in a row the puzzle was solved, up to and including `day`.
 * `solvedOn(day)` says whether a day's puzzle was solved. A day that is not solved yet does not
 * break the streak: it then runs up to yesterday, and today can still add to it.
 */
export function streak(day: string, solvedOn: (day: string) => boolean): number {
  let count = 0
  for (let d = solvedOn(day) ? day : dayBefore(day); solvedOn(d); d = dayBefore(d)) {
    count += 1
  }
  return count
}

/**
 * How hard a day's puzzle is: the number of rounds of reasoning, row by row and column by column,
 * that it takes to finish. 3 is light, 5 (or more) is stiff. It is drawn from the date, so it
 * differs from day to day without a pattern and is still the same for everyone. The seed text is
 * Dutch ("niveau": level) and stays so: changing it changes the level of every day.
 */
export const LEVELS: readonly number[] = [3, 4, 5]
export const levelOf = (day: string): number =>
  at(LEVELS, Math.floor(rng(hash(`niveau ${day}`))() * LEVELS.length))

/**
 * Everyone gets the same puzzle on the same day: always 5 by 5 with the digits 1 to 4, so one
 * black cell in every row and column. Only how hard it is varies. The seed still says
 * "sommetje", the game's first name: changing it changes every day's puzzle.
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

/** The grid is right: every cell holds what the solution holds. */
export const solved = (cells: readonly Value[], solution: readonly number[]): boolean =>
  cells.every((value, i) => value === solution[i])

/** 2:47, or 1:02:47 for the very patient. */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const two = (number: number): string => String(number).padStart(2, "0")
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h ? `${h}:${two(m)}:${two(s % 60)}` : `${m}:${two(s % 60)}`
}

/**
 * How a game went, kept as it is played. `order`: the cells in the order they were first filled.
 * `changed`: cells that were altered later, after they held a digit or a black cell. `edits`: how
 * often that happened.
 */
export const freshTrail = (cells: number): Trail => ({
  order: [],
  changed: new Array<boolean>(cells).fill(false),
  edits: 0,
})

/**
 * Keeps track of a move: `to` put in a cell that held `from`. Filling an empty cell puts the cell
 * on the timeline. Altering a digit or a black cell, also by wiping it, is a change: something
 * was taken back. Unless it is a `slip`: put right at once, before any other cell was touched.
 * That is a finger that missed, not a change of mind.
 */
export function noteMove(trail: Trail, cell: number, from: Value, to: Value, slip = false): void {
  if (to === from) {
    return
  }
  if (!isFilled(from)) {
    if (!trail.order.includes(cell)) {
      trail.order.push(cell)
    }
  } else if (!slip) {
    trail.edits += 1
    trail.changed[cell] = true
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

/** "Somdoku 12 · 3:42" with the timeline under it, n squares to a line, and no link. */
export function shareText({
  name,
  seconds,
  trail,
  n,
}: {
  name: string
  seconds: number
  trail: Trail
  n: number
}): string {
  const all = marks(trail).map(mark => SQUARE[mark])
  const lines: string[] = []
  for (let i = 0; i < all.length; i += n) {
    lines.push(all.slice(i, i + n).join(""))
  }
  return [`${name} · ${clock(seconds)}`, ...lines].join("\n")
}
