// The other names of the site send everything on to somdoku.nl.
import { describe, expect, it } from "vitest"
import { onRequest } from "../functions/_middleware"

const next = (): Promise<Response> => Promise.resolve(new Response("the page"))
const visit = async (url: string): Promise<Response> =>
  onRequest({ request: new Request(url), next })

describe("the other names of the site", () => {
  it.each([
    ["https://www.somdoku.nl/", "https://somdoku.nl/"],
    ["https://www.somdoku.nl/?a=1&b=2", "https://somdoku.nl/?a=1&b=2"],
    ["http://www.somdoku.nl/", "https://somdoku.nl/"],
    ["https://somdoku.pages.dev/", "https://somdoku.nl/"],
    ["https://somdoku.pages.dev/?a=1", "https://somdoku.nl/?a=1"],
  ])("send %s on to %s", async (from, to) => {
    const response = await visit(from)
    expect([response.status, response.headers.get("location")]).toEqual([301, to])
  })

  it.each([
    "https://somdoku.nl/?a=1",
    "https://19b585b2.somdoku.pages.dev/",
    "http://localhost:8788/",
  ])("leave %s alone", async url => {
    const response = await visit(url)
    expect(response.status).toBe(200)
    expect(await response.text()).toBe("the page")
  })
})
