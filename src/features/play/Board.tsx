import { Fragment, type CSSProperties, type ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { isFilled, type Value } from "../../lib/game"
import { BLACK } from "../../lib/puzzle"
import { n, puzzle, rowOf } from "../../stores/today"
import { useGameStore } from "../../stores/useGameStore"
import { STEP } from "../../utils/motion"
import { holdCell, isSwallowing } from "./usePickerGestures"

const runs = Math.max(...puzzle.cols.map(clue => clue.length)) // lines of sums above the columns
const delay = (row: number): string => `${row * STEP}ms`

interface ClueLineProps {
  clue: readonly number[]
  className: string
  style?: CSSProperties
}

function ClueLine({ clue, className, style }: ClueLineProps): ReactElement {
  return (
    <div className={className} style={style}>
      {clue.map((sum, j) => (
        <span key={j}>{sum}</span>
      ))}
    </div>
  )
}

const classes = (...names: (string | false | null | undefined)[]): string =>
  names.filter(Boolean).join(" ")

/**
 * The grid with the sums beside it. Nothing is pointed out while playing, not even a digit that
 * is in a line twice: seeing that is part of the puzzle.
 */
export function Board(): ReactElement {
  const { t } = useTranslation()
  const cells = useGameStore(game => game.cells)
  const selected = useGameStore(game => game.selected)
  const tapped = useGameStore(game => game.tapped)
  const done = useGameStore(game => game.finished)
  const revealing = useGameStore(game => game.revealing)
  const select = useGameStore(game => game.select)

  const says = (value: Value): string => {
    if (!isFilled(value)) {
      return t("board.empty")
    }
    return value === BLACK ? t("board.black") : String(value)
  }
  const inLine = (r: number, c: number): boolean =>
    selected !== null && (rowOf(selected) === r || selected % n === c)

  return (
    <div
      id="board"
      className="board"
      role="grid"
      aria-label={t("board.label")}
      style={{ "--n": n, "--runs": runs }}
      // On a phone a long press may ask for a menu too: not here.
      onContextMenu={event => event.preventDefault()}
    >
      {/* the corner stays empty: every day has the same digits and one black cell */}
      <div />
      {puzzle.cols.map((clue, c) => (
        <ClueLine
          key={c}
          clue={clue}
          className={classes("clue col", selected !== null && selected % n === c && "sel")}
        />
      ))}
      {puzzle.rows.map((clue, r) => (
        <Fragment key={r}>
          <ClueLine
            clue={clue}
            className={classes(
              "clue row",
              done && "ok",
              selected !== null && rowOf(selected) === r && "sel",
              revealing && "pop"
            )}
            style={{ "--d": delay(r) }}
          />
          {Array.from({ length: n }, (_, c) => {
            const i = r * n + c
            const value = cells[i] ?? null
            const digit = isFilled(value) && value > 0
            return (
              <button
                key={c}
                type="button"
                data-i={i}
                // a digit makes the cell a tile; which digit only shows in colour once the grid is solved
                data-v={digit ? value : undefined}
                style={{ "--d": delay(r) }}
                className={classes(
                  "cell",
                  value === BLACK && "black",
                  done && "ok",
                  i === selected ? "sel" : inLine(r, c) && "near",
                  revealing && "pop",
                  i === tapped && "tap"
                )}
                aria-label={t("board.cell", { row: r + 1, col: c + 1, value: says(value) })}
                onPointerDown={event => holdCell(event, i)}
                onClick={() => {
                  if (!isSwallowing()) {
                    select(i)
                  }
                }}
              >
                {digit ? value : ""}
              </button>
            )
          })}
        </Fragment>
      ))}
    </div>
  )
}
