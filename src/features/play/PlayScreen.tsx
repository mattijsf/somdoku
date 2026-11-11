import type { ReactElement } from "react"
import { Board } from "./Board"
import { Keypad } from "./Keypad"
import { Note } from "./Note"

/** The puzzle: tap a cell and then a key. */
export function PlayScreen(): ReactElement {
  return (
    <section id="play">
      <div className="stage">
        <Board />
      </div>
      <Keypad />
      <Note />
    </section>
  )
}
