import assert from 'node:assert/strict'
import { promises as fs, readFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'

import {
  CONTENT_IMAGE_SIZES,
  addResponsiveImageAttributes,
  responsiveSrcSet,
} from '../src/lib/assets/responsive-images.ts'
import { generateVariants, variantWidthsFor } from '../scripts/generate-icdn-variants.mjs'

const BASE = 'https://nguyenlephong.github.io/dom-pub/icdn'
const VARIANTS = {
  'blogs/post/map.webp': { width: 1600, height: 900, widths: [480, 800] },
}

test('srcset is added only for media with published variants', () => {
  assert.equal(
    responsiveSrcSet(`${BASE}/blogs/post/map.webp`, BASE, VARIANTS),
    `${BASE}/blogs/post/map-480w.webp 480w, ${BASE}/blogs/post/map-800w.webp 800w, ${BASE}/blogs/post/map.webp 1600w`,
  )
  assert.equal(responsiveSrcSet(`${BASE}/blogs/post/other.webp`, BASE, VARIANTS), null)
  assert.equal(responsiveSrcSet('https://elsewhere.test/blogs/post/map.webp', BASE, VARIANTS), null)
})

test('body images keep width, height and lazy loading and gain srcset and sizes', () => {
  const html =
    `<p>x</p><img src='${BASE}/blogs/post/map.webp' width='1600' height='900' loading='lazy' alt='Map' />` +
    `<img src="${BASE}/blogs/post/other.webp" alt="Other">` +
    `<img src="${BASE}/blogs/post/map.webp" srcset="custom.webp 1x" alt="Already set">`
  const output = addResponsiveImageAttributes(html, BASE, VARIANTS)
  assert.match(
    output,
    new RegExp(
      `<img src='${BASE}/blogs/post/map\\.webp' width='1600' height='900' loading='lazy' alt='Map' srcset="[^"]+-480w\\.webp 480w, [^"]+ 1600w" sizes="${CONTENT_IMAGE_SIZES.replace(/[()]/g, '\\$&')}" />`,
    ),
  )
  assert.match(output, /<img src="[^"]+other\.webp" alt="Other">/)
  assert.match(output, /srcset="custom\.webp 1x" alt="Already set">/)
  assert.equal(addResponsiveImageAttributes('<p>no images</p>', BASE, VARIANTS), '<p>no images</p>')
})

test('the committed variant manifest is well formed', () => {
  const manifest = JSON.parse(readFileSync('config/icdn-responsive-variants.json', 'utf8'))
  assert.equal(manifest.schemaVersion, 1)
  for (const [key, entry] of Object.entries(manifest.images)) {
    assert.match(key, /^(?:blogs|notes|gallery)\/.+\.webp$/)
    assert.deepEqual(entry.widths, variantWidthsFor(entry.width))
  }
})

test('variant generation writes smaller widths next to originals and lists them', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'icdn-variants-'))
  t.after(() => fs.rm(root, { recursive: true, force: true }))
  const icdnDir = path.join(root, 'icdn')
  const manifestPath = path.join(root, 'variants.json')
  await fs.mkdir(path.join(icdnDir, 'notes/post'), { recursive: true })
  await fs.mkdir(path.join(icdnDir, 'og'), { recursive: true })
  const image = (width) =>
    sharp({ create: { width, height: Math.round(width / 2), channels: 3, background: '#88aacc' } }).webp().toBuffer()
  await fs.writeFile(path.join(icdnDir, 'notes/post/wide.webp'), await image(1600))
  await fs.writeFile(path.join(icdnDir, 'notes/post/small.webp'), await image(400))
  await fs.writeFile(path.join(icdnDir, 'og/share.webp'), await image(1200))

  const { images } = await generateVariants({ icdnDir, manifestPath })
  assert.deepEqual(Object.keys(images), ['notes/post/wide.webp'])
  assert.deepEqual(images['notes/post/wide.webp'], { width: 1600, height: 800, widths: [480, 800] })
  assert.equal((await sharp(path.join(icdnDir, 'notes/post/wide-480w.webp')).metadata()).width, 480)
  assert.equal((await sharp(path.join(icdnDir, 'notes/post/wide-800w.webp')).metadata()).width, 800)

  // A second run does not treat variants as originals.
  const again = await generateVariants({ icdnDir, manifestPath })
  assert.equal(again.written, 0)
  assert.deepEqual(Object.keys(again.images), ['notes/post/wide.webp'])
})
