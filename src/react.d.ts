import "react"

declare module "react" {
  // CSS custom properties in a style prop: the stylesheet reads --n, --d and friends.
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined
  }
}
