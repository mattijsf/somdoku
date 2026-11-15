// What is felt under the finger. A web page gets little say over a phone's motor: on Android it
// may switch it on and off for a number of milliseconds, with no say over how hard; on an iPhone
// it may not touch it at all. So the feel has to come from timing: very short pulses, which a
// modern phone renders as a crisp tick rather than a buzz, a little longer for what is heavier,
// and a rhythm for the moment the grid is solved.

/** One pulse each, in ms. The differences are small on purpose: felt, not noticed. */
export const TICKS = {
  hold: 12, // a held cell lets go of its row of values
  step: 4, // the finger slides onto another value: a detent, as on a dial
  tile: 10, // a digit lands in a cell
  black: 22, // a black cell lands: heavier
  erase: 5, // a cell is emptied: lighter
} as const satisfies Record<string, number>
export type Tick = keyof typeof TICKS

/**
 * The grid is solved: a tick for every row as it bursts into colour, then a longer one to end on.
 * `step` is the time between one row and the next, `lead` the time until the first row is at its
 * largest. A pattern is on, off, on, off, …; it starts with nothing so the first tick can wait.
 */
export function solvedPattern(rows: number, step: number, lead = 200): number[] {
  const tick = 14
  const pattern = [0, lead]
  for (let row = 0; row < rows; row++) {
    pattern.push(tick, step - tick)
  }
  pattern[pattern.length - 1] = 180 // a breath after the last row
  pattern.push(70)
  return pattern
}

// An iPhone has no vibration for web pages, but it does tick when a switch is flipped. Flipping
// one that is not on the page gives that tick. It is one strength and one length, so on an
// iPhone every tick feels the same and the rhythm at the end is a single tick.
function switchTick(): void {
  const label = document.createElement("label")
  label.style.display = "none"
  label.setAttribute("aria-hidden", "true")
  const flip = label.appendChild(document.createElement("input"))
  flip.type = "checkbox"
  flip.setAttribute("switch", "")
  document.head.appendChild(label)
  label.click()
  label.remove()
}

/** Lets the phone tick, where it can: a name from TICKS, or a pattern of ms on and off. */
export function buzz(what: Tick | number[]): void {
  if (typeof navigator === "undefined") {
    return
  }
  // Not every browser has these, whatever the DOM types say: an iPhone has no vibrate.
  const nav: {
    vibrate?: (pattern: VibratePattern) => boolean
    userActivation?: UserActivation
    userAgent: string
  } = navigator
  // a page may not move the motor before it has been touched, and nothing here happens before that
  if (nav.userActivation?.hasBeenActive === false) {
    return
  }
  const pattern = typeof what === "string" ? TICKS[what] : what
  try {
    if (nav.vibrate) {
      nav.vibrate(pattern)
    } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      switchTick()
    }
  } catch {
    /* no motor, or not allowed: the game is the same without */
  }
}
