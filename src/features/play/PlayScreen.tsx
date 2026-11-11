import type { ReactElement } from "react"
import { Board } from "./Board"
import { Keypad } from "./Keypad"
import { Note } from "./Note"
import { Picker } from "./Picker"
import { usePickerGestures } from "./usePickerGestures"

/**
 * The puzzle, filled in two ways: tap a cell and then a key, or hold a cell and slide to a value.
 */
export function PlayScreen(): ReactElement {
  usePickerGestures()
  return (
    <section id="play">
      <div className="stage">
        <Board />
      </div>
      <Keypad />
      <Note />
      <Picker />
    </section>
  )
}
