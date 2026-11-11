import js from "@eslint/js"
import type { ESLint } from "eslint"
import filenameExport from "eslint-plugin-filename-export"
import i18next from "eslint-plugin-i18next"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import { defineConfig } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

const reactRecommended = react.configs.flat.recommended
const reactJsxRuntime = react.configs.flat["jsx-runtime"]
if (!reactRecommended || !reactJsxRuntime) {
  throw new Error("eslint-plugin-react has no flat configs")
}
// The plugin's own types predate ESLint 9's; the rules work the same.
const filenameExportPlugin = filenameExport as unknown as ESLint.Plugin

export default defineConfig(
  { ignores: ["dist", "node_modules", ".wrangler", "art", "public"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    linterOptions: { reportUnusedDisableDirectives: "error" },
    rules: {
      eqeqeq: ["error", "always"],
      "no-console": "error",
      "no-nested-ternary": "error",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      reactRecommended,
      reactJsxRuntime,
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
      // every word on screen comes from the translations
      i18next.configs["flat/recommended"],
    ],
    languageOptions: { globals: globals.browser },
    settings: { react: { version: "detect" } },
    rules: {
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],
    },
  },
  {
    // a component, hook or store file is named after what it exports
    files: ["src/**/*.tsx", "src/**/use*.ts"],
    ignores: ["src/main.tsx"],
    plugins: { "filename-export": filenameExportPlugin },
    rules: {
      "filename-export/match-named-export": "error",
      "filename-export/match-default-export": "error",
    },
  },
  {
    // declaration merging needs an interface, even one with just an index signature
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
    },
  },
  { files: ["src/sw.ts"], languageOptions: { globals: globals.serviceworker } },
  { files: ["test/**/*.{ts,tsx}", "*.config.ts"], languageOptions: { globals: globals.node } },
  eslintPluginPrettierRecommended,
  // after eslint-config-prettier, which turns curly off
  { rules: { curly: ["error", "all"] } }
)
