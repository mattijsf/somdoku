// Which puzzle: today's, the same for everyone, or a practice puzzle (?oefen=3, optionally
// &maat=4 or 6).
import { dailyPuzzle, dayString, practicePuzzle, puzzleNumber } from "../lib/game"

export const BRAND = "Somdoku"
const query = new URLSearchParams(location.search)
/** The number of the practice puzzle, or null for today's. */
export const practice = query.has("oefen")
  ? Math.max(1, parseInt(query.get("oefen") ?? "", 10) || 1)
  : null
export const size = [4, 5, 6].includes(Number(query.get("maat"))) ? Number(query.get("maat")) : 5
export const day = dayString()
export const puzzle = practice ? practicePuzzle(practice, size) : dailyPuzzle(day)
export const { n, k } = puzzle
export const solution = puzzle.solution.flat()
export const number = puzzleNumber(day)
export const name = `${BRAND} ${number}`
export const rowOf = (i: number): number => Math.floor(i / n)
