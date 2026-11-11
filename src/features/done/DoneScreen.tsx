import { useEffect, useRef, useState, type ReactElement } from "react"
import { flushSync } from "react-dom"
import { useTranslation } from "react-i18next"
import { at } from "../../lib/at"
import { shareText } from "../../lib/game"
import { name } from "../../stores/today"
import { useGameStore } from "../../stores/useGameStore"
import { ShareBubble } from "./ShareBubble"
import { shareScore } from "./shareScore"

/** The result: the checks it took, and the score drawn as it will be shared. */
export function DoneScreen(): ReactElement {
  const { t } = useTranslation()
  const finished = useGameStore(game => game.finished)
  const checks = useGameStore(game => game.checks)
  const result = useRef<HTMLPreElement>(null)
  const [copyByHand, setCopyByHand] = useState(false) // the clipboard said no: the text is shown to copy
  const [said, setSaid] = useState<"share" | "copied" | "copyAbove">("share") // what the share button says

  const won = finished === "won"
  const used = checks.length
  const text = shareText({ name, checks, solved: won })

  useEffect(() => {
    document.body.style.setProperty("--lines", String(used))
  }, [used])

  let title = t("done.lost")
  if (won) {
    title = used === 1 ? t("done.firstCheck") : t("done.checks", { used })
  }
  const note = [won ? "" : t("done.solution"), t("done.tomorrow")].filter(Boolean).join(" ")

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
      flushSync(() => {
        setCopyByHand(true)
        setSaid("copyAbove")
      })
      if (result.current) {
        getSelection()?.selectAllChildren(result.current)
      }
    }
    setTimeout(() => setSaid("share"), 2500)
  }

  return (
    <section id="done" className="card">
      {finished && (
        <>
          <h1 id="done-title">{title}</h1>
          <ShareBubble head={at(text.split("\n"), 0)} checks={checks} />
          <pre ref={result} id="result" className="result" hidden={!copyByHand}>
            {text}
          </pre>
          <button id="share" className="btn primary" type="button" onClick={() => void share()}>
            {t(`done.${said}`)}
          </button>
          <p id="done-note" className="hint">
            {note}
          </p>
        </>
      )}
    </section>
  )
}
