import assert from 'node:assert/strict'
import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

import {
  applyContentSecurityPolicy,
  buildCspPolicy,
  hashSource,
  inlineScriptBodies,
  mergeFlightScripts,
  runtimeInlineScripts,
  verifyPageCsp,
} from '../scripts/lib/content-security-policy.mjs'
import { cspBuildOptions } from '../scripts/postbuild.mjs'

const FIXTURES = path.join(import.meta.dirname, 'fixtures', 'csp')
// Real pre-CSP pages from a static export: root redirect, global 404, Studio, and a blog article.
const FIXTURE_FILES = ['root-redirect.html', 'global-not-found.html', 'studio.html', 'blog-article.html']
const SEARCH_CONSOLE_TOKEN = 'google-site-verification: google0000000000000000.html'

function memoryIndex(entries) {
  const files = new Map(entries)
  return {
    files: () => [...files.keys()],
    readText: async (file) => files.get(file),
    write: async (file, content) => {
      files.set(file, String(content))
    },
    get: (file) => files.get(file),
  }
}

async function fixtureIndex() {
  const entries = await Promise.all(
    FIXTURE_FILES.map(async (file) => [file, await fs.readFile(path.join(FIXTURES, file), 'utf8')]),
  )
  return memoryIndex([...entries, ['google0000000000000000.html', SEARCH_CONSOLE_TOKEN]])
}

function policyOf(html) {
  return /<meta http-equiv="Content-Security-Policy" content="([^"]*)"\/>/.exec(html)?.[1] ?? ''
}

function flightPayload(html) {
  return [...html.matchAll(/self\.__next_f\.push\((\[[\s\S]*?\])\)(?=;|<\/script>)/g)].map((match) => match[1]).join('\n')
}

test('every fixture gets one CSP meta that hashes each inline script, including next/script sources', async () => {
  const index = await fixtureIndex()
  const result = await applyContentSecurityPolicy(index, { firestore: true })
  assert.equal(result.pages, FIXTURE_FILES.length)
  assert.deepEqual(result.runtimeIds, ['POSTHOG'])

  for (const file of FIXTURE_FILES) {
    const html = index.get(file)
    assert.deepEqual(verifyPageCsp(html), [], file)
    // The meta sits right after the charset, ahead of every script.
    assert.match(html, /^<!DOCTYPE html><html[^>]*><head><meta charSet="utf-8"\/><meta http-equiv="Content-Security-Policy"/, file)
    const policy = policyOf(html)
    const scriptSrc = policy.split('; ').find((directive) => directive.startsWith('script-src '))
    assert.doesNotMatch(scriptSrc, /unsafe-inline/, file)
    assert.doesNotMatch(policy, /unsafe-eval|unsafe-hashes|strict-dynamic/, file)
    for (const body of inlineScriptBodies(html)) assert.ok(policy.includes(hashSource(body)), `${file}: ${body.slice(0, 40)}`)
  }
})

test('PostHog lazyOnload source is hashed from the RSC payload, not only from <script> tags', async () => {
  const index = await fixtureIndex()
  await applyContentSecurityPolicy(index, {})
  for (const file of ['studio.html', 'global-not-found.html', 'blog-article.html']) {
    const html = index.get(file)
    const [posthog] = runtimeInlineScripts(html).filter((script) => script.id === 'POSTHOG')
    assert.ok(posthog, file)
    assert.match(posthog.source, /posthog\.init\('phc_/)
    assert.ok(!inlineScriptBodies(html).includes(posthog.source), `${file}: PostHog is injected at runtime`)
    assert.ok(policyOf(html).includes(hashSource(posthog.source)), file)
  }
  // The 404 registers surface "not_found", so its hash differs from the CV pages.
  const notFound = runtimeInlineScripts(index.get('global-not-found.html'))[0].source
  const studio = runtimeInlineScripts(index.get('studio.html'))[0].source
  assert.notEqual(hashSource(notFound), hashSource(studio))
  assert.ok(policyOf(index.get('root-redirect.html')).includes(hashSource('window.location.replace("/en");')))
})

test('JSON-LD data blocks are not hashed and adjacent RSC scripts merge without changing the payload', async () => {
  const original = await fs.readFile(path.join(FIXTURES, 'blog-article.html'), 'utf8')
  const merged = mergeFlightScripts(original)
  assert.equal(flightPayload(merged), flightPayload(original))
  assert.ok(inlineScriptBodies(merged).length <= 6, `${inlineScriptBodies(merged).length} inline scripts`)
  assert.ok(inlineScriptBodies(original).length > 20)

  const jsonLd = [...original.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => match[1])
  assert.ok(jsonLd.length > 0)
  const index = memoryIndex([['a.html', original]])
  await applyContentSecurityPolicy(index, {})
  for (const body of jsonLd) assert.ok(!policyOf(index.get('a.html')).includes(hashSource(body)))
})

test('the transform is idempotent and leaves files without <head> byte-exact', async () => {
  const index = await fixtureIndex()
  await applyContentSecurityPolicy(index, { firestore: true })
  const first = new Map(FIXTURE_FILES.map((file) => [file, index.get(file)]))
  await applyContentSecurityPolicy(index, { firestore: true })
  for (const file of FIXTURE_FILES) assert.equal(index.get(file), first.get(file), file)
  assert.equal(index.get('google0000000000000000.html'), SEARCH_CONSOLE_TOKEN)
})

test('verification fails on a missing hash, a missing meta, or a duplicate meta', async () => {
  const index = await fixtureIndex()
  await applyContentSecurityPolicy(index, {})
  const html = index.get('studio.html')
  const injected = html.replace('</body>', '<script>alert(1)</script></body>')
  assert.match(verifyPageCsp(injected).join('\n'), /inline script 'sha256-.*' is not in script-src: alert\(1\)/)
  const stripped = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '')
  assert.deepEqual(verifyPageCsp(stripped), ['expected exactly one CSP meta, found 0'])
  const doubled = html.replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="default-src 'self'"/>`)
  assert.deepEqual(verifyPageCsp(doubled), ['expected exactly one CSP meta, found 2'])
})

test('verification fails when a flight next/script is present but runtimeInlineScripts parses none', async () => {
  const index = await fixtureIndex()
  await applyContentSecurityPolicy(index, {})
  const html = index.get('studio.html')
  assert.equal(runtimeInlineScripts(html).length, 1)
  // Simulate an RSC format change: the client reference no longer reads "$L<id>".
  const drifted = html.replace(/\\"\$L([0-9a-f]+)\\",null,\{\\"id\\":\\"POSTHOG\\"/, (_, id) => `\\"$Z${id}\\",null,{\\"id\\":\\"POSTHOG\\"`)
  assert.notEqual(drifted, html)
  assert.deepEqual(runtimeInlineScripts(drifted), [])
  assert.match(verifyPageCsp(drifted).join('\n'), /inline next\/script that runtimeInlineScripts did not parse/)
})

test('the policy allows only the origins a build ships', () => {
  const base = buildCspPolicy({ hashes: [hashSource('x')] })
  assert.match(base, /script-src 'self' 'sha256-[^']+' https:\/\/us-assets\.i\.posthog\.com;/)
  assert.match(base, /connect-src 'self' https:\/\/us\.i\.posthog\.com https:\/\/us-assets\.i\.posthog\.com;/)
  assert.match(base, /frame-src 'none'/)
  assert.match(base, /object-src 'none'; base-uri 'self'; form-action 'self'$/)
  assert.doesNotMatch(base, /google|firestore|recaptcha/)

  const firestore = buildCspPolicy({ hashes: [], firestore: true })
  assert.match(firestore, /connect-src [^;]*https:\/\/firestore\.googleapis\.com/)
  assert.doesNotMatch(firestore, /recaptcha|googletagmanager|googlesyndication/)

  const appCheck = buildCspPolicy({ hashes: [], firestore: true, appCheck: true })
  assert.match(appCheck, /script-src [^;]*https:\/\/www\.google\.com\/recaptcha\//)
  assert.match(appCheck, /connect-src [^;]*https:\/\/content-firebaseappcheck\.googleapis\.com/)
  assert.match(appCheck, /frame-src https:\/\/www\.google\.com\/recaptcha\//)

  const google = buildCspPolicy({ hashes: [], googleThirdParty: true })
  assert.match(google, /script-src [^;]*https:\/\/www\.googletagmanager\.com [^;]*https:\/\/pagead2\.googlesyndication\.com/)
  assert.match(google, /connect-src [^;]*https:\/\/\*\.google-analytics\.com/)
  assert.match(google, /frame-src [^;]*https:\/\/googleads\.g\.doubleclick\.net/)
})

test('build options follow the Firebase env and the GOOGLE_THIRD_PARTY flag', () => {
  const firebase = {
    NEXT_PUBLIC_FIREBASE_API_KEY: 'k',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'p',
    NEXT_PUBLIC_FIREBASE_APP_ID: 'a',
  }
  assert.deepEqual(cspBuildOptions({}), { firestore: false, appCheck: false, googleThirdParty: false })
  assert.deepEqual(cspBuildOptions(firebase), { firestore: true, appCheck: false, googleThirdParty: false })
  assert.deepEqual(
    cspBuildOptions({ ...firebase, NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY: ' key ', GOOGLE_THIRD_PARTY: 'on' }),
    { firestore: true, appCheck: true, googleThirdParty: true },
  )
  assert.equal(cspBuildOptions({ NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY: 'key' }).appCheck, false)
})

test('browsers hash the parser-normalized source', () => {
  assert.equal(hashSource('a\r\nb\rc'), hashSource('a\nb\nc'))
  assert.equal(hashSource(''), "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='")
})

// AC (MEP-75): fail when any exported page carries an inline script without its hash.
// Skips when out/ is missing or predates the CSP step (no meta on the home page).
const OUT_DIR = process.env.CSP_OUT_DIR ?? path.join(import.meta.dirname, '..', 'out')
const outHasCsp = existsSync(path.join(OUT_DIR, 'en.html'))
  && (await fs.readFile(path.join(OUT_DIR, 'en.html'), 'utf8')).includes('http-equiv="Content-Security-Policy"')
test('every page in the built out/ hashes all of its inline scripts', { skip: !outHasCsp && 'out/ has no CSP build' }, async () => {
  const pages = (await fs.readdir(OUT_DIR, { recursive: true })).filter((file) => file.endsWith('.html') && !file.startsWith('_next'))
  const problems = []
  for (const file of pages) {
    const html = await fs.readFile(path.join(OUT_DIR, file), 'utf8')
    if (!/<head[\s>]/i.test(html)) continue
    for (const problem of verifyPageCsp(html)) problems.push(`${file}: ${problem}`)
  }
  assert.deepEqual(problems.slice(0, 20), [])
})
