import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const CACHE_DIR = path.join(process.cwd(), 'public', 'og-cache')

export function hashOgParams(params: Record<string, unknown>): string {
  return createHash('sha256')
    .update(JSON.stringify(params))
    .digest('hex')
    .slice(0, 16)
}

export function getCachedOg(key: string): Buffer | null {
  const file = path.join(CACHE_DIR, `${key}.png`)
  if (!fs.existsSync(file)) return null
  try {
    return fs.readFileSync(file)
  } catch {
    return null
  }
}

export async function saveOgCache(key: string, response: Response): Promise<void> {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
    const buffer = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync(path.join(CACHE_DIR, `${key}.png`), buffer)
  } catch {
    // non-fatal: next build will regenerate
  }
}

export function cachedOgResponse(buffer: Buffer): Response {
  return new Response(buffer, { headers: { 'content-type': 'image/png' } })
}
