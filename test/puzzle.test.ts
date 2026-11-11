import { describe, expect, it } from "vitest"
import {
  EMPTY,
  MAX_CHECKS,
  WHITE,
  dailyPuzzle,
  doubles,
  isFilled,
  practicePuzzle,
  puzzleNumber,
  rowsRight,
  shareText,
} from "../src/lib/game"
import { clueOf, cluesOf, column, generate, hash, solve } from "../src/lib/puzzle"

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

  it("follow the rules and can be solved from the clues alone, for a year of days", () => {
    for (let i = 0; i < 365; i++) {
      const day = new Date(Date.UTC(2026, 10, 11 + i)).toISOString().slice(0, 10)
      const { n, k, solution, rows, cols } = dailyPuzzle(day)
      for (const line of [...solution, ...(solution[0] ?? []).map((_, c) => column(solution, c))]) {
        const digits = line.filter(value => value > 0)
        expect(new Set(digits).size).toBe(digits.length)
        expect(digits.length).toBeGreaterThanOrEqual(2)
        expect(Math.max(...digits)).toBeLessThanOrEqual(k)
      }
      expect(cluesOf(solution)).toEqual({ rows, cols })
      expect(solve(n, k, rows, cols)?.grid).toEqual(solution)
    }
  })

  it("stay the same from one version to the next", () => {
    // Puzzle 1 as it went online. If this fails, the generator or the seed changed, and with it
    // every day's puzzle.
    const { rows, cols } = dailyPuzzle("2026-11-11")
    expect(rows).toEqual([[15], [6, 4], [13], [5, 5], [8, 3]])
    expect(cols).toEqual([[4, 7], [11, 1], [8, 5], [1, 7], [15]])
  })

  it("come in other sizes for practice", () => {
    for (const n of [4, 5, 6]) {
      expect(practicePuzzle(1, n).solution).toHaveLength(n)
    }
  })

  it("does not call a puzzle with two solutions solved", () => {
    // 1 2 / 2 1 and 2 1 / 1 2 give the same clues
    expect(solve(2, 2, [[3], [3]], [[3], [3]])).toBeNull()
  })
})

describe("a game", () => {
  it("numbers the puzzles from the first day", () => {
    expect(puzzleNumber("2026-11-11")).toBe(1)
    expect(puzzleNumber("2027-03-29")).toBe(139) // across the change to summer time
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
        checks: new Array<boolean[]>(MAX_CHECKS).fill([true, false, false]),
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
