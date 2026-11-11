import { useEffect, useRef, type ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { useUiStore } from "../../stores/useUiStore"
import { Rules } from "./Rules"

/** The rules, as a dialog: on the first visit, and behind the help button. */
export function RulesDialog(): ReactElement {
  const { t } = useTranslation()
  const open = useUiStore(ui => ui.rulesOpen)
  const closeRules = useUiStore(ui => ui.closeRules)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialog.current
    if (open && el && !el.open) {
      el.showModal()
    } else if (!open && el?.open) {
      el.close()
    }
  }, [open])

  return (
    <dialog ref={dialog} id="rules-dialog" onClose={closeRules}>
      <div className="card">
        <h2>{t("rules.title")}</h2>
        <div className="rules">
          <Rules />
        </div>
        <form method="dialog">
          <button className="btn primary">{t("rules.begin")}</button>
        </form>
      </div>
    </dialog>
  )
}
