import "@fontsource-variable/bricolage-grotesque"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./app/App"
import { registerServiceWorker } from "./app/registerServiceWorker"
import "./i18n"
import "./style.css"

const root = document.getElementById("root")
if (!root) {
  throw new Error("#root is missing")
}
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
registerServiceWorker()
