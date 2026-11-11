// Every word on screen comes in English and in Dutch.
import { describe, expect, it } from "vitest"
import { i18n } from "../src/i18n"
import english from "../src/locales/en/translations.json"
import dutch from "../src/locales/nl/translations.json"

/** Every key of a translations file, as a.b.c. */
const keysOf = (tree: object, prefix = ""): string[] =>
  Object.entries(tree).flatMap(([key, value]: [string, unknown]) =>
    typeof value === "object" && value !== null
      ? keysOf(value, `${prefix}${key}.`)
      : `${prefix}${key}`
  )

describe("the translations", () => {
  it("have the same keys in English and Dutch", () => {
    expect(keysOf(dutch).sort()).toEqual(keysOf(english).sort())
  })

  it("say the score in changes, one or more", () => {
    expect(i18n.t("edits", { count: 1, lng: "en" })).toBe("1 change")
    expect(i18n.t("edits", { count: 3, lng: "en" })).toBe("3 changes")
    expect(i18n.t("edits", { count: 1, lng: "nl" })).toBe("1 wijziging")
    expect(i18n.t("edits", { count: 3, lng: "nl" })).toBe("3 wijzigingen")
  })

  it("have no button to check with and no notes: the grid being right is the end", () => {
    const words = [english, dutch]
      .flatMap(tree => keysOf(tree).map(key => i18n.t(key as never)))
      .join(" ")
    expect(words).not.toMatch(/Controleer|Check\b|Cijfer\?|notes?\b/i)
  })

  it("fall back to English for a language the game does not speak", () => {
    expect(i18n.t("done.share", { lng: "fr" })).toBe("Share")
  })
})
