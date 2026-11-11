import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  base: "./",
  plugins: [react()],
  test: {
    environment: "jsdom",
    // Node's own localStorage would stand in for jsdom's, and does nothing without a file
    execArgv: ["--no-experimental-webstorage"],
    setupFiles: ["test/setup.ts"],
  },
})
