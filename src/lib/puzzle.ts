// Japanse sommen: the rules, a generator, and a solver that only reasons the way a person does,
// one row or column at a time. A puzzle that this solver finishes has one solution and needs no guessing.
//
// The rules are the puzzle booklet's: a grid of n by n, the digits 1 to k. Every row and every
// column holds each digit exactly once; the cells that are left, n - k in every row and column,
// are black. Beside each row and above each column are the sums of the groups of digits that
// touch, in order.

import { at } from "./at"

export const BLACK = 0

/** One row or column: a digit 1..k, or BLACK. */
export type Line = number[]
export type Grid = Line[]
/** The sums beside a line, one per group of digits that touch. */
export type Clue = number[]
export interface Clues {
  rows: Clue[]
  cols: Clue[]
}
export interface Puzzle extends Clues {
  n: number
  k: number
  blacks: number
  solution: Grid
  passes: number
  attempt: number
}
export interface Options {
  n?: number
  k?: number
  minPasses?: number
  maxPasses?: number
}
type Random = () => number

/** Random numbers that are the same on every device for the same seed (mulberry32). */
export function rng(seed: number): Random {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A number for a piece of text (FNV-1a), to seed rng() with a date. */
export function hash(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** The sums beside a line: one per group of digits that touch, in order. */
export function clueOf(line: readonly number[]): Clue {
  const sums: Clue = []
  let run = 0
  let open = false
  for (const value of line) {
    if (value > 0) {
      run += value
      open = true
    } else if (open) {
      sums.push(run)
      run = 0
      open = false
    }
  }
  if (open) {
    sums.push(run)
  }
  return sums
}

export const column = (grid: Grid, c: number): Line => grid.map(row => at(row, c))

export function cluesOf(grid: Grid): Clues {
  return {
    rows: grid.map(row => clueOf(row)),
    cols: at(grid, 0).map((_, c) => clueOf(column(grid, c))),
  }
}

const lineCache = new Map<string, Map<string, Line[]>>()

/** Every way to fill a line of n cells with each of the digits 1..k once and black cells, by clue. */
function linesByClue(n: number, k: number): Map<string, Line[]> {
  const id = `${n}/${k}`
  const cached = lineCache.get(id)
  if (cached) {
    return cached
  }
  const byClue = new Map<string, Line[]>()
  const line: Line = new Array<number>(n).fill(BLACK)
  const every = ((1 << (k + 1)) - 1) & ~1 // all digits used
  const walk = (i: number, used: number): void => {
    if (i === n) {
      if (used !== every) {
        return
      }
      const key = clueOf(line).join(",")
      const fits = byClue.get(key)
      if (fits) {
        fits.push(line.slice())
      } else {
        byClue.set(key, [line.slice()])
      }
      return
    }
    line[i] = BLACK
    walk(i + 1, used)
    for (let d = 1; d <= k; d++) {
      if (used & (1 << d)) {
        continue
      }
      line[i] = d
      walk(i + 1, used | (1 << d))
    }
    line[i] = BLACK
  }
  walk(0, 0)
  lineCache.set(id, byClue)
  return byClue
}

/**
 * Solves from the clues alone, line by line: a cell keeps only the values that still occur in
 * some filling of its row and of its column. Returns the grid when that settles every cell,
 * with the number of passes it took (more passes: harder), or null when it gets stuck.
 */
export function solve(
  n: number,
  k: number,
  rows: readonly Clue[],
  cols: readonly Clue[]
): { grid: Grid; passes: number } | null {
  const all = linesByClue(n, k)
  const lines: { cells: number[]; fits: Line[] }[] = []
  for (let r = 0; r < n; r++) {
    lines.push({
      cells: Array.from({ length: n }, (_, c) => r * n + c),
      fits: all.get(at(rows, r).join(",")) ?? [],
    })
  }
  for (let c = 0; c < n; c++) {
    lines.push({
      cells: Array.from({ length: n }, (_, r) => r * n + c),
      fits: all.get(at(cols, c).join(",")) ?? [],
    })
  }
  const domain: number[] = new Array<number>(n * n).fill((1 << (k + 1)) - 1)
  let passes = 0
  for (let changed = true; changed;) {
    changed = false
    passes++
    for (const line of lines) {
      line.fits = line.fits.filter(fit =>
        fit.every((value, i) => (at(domain, at(line.cells, i)) & (1 << value)) !== 0)
      )
      if (!line.fits.length) {
        return null
      }
      line.cells.forEach((cell, i) => {
        let seen = 0
        for (const fit of line.fits) {
          seen |= 1 << at(fit, i)
        }
        if (seen !== at(domain, cell)) {
          domain[cell] = seen
          changed = true
        }
      })
    }
  }
  if (domain.some(bits => (bits & (bits - 1)) !== 0)) {
    return null
  }
  const grid: Grid = []
  for (let r = 0; r < n; r++) {
    grid.push(domain.slice(r * n, r * n + n).map(bits => 31 - Math.clz32(bits)))
  }
  return { grid, passes: passes - 1 }
}

/**
 * A filled grid: a Latin square of n symbols, of which the highest are the black cells. So
 * every row and column gets each digit once and n - k black cells.
 */
function randomGrid(random: Random, n: number, k: number): Grid {
  const grid: Grid = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  const inRow: number[] = new Array<number>(n).fill(0)
  const inCol: number[] = new Array<number>(n).fill(0)
  const fill = (i: number): boolean => {
    if (i === n * n) {
      return true
    }
    const r = Math.floor(i / n)
    const c = i % n
    // Shuffled by hand: what sort() does with a random comparison differs between browsers.
    const symbols = Array.from({ length: n }, (_, s) => s + 1)
    for (let a = n - 1; a > 0; a--) {
      const b = Math.floor(random() * (a + 1))
      const swap = at(symbols, a)
      symbols[a] = at(symbols, b)
      symbols[b] = swap
    }
    for (const symbol of symbols) {
      if ((at(inRow, r) | at(inCol, c)) & (1 << symbol)) {
        continue
      }
      at(grid, r)[c] = symbol
      inRow[r] = at(inRow, r) | (1 << symbol)
      inCol[c] = at(inCol, c) | (1 << symbol)
      if (fill(i + 1)) {
        return true
      }
      inRow[r] = at(inRow, r) & ~(1 << symbol)
      inCol[c] = at(inCol, c) & ~(1 << symbol)
    }
    return false
  }
  fill(0)
  return grid.map(row => row.map(symbol => (symbol > k ? BLACK : symbol)))
}

/**
 * The puzzle for a seed: the same on every device. minPasses..maxPasses sets how hard it is.
 * `blacks` in the result is the number of black cells in every row and column, n - k.
 */
export function generate(
  seed: number,
  { n = 5, k = 4, minPasses = 3, maxPasses = 99 }: Options = {}
): Puzzle {
  const random = rng(seed)
  for (let attempt = 1; attempt <= 20000; attempt++) {
    const solution = randomGrid(random, n, k)
    const { rows, cols } = cluesOf(solution)
    const solved = solve(n, k, rows, cols)
    if (!solved || solved.passes < minPasses || solved.passes > maxPasses) {
      continue
    }
    return { n, k, blacks: n - k, solution, rows, cols, passes: solved.passes, attempt }
  }
  throw new Error(`no puzzle for seed ${seed}`)
}
