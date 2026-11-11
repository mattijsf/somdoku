// Somdoku's service worker: keeps the game working without a connection, which is also what lets
// a phone install it as an app. With a connection the page is always fetched fresh, so a new
// version arrives on the next visit; the copy kept here is only for when there is none.
// vite builds it to sw.js beside the page (vite.config.ts), under a name that does not change.
declare const self: ServiceWorkerGlobalScope

const CACHE = "somdoku-1"
const HOME = self.registration.scope // https://somdoku.nl/

/** The files a page names as ./..., as full addresses. */
const named = (html: string): string[] =>
  [...html.matchAll(/(?:src|href)="\.\/([^"?#]+)"/g)].map(match => HOME + (match[1] ?? ""))

/** Keeps the page and the files it names, and forgets the script and styles of earlier versions. */
async function keepPage(response: Response): Promise<void> {
  const cache = await caches.open(CACHE)
  const files = named(await response.clone().text())
  await cache.put(HOME, response)
  await Promise.all(
    files.map(
      async file =>
        (await cache.match(file)) ??
        cache.add(file).catch(() => {
          /* fetched again next time */
        })
    )
  )
  for (const request of await cache.keys()) {
    if (/\/assets\/[^/]+\.(js|css)$/.test(request.url) && !files.includes(request.url)) {
      await cache.delete(request)
    }
  }
}

async function keep(request: Request, response: Response): Promise<Response> {
  if (response.ok) {
    const cache = await caches.open(CACHE)
    void cache.put(request, response.clone()) // not waited for: the response goes out at once
  }
  return response
}

self.addEventListener("install", event => {
  event.waitUntil(
    fetch(HOME, { cache: "reload" })
      .then(async response => {
        if (response.ok) {
          await keepPage(response)
        }
      })
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(names =>
        Promise.all(names.filter(name => name !== CACHE).map(name => caches.delete(name)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", event => {
  const { request } = event
  if (request.method !== "GET" || !request.url.startsWith(HOME)) {
    return
  }
  const url = new URL(request.url)

  // The page, whatever comes after the ? (it is the same page): fresh if possible.
  if (request.mode === "navigate" && url.origin + url.pathname === HOME) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok && !response.redirected) {
            event.waitUntil(keepPage(response.clone()))
          }
          return response
        })
        .catch(async () => (await caches.match(HOME)) ?? Response.error())
    )
    return
  }

  // Script, styles and fonts carry their version in their name: a kept copy is always right.
  if (url.pathname.includes("/assets/")) {
    event.respondWith(
      caches
        .match(request)
        .then(kept => kept ?? fetch(request).then(response => keep(request, response)))
    )
    return
  }

  // Icons and the like keep their name when they change: fresh if possible, the kept copy otherwise.
  event.respondWith(
    fetch(request)
      .then(response => keep(request, response))
      .catch(async () => (await caches.match(request)) ?? Response.error())
  )
})
