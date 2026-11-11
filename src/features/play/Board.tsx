import { Fragment, type ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { at } from "../../lib/at"
import { EMPTY, WHITE, doubles, type Value } from "../../lib/game"
import { BLACK } from "../../lib/puzzle"
import { n, puzzle, rowOf, solution } from "../../stores/today"
import { locked, useGameStore } from "../../stores/useGameStore"

const runs = Math.max(...puzzle.rows.map(clue => clue.length))

interface ClueLineProps {
  clue: readonly number[]
  className: string
}

function ClueLine({ clue, className }: ClueLineProps): ReactElement {
  return (
    <div className={className}>
      {clue.map((sum, j) => (
        <span key={j}>{sum}</span>
      ))}
    </div>
  )
}

const classes = (...names: (string | false | null | undefined)[]): string =>
  names.filter(Boolean).join(" ")

/**
 * The grid with the sums beside it. A digit that is in a line twice turns red; a row that a
 * check found right turns green and stays as it is.
 */
export function Board(): ReactElement {
  const { t } = useTranslation()
  const cells = useGameStore(game => game.cells)
  const checks = useGameStore(game => game.checks)
  const stale = useGameStore(game => game.stale)
  const finished = useGameStore(game => game.finished)
  const selected = useGameStore(game => game.selected)
  const select = useGameStore(game => game.select)

  const lost = finished === "lost"
  const shown: readonly Value[] = lost ? solution : cells // after a lost game the board shows the solution
  const last = checks.at(-1)
  const right = (r: number): boolean => locked({ checks }, r)
  const rowDoubles = Array.from({ length: n }, (_, r) => doubles(shown.slice(r * n, r * n + n)))
  const colDoubles = Array.from({ length: n }, (_, c) =>
    doubles(Array.from({ length: n }, (__, r) => at(shown, r * n + c)))
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
              right(r) && "ok",
              last !== undefined && !last[r] && !stale[r] && !finished && "bad",
              selected !== null && rowOf(selected) === r && "sel"
            )}
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
                className={classes(
                  "cell",
                  value === BLACK && "black",
                  value === WHITE && "white",
                  right(r) && "ok",
                  lost && cells[i] !== solution[i] && "missed",
                  i === selected ? "sel" : inLine(r, c) && "near",
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
