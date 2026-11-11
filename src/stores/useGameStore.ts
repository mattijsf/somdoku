// The game being played: what is filled in, how it went, the clock, and what is selected. Every
// change to the game goes through the actions here, which also keep it on the device.
import { create } from "zustand"
import { at } from "../lib/at"
import { EMPTY, noteMove, solved, type Value } from "../lib/game"
import { calm, STEP } from "../utils/motion"
import { loadGame, saveGame, type Game } from "./savedGame"
import { n, solution } from "./today"

export type View = "ready" | "play" | "done"

export interface GameStore extends Game {
  selected: number | null
  /** The cell that was filled last, as long as no other cell was touched since: changing it now is a slip of the finger. */
  justFilled: number | null
  /** The cell that was just filled in, so it can give a little under the finger. */
  tapped: number | null
  /** The grid was solved just now: its rows burst into colour one after the other. */
  revealing: boolean
  /** The result is up: at once for a game solved earlier, after the reveal for one solved now. */
  showResult: boolean
  select: (i: number) => void
  put: (value: Value) => void
  start: () => void
  pause: () => void
  tick: () => void
}

/** The puzzle is in sight and can be played on: started, not paused, not finished. */
export const isLive = (game: Game): boolean => game.started && !game.paused && !game.finished
/** The clock runs: the game is live and on screen. */
export const isPlaying = (game: Game): boolean => isLive(game) && !document.hidden

/** The start screen doubles as the pause screen: the puzzle out of sight, one button to go on. */
export function viewOf({ started, paused, finished, showResult }: GameStore): View {
  if (finished) {
    return showResult ? "done" : "play"
  }
  return !started || paused ? "ready" : "play"
}

// The score is the time spent playing. It counts from Start and only while the puzzle is in
// sight: pause, or put the phone away, and the clock stops, so a game can be spread over the day.
// It is not shown while playing. Time is added a tick at a time; a gap longer than a few seconds
// means the page was asleep, and is not counted.
let last: number | null = null // when the clock was last read while running

const kept = loadGame()

export const useGameStore = create<GameStore>()((set, get) => ({
  ...kept,
  // Coming back to a game that was under way always lands on the pause screen: the clock starts
  // again when the player says so, not the moment the page happens to open.
  paused: kept.paused || (kept.started && !kept.finished),
  selected: null,
  justFilled: null,
  tapped: null,
  revealing: false,
  showResult: kept.finished,

  select: (i): void => {
    const game = get()
    if (!isLive(game)) {
      return
    }
    set({
      selected: i,
      justFilled: i !== game.justFilled ? null : game.justFilled,
      tapped: null,
    })
  },

  /**
   * Fills the selected cell; the same value a second time empties it again. There is no button
   * to check with: the game is over the moment the grid is right.
   */
  put: (value): void => {
    const game = get()
    const { selected } = game
    if (selected === null || !isLive(game)) {
      return
    }
    const from = at(game.cells, selected)
    const to = from === value ? EMPTY : value
    const trail = { ...game.trail, order: [...game.trail.order], changed: [...game.trail.changed] }
    noteMove(trail, selected, from, to, selected === game.justFilled)
    const cells = game.cells.slice()
    cells[selected] = to
    set({ cells, trail, justFilled: selected, tapped: selected })
    get().tick() // the clock is exact at every move, and at the last one
    const finished = solved(cells, solution)
    if (finished) {
      last = null // the clock stops here, at the last move
      set({ finished, selected: null, tapped: null, revealing: true })
    }
    saveGame(get())
    if (!finished) {
      return
    }
    // Let the finished grid be seen row by row before the result comes up.
    if (calm) {
      set({ showResult: true })
    } else {
      setTimeout(() => set({ showResult: true }), (n - 1) * STEP + 700)
    }
  },

  // Start, and Continue after a pause: the puzzle comes into sight and the clock runs.
  start: (): void => {
    const game = get()
    if (game.finished || (game.started && !game.paused)) {
      return
    }
    set({ started: true, paused: false })
    get().tick()
    saveGame(get())
  },

  /** Stops the clock and takes the puzzle out of sight, until Continue. Pausing with the puzzle still there would be free time to think. */
  pause: (): void => {
    get().tick()
    const game = get()
    if (!game.started || game.paused || game.finished) {
      return
    }
    last = null
    set({ paused: true, selected: null })
    saveGame(get())
  },

  tick: (): void => {
    const now = Date.now()
    const game = get()
    if (last !== null && now - last < 5000) {
      set({ active: game.active + Math.max(0, now - last) })
    }
    last = isPlaying(game) ? now : null
  },
}))
