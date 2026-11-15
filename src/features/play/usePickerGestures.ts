// Besides tapping a cell and then a key: hold a cell and the values come up in a row above it.
// It is one gesture. Slide to a value and let go to fill it in; let go anywhere else, or slide
// well away from the row, and it is gone. What a move does to the game and the score is the same.
import { useEffect, type PointerEvent as ReactPointerEvent } from "react"
import { flushSync } from "react-dom"
import { at } from "../../lib/at"
import { isLive, useGameStore } from "../../stores/useGameStore"
import { buzz } from "../../utils/haptics"
import { keys } from "./keys"
import { usePickerStore } from "./usePickerStore"

const HOLD = 350 // ms a finger rests on a cell before the values come up
const REACH = 56 // px the finger may stray from the cell and the row before the row gives up

interface Zone {
  left: number
  right: number
  top: number
  bottom: number
}

let picker: HTMLElement | null = null
let hold: { x: number; y: number; timer: ReturnType<typeof setTimeout> } | null = null // a finger down on a cell that may become a long press
let zone: Zone | null = null // the values are up and the finger may roam here
let swallow = false // the click that ends a long press is not a tap on the cell

/** The picker's element, for measuring it. */
export function registerPicker(el: HTMLElement | null): void {
  picker = el
}

/** The click that ends a long press is not a tap on the cell. */
export const isSwallowing = (): boolean => swallow

/** The value the finger is at: the nearest one, as soon as the finger is level with the row. */
function optionAt(x: number, y: number): number {
  if (!picker) {
    return -1
  }
  const box = picker.getBoundingClientRect()
  if (y < box.top - 12 || y > box.bottom + 4 || x < box.left - 12 || x > box.right + 12) {
    return -1
  }
  const off = [...picker.children].map(el => {
    const place = el.getBoundingClientRect()
    return Math.abs(x - (place.left + place.width / 2))
  })
  return off.indexOf(Math.min(...off))
}

function light(j: number): void {
  if (j === usePickerStore.getState().lit) {
    return
  }
  usePickerStore.setState({ lit: j })
  // a detent for every value the finger slides onto
  if (j >= 0) {
    buzz("step")
  }
}

function openPicker(i: number, cellEl: HTMLElement): void {
  useGameStore.getState().select(i)
  flushSync(() => usePickerStore.setState({ open: i, lit: -1 })) // shown, so it can be measured
  if (!picker) {
    return
  }
  // above the cell, where the finger does not cover it; below when there is no room above
  const cell = cellEl.getBoundingClientRect()
  const box = { width: picker.offsetWidth, height: picker.offsetHeight } // its size at rest, not mid-animation
  const left = Math.min(
    Math.max(cell.left + cell.width / 2 - box.width / 2, 8),
    innerWidth - box.width - 8
  )
  const above = cell.top - box.height - 10
  const top = above >= 8 ? above : cell.bottom + 10
  usePickerStore.setState({ left, top })
  zone = {
    left: Math.min(cell.left, left) - REACH,
    right: Math.max(cell.right, left + box.width) + REACH,
    top: Math.min(cell.top, top) - REACH,
    bottom: Math.max(cell.bottom, top + box.height) + REACH,
  }
  buzz("hold") // the row is up: felt, so there is no need to look for it
}

function closePicker(): void {
  zone = null
  usePickerStore.setState({ open: null })
}

/** A finger down on a cell: after a moment still, the values come up. */
export function holdCell(event: ReactPointerEvent<HTMLElement>, i: number): void {
  if (!isLive(useGameStore.getState()) || event.button !== 0) {
    return
  }
  const cellEl = event.currentTarget
  clearTimeout(hold?.timer)
  hold = {
    x: event.clientX,
    y: event.clientY,
    timer: setTimeout(() => {
      hold = null
      swallow = true
      openPicker(i, cellEl)
    }, HOLD),
  }
}

function onMove(event: PointerEvent): void {
  const { clientX: x, clientY: y } = event
  // a finger that moves before the values are up is not holding still: scrolling, or a slip
  if (hold && Math.hypot(x - hold.x, y - hold.y) > 10) {
    clearTimeout(hold.timer)
    hold = null
  }
  if (!zone || usePickerStore.getState().open === null) {
    return
  }
  if (x < zone.left || x > zone.right || y < zone.top || y > zone.bottom) {
    closePicker() // swept away
  } else {
    light(optionAt(x, y))
  }
}

function letGo(event: PointerEvent): void {
  clearTimeout(hold?.timer)
  hold = null
  setTimeout(() => {
    swallow = false
  }, 0) // after the click that may follow
  const i = usePickerStore.getState().open
  if (i === null) {
    return
  }
  const j = event.type === "pointerup" ? optionAt(event.clientX, event.clientY) : -1
  closePicker() // letting go always puts the row away
  const game = useGameStore.getState()
  if (j < 0 || game.cells[i] === at(keys, j).value) {
    return // not on a value, or on what is there already
  }
  useGameStore.setState({ selected: i })
  game.put(at(keys, j).value)
}

// While sliding to a value the page must not scroll along.
function onTouchMove(event: TouchEvent): void {
  if (usePickerStore.getState().open !== null) {
    event.preventDefault()
  }
}

/** The finger may move anywhere on the page while a cell is held. */
export function usePickerGestures(): void {
  useEffect(() => {
    document.addEventListener("pointermove", onMove)
    document.addEventListener("pointerup", letGo)
    document.addEventListener("pointercancel", letGo)
    document.addEventListener("touchmove", onTouchMove, { passive: false })
    return (): void => {
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerup", letGo)
      document.removeEventListener("pointercancel", letGo)
      document.removeEventListener("touchmove", onTouchMove)
    }
  }, [])
}
