import { describe, expect, it } from "vitest"
import {
  EMPTY,
  LEVELS,
  dailyPuzzle,
  doubles,
  freshTrail,
  isFilled,
  levelOf,
  marks,
  noteMove,
  puzzleNumber,
  shareText,
  solved,
  spare,
} from "../src/lib/game"
import {
  clueOf,
  cluesOf,
  column,
  generate,
  hash,
  solve,
  type Grid,
  type Line,
} from "../src/lib/puzzle"

const linesOf = (grid: Grid): Line[] => [...grid, ...(grid[0] ?? []).map((_, c) => column(grid, c))]

describe("clues", () => {
  it("sums each group of digits that touch, in order", () => {
    expect(clueOf([4, 0, 1, 5, 0])).toEqual([4, 6])
    expect(clueOf([0, 3, 2, 4, 5])).toEqual([14])
    expect(clueOf([0, 0, 0])).toEqual([])
  })
})

describe("puzzles", () => {
  it("are the same for the same seed", () => {
    expect(generate(hash("a"))).toEqual(generate(hash("a")))
    expect(generate(hash("a")).solution).not.toEqual(generate(hash("b")).solution)
  })

  it("follow the booklet and can be solved from the clues alone, for a year of days", () => {
    for (let i = 0; i < 365; i++) {
      const day = new Date(Date.UTC(2026, 10, 11 + i)).toISOString().slice(0, 10)
      const { n, k, blacks, solution, rows, cols } = dailyPuzzle(day)
      expect([n, k, blacks]).toEqual([5, 4, 1])
      // every row and column: each of 1, 2, 3, 4 once and one black cell
      for (const line of linesOf(solution)) {
        expect([...line].sort()).toEqual([0, 1, 2, 3, 4])
      }
      expect(cluesOf(solution)).toEqual({ rows, cols })
      expect(solve(n, k, rows, cols)?.grid).toEqual(solution)
    }
  })

  it("stay the same from one version to the next", () => {
    // The first two puzzles. If this fails, the generator or the seed changed, and with it every
    // day's puzzle: fine while the game is being made, not once people play along every day.
    expect(dailyPuzzle("2026-11-11")).toMatchObject({
      blacks: 1,
      rows: [[10], [3, 7], [10], [9, 1], [4, 6]],
      cols: [[4, 6], [10], [4, 6], [9, 1], [10]],
    })
    expect(dailyPuzzle("2026-11-12")).toMatchObject({
      blacks: 1,
      rows: [[10], [9, 1], [3, 7], [10], [4, 6]],
      cols: [[10], [10], [6, 4], [4, 6], [8, 2]],
    })
  })

  it("differ in how hard they are from day to day, without a pattern, on the same grid", () => {
    const days = Array.from({ length: 365 }, (_, i) =>
      new Date(Date.UTC(2026, 10, 11 + i)).toISOString().slice(0, 10)
    )
    const seen: Record<number, number> = {}
    let run = 0
    let longest = 0
    days.forEach((day, i) => {
      const level = levelOf(day)
      const { passes } = dailyPuzzle(day)
      // the rounds of reasoning the puzzle takes are the level; the stiffest level has no upper end
      if (level === LEVELS.at(-1)) {
        expect(passes).toBeGreaterThanOrEqual(level)
      } else {
        expect(passes).toBe(level)
      }
      seen[level] = (seen[level] ?? 0) + 1
      run = i > 0 && level === levelOf(days[i - 1] ?? "") ? run + 1 : 1
      longest = Math.max(longest, run)
    })
    // each level on roughly a third of the days, and never the same level for weeks on end
    for (const level of LEVELS) {
      expect(seen[level]).toBeGreaterThan(90)
    }
    expect(longest).toBeLessThan(10)
  })

  it("have one solution, also when every grid that fits the clues is tried", () => {
    // Without the solver: every way to fill each row, then the columns checked.
    const { n, k, rows, cols, solution } = dailyPuzzle("2026-11-11")
    const same = (a: readonly number[], b: readonly number[]): boolean =>
      a.length === b.length && a.every((v, i) => v === b[i])
    const fillings: Line[] = []
    for (let code = 0; code < (k + 1) ** n; code++) {
      const line = Array.from({ length: n }, (_, i) => Math.floor(code / (k + 1) ** i) % (k + 1))
      if (same([...line].sort(), [0, 1, 2, 3, 4])) {
        fillings.push(line)
      }
    }
    const perRow = rows.map(clue => fillings.filter(line => same(clueOf(line), clue)))
    const found: Grid[] = []
    const grid: Grid = []
    const place = (r: number): void => {
      if (r < n) {
        for (const line of perRow[r] ?? []) {
          grid.push(line)
          place(r + 1)
          grid.pop()
        }
        return
      }
      const columns = (grid[0] ?? []).map((_, c) => column(grid, c))
      if (
        columns.every(
          (col, c) => same([...col].sort(), [0, 1, 2, 3, 4]) && same(clueOf(col), cols[c] ?? [])
        )
      ) {
        found.push(grid.map(row => [...row]))
      }
    }
    place(0)
    expect(found).toEqual([solution])
  })

  it("work in other sizes too, by the same rules", () => {
    for (const [n, k] of [
      [4, 3],
      [6, 4],
    ] as const) {
      const puzzle = generate(hash(`maat ${n}`), { n, k, minPasses: 2 })
      expect(puzzle.blacks).toBe(n - k)
      for (const line of linesOf(puzzle.solution)) {
        expect(line.filter(value => value === 0)).toHaveLength(n - k)
        expect(new Set(line.filter(value => value > 0)).size).toBe(k)
      }
    }
  })

  it("does not call a puzzle with two solutions solved", () => {
    // one digit and one black cell per line: 1 # / # 1 and # 1 / 1 # give the same clues
    expect(solve(2, 1, [[1], [1]], [[1], [1]])).toBeNull()
  })
})

describe("a game", () => {
  it("numbers the puzzles from the first day", () => {
    expect(puzzleNumber("2026-11-11")).toBe(1)
    expect(puzzleNumber("2027-03-29")).toBe(139) // across the change to summer time
  })

  it("points out black cells when a line has more than it gets", () => {
    expect([...spare([0, 1, 0, 2, 3], 1)].sort()).toEqual([0, 2])
    expect(spare([0, 1, 4, 2, 3], 1).size).toBe(0)
    expect(spare([0, 0, 0, EMPTY, 1], 2).size).toBe(3)
  })

  it("points out a digit that is in a line twice", () => {
    expect([...doubles([4, 0, 4, EMPTY, 0])].sort()).toEqual([0, 2])
    expect(doubles([4, 0, 1, EMPTY, 0]).size).toBe(0)
    expect(doubles([0, 0, 0, 0, 0]).size).toBe(0) // black cells may repeat
  })

  it("is over when the grid is right, and not before", () => {
    const solution = [1, 2, 0, 1]
    expect(solved([1, 2, 0, 1], solution)).toBe(true)
    expect(solved([1, 2, 0, EMPTY], solution)).toBe(false)
    expect(solved([2, 1, 0, 1], solution)).toBe(false)
    expect([EMPTY, 0, 3].map(isFilled)).toEqual([false, true, true])
  })

  it("fills a cell for free, and counts taking something back", () => {
    const trail = freshTrail(4)
    noteMove(trail, 0, EMPTY, 3) // filled in
    noteMove(trail, 1, EMPTY, 2)
    noteMove(trail, 2, EMPTY, 0) // a black cell
    expect(trail).toMatchObject({ edits: 0, order: [0, 1, 2] })

    noteMove(trail, 0, 3, 1) // another digit over it
    noteMove(trail, 2, 0, EMPTY) // wiped
    noteMove(trail, 2, EMPTY, 4) // and filled in again: the wiping was the change
    noteMove(trail, 3, EMPTY, EMPTY) // nothing happened
    expect(trail).toMatchObject({ edits: 2, order: [0, 1, 2], changed: [true, false, true, false] })
  })

  it("shares the score with a timeline: a square per cell in the order they were filled", () => {
    const trail = freshTrail(4)
    ;[2, 0, 3, 1].forEach(cell => noteMove(trail, cell, EMPTY, 1)) // filled in this order
    noteMove(trail, 0, 1, 2) // the second one filled was altered later
    expect(marks(trail)).toEqual(["g", "y", "g", "g"])
    expect(shareText({ name: "Somdoku 12", trail, n: 2 })).toBe("Somdoku 12 ✏️1\n🟩🟨\n🟩🟩")
    expect(
      shareText({ name: "Somdoku 12", trail, n: 2, url: "https://x.nl/" }).split("\n").at(-1)
    ).toBe("https://x.nl/")
  })

  it("shows a flawless game as nothing but green", () => {
    const trail = freshTrail(4)
    ;[0, 1, 2, 3].forEach(cell => noteMove(trail, cell, EMPTY, 1))
    expect(shareText({ name: "Somdoku 1", trail, n: 2 })).toBe("Somdoku 1 ✏️0\n🟩🟩\n🟩🟩")
  })
})
