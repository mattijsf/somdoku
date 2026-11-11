import type { ReactElement } from "react"
import { marks } from "../../lib/game"
import { n } from "../../stores/today"
import { useGameStore } from "../../stores/useGameStore"
import { STEP } from "../../utils/motion"

/** The share picture as it grows: a square per cell, in the order they are filled. */
export function Tally(): ReactElement {
  const trail = marks(useGameStore(game => game.trail))
  const tapped = useGameStore(game => game.tapped)
  return (
    <span id="tally" className="tally" aria-hidden="true" style={{ "--n": n }}>
      {Array.from({ length: n * n }, (_, j) => (
        <i
          key={j}
          className={[trail[j], tapped !== null && j === trail.length - 1 && "new"]
            .filter(Boolean)
            .join(" ")}
          style={{ "--d": `${(j % n) * STEP}ms` }}
        />
      ))}
    </span>
  )
}
