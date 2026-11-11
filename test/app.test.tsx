// The game as a player meets it: the start, filling in, solving and sharing.
import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { App } from "../src/app/App"
import { i18n } from "../src/i18n"
import { EMPTY } from "../src/lib/game"
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
    justFilled: null,
    tapped: null,
    revealing: false,
    showResult: false,
  })
  useUiStore.setState({ rulesOpen: false })
})

afterEach(() => {
  vi.useRealTimers()
})

describe("the start", () => {
  it("starts on a button with the sums covered", () => {
    render(<App />)
    expect(view()).toBe("ready")
    expect(screen.getByRole("button", { name: "Start" })).toBeTruthy()
    expect(screen.getByText("The sums appear when you start.")).toBeTruthy()
  })

  it("shows the sums after Start, and keeps the game on the device", () => {
    render(<App />)
    fireEvent.click(screen.getByRole("button", { name: "Start" }))
    expect(view()).toBe("play")
    expect(document.querySelectorAll(".cell")).toHaveLength(n * n)
    expect(JSON.parse(localStorage.getItem(`somdoku:${day}`) ?? "{}")).toMatchObject({
      started: true,
    })
  })
})

describe("filling in", () => {
  beforeEach(() => {
    render(<App />)
    fireEvent.click(screen.getByRole("button", { name: "Start" }))
  })

  it("puts a digit in the chosen cell, and the same key again empties it", () => {
    fill(0, 3)
    expect(cell(0).textContent).toBe("3")
    fireEvent.click(keyFor(3))
    expect(cell(0).textContent).toBe("")
    expect(useGameStore.getState().cells[0]).toBe(EMPTY)
  })

  it("makes a cell black", () => {
    fill(1, BLACK)
    expect(cell(1).className).toContain("black")
  })

  it("has no button to check with and no notes: the grid being right is the end", () => {
    expect(screen.queryByRole("button", { name: /Check|Digit\?/ })).toBeNull()
    expect(document.querySelector("#check")).toBeNull()
  })

  it("points out a digit twice in a line, and a black cell too many", () => {
    fill(0, 2)
    fill(1, 2)
    expect(cell(0).className).toContain("double")
    expect(cell(1).className).toContain("double")
    expect(cell(2).className).not.toContain("double")
    fill(n, BLACK)
    fill(2 * n, BLACK)
    expect(cell(2 * n).className).toContain("double")
  })

  it("takes digits, black and arrows from the keyboard", () => {
    fireEvent.keyDown(document, { key: "ArrowRight" })
    expect(useGameStore.getState().selected).toBe(0)
    fireEvent.keyDown(document, { key: "ArrowRight" })
    fireEvent.keyDown(document, { key: "1" })
    fireEvent.keyDown(document, { key: "ArrowDown" })
    fireEvent.keyDown(document, { key: "x" })
    expect(useGameStore.getState().cells.slice(0, n + 2)).toEqual([
      EMPTY,
      1,
      ...new Array<null>(n - 1).fill(EMPTY),
      BLACK,
    ])
  })

  it("says how many cells are still empty", () => {
    expect(screen.getByText("Tap a cell, or hold it.")).toBeTruthy()
    fill(0, 1)
    expect(screen.getByText(`${n * n - 1} cells still empty.`)).toBeTruthy()
  })

  it("does not count a slip put right at once as a change", () => {
    fill(0, 1)
    fireEvent.click(keyFor(2))
    expect(useGameStore.getState().trail).toMatchObject({ edits: 0, order: [0] })
    fill(1, 1)
    fill(0, 3)
    expect(useGameStore.getState().trail.edits).toBe(1)
  })
})

describe("holding a cell", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(screen.getByRole("button", { name: "Start" }))
  })

  // the click that may follow letting go is swallowed, until the next tick
  const letGo = (x: number, y: number): void => {
    fireEvent.pointerUp(document, { clientX: x, clientY: y })
    act(() => {
      vi.advanceTimersByTime(1)
    })
  }
  const hold = (i: number): void => {
    fireEvent.pointerDown(cell(i), { button: 0, clientX: 0, clientY: 0 })
    act(() => {
      vi.advanceTimersByTime(400)
    })
  }

  const picker = (): HTMLElement | null => document.querySelector<HTMLElement>(".picker")

  it("brings up the values above it: let go on one to fill it in", () => {
    expect(picker()?.hidden).toBe(true)
    hold(2)
    expect(picker()?.hidden).toBe(false)
    expect(useGameStore.getState().selected).toBe(2)
    // jsdom measures everything at 0, so the finger at 0,0 is at the first value: the digit 1
    fireEvent.pointerMove(document, { clientX: 0, clientY: 0 })
    expect(picker()?.querySelector(".pick.hot")?.textContent).toBe("1")
    letGo(0, 0)
    expect(useGameStore.getState().cells[2]).toBe(1)
    expect(picker()?.hidden).toBe(true) // letting go always puts the row away
  })

  it("puts the values away when the finger sweeps off", () => {
    hold(2)
    fireEvent.pointerMove(document, { clientX: 600, clientY: 600 })
    expect(picker()?.hidden).toBe(true) // swept away
    letGo(0, 0)
    expect(useGameStore.getState().cells[2]).toBe(EMPTY)
  })

  it("is a tap when the finger lets go before the values are up", () => {
    fireEvent.pointerDown(cell(2), { button: 0, clientX: 0, clientY: 0 })
    letGo(0, 0)
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(picker()?.hidden).toBe(true)
  })
})

describe("keeping the game", () => {
  it("drops a game kept from an earlier version of today's puzzle, or of the game", () => {
    const kept = { ...freshGame(), cells: [3, ...new Array<null>(n * n - 1).fill(EMPTY)] }
    localStorage.setItem(`somdoku:${day}`, JSON.stringify(kept))
    expect(loadGame().cells[0]).toBe(3)
    localStorage.setItem(`somdoku:${day}`, JSON.stringify({ ...kept, sums: "[[15],[6,4]]" }))
    expect(loadGame().cells[0]).toBe(EMPTY)
    // one with checks, from before the score was the number of changes
    localStorage.setItem(`somdoku:${day}`, JSON.stringify({ ...kept, checks: [] }))
    expect(loadGame().cells[0]).toBe(EMPTY)
    // one without a clock, from before the score was the time
    localStorage.setItem(`somdoku:${day}`, JSON.stringify({ ...kept, active: undefined }))
    expect(loadGame().cells[0]).toBe(EMPTY)
  })
})

describe("the end", () => {
  it("is over when the grid is right, shows the result after the grid, and copies the score", async () => {
    vi.useFakeTimers()
    const writeText = vi.fn(() => Promise.resolve())
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } })
    render(<App />)
    fireEvent.click(screen.getByRole("button", { name: "Start" }))
    solution.forEach((value, i) => fill(i, value))
    expect(useGameStore.getState().finished).toBe(true)
    expect(view()).toBe("play") // the solved grid first, row by row
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(view()).toBe("done")
    expect(screen.getByRole("heading", { level: 1, name: /^Solved in \d+:\d\d$/ })).toBeTruthy()
    expect(
      screen.getByRole("img", {
        name: /^Somdoku \d+ · \d+:\d\d\. 25 cells in one go, 0 changed later\.$/u,
      })
    ).toBeTruthy()

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Share" }))
      await vi.advanceTimersByTimeAsync(100)
    })
    const [[shared]] = writeText.mock.calls as unknown as [[string]]
    expect(shared).toMatch(/^Somdoku \d+ · \d+:\d\d\n(🟩{5}\n){4}🟩{5}$/u)
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy()
  })
})

describe("in Dutch", () => {
  it("speaks Dutch to a Dutch browser", async () => {
    await i18n.changeLanguage("nl")
    render(<App />)
    expect(document.documentElement.lang).toBe("nl")
    expect(screen.getByRole("button", { name: "Uitleg" })).toBeTruthy()
    expect(screen.getByText("De sommen verschijnen als je start.")).toBeTruthy()
  })
})
