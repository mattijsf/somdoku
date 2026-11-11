import { describe, expect, it } from "vitest"
import {
  EMPTY,
  MAX_CHECKS,
  WHITE,
  dailyPuzzle,
  doubles,
  isFilled,
  puzzleNumber,
  rowsRight,
  shareText,
  spare,
  type Check,
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
      rows: [[10], [1, 9], [6, 4], [5, 5], [10]],
      cols: [[10], [3, 7], [7, 3], [5, 5], [10]],
    })
    expect(dailyPuzzle("2026-11-12")).toMatchObject({
      blacks: 1,
      rows: [[10], [9, 1], [3, 7], [10], [4, 6]],
      cols: [[10], [10], [6, 4], [4, 6], [8, 2]],
    })
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
    expect(spare([0, 0, 0, EMPTY, WHITE], 2).size).toBe(3)
  })

  it("points out a digit that is in a line twice", () => {
    expect([...doubles([4, 0, 4, EMPTY, 0])].sort()).toEqual([0, 2])
    expect(doubles([4, 0, 1, WHITE, 0]).size).toBe(0)
    expect(doubles([0, 0, 0, 0, 0]).size).toBe(0) // black cells may repeat
  })

  it("counts a note or an empty cell as not filled in", () => {
    expect([EMPTY, WHITE, 0, 3].map(isFilled)).toEqual([false, false, true, true])
  })

  it("says per row whether it is right, not which cell is wrong", () => {
    const solution = [1, 2, 0, 1]
    expect(rowsRight([1, 2, 0, 1], solution, 2)).toEqual([true, true])
    expect(rowsRight([2, 1, 0, 1], solution, 2)).toEqual([false, true])
    expect(rowsRight([1, 2, 0, 2], solution, 2)).toEqual([true, false])
  })

  it("shares the number of checks with a line per check, like a Woordle score", () => {
    const checks = [
      [true, false, true],
      [true, true, true],
    ]
    expect(shareText({ name: "Somdoku 12", checks, solved: true })).toBe(
      "Somdoku 12 2/6\n🟩⬛🟩\n🟩🟩🟩"
    )
    expect(
      shareText({
        name: "Somdoku 12",
        checks: new Array<Check>(MAX_CHECKS).fill([true, false, false]),
        solved: false,
      })
    ).toMatch(/^Somdoku 12 X\/6\n(🟩⬛⬛\n){5}🟩⬛⬛$/u)
    expect(
      shareText({ name: "Somdoku 12", checks: [[true]], solved: true, url: "https://x.nl/" })
        .split("\n")
        .at(-1)
    ).toBe("https://x.nl/")
  })
})
