import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { contrastRatio, mixOklab, parseColor } from './helpers/contrast.mjs'

const css = (path) => readFileSync(new URL(`../src/app/[locale]/(site)/${path}`, import.meta.url), 'utf8')
const readerCss = css('blog/reader.css')
const blogCss = css('blog/blog.css')
const notesCss = css('notes/notes.css')

/** Top-level rule blocks that declare all of the given custom properties. */
function tokenBlocks(source, names) {
  const blocks = []
  for (const match of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const tokens = {}
    for (const name of names) {
      const value = match[2].match(new RegExp(`--${name}:\\s*([^;]+);`))
      if (value) tokens[name] = value[1].replace(/\/\*.*?\*\//g, '').trim()
    }
    if (names.every((name) => tokens[name])) blocks.push({ selector: match[1].trim(), tokens })
  }
  return blocks
}

test('every reader material keeps meta text at 4.5:1 on its own backgrounds', () => {
  const materials = tokenBlocks(readerCss, ['reader-bg', 'reader-bg-muted', 'reader-fg-subtle'])
  assert.ok(materials.length >= 8, `expected 8 reader materials, found ${materials.length}`)
  for (const { selector, tokens } of materials) {
    const subtle = parseColor(tokens['reader-fg-subtle'])
    for (const bg of ['reader-bg', 'reader-bg-muted']) {
      const ratio = contrastRatio(subtle, parseColor(tokens[bg]))
      assert.ok(ratio >= 4.5, `${selector}: --reader-fg-subtle on --${bg} is ${ratio.toFixed(2)}`)
    }
  }
})

test('notes archive palette keeps faint and gilt text at 4.5:1 on paper', () => {
  const palettes = tokenBlocks(notesCss, ['paper', 'paper-2', 'ink-faint', 'gilt'])
  assert.ok(palettes.length >= 2)
  for (const { selector, tokens } of palettes) {
    for (const fg of ['ink-faint', 'gilt']) {
      for (const bg of ['paper', 'paper-2']) {
        const ratio = contrastRatio(parseColor(tokens[fg]), parseColor(tokens[bg]))
        assert.ok(ratio >= 4.5, `${selector}: --${fg} on --${bg} is ${ratio.toFixed(2)}`)
      }
    }
  }
})

test('accent ink stays text-safe for every accent family and notes topic', () => {
  const ink = blogCss.match(/--blog-accent-ink: color-mix\(in oklab, var\(--blog-accent\) (\d+)%, var\(--fg\)\)/)
  assert.ok(ink, 'blog.css derives --blog-accent-ink from --blog-accent and --fg')
  const share = Number(ink[1]) / 100
  const families = [...blogCss.matchAll(/--blog-accent: (#[0-9a-f]{6});/g)].map((m) => m[1])
  const topics = JSON.parse(
    readFileSync(new URL('../content/notes-data/_index.json', import.meta.url), 'utf8'),
  ).topics.map((topic) => topic.color)
  const accents = [...new Set([...families, ...topics])]
  assert.ok(families.length >= 5 && topics.length > 0)

  const light = { fg: 'oklch(20% 0.02 260)', bgs: ['oklch(98% 0.003 250)', 'oklch(95% 0.005 250)', '#eceff2'] }
  const dark = { fg: 'oklch(95% 0.005 250)', bgs: ['oklch(14% 0.012 260)', 'oklch(20% 0.015 260)'] }
  for (const accent of accents) {
    for (const theme of [light, dark]) {
      const color = mixOklab(parseColor(accent), share, parseColor(theme.fg))
      for (const bg of theme.bgs) {
        const ratio = contrastRatio(color, parseColor(bg))
        // 4.5:1 covers text and is well above the 3:1 focus-ring minimum.
        assert.ok(ratio >= 4.5, `${accent} ink on ${bg} is ${ratio.toFixed(2)}`)
      }
    }
  }
})

test('text and focus rings never use the bright accent directly', () => {
  for (const [name, source] of [['blog.css', blogCss], ['notes.css', notesCss]]) {
    assert.doesNotMatch(source, /(?:^|[\s;{])color: var\(--blog-accent\);/m, `${name} text uses the bright accent`)
    assert.doesNotMatch(source, /outline: [^;]*var\(--blog-accent\)[;\s]/, `${name} focus ring uses the bright accent`)
  }
  assert.doesNotMatch(blogCss, /\.blog-pager__page\.is-active \{[^}]*color: #fff/)
})
