import type { ReactElement } from "react"
import { Actions } from "./Actions"
import { Board } from "./Board"
import { History } from "./History"
import { Keypad } from "./Keypad"
import { Note } from "./Note"

/** The puzzle: tap a cell and then a key. Check when it is all filled in. */
export function PlayScreen(): ReactElement {
  return (
    <section id="play">
      <Board />
      <Keypad />
      <Actions />
      <Note />
      <History />
    </section>
  )
}
