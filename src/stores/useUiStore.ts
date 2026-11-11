// What the page shows besides the game: the rules and the line that comes up from the bottom.
import { create } from "zustand"
import { store } from "../utils/storage"

interface UiStore {
  rulesOpen: boolean
  toast: string
  toastUp: boolean
  openRules: () => void
  closeRules: () => void
  /** A line that comes up from the bottom for a moment. */
  showToast: (text: string) => void
}

// The first visit starts with the rules. The key is the one the game has always used, so
// players who have seen them are not shown them again.
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

let toasting: ReturnType<typeof setTimeout> | undefined

export const useUiStore = create<UiStore>()(set => ({
  rulesOpen: firstVisit(),
  toast: "",
  toastUp: false,
  openRules: (): void => set({ rulesOpen: true }),
  closeRules: (): void => set({ rulesOpen: false }),
  showToast: (text): void => {
    set({ toast: text, toastUp: true })
    clearTimeout(toasting)
    toasting = setTimeout(() => set({ toastUp: false }), 2600)
  },
}))
