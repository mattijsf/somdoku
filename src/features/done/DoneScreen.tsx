import { useEffect, useRef, useState, type ReactElement } from "react"
import { flushSync } from "react-dom"
import { useTranslation } from "react-i18next"
import { at } from "../../lib/at"
import { marks, shareText } from "../../lib/game"
import { n, name } from "../../stores/today"
import { useGameStore } from "../../stores/useGameStore"
import { ShareBubble } from "./ShareBubble"
import { shareScore } from "./shareScore"

/** The result: the score, the timeline as it will be shared, and the button to share it. */
export function DoneScreen(): ReactElement {
  const { t } = useTranslation()
  const finished = useGameStore(game => game.finished)
  const trail = useGameStore(game => game.trail)
  const result = useRef<HTMLPreElement>(null)
  const [copyByHand, setCopyByHand] = useState(false) // the clipboard said no: the text is shown to copy
  const [said, setSaid] = useState<"share" | "copied" | "copyAbove">("share") // what the share button says

  const { edits } = trail
  const text = shareText({ name, trail, n })
  const timeline = marks(trail)

  useEffect(() => {
    document.body.style.setProperty("--lines", String(Math.ceil(timeline.length / n)))
  }, [timeline.length])

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
          <h1 id="done-title">
            {edits === 0 ? t("done.flawless") : t("done.withEdits", { count: edits })}
          </h1>
          <ShareBubble head={at(text.split("\n"), 0)} trail={timeline} />
          <pre ref={result} id="result" className="result" hidden={!copyByHand}>
            {text}
          </pre>
          <button id="share" className="btn primary" type="button" onClick={() => void share()}>
            {t(`done.${said}`)}
          </button>
          <p id="done-note" className="hint">
            {t("done.tomorrow")}
          </p>
        </>
      )}
    </section>
  )
}
