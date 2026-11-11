import { Fragment, type CSSProperties, type ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { at } from "../../lib/at"
import { doubles, isFilled, spare, type Value } from "../../lib/game"
import { BLACK } from "../../lib/puzzle"
import { blacks, n, puzzle, rowOf } from "../../stores/today"
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
 * The grid with the sums beside it. What breaks a rule in plain sight shows in red: a digit twice
 * in a line, or more black cells than a line gets.
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
  const wrongIn = (line: readonly Value[]): Set<number> =>
    new Set([...doubles(line), ...spare(line, blacks)])
  const rowDoubles = Array.from({ length: n }, (_, r) => wrongIn(cells.slice(r * n, r * n + n)))
  const colDoubles = Array.from({ length: n }, (_, c) =>
    wrongIn(Array.from({ length: n }, (__, r) => at(cells, r * n + c)))
  )

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
                style={{ "--d": delay(r) }}
                className={classes(
                  "cell",
                  value === BLACK && "black",
                  done && "ok",
                  i === selected ? "sel" : inLine(r, c) && "near",
                  revealing && "pop",
                  i === tapped && "tap",
                  (at(rowDoubles, r).has(c) || at(colDoubles, c).has(r)) && "double"
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
