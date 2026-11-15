// What a phone needs to install the game as an app, and how it looks: a manifest the page points
// to, icons that exist and are the size they say, a light and a dark look, and a service worker.
import { describe, expect, it } from "vitest"
import { TICKS, solvedPattern } from "../src/utils/haptics"
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

  it("draws the small icons whole: scaled down from the large one, not cut from it", () => {
    const { scripts } = JSON.parse(read("package.json")) as { scripts: Record<string, string> }
    expect(scripts.icons).toContain("sips -z 192 192 public/icon-512.png --out public/icon-192.png")
    expect(scripts.icons).toContain(
      "sips -z 180 180 public/icon-512.png --out public/apple-touch-icon.png"
    )
    expect(scripts.icons).not.toMatch(/--window-size=(180|192),/)
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
    expect(manifest).toMatchObject({ background_color: "#15112A", theme_color: "#15112A" })
    const page = read("index.html")
    expect(page).toContain('<meta name="color-scheme" content="light dark">')
    expect(page).toContain(
      '<meta name="theme-color" content="#15112A" media="(prefers-color-scheme: dark)">'
    )
    // the bars take the colour of the page, in both looks
    const style = read("src/style.css")
    expect(style).toMatch(/:root\{\s*--bg:#F7F4FF;/)
    expect(style).toMatch(/prefers-color-scheme: dark\)\{\s*:root\{\s*--bg:#15112A;/)
    expect(page).toContain(
      '<meta name="theme-color" content="#F7F4FF" media="(prefers-color-scheme: light)">'
    )
    expect(style).toMatch(/html\{[^}]*background:var\(--bg\)/)
  })

  it("gives every digit the same tile while playing: a colour per digit only once the grid is solved", () => {
    // A colour for each digit would point out a digit that is in a line twice. So the colours of
    // the digits (--c, --e, --t) may only be used for decoration (the tiles on the start screen
    // and in the name) and for a cell of the finished grid.
    const style = read("src/style.css").replace(/\/\*[\s\S]*?\*\//g, "") // without the comments
    const rules = [...style.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(
      ([, selector = "", body = ""]) => ({ selector: selector.trim(), body })
    )
    const coloured = rules.filter(
      ({ selector, body }) => /var\(--[cet][,)]/.test(body) && !selector.startsWith("[data-v=")
    )
    expect(coloured.length).toBeGreaterThan(0)
    for (const { selector } of coloured) {
      expect(selector).toMatch(/^(\.cell\.ok\[data-v\]|\.hero i\[data-v\]|\.mark i\[data-v\])$/)
    }
    // a cell with a digit, a digit key and a digit in the row above a held cell are all the one tile
    expect(style).toContain(".cell[data-v]{background:var(--tile);color:var(--tile-ink);")
    expect(style).toContain(".key.digit{background:var(--tile);color:var(--tile-ink);")
    expect(style).toContain(".pick.digit{background:var(--tile);color:var(--tile-ink);")
  })

  it("points nothing out while playing: no red for a digit or a black cell too many in a line", () => {
    expect(read("src/style.css")).not.toMatch(/\.double|\.bad|danger/)
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

describe("the feel", () => {
  it("ticks under the finger: short pulses, heavier for black, and a rhythm when solved", () => {
    // every tick is short enough to feel like a tick, not a buzz
    for (const ms of Object.values(TICKS)) {
      expect(ms).toBeLessThanOrEqual(25)
    }
    expect(TICKS.erase).toBeLessThan(TICKS.tile)
    expect(TICKS.tile).toBeLessThan(TICKS.black)
    // solved: nothing until the first row is at its largest, a tick for every row in step with
    // the rows, a breath, and a longer one to end on
    const pattern = solvedPattern(5, 110)
    expect(pattern).toEqual([0, 200, 14, 96, 14, 96, 14, 96, 14, 96, 14, 180, 70])
    expect(pattern.length % 2).toBe(1) // ends on a pulse, not on a pause
  })

  it("asks for the motor only through the one place that knows where it can", () => {
    for (const [path, text] of sources()) {
      if (path !== "src/utils/haptics.ts") {
        expect(text, path).not.toMatch(/navigator\.vibrate/)
      }
    }
  })
})

describe("the choice", () => {
  it("offers nothing to choose: no practice puzzles, no sizes, nothing read from the address", () => {
    for (const [path, text] of sources()) {
      expect(text, path).not.toMatch(/location\.search|URLSearchParams|querystring/)
    }
  })
})
