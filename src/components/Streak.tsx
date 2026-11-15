import { Flame } from "lucide-react"
import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { streak } from "../lib/game"
import { solvedBefore } from "../stores/savedGame"
import { day } from "../stores/today"
import { useGameStore } from "../stores/useGameStore"

/**
 * The streak: days in a row the puzzle was solved on this device. Before the game as what there
 * is to keep going, afterwards with today in it. No streak, no line.
 */
export function Streak({ id }: { id: string }): ReactElement {
  const { t } = useTranslation()
  const finished = useGameStore(game => game.finished)
  const days = streak(day, someDay => (someDay === day ? finished : solvedBefore(someDay)))
  return (
    <p id={id} className="streak" hidden={days === 0}>
      <span data-icon="flame">
        <Flame className="icon" aria-hidden="true" />
      </span>
      <b>{t("streak", { count: days })}</b>
    </p>
  )
}
