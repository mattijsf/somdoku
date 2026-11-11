import { useRef, useState, type ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { usePuzzleName } from "../../hooks/usePuzzleName"
import { shareText } from "../../lib/game"
import { practice, size } from "../../stores/today"
import { useGameStore } from "../../stores/useGameStore"
import { shareScore } from "./shareScore"

/** The result: the checks it took, the score as it will be shared, and another practice puzzle. */
export function DoneScreen(): ReactElement {
  const { t } = useTranslation()
  const finished = useGameStore(game => game.finished)
  const checks = useGameStore(game => game.checks)
  const name = usePuzzleName()
  const result = useRef<HTMLPreElement>(null)
  const [said, setSaid] = useState<"share" | "copied" | "copyAbove">("share") // what the share button says

  const won = finished === "won"
  const used = checks.length
  const text = shareText({ name, checks, solved: won })

  let title = t("done.lost")
  if (won) {
    title = used === 1 ? t("done.firstCheck") : t("done.checks", { used })
  }
  const note = [won ? "" : t("done.solution"), practice ? "" : t("done.tomorrow")]
    .filter(Boolean)
    .join(" ")
  const more = `./?oefen=${(practice ?? 0) + 1}${size !== 5 ? `&maat=${size}` : ""}`

  const share = async (): Promise<void> => {
    // the score, with the address of the game under it, except while trying it out on this computer
    const hosted = !["localhost", "127.0.0.1"].includes(location.hostname)
    const shared = await shareScore(
      text + (hosted ? `\n${location.origin}${location.pathname}` : "")
    )
    if (shared === "shared") {
      return
    }
    if (shared === "copied") {
      setSaid("copied")
    } else {
      if (result.current) {
        getSelection()?.selectAllChildren(result.current)
      }
      setSaid("copyAbove")
    }
    setTimeout(() => setSaid("share"), 2500)
  }

  return (
    <section id="done" className="card">
      {finished && (
        <>
          <h1 id="done-title">{title}</h1>
          <pre ref={result} id="result" className="result">
            {text}
          </pre>
          <button id="share" className="btn primary" type="button" onClick={() => void share()}>
            {t(`done.${said}`)}
          </button>
          <p id="done-note" className="hint">
            {note}
          </p>
          <a id="more" className="btn small" href={more}>
            {t("done.more")}
          </a>
        </>
      )}
    </section>
  )
}
