import { createHash } from 'node:crypto'

/**
 * MEP-75: per-page, hash-based CSP delivered as <meta http-equiv>, because GitHub
 * Pages cannot send response headers. See specs/content-security-policy.md for the
 * policy, how every inline script is hashed, and what a meta CSP cannot cover.
 */

const CSP_META_SOURCE = String.raw`<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*>`
const cspMetas = (html) => [...html.matchAll(new RegExp(CSP_META_SOURCE, 'gi'))]

const POSTHOG_API_ORIGIN = 'https://us.i.posthog.com'
const POSTHOG_ASSETS_ORIGIN = 'https://us-assets.i.posthog.com'
const FIRESTORE_ORIGIN = 'https://firestore.googleapis.com'
const APP_CHECK_ORIGIN = 'https://content-firebaseappcheck.googleapis.com'
const RECAPTCHA_SOURCES = ['https://www.google.com/recaptcha/', 'https://www.gstatic.com/recaptcha/']
// GA4 + AdSense (GOOGLE_THIRD_PARTY=on only). Best effort: AdSense rotates hosts, so a
// flag-on build must be checked in a browser before it ships (see the spec).
const GOOGLE_SCRIPT_SOURCES = [
  'https://www.googletagmanager.com',
  'https://pagead2.googlesyndication.com',
  'https://*.googlesyndication.com',
  'https://*.adtrafficquality.google',
  'https://fundingchoicesmessages.google.com',
]
const GOOGLE_CONNECT_SOURCES = [
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
  'https://www.googletagmanager.com',
  'https://pagead2.googlesyndication.com',
  'https://*.adtrafficquality.google',
]
const GOOGLE_FRAME_SOURCES = [
  'https://googleads.g.doubleclick.net',
  'https://tpc.googlesyndication.com',
  'https://www.google.com',
  'https://*.adtrafficquality.google',
]

const EXECUTABLE_SCRIPT_TYPES = new Set([
  '',
  'module',
  'text/javascript',
  'application/javascript',
  'text/ecmascript',
  'application/ecmascript',
])
const SCRIPT_PATTERN = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi
// Consecutive attribute-less RSC chunks. A script body cannot contain "</script"
// (Next escapes "<" in flight data), so the lazy body stops at its own close tag.
const FLIGHT_RUN_PATTERN = /(?:<script>self\.__next_f\.push\(\[[\s\S]*?\]\)<\/script>){2,}/g
const FLIGHT_PUSH_PATTERN = /self\.__next_f\.push\((\[1,"(?:[^"\\]|\\.)*"\])\)/g
const TEXT_ROW_PATTERN = /(?:^|\n)([0-9a-f]+):T([0-9a-f]+),/g
// A client component (next/script) whose props carry inline source; earlier props are scalars.
const RUNTIME_SCRIPT_PATTERN =
  /\["\$","\$L[0-9a-f]+",(?:null|"(?:[^"\\]|\\.)*"),\{((?:"[A-Za-z]+":(?:"(?:[^"\\]|\\.)*"|true|false|null|-?\d+),)*)"dangerouslySetInnerHTML":\{"__html":("(?:[^"\\]|\\.)*")\}/g

// Any element with a next/script strategy next to inline source, whatever the element
// reference looks like. Catches RSC format drift that RUNTIME_SCRIPT_PATTERN would miss.
const NEXT_SCRIPT_STRATEGY = String.raw`"strategy":"(?:afterInteractive|lazyOnload|beforeInteractive|worker)"`
const INLINE_HTML_PROP = String.raw`"dangerouslySetInnerHTML":\{"__html":"(?:[^"\\]|\\.)*"\}`
const FLIGHT_NEXT_SCRIPT_PATTERN = new RegExp(
  `${NEXT_SCRIPT_STRATEGY}[^{}\\[\\]]*${INLINE_HTML_PROP}|${INLINE_HTML_PROP}[^{}\\[\\]]*${NEXT_SCRIPT_STRATEGY}`,
)

function attributeValue(attributes, name) {
  const match = attributes.match(
    new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'),
  )
  return match ? (match[1] ?? match[2] ?? match[3] ?? '') : null
}

function isExecutableInline(attributes) {
  if (attributeValue(attributes, 'src') !== null) return false
  const type = (attributeValue(attributes, 'type') ?? '').trim().toLowerCase()
  return EXECUTABLE_SCRIPT_TYPES.has(type)
}

// Browsers hash the element text after the HTML parser normalizes newlines.
function normalizeNewlines(source) {
  return source.replace(/\r\n?/g, '\n')
}


// Plain code-unit order: deterministic, and identical to Array#sort's default.
const byCodeUnit = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

export function hashSource(source) {
  const digest = createHash('sha256').update(normalizeNewlines(source), 'utf8').digest('base64')
  return `'sha256-${digest}'`
}

/** Bodies of every inline script the browser would execute (JSON-LD and other data blocks excluded). */
export function inlineScriptBodies(html) {
  const bodies = []
  for (const match of html.matchAll(SCRIPT_PATTERN)) {
    if (isExecutableInline(match[1])) bodies.push(match[2])
  }
  return bodies
}

/**
 * Join each run of adjacent RSC push scripts into one script so a page needs a
 * handful of hashes instead of ~40. Execution order and content are unchanged.
 */
export function mergeFlightScripts(html) {
  return html.replace(FLIGHT_RUN_PATTERN, (run) => {
    const bodies = [...run.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1])
    return `<script>${bodies.join(';')}</script>`
  })
}

function flightText(html) {
  let text = ''
  for (const body of inlineScriptBodies(html)) {
    for (const match of body.matchAll(FLIGHT_PUSH_PATTERN)) text += JSON.parse(match[1])[1]
  }
  return text
}

function textRows(flight) {
  const rows = new Map()
  for (const match of flight.matchAll(TEXT_ROW_PATTERN)) {
    const start = match.index + match[0].length
    const bytes = Buffer.from(flight.slice(start), 'utf8').subarray(0, Number.parseInt(match[2], 16))
    rows.set(match[1], bytes.toString('utf8'))
  }
  return rows
}

function resolveFlightString(value, rows) {
  if (value.startsWith('$$')) return value.slice(1)
  if (!value.startsWith('$')) return value
  const row = /^\$([0-9a-f]+)$/.exec(value)
  if (!row) return null
  if (!rows.has(row[1])) throw new Error(`[csp] unresolved inline script reference ${value}`)
  return rows.get(row[1])
}

/**
 * Inline sources that next/script injects after load (strategy afterInteractive or
 * lazyOnload). They are not <script> tags in the HTML, only props in the RSC payload,
 * but the browser still checks them against script-src when they are inserted.
 */
export function runtimeInlineScripts(html) {
  const flight = flightText(html)
  if (!flight) return []
  const rows = textRows(flight)
  const scripts = []
  for (const match of flight.matchAll(RUNTIME_SCRIPT_PATTERN)) {
    const props = JSON.parse(`{${match[1].replace(/,$/, '')}}`)
    if (!EXECUTABLE_SCRIPT_TYPES.has(String(props.type ?? '').toLowerCase())) continue
    const source = resolveFlightString(JSON.parse(match[2]), rows)
    if (source) scripts.push({ id: props.id ?? null, source })
  }
  return scripts
}

function unique(values) {
  return [...new Set(values)]
}

/** Origins and features that change per build; everything else in the policy is fixed. */
export function buildCspPolicy({
  hashes,
  firestore = false,
  appCheck = false,
  googleThirdParty = false,
}) {
  const scriptSrc = ["'self'", ...unique(hashes).sort(byCodeUnit), POSTHOG_ASSETS_ORIGIN]
  const connectSrc = ["'self'", POSTHOG_API_ORIGIN, POSTHOG_ASSETS_ORIGIN]
  const frameSrc = []
  if (firestore) connectSrc.push(FIRESTORE_ORIGIN)
  if (appCheck) {
    scriptSrc.push(...RECAPTCHA_SOURCES)
    connectSrc.push(APP_CHECK_ORIGIN, ...RECAPTCHA_SOURCES)
    frameSrc.push(...RECAPTCHA_SOURCES)
  }
  if (googleThirdParty) {
    scriptSrc.push(...GOOGLE_SCRIPT_SOURCES)
    connectSrc.push(...GOOGLE_CONNECT_SOURCES)
    frameSrc.push(...GOOGLE_FRAME_SOURCES)
  }

  return [
    "default-src 'self'",
    `script-src ${unique(scriptSrc).join(' ')}`,
    `connect-src ${unique(connectSrc).join(' ')}`,
    "img-src 'self' data: blob: https:",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    `frame-src ${frameSrc.length ? unique(frameSrc).join(' ') : "'none'"}`,
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

/** Drop a meta from an earlier run so the transform is idempotent. */
export function stripCspMeta(html) {
  return html.replace(new RegExp(CSP_META_SOURCE, 'gi'), '')
}

/**
 * Insert the meta before anything the policy must govern: right after <head> and its
 * charset (which must stay in the first 1024 bytes). Null when the file has no <head>.
 */
export function injectCspMeta(html, policy) {
  if (cspMetas(html).length) throw new Error('[csp] page already carries a CSP meta')
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy}"/>`
  const head = /<head(?:\s[^>]*)?>(\s*<meta\s+charset=["']?utf-8["']?\s*\/?>)?/i.exec(html)
  if (!head) return null
  const at = head.index + head[0].length
  return html.slice(0, at) + meta + html.slice(at)
}

/**
 * Hashes a page needs: its own inline scripts and next/script sources, plus the
 * next/script sources of any id the page lacks. A meta policy stays fixed across
 * client-side navigation, so a page must also allow a next/script another route
 * mounts later (for example GA's inline config when the flag is on). Ids the page
 * already has are skipped: next/script runs each id once per document.
 */
export function pageScriptHashes(page, runtimeById) {
  const ownIds = new Set(page.runtime.map((script) => script.id).filter(Boolean))
  const sources = [...page.inline, ...page.runtime.map((script) => script.source)]
  for (const [id, idSources] of runtimeById) {
    if (!ownIds.has(id)) sources.push(...idSources)
  }
  return unique(sources.map(hashSource))
}

export function analyzePage(html) {
  return { inline: inlineScriptBodies(html), runtime: runtimeInlineScripts(html) }
}

export function collectRuntimeById(pages) {
  const byId = new Map()
  for (const page of pages) {
    for (const script of page.runtime) {
      if (!script.id) continue
      if (!byId.has(script.id)) byId.set(script.id, new Set())
      byId.get(script.id).add(script.source)
    }
  }
  return new Map([...byId].map(([id, sources]) => [id, [...sources]]))
}

function policyScriptHashes(policy) {
  const scriptSrc = policy.split(';').map((part) => part.trim()).find((part) => part.startsWith('script-src '))
  return new Set(scriptSrc?.match(/'sha256-[A-Za-z0-9+/=]+'/g) ?? [])
}

/** Problems with one exported page: missing or duplicate meta, or an inline script without its hash. */
export function verifyPageCsp(html) {
  const metas = cspMetas(html)
  if (metas.length !== 1) return [`expected exactly one CSP meta, found ${metas.length}`]
  const policy = /content="([^"]*)"/.exec(metas[0][0])?.[1] ?? ''
  const allowed = policyScriptHashes(policy)
  const problems = []
  const runtime = runtimeInlineScripts(html)
  if (!runtime.length && FLIGHT_NEXT_SCRIPT_PATTERN.test(flightText(html))) {
    problems.push('the RSC payload carries an inline next/script that runtimeInlineScripts did not parse')
  }
  const sources = [...inlineScriptBodies(html), ...runtime.map((script) => script.source)]
  for (const source of sources) {
    const hash = hashSource(source)
    if (!allowed.has(hash)) problems.push(`inline script ${hash} is not in script-src: ${source.slice(0, 60)}`)
  }
  const firstScript = html.search(/<script\b/i)
  if (firstScript !== -1 && firstScript < metas[0].index) problems.push('a script precedes the CSP meta')
  return problems
}

/**
 * Postbuild step: merge RSC scripts, hash every inline source, inject one meta per
 * page, and fail the build if any page would block one of its own scripts.
 * Runs after the OG rewrite (which edits flight data) and before the offline step
 * (which fingerprints the final HTML).
 */
export async function applyContentSecurityPolicy(artifactIndex, options = {}) {
  const htmlFiles = artifactIndex
    .files()
    .filter((file) => file.endsWith('.html'))
    .sort(byCodeUnit)
  const pages = []
  const prepare = async (file) => mergeFlightScripts(stripCspMeta(await artifactIndex.readText(file)))
  for (const file of htmlFiles) {
    const html = await prepare(file)
    // Plain files such as the Search Console token have no <head> and must stay byte-exact.
    if (!/<head[\s>]/i.test(html)) continue
    pages.push({ file, ...analyzePage(html) })
  }

  const runtimeById = collectRuntimeById(pages)
  let hashes = 0
  for (const page of pages) {
    const pageHashes = pageScriptHashes(page, runtimeById)
    hashes = Math.max(hashes, pageHashes.length)
    const html = injectCspMeta(await prepare(page.file), buildCspPolicy({ ...options, hashes: pageHashes }))
    if (html === null) throw new Error(`[csp] ${page.file}: no <head> to carry the policy`)
    const problems = verifyPageCsp(html)
    if (problems.length) throw new Error(`[csp] ${page.file}: ${problems.join('; ')}`)
    await artifactIndex.write(page.file, html)
  }
  return { pages: pages.length, maxHashes: hashes, runtimeIds: [...runtimeById.keys()].sort(byCodeUnit) }
}
