/**
 * Keeps the game working without a connection (src/sw.ts, built to sw.js). Not while developing:
 * there a kept copy would only hide changes.
 */
export function registerServiceWorker(): void {
  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* the game works without it */
    })
  }
}
