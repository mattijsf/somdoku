// The game as a player meets it: filling in, checking, solving and sharing.
import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { App } from "../src/app/App"
import { i18n } from "../src/i18n"
import { EMPTY, WHITE } from "../src/lib/game"
import { BLACK } from "../src/lib/puzzle"
import { freshGame, loadGame } from "../src/stores/savedGame"
import { day, n, solution } from "../src/stores/today"
import { useGameStore } from "../src/stores/useGameStore"
import { useUiStore } from "../src/stores/useUiStore"

const view = (): string | undefined => document.body.dataset.view
const cell = (i: number): HTMLElement => {
  const el = document.querySelector<HTMLElement>(`.cell[data-i="${i}"]`)
  if (!el) {
    throw new Error(`no cell ${i}`)
  }
  return el
}
const key = (name: string): HTMLElement =>
  within(screen.getByRole("group", { name: "Fill in" })).getByRole("button", { name })
const keyFor = (value: number): HTMLElement =>
  key(value === BLACK ? "Black cell" : `Digit ${value}`)

function fill(i: number, value: number): void {
  fireEvent.click(cell(i))
  fireEvent.click(keyFor(value))
}

beforeEach(async () => {
  localStorage.clear()
  await i18n.changeLanguage("en")
  useGameStore.setState({
    ...freshGame(),
    selected: null,
    reveal: null,
    tapped: null,
    showResult: false,
  })
  useUiStore.setState({ rulesOpen: false })
})

afterEach(() => {
  vi.useRealTimers()
})

describe("filling in", () => {
  beforeEach(() => {
    render(<App />)
  })

  it("shows the puzzle, and keeps the game on the device", () => {
    expect(view()).toBe("play")
    expect(document.querySelectorAll(".cell")).toHaveLength(n * n)
    fill(0, 3)
    expect(JSON.parse(localStorage.getItem(`somdoku:${day}`) ?? "{}")).toMatchObject({
      cells: [3, ...new Array<null>(n * n - 1).fill(EMPTY)],
      checks: [],
      finished: null,
    })
  })

  it("puts a digit in the chosen cell, and the same key again empties it", () => {
    fill(0, 3)
    expect(cell(0).textContent).toBe("3")
    fireEvent.click(keyFor(3))
    expect(cell(0).textContent).toBe("")
    expect(useGameStore.getState().cells[0]).toBe(EMPTY)
  })

  it("makes a cell black, or puts a note in it", () => {
    fill(1, BLACK)
    expect(cell(1).className).toContain("black")
    fireEvent.click(cell(2))
    fireEvent.click(key("Note: a digit goes here, not known yet which"))
    expect(cell(2).className).toContain("white")
    expect(useGameStore.getState().cells[2]).toBe(WHITE)
  })

  it("points out a digit that is in a line twice", () => {
    fill(0, 2)
    fill(1, 2)
    expect(cell(0).className).toContain("double")
    expect(cell(1).className).toContain("double")
  })

  it("points out a black cell too many in a line", () => {
    fill(0, BLACK)
    fill(1, BLACK)
    expect(cell(0).className).toContain("double")
    expect(cell(1).className).toContain("double")
  })

  it("takes digits, black, notes and arrows from the keyboard", () => {
    fireEvent.keyDown(document, { key: "ArrowRight" })
    expect(useGameStore.getState().selected).toBe(0)
    fireEvent.keyDown(document, { key: "ArrowRight" })
    fireEvent.keyDown(document, { key: "1" })
    fireEvent.keyDown(document, { key: "ArrowDown" })
    fireEvent.keyDown(document, { key: "x" })
    fireEvent.keyDown(document, { key: "ArrowLeft" })
    fireEvent.keyDown(document, { key: "o" })
    expect(useGameStore.getState().cells.slice(0, n + 2)).toEqual([
      EMPTY,
      1,
      ...new Array<null>(n - 2).fill(EMPTY),
      WHITE,
      BLACK,
    ])
  })

  it("says how many cells are still empty, and checks only once all are filled in", () => {
    expect(screen.getByText("Tap a cell, then a digit or black.")).toBeTruthy()
    fill(0, 1)
    expect(screen.getByText(`${n * n - 1} cells still empty.`)).toBeTruthy()
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Check" }).disabled).toBe(true)
  })
})

describe("keeping the game", () => {
  it("drops a game kept from an earlier version of today's puzzle", () => {
    const kept = { ...freshGame(), cells: [3, ...new Array<null>(n * n - 1).fill(EMPTY)] }
    localStorage.setItem(`somdoku:${day}`, JSON.stringify(kept))
    expect(loadGame().cells[0]).toBe(3)
    localStorage.setItem(`somdoku:${day}`, JSON.stringify({ ...kept, sums: "[[15],[6,4]]" }))
    expect(loadGame().cells[0]).toBe(EMPTY)
  })
})

describe("checking", () => {
  it("says per row whether it is right, and keeps the right rows", () => {
    render(<App />)
    // all right but the first row, where two cells are swapped
    const wrong = [...solution]
    ;[wrong[0], wrong[1]] = [solution[1] ?? 0, solution[0] ?? 0]
    wrong.forEach((value, i) => fill(i, value))
    expect(screen.getByText("This will be check 1 of 6.")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Check" }))
    expect(useGameStore.getState().checks).toEqual([
      [wrong[0] === solution[0], ...new Array<boolean>(n - 1).fill(true)],
    ])
    expect(screen.getByRole("img", { name: "1 of 6 checks used" }).textContent).toBe("1/6")
    expect(document.querySelectorAll("#tally .g")).toHaveLength(n - 1) // the score picture grows
    expect(cell(n).className).toContain("ok")
    // a right row stays as it is
    fill(n, solution[n] === 1 ? 2 : 1)
    expect(useGameStore.getState().cells[n]).toBe(solution[n])
    // nothing changed: checking again would only cost a try
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Check" }).disabled).toBe(true)
  })

  it("is over when every row is right, shows the result after the check, and copies the score", async () => {
    vi.useFakeTimers()
    const writeText = vi.fn(() => Promise.resolve())
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } })
    render(<App />)
    solution.forEach((value, i) => fill(i, value))
    fireEvent.click(screen.getByRole("button", { name: "Check" }))
    expect(useGameStore.getState().finished).toBe("won")
    expect(view()).toBe("play") // the check first, row by row
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(view()).toBe("done")
    expect(screen.getByRole("heading", { level: 1, name: "Right first time" })).toBeTruthy()
    expect(
      screen.getByRole("img", { name: /^Somdoku \d+ 1\/6\. 5 of 5 rows right\.$/ })
    ).toBeTruthy()

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Share" }))
      await vi.advanceTimersByTimeAsync(100)
    })
    const [[shared]] = writeText.mock.calls as unknown as [[string]]
    expect(shared).toMatch(/^Somdoku \d+ 1\/6\n🟩{5}$/u) // no address while trying it out here
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy()
  })
})

describe("in Dutch", () => {
  it("speaks Dutch to a Dutch browser", async () => {
    await i18n.changeLanguage("nl")
    render(<App />)
    expect(document.documentElement.lang).toBe("nl")
    expect(screen.getByRole("button", { name: "Controleer" })).toBeTruthy()
    expect(screen.getByText("Tik een vakje, en dan een cijfer of zwart.")).toBeTruthy()
  })
})
