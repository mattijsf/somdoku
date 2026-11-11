// The game being played: what is filled in, how it went, and what is selected. Every change to
// the game goes through the actions here, which also keep it on the device.
import { create } from "zustand"
import { at } from "../lib/at"
import { EMPTY, noteMove, solved, type Value } from "../lib/game"
import { calm, STEP } from "../utils/motion"
import { loadGame, saveGame, type Game } from "./savedGame"
import { n, solution } from "./today"

export type View = "play" | "done"

export interface GameStore extends Game {
  selected: number | null
  /** The cell that was just filled in, so it can give a little under the finger. */
  tapped: number | null
  /** The grid was solved just now: its rows turn green one after the other. */
  revealing: boolean
  /** The result is up: at once for a game solved earlier, after the reveal for one solved now. */
  showResult: boolean
  select: (i: number | null) => void
  put: (value: Value) => void
}

/** The puzzle can be played on: not finished. */
export const isLive = (game: Game): boolean => !game.finished

/** The puzzle while it is played, the result once it is over. */
export function viewOf({ finished, showResult }: GameStore): View {
  return finished && showResult ? "done" : "play"
}

const kept = loadGame()

export const useGameStore = create<GameStore>()((set, get) => ({
  ...kept,
  selected: null,
  tapped: null,
  revealing: false,
  showResult: kept.finished,

  select: (i): void => {
    if (!isLive(get())) {
      return
    }
    set({ selected: i, tapped: null })
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
    noteMove(trail, selected, from, to)
    const cells = game.cells.slice()
    cells[selected] = to
    set({ cells, trail, tapped: selected })
    const finished = solved(cells, solution)
    if (finished) {
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
}))
