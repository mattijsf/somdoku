import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { useGameStore } from "../../stores/useGameStore"
import { Board } from "./Board"
import { Keypad } from "./Keypad"
import { Note } from "./Note"
import { Picker } from "./Picker"
import { usePickerGestures } from "./usePickerGestures"

/**
 * The puzzle, filled in two ways: tap a cell and then a key, or hold a cell and slide to a value.
 * Before Start the button takes the room of the keys, so nothing moves when the game begins.
 */
export function PlayScreen(): ReactElement {
  const { t } = useTranslation()
  const start = useGameStore(game => game.start)
  usePickerGestures()
  return (
    <section id="play">
      <div className="stage">
        <Board />
      </div>
      <Keypad />
      <div className="actions">
        <button id="start" className="btn primary" type="button" onClick={start}>
          {t("ready.start")}
        </button>
      </div>
      <Note />
      <Picker />
    </section>
  )
}
