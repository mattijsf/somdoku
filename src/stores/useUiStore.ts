// What the page shows besides the game: the rules.
import { create } from "zustand"
import { store } from "../utils/storage"

interface UiStore {
  rulesOpen: boolean
  openRules: () => void
  closeRules: () => void
}

// The first visit starts with the rules.
const RULES_SEEN = "somdoku:uitleg"
function firstVisit(): boolean {
  let seen = true
  try {
    seen = Boolean(localStorage.getItem(RULES_SEEN))
  } catch {
    /* no storage: don't nag on every visit */
  }
  if (!seen) {
    store(RULES_SEEN, "1")
  }
  return !seen
}

export const useUiStore = create<UiStore>()(set => ({
  rulesOpen: firstVisit(),
  openRules: (): void => set({ rulesOpen: true }),
  closeRules: (): void => set({ rulesOpen: false }),
}))
