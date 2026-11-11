import type { ReactElement } from "react"
import { MAX_CHECKS } from "../../lib/game"
import { n } from "../../stores/today"
import { useGameStore } from "../../stores/useGameStore"
import { STEP } from "../../utils/motion"

/** The share picture as it grows: a line per check, a square per row. Doubles as the counter. */
export function Tally(): ReactElement {
  const checks = useGameStore(game => game.checks)
  const revealing = useGameStore(game => game.reveal !== null)
  return (
    <span id="tally" className="tally" aria-hidden="true" style={{ "--n": n }}>
      {Array.from({ length: MAX_CHECKS * n }, (_, j) => {
        const line = Math.floor(j / n)
        const found = checks[line]
        return (
          <i
            key={j}
            className={[
              found && (found[j % n] ? "g" : "x"),
              revealing && line === checks.length - 1 && "new",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ "--d": `${(j % n) * STEP}ms` }}
          />
        )
      })}
    </span>
  )
}
