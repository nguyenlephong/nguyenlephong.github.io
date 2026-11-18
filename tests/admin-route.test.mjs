import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const read = (file) => readFileSync(file, 'utf8')

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(entryPath) : [entryPath]
  })
}

test('/admin is noindex, nofollow, without a social card or automatic pageview', () => {
  const page = read('src/app/admin/page.tsx')
  assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false/)
  assert.match(page, /googleBot:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/)
  assert.match(page, /openGraph:\s*null/)
  assert.match(page, /twitter:\s*null/)
  assert.match(page, /surface="admin"/)
  assert.doesNotMatch(page, /WebVitalsReporter|PageTracker/)

  const bootstrap = read('src/components/analytics/PostHogBootstrap.tsx')
  assert.match(bootstrap, /captureAutomaticPageLifecycle = surface === "cv"/)
})

test('/admin stays out of the sitemap and the site navigation', () => {
  assert.doesNotMatch(read('src/app/sitemap.ts'), /admin/i)
  const linked = walk('src')
    .filter((file) => /\.(?:ts|tsx)$/.test(file))
    .filter((file) => !file.startsWith(path.join('src', 'app', 'admin')) && !file.startsWith(path.join('src', 'components', 'admin')))
    .filter((file) => /["'`]\/admin["'`/]/.test(read(file)))
  assert.deepEqual(linked, [])
})

test('the gate compares a SHA-256 hash, tracks no secrets and keeps the session per tab', () => {
  const analytics = read('src/lib/analytics.ts')
  assert.match(analytics, /'admin_opened'/)
  assert.match(analytics, /'admin_login_failed'/)

  const gate = read('src/components/admin/AdminGate.tsx')
  for (const call of gate.match(/track\([^)]*\)/g) ?? []) {
    assert.doesNotMatch(call, /GATE_DIGEST|sha256|[{,]\s*password\b/i, call)
  }
  assert.match(gate, /const GATE_DIGEST = '[0-9a-f]{64}'/)
  assert.match(gate, /crypto\.subtle\.digest\('SHA-256'/)
  assert.match(gate, /curtain, not security/)
  assert.match(gate, /sessionStorage/)
  assert.doesNotMatch(gate, /localStorage\./)
  assert.match(gate, /import\('\.\/AdminDashboard'\)/)
})

test('the built export keeps /admin noindex and out of sitemap.xml', { skip: !existsSync('out/admin.html') && 'no static export in out/' }, () => {
  const html = read('out/admin.html')
  assert.match(html, /<meta name="robots" content="noindex, nofollow/)
  assert.doesNotMatch(html, /property="og:image"/)
  assert.doesNotMatch(read('out/sitemap.xml'), /\/admin/)
})
