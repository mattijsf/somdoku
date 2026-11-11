// What a phone needs to install the game as an app, and how it looks: a manifest the page points
// to, icons that exist and are the size they say, a light and a dark look, and a service worker.
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
    expect(read("vite.config.ts")).toContain('chunk.name === "sw" ? "sw.js"')
  })
})

describe("the look", () => {
  it("gives the phone a colour for its bars that does not glare in the dark", () => {
    // The manifest has one colour for both looks; a light bar under a dark page is the worse of the two.
    expect(manifest).toMatchObject({ background_color: "#0E1A16", theme_color: "#0E1A16" })
    const page = read("index.html")
    expect(page).toContain('<meta name="color-scheme" content="light dark">')
    expect(page).toContain(
      '<meta name="theme-color" content="#0E1A16" media="(prefers-color-scheme: dark)">'
    )
    expect(read("src/style.css")).toMatch(/html\{[^}]*background:var\(--bg\)/)
  })

  it("starts with the puzzle out of sight, and has no clock to look at while playing", () => {
    const style = read("src/style.css")
    expect(style).toContain('body[data-view="ready"] #play') // the puzzle is not shown before Start
    expect(style).toContain('body:not([data-view="done"]) .count{display:none}')
  })

  it("draws every icon from one set, Lucide: no emoji, no loose glyphs, no drawn svg", () => {
    const page = [read("index.html"), read("src/style.css"), ...sources().map(([, text]) => text)]
    const shared = read("src/lib/game.ts") // the share text is text, for WhatsApp: emoji belong there
    for (const source of page.filter(text => text !== shared)) {
      expect(source).not.toMatch(/[\u2700-\u27BF\u{1F000}-\u{1FAFF}]/u) // dingbats and emoji
      expect(source).not.toMatch(/<svg/)
    }
    expect(sources().some(([, text]) => text.includes('from "lucide-react"'))).toBe(true)
  })
})

describe("the choice", () => {
  it("offers nothing to choose: no practice puzzles, no sizes, nothing read from the address", () => {
    for (const [path, text] of sources()) {
      expect(text, path).not.toMatch(/location\.search|URLSearchParams|querystring/)
    }
  })
})
