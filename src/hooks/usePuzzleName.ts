import { useTranslation } from "react-i18next"
import { BRAND, name, practice } from "../stores/today"

/** The puzzle's name, in the tab and the shared score: "Sommetje 12", or the practice puzzle's. */
export function usePuzzleName(): string {
  const { t } = useTranslation()
  return practice ? t("practiceName", { brand: BRAND, number: practice }) : name
}
