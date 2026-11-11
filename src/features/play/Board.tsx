import { Fragment, type CSSProperties, type ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { at } from "../../lib/at"
import { EMPTY, WHITE, doubles, spare, type Value } from "../../lib/game"
import { BLACK } from "../../lib/puzzle"
import { blacks, k, n, puzzle, rowOf, solution } from "../../stores/today"
import { locked, useGameStore } from "../../stores/useGameStore"
import { STEP } from "../../utils/motion"

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
 * The grid with the sums beside it. What breaks a rule in plain sight turns red: a digit twice in
 * a line, or more black cells than a line gets. A row that a
 * check found right turns green and stays as it is. A check is shown row by row.
 */
export function Board(): ReactElement {
  const { t } = useTranslation()
  const cells = useGameStore(game => game.cells)
  const checks = useGameStore(game => game.checks)
  const stale = useGameStore(game => game.stale)
  const finished = useGameStore(game => game.finished)
  const selected = useGameStore(game => game.selected)
  const reveal = useGameStore(game => game.reveal)
  const tapped = useGameStore(game => game.tapped)
  const select = useGameStore(game => game.select)

  const lost = finished === "lost"
  const shown: readonly Value[] = lost ? solution : cells // after a lost game the board shows the solution
  const last = checks.at(-1)
  const right = (r: number): boolean => locked({ checks }, r)
  // What breaks a rule in plain sight: a digit twice in a line, or more black cells than a line gets.
  const wrongIn = (line: readonly Value[]): Set<number> =>
    new Set([...doubles(line), ...spare(line, blacks)])
  const rowDoubles = Array.from({ length: n }, (_, r) => wrongIn(shown.slice(r * n, r * n + n)))
  const colDoubles = Array.from({ length: n }, (_, c) =>
    wrongIn(Array.from({ length: n }, (__, r) => at(shown, r * n + c)))
  )

  const says = (value: Value): string => {
    if (value === EMPTY) {
      return t("board.empty")
    }
    if (value === WHITE) {
      return t("board.white")
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
    >
      {/* The corner says what goes in, as the booklet does at the top of the page: which digits,
          and how many black cells in every row and column. */}
      {blacks === null ? (
        <div />
      ) : (
        <div className="recipe" role="img" aria-label={t("board.recipe", { k, count: blacks })}>
          <span>{`1–${k}`}</span>
          <span>
            <i />
            {blacks}
          </span>
        </div>
      )}
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
              right(r) && "ok",
              last !== undefined && !last[r] && !stale[r] && !finished && "bad",
              selected !== null && rowOf(selected) === r && "sel",
              reveal?.[r]
            )}
            style={{ "--d": delay(r) }}
          />
          {Array.from({ length: n }, (_, c) => {
            const i = r * n + c
            const value = at(shown, i)
            const cell = { row: r + 1, col: c + 1, value: says(value) }
            return (
              <button
                key={c}
                type="button"
                data-i={i}
                style={{ "--d": delay(r) }}
                className={classes(
                  "cell",
                  value === BLACK && "black",
                  value === WHITE && "white",
                  right(r) && "ok",
                  lost && cells[i] !== solution[i] && "missed",
                  i === selected ? "sel" : inLine(r, c) && "near",
                  reveal?.[r],
                  i === tapped && "tap",
                  // a row known to be right is never the one at fault
                  !right(r) && (at(rowDoubles, r).has(c) || at(colDoubles, c).has(r)) && "double"
                )}
                aria-label={right(r) ? t("board.cellRight", cell) : t("board.cell", cell)}
                onClick={() => select(i)}
              >
                {value !== EMPTY && value > 0 ? value : ""}
              </button>
            )
          })}
        </Fragment>
      ))}
    </div>
  )
}
