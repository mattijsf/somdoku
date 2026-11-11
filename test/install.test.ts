// What a phone needs to install the game as an app: a manifest the page points to, with icons
// that exist and are the size they say.
import { describe, expect, it } from "vitest"
import { read, readBytes, sources } from "./files"

interface Manifest {
  icons: { src: string; sizes: string; purpose?: string }[]
}

const manifest = JSON.parse(read("public/manifest.webmanifest")) as Manifest
/** Width and height of a png, from its header. */
const size = (png: Buffer): string => `${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`

describe("the installable app", () => {
  it("is named by the page", () => {
    const page = read("index.html")
    expect(page).toContain('<link rel="manifest" href="./manifest.webmanifest">')
    expect(page).toContain('<link rel="apple-touch-icon" href="./apple-touch-icon.png">')
  })

  it("opens on the game itself, without the browser around it", () => {
    expect(manifest).toMatchObject({
      name: "Somdoku",
      start_url: "./",
      scope: "./",
      display: "standalone",
    })
  })

  it.each(manifest.icons)("has the icon $src at $sizes", ({ src, sizes }) => {
    expect(size(readBytes(`public/${src}`))).toBe(sizes)
  })

  it("has an icon for every use: a small one, a large one and one that may be cut to a shape", () => {
    expect(manifest.icons.map(icon => `${icon.sizes} ${icon.purpose ?? "any"}`).sort()).toEqual([
      "192x192 any",
      "512x512 any",
      "512x512 maskable",
    ])
    expect(size(readBytes("public/apple-touch-icon.png"))).toBe("180x180")
  })

  it("keeps working without a connection", () => {
    expect(read("src/app/registerServiceWorker.ts")).toContain(
      'navigator.serviceWorker.register("./sw.js")'
    )
    expect(read("src/sw.ts").length).toBeGreaterThan(0)
  })
})

describe("the choice", () => {
  it("offers nothing to choose: no practice puzzles, no sizes, nothing read from the address", () => {
    for (const [path, text] of sources()) {
      expect(text, path).not.toMatch(/location\.search|URLSearchParams|oefen|maat/)
    }
    expect(read("index.html")).not.toMatch(/oefen/)
  })
})
