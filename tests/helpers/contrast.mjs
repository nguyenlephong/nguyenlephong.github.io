// WCAG contrast from CSS colour tokens (oklch(), #hex, oklab color-mix), no dependencies.

function toLinear(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function toGamma(x) {
  const c = Math.min(1, Math.max(0, x))
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
}

export function oklabToRgb([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(toGamma)
}

export function rgbToOklab(rgb) {
  const [r, g, b] = rgb.map(toLinear)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

/** Parses `oklch(58% 0.012 260)` or `#rrggbb` into sRGB 0..1. */
export function parseColor(value) {
  const text = value.trim()
  if (text.startsWith('#')) return [1, 3, 5].map((i) => parseInt(text.slice(i, i + 2), 16) / 255)
  const match = text.match(/^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)$/)
  if (!match) throw new Error(`Unsupported colour: ${value}`)
  const [L, C, H] = [Number(match[1]) / 100, Number(match[2]), (Number(match[3]) * Math.PI) / 180]
  return oklabToRgb([L, C * Math.cos(H), C * Math.sin(H)])
}

/** `color-mix(in oklab, a p%, b)` */
export function mixOklab(a, p, b) {
  const x = rgbToOklab(a)
  const y = rgbToOklab(b)
  return oklabToRgb(x.map((v, i) => v * p + y[i] * (1 - p)))
}

function luminance(rgb) {
  const [r, g, b] = rgb.map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a, b) {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

export function toHex(rgb) {
  return `#${rgb.map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('')}`
}
