/** What is kept under a key, parsed; null when there is nothing. Throws on storage or JSON errors. */
export function kept(key: string): unknown {
  const text = localStorage.getItem(key)
  return text === null ? null : JSON.parse(text)
}

export function store(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* private window: the game still works, it just isn't kept */
  }
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null
