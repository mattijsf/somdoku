import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"

const root = join(import.meta.dirname, "..")

/** A file of the project, by its path from the root. */
export const read = (path: string): string => readFileSync(join(root, path)).toString()

export const readBytes = (path: string): Buffer => readFileSync(join(root, path))

/** Every source file under src, as [path, text]. */
export const sources = (): [string, string][] =>
  readdirSync(join(root, "src"), { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && /\.(ts|tsx)$/.test(entry.name))
    .map(entry => {
      const path = relative(root, join(entry.parentPath, entry.name))
      return [path, read(path)]
    })
