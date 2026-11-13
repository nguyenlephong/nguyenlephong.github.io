import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')

// MEP-59: below 768px the canvas comes first and the board tools fold behind a disclosure.
test('mobile Studio flow routes put the canvas first behind a tracked, keyboard-operable disclosure', async () => {
  const [toolbar, chart, css, analytics] = await Promise.all([
    read('src/app/[locale]/studio/StudioFlowToolbar.tsx'),
    read('src/app/[locale]/studio/StudioFlowChart.tsx'),
    read('public/studio/studio-shadow.css'),
    read('src/lib/analytics.ts'),
  ])

  // A native button with aria-expanded and aria-controls is the disclosure (Enter and Space work).
  assert.match(toolbar, /<button\s+type="button"\s+className="flow-board-options-toggle"\s+aria-expanded=\{optionsOpen\}/)
  assert.match(toolbar, /aria-controls=\{hasSelectors \? "flow-example-options flow-canvas-options" : "flow-canvas-options"\}/)
  assert.match(toolbar, /id="flow-example-options"/)
  assert.match(toolbar, /id="flow-canvas-options"/)
  assert.match(chart, /track\("studio_flow_options_toggle", \{\s*flow_id: flow\.id,\s*view_id: selectedView\?\.id,\s*open_next: openNext\s*\}\)/)
  assert.match(analytics, /\| 'studio_flow_options_toggle'/)

  // Undo, redo, copy and paste are hidden on touch; the rest of the tools stay.
  assert.equal((toolbar.match(/className="flow-touch-hidden"/g) ?? []).length, 4)
  assert.match(css, /@media \(hover: none\) and \(pointer: coarse\) \{\s*\.flow-canvas-toolbar \.flow-touch-hidden \{\s*display: none;/)

  const mobile = css.slice(css.indexOf('/* MEP-59'))
  assert.match(mobile, /^\.flow-board-options-toggle \{\s*display: none;/m, 'desktop never shows the toggle')
  assert.match(mobile, /@media \(max-width: 767px\)/)
  assert.match(mobile, /\.flow-canvas-shell > \.flow-react-surface \{\s*order: 1;/)
  assert.match(mobile, /> \.flow-board-toolbar \{\s*order: 2;/)
  assert.match(mobile, /:not\(\.is-options-open\) > \.flow-canvas-toolbar \{\s*display: none;/)
  // Fullscreen keeps the original row order, which its grid template depends on.
  assert.match(mobile, /\.flow-chart-surface:not\(\.is-fullscreen\) \.flow-canvas-shell \{\s*display: contents;/)

  for (const locale of ['en', 'vi', 'fr', 'ja', 'ko', 'zh']) {
    const copy = JSON.parse(await read(`src/app/[locale]/studio/studio-shell-copy.${locale}.json`))
    assert.ok(copy.flows.diagramOptions?.trim(), locale)
  }
  assert.equal(JSON.parse(await read('src/app/[locale]/studio/studio-shell-copy.vi.json')).flows.diagramOptions, 'Tuỳ chọn sơ đồ')
})
