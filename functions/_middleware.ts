// Cloudflare Pages middleware, runs before every page: the site has one address, somdoku.nl. Its
// www address sends everything on to it, so that one link goes round and a game in progress is
// found again (what is filled in is kept per address).
const HOME = "somdoku.nl"

/** What Cloudflare Pages hands a function: the request, and the rest of the chain. */
export interface PagesContext {
  request: Request
  next: () => Promise<Response>
}

export function onRequest({ request, next }: PagesContext): Response | Promise<Response> {
  const url = new URL(request.url)
  if (url.hostname !== `www.${HOME}`) {
    return next()
  }
  url.hostname = HOME
  url.protocol = "https:"
  return Response.redirect(url.toString(), 301)
}
