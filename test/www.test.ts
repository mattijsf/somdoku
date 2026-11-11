// The www address of the site sends everything on to somdoku.nl.
import { describe, expect, it } from "vitest"
import { onRequest } from "../functions/_middleware"

const next = (): Promise<Response> => Promise.resolve(new Response("the page"))
const visit = async (url: string): Promise<Response> =>
  onRequest({ request: new Request(url), next })

describe("the www address", () => {
  it.each([
    ["https://www.somdoku.nl/", "https://somdoku.nl/"],
    ["https://www.somdoku.nl/?oefen=3&maat=6", "https://somdoku.nl/?oefen=3&maat=6"],
    ["http://www.somdoku.nl/", "https://somdoku.nl/"],
  ])("sends %s on to %s", async (from, to) => {
    const response = await visit(from)
    expect([response.status, response.headers.get("location")]).toEqual([301, to])
  })

  it.each([
    "https://somdoku.nl/?oefen=3",
    "https://somdoku.pages.dev/",
    "https://19b585b2.somdoku.pages.dev/",
  ])("leaves %s alone", async url => {
    const response = await visit(url)
    expect(response.status).toBe(200)
    expect(await response.text()).toBe("the page")
  })
})
