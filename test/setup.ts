// What jsdom does not have and the page needs.
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

// Only .matches is read: whether the player asked for less motion.
Object.defineProperty(window, "matchMedia", {
  value: (query: string) => ({ matches: false, media: query }),
})

if (!("showModal" in HTMLDialogElement.prototype)) {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      value(this: HTMLDialogElement): void {
        this.open = true
      },
    },
    close: {
      value(this: HTMLDialogElement): void {
        this.open = false
        this.dispatchEvent(new Event("close"))
      },
    },
  })
}

afterEach(cleanup)
