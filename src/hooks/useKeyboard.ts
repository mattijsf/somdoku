import { useEffect } from "react"
import { EMPTY, WHITE } from "../lib/game"
import { BLACK } from "../lib/puzzle"
import { k, n, rowOf } from "../stores/today"
import { isLive, useGameStore } from "../stores/useGameStore"
import { useUiStore } from "../stores/useUiStore"

const moves = new Map([
  ["ArrowUp", -n],
  ["ArrowDown", n],
  ["ArrowLeft", -1],
  ["ArrowRight", 1],
])

/**
 * Arrows move the selection, digits fill in, 0, x or space make a cell black, a dot or o puts a
 * note in it, Backspace wipes it.
 */
export function useKeyboard(): void {
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const game = useGameStore.getState()
      const { selected, select, put } = game
      if (!isLive(game) || useUiStore.getState().rulesOpen) {
        return
      }
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }
      const move = moves.get(event.key)
      if (move !== undefined) {
        event.preventDefault()
        const from = selected ?? 0
        const to = from + move
        if (selected === null) {
          select(0)
        } else if (to >= 0 && to < n * n && (Math.abs(move) === n || rowOf(to) === rowOf(from))) {
          select(to)
        }
        return
      }
      if (/^[1-9]$/.test(event.key) && Number(event.key) <= k) {
        put(Number(event.key))
      } else if (["0", "x", "X", " "].includes(event.key)) {
        event.preventDefault()
        put(BLACK)
      } else if ([".", "o", "O"].includes(event.key)) {
        put(WHITE)
      } else if (["Backspace", "Delete"].includes(event.key)) {
        put(EMPTY)
      }
    }
    document.addEventListener("keydown", onKey)
    return (): void => document.removeEventListener("keydown", onKey)
  }, [])
}
