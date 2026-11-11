import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"
import englishTranslations from "./locales/en/translations.json"
import dutchTranslations from "./locales/nl/translations.json"

export const defaultNS = "translation"

export const resources = {
  en: { [defaultNS]: englishTranslations },
  nl: { [defaultNS]: dutchTranslations },
} as const

/** Keeps `<html lang>` on the language that renders: a screen reader takes its voice from it. */
function syncDocumentLanguage(): void {
  document.documentElement.lang = i18n.resolvedLanguage ?? "en"
}

void i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    // The browser's language only: there is nothing to choose, so nothing in the address or in
    // storage picks one.
    detection: { order: ["navigator"], caches: [] },
    fallbackLng: "en",
    supportedLngs: ["en", "nl"],
    nonExplicitSupportedLngs: true, // nl-NL and nl-BE are nl
    ns: [defaultNS],
    defaultNS,
    resources,
    initAsync: false, // the translations are bundled: ready before the first render
    returnEmptyString: false,
    interpolation: { escapeValue: false }, // React escapes
  })

syncDocumentLanguage()
i18n.on("languageChanged", syncDocumentLanguage)

export { i18n }
