// Regenerate favicon.ico (multi-res) + icon.png + apple-icon.png from
// the highest-res source. Uses sharp for resize + manual ICO assembly.
import sharp from 'sharp'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC = join(ROOT, 'public/favicon/ms-icon-310x310.png')
const APP = join(ROOT, 'src/app')
const FAV_DIR = join(ROOT, 'public/favicon')

// Build a multi-resolution .ico by embedding PNG payloads.
// ICO format: ICONDIR(6) + N * ICONDIRENTRY(16) + PNG bytes appended.
function buildIco(pngBuffers, sizes) {
  const count = pngBuffers.length
  const headerSize = 6 + 16 * count
  let offset = headerSize

  const dir = Buffer.alloc(headerSize)
  dir.writeUInt16LE(0, 0) // reserved
  dir.writeUInt16LE(1, 2) // type 1 = .ico
  dir.writeUInt16LE(count, 4)

  pngBuffers.forEach((png, i) => {
    const size = sizes[i]
    const entry = 6 + i * 16
    dir.writeUInt8(size >= 256 ? 0 : size, entry + 0) // width (0 = 256)
    dir.writeUInt8(size >= 256 ? 0 : size, entry + 1) // height
    dir.writeUInt8(0, entry + 2)                       // colors in palette
    dir.writeUInt8(0, entry + 3)                       // reserved
    dir.writeUInt16LE(1, entry + 4)                    // planes
    dir.writeUInt16LE(32, entry + 6)                   // bit count
    dir.writeUInt32LE(png.length, entry + 8)           // bytes in PNG
    dir.writeUInt32LE(offset, entry + 12)              // offset
    offset += png.length
  })

  return Buffer.concat([dir, ...pngBuffers])
}

async function makePng(srcBuf, size) {
  return sharp(srcBuf, { density: 600 })
    .resize(size, size, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
    .toBuffer()
}

async function main() {
  if (!existsSync(SRC)) throw new Error(`Source not found: ${SRC}`)
  const src = readFileSync(SRC)
  const meta = await sharp(src).metadata()
  console.log(`Source: ${meta.width}x${meta.height} ${meta.format}`)

  // .ico — multi resolution (16, 32, 48). Modern browsers pick 32 or 48 on HiDPI.
  const icoSizes = [16, 32, 48]
  const icoPngs = await Promise.all(icoSizes.map((s) => makePng(src, s)))
  const ico = buildIco(icoPngs, icoSizes)
  writeFileSync(join(APP, 'favicon.ico'), ico)
  console.log(`✓ src/app/favicon.ico (${icoSizes.join('/')}, ${ico.length} bytes)`)

  // Next.js App Router picks this up automatically and serves a sharp
  // PNG link in <head> alongside .ico. 512 = crisp on any device.
  const iconPng = await makePng(src, 512)
  writeFileSync(join(APP, 'icon.png'), iconPng)
  console.log(`✓ src/app/icon.png (512, ${iconPng.length} bytes)`)

  // Apple touch icon — spec recommends 180x180.
  const applePng = await makePng(src, 180)
  writeFileSync(join(APP, 'apple-icon.png'), applePng)
  console.log(`✓ src/app/apple-icon.png (180, ${applePng.length} bytes)`)

  // Regenerate public/favicon/* PNG variants for consistency
  // (older browser/manifest references).
  if (!existsSync(FAV_DIR)) mkdirSync(FAV_DIR, { recursive: true })
  const pubSizes = [
    ['favicon-16x16.png', 16],
    ['favicon-32x32.png', 32],
    ['favicon-96x96.png', 96],
    ['apple-icon-57x57.png', 57],
    ['apple-icon-60x60.png', 60],
    ['apple-icon-72x72.png', 72],
    ['apple-icon-76x76.png', 76],
    ['apple-icon-114x114.png', 114],
    ['apple-icon-120x120.png', 120],
    ['apple-icon-144x144.png', 144],
    ['apple-icon-152x152.png', 152],
    ['apple-icon-180x180.png', 180],
    ['apple-icon-precomposed.png', 192],
    ['android-icon-36x36.png', 36],
    ['android-icon-48x48.png', 48],
    ['android-icon-72x72.png', 72],
    ['android-icon-96x96.png', 96],
    ['android-icon-144x144.png', 144],
    ['android-icon-192x192.png', 192],
    ['ms-icon-70x70.png', 70],
    ['ms-icon-144x144.png', 144],
    ['ms-icon-150x150.png', 150],
    ['ms-icon-310x310.png', 310],
  ]
  for (const [name, size] of pubSizes) {
    const out = await makePng(src, size)
    writeFileSync(join(FAV_DIR, name), out)
  }
  console.log(`✓ public/favicon/* (${pubSizes.length} variants)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
