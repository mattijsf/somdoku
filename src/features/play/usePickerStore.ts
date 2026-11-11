import { create } from "zustand"
import { isLive, useGameStore } from "../../stores/useGameStore"

interface PickerStore {
  /** The cell whose values are up, for as long as the finger stays down. */
  open: number | null
  /** Where the row is: above the cell, or below it when there is no room above. */
  left: number
  top: number
  /** The option the finger is at, or -1. */
  lit: number
}

export const usePickerStore = create<PickerStore>()(() => ({
  open: null,
  left: 0,
  top: 0,
  lit: -1,
}))

// The end of the game puts the row away.
useGameStore.subscribe(game => {
  if (!isLive(game) && usePickerStore.getState().open !== null) {
    usePickerStore.setState({ open: null })
  }
})
