/** The item at `index`, for code that knows it is there. Throws instead of returning undefined. */
export function at<T>(items: ArrayLike<T>, index: number): T {
  const item = items[index]
  if (item === undefined) {
    throw new RangeError(`no item at ${index}`)
  }
  return item
}
