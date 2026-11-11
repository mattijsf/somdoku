// The game being played: what is filled in, the checks so far, and what is selected. Every
// change to the game goes through the actions here, which also keep it on the device.
import { create } from "zustand"
import { at } from "../lib/at"
import { EMPTY, isFilled, MAX_CHECKS, rowsRight, type Value } from "../lib/game"
import { calm, STEP } from "../utils/motion"
import { loadGame, saveGame, type Game } from "./savedGame"
import { n, rowOf, solution } from "./today"

export type View = "play" | "done"
/** What a check found in a row, while that is being shown: right rows pop, the others shake. */
export type Reveal = "pop" | "shake" | null

export interface GameStore extends Game {
  selected: number | null
  /** What the check that was just done found, per row, while that is being shown. */
  reveal: Reveal[] | null
  /** The cell that was just filled in, so it can give a little under the finger. */
  tapped: number | null
  /** The result is up: at once for a game finished earlier, after the last check for one finished now. */
  showResult: boolean
  select: (i: number | null) => void
  put: (value: Value) => void
  check: () => void
}

/** The puzzle can be played on: not finished. */
export const isLive = (game: Game): boolean => game.finished === null

/** The puzzle while it is played, the result once it is over. */
export function viewOf({ finished, showResult }: GameStore): View {
  return finished && showResult ? "done" : "play"
}

/** A row that a check found right stays as it is. */
export const locked = ({ checks }: Pick<Game, "checks">, r: number): boolean =>
  Boolean(checks.at(-1)?.[r])

/** Nothing was changed since the last check: checking again would only cost a try. */
export const unchanged = ({ checks, stale }: Pick<Game, "checks" | "stale">): boolean =>
  checks.length > 0 && !stale.some(Boolean)

const kept = loadGame()

export const useGameStore = create<GameStore>()((set, get) => ({
  ...kept,
  selected: null,
  reveal: null,
  tapped: null,
  showResult: kept.finished !== null,

  select: (i): void => {
    if (!isLive(get())) {
      return
    }
    set({ selected: i, reveal: null, tapped: null })
  },

  /** Fills the selected cell; the same value a second time empties it again. */
  put: (value): void => {
    const game = get()
    const { selected } = game
    if (selected === null || !isLive(game) || locked(game, rowOf(selected))) {
      return
    }
    const cells = game.cells.slice()
    cells[selected] = at(game.cells, selected) === value ? EMPTY : value
    const stale = game.stale.slice()
    stale[rowOf(selected)] = true
    set({ cells, stale, reveal: null, tapped: selected })
    saveGame(get())
  },

  /** One try: says for each row whether it is right. The game ends when all are, or after the last try. */
  check: (): void => {
    const game = get()
    if (!isLive(game) || unchanged(game) || !game.cells.every(isFilled)) {
      return
    }
    const right = rowsRight(game.cells, solution, n)
    // rows that were right already stay still
    const reveal = right.map((ok, r): Reveal => {
      if (locked(game, r)) {
        return null
      }
      return ok ? "pop" : "shake"
    })
    const checks = [...game.checks, right]
    let finished: Game["finished"] = null
    if (right.every(Boolean)) {
      finished = "won"
    } else if (checks.length >= MAX_CHECKS) {
      finished = "lost"
    }
    set({
      checks,
      stale: new Array<boolean>(n).fill(false),
      finished,
      selected: finished ? null : game.selected,
      reveal,
      tapped: null,
    })
    saveGame(get())
    if (!finished) {
      return
    }
    // Let the last check be seen row by row before the result comes up.
    if (calm) {
      set({ showResult: true })
    } else {
      setTimeout(() => set({ showResult: true }), (n - 1) * STEP + 700)
    }
  },
}))
