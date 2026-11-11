// One puzzle a day, the same for everyone. Nothing in the address or anywhere else changes it:
// there is nothing to choose, and that is the point.
import { dailyPuzzle, dayString, puzzleNumber } from "../lib/game"

export const BRAND = "Somdoku"
export const day = dayString()
export const puzzle = dailyPuzzle(day)
export const { n, k, blacks } = puzzle // blacks: how many black cells every row and column has
export const solution = puzzle.solution.flat()
export const number = puzzleNumber(day)
export const name = `${BRAND} ${number}`
export const rowOf = (i: number): number => Math.floor(i / n)
