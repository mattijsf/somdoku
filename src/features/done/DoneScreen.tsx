import { useEffect, useRef, useState, type ReactElement } from "react"
import { flushSync } from "react-dom"
import { useTranslation } from "react-i18next"
import { at } from "../../lib/at"
import { clock, marks, shareText } from "../../lib/game"
import { n, name } from "../../stores/today"
import { useGameStore } from "../../stores/useGameStore"
import { useUiStore } from "../../stores/useUiStore"
import { ShareBubble } from "./ShareBubble"
import { shareScore } from "./shareScore"

/** The result: the time, the timeline as it will be shared, and the button to share it. */
export function DoneScreen(): ReactElement {
  const { t } = useTranslation()
  const finished = useGameStore(game => game.finished)
  const active = useGameStore(game => game.active)
  const trail = useGameStore(game => game.trail)
  const showToast = useUiStore(ui => ui.showToast)
  const result = useRef<HTMLPreElement>(null)
  const [copyByHand, setCopyByHand] = useState(false) // the clipboard said no: the text is shown to copy
  const [hint, setHint] = useState(false)

  const seconds = active / 1000
  const text = shareText({ name, seconds, trail, n })
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
    if (shared === "copied") {
      showToast(t("done.copied"))
    } else if (shared === "failed") {
      flushSync(() => {
        setCopyByHand(true)
        setHint(true)
      })
      if (result.current) {
        getSelection()?.selectAllChildren(result.current)
      }
      setTimeout(() => setHint(false), 2500)
    }
  }

  return (
    <section id="done" className="card">
      {finished && (
        <>
          <h1 id="done-title">{t("solvedIn", { time: clock(seconds) })}</h1>
          <ShareBubble head={at(text.split("\n"), 0)} trail={timeline} />
          {/* what the colours say, here where they are looked at, not in the rules */}
          <p className="hint colours">
            <span>
              <i className="g" />
              {t("done.firstGo")}
            </span>
            <span>
              <i className="y" />
              {t("done.changedLater")}
            </span>
          </p>
          <pre ref={result} id="result" className="result" hidden={!copyByHand}>
            {text}
          </pre>
          <button id="share" className="btn primary" type="button" onClick={() => void share()}>
            {hint ? t("done.copyAbove") : t("done.share")}
          </button>
          <p id="done-note" className="hint">
            {t("done.tomorrow")}
          </p>
        </>
      )}
    </section>
  )
}
