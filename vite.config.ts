import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rolldownOptions: {
      // The service worker is its own entry, built to sw.js beside the page: a fixed name, since the
      // page registers it by name and a worker's scope is the folder it is served from.
      input: { index: "index.html", sw: "src/sw.ts" },
      output: {
        entryFileNames: chunk => (chunk.name === "sw" ? "sw.js" : "assets/[name]-[hash].js"),
      },
    },
  },
  test: {
    environment: "jsdom",
    // Node's own localStorage would stand in for jsdom's, and does nothing without a file
    execArgv: ["--no-experimental-webstorage"],
    setupFiles: ["test/setup.ts"],
  },
})
