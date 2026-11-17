#!/usr/bin/env node
// Tone report for blog posts (AI/skills/blog-voice/SKILL.md). Counts AI-tell patterns per post and locale.
// Warn-only by default; --strict exits 1 when any post in scope breaks a hard ban (use with --slug per PR).
// Usage: node scripts/report-content-tone.mjs [--slug <slug>] [--locale en|vi] [--limit 30] [--json] [--strict]
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const LOCALE_DIRS = { en: 'content/blog-data/posts', vi: 'content/blog-data/vi/posts' }

// allow: hits tolerated per post before --strict fails. Infinity = informational only.
const SHARED_RULES = [{ id: 'em-dash', re: /—/g, allow: 0 }]

export const RULES = {
  en: [
    ...SHARED_RULES,
    {
      id: 'contrast',
      re: /\bnot (?:just|only|merely)\b[^.!?]{0,80}?\bbut\b|\b(?:it|this|that)(?:'s| is) not [^.!?]{1,60}?[,;] (?:it|this|that)(?:'s| is)\b|\bisn't (?:just |only )?[^.!?]{1,60}?[,;] (?:it|this|that)(?:'s| is)\b/gi,
      allow: 1,
    },
    { id: 'staged-opener', re: /\b(?:picture this|imagine this|let'?s dive|here'?s the thing|in today'?s fast-paced)\b/gi, allow: 0 },
    { id: 'mood-word', re: /\b(?:quiet(?:ly|er)?|calm(?:ly|er)?|gentl[ey])\b/gi, allow: 0 },
    {
      id: 'ai-vocabulary',
      re: /\b(?:delv\w*|tapestry|testament|pivotal|crucial|intricate|showcas\w*|underscor\w*|leverag\w*|seamless\w*|game-?changer)\b/gi,
      allow: 0,
    },
  ],
  vi: [
    ...SHARED_RULES,
    { id: 'contrast', re: /không phải(?! lúc nào)[^.!?]{0,80}?\smà(?!\p{L})|không chỉ[^.!?]{0,80}?\smà còn(?!\p{L})/giu, allow: 1 },
    { id: 'staged-opener', re: /hãy tưởng tượng|trong bối cảnh|có một điều/giu, allow: 0 },
    { id: 'mood-word', re: /lặng lẽ|âm thầm|bình tĩnh|nhẹ nhõm|chiêm nghiệm|hiện diện/giu, allow: 0 },
    { id: 'ai-vocabulary', re: /đóng vai trò (?:then chốt|quan trọng)/giu, allow: 0 },
    // "biến X thành Y" is a translation tic, but "biến" also means a code variable: report, never fail.
    { id: 'turn-into', re: /(?<!\p{L})biến [^.!?]{1,40}? thành(?!\p{L})/giu, allow: Infinity },
    { id: 'semicolon', re: /;/g, allow: Infinity },
  ],
}

// Visible prose only: code and markup are not voice.
export function extractText(html) {
  return html
    .replace(/<(pre|code|style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
}

export function analyzeText(text, locale) {
  const counts = {}
  for (const rule of RULES[locale]) {
    const n = (text.match(rule.re) || []).length
    if (n) counts[rule.id] = n
  }
  return counts
}

export function postText(post) {
  const faqs = (post.faqs || []).map((f) => `${f.q}. ${extractText(f.a)}`)
  return [post.title, post.summary, extractText(post.html || ''), ...faqs].filter(Boolean).join('\n')
}

export function violations(counts, locale) {
  return RULES[locale].filter((r) => (counts[r.id] || 0) > r.allow).map((r) => r.id)
}

function readPosts(locale, slug) {
  const dir = path.join(root, LOCALE_DIRS[locale])
  const files = slug ? [`${slug}.json`] : readdirSync(dir).filter((f) => f.endsWith('.json'))
  // Some locale overrides omit slug; the file name is the slug.
  return files.map((f) => ({ slug: f.slice(0, -5), ...JSON.parse(readFileSync(path.join(dir, f), 'utf8')) }))
}

export function buildReport({ slug, locales = Object.keys(LOCALE_DIRS) } = {}) {
  const rows = []
  for (const locale of locales) {
    for (const post of readPosts(locale, slug)) {
      const counts = analyzeText(postText(post), locale)
      const total = Object.entries(counts)
        .filter(([id]) => RULES[locale].find((r) => r.id === id).allow !== Infinity)
        .reduce((sum, [, n]) => sum + n, 0)
      rows.push({ slug: post.slug, locale, total, counts, violations: violations(counts, locale) })
    }
  }
  return rows.sort((a, b) => b.total - a.total)
}

function main(argv) {
  const arg = (name) => {
    const i = argv.indexOf(name)
    return i === -1 ? undefined : argv[i + 1]
  }
  const locale = arg('--locale')
  const rows = buildReport({ slug: arg('--slug'), locales: locale ? [locale] : undefined })
  const limit = Number(arg('--limit') || 30)

  if (argv.includes('--json')) {
    console.log(JSON.stringify(rows, null, 2))
  } else {
    const totals = {}
    for (const r of rows) for (const [id, n] of Object.entries(r.counts)) totals[`${r.locale}:${id}`] = (totals[`${r.locale}:${id}`] || 0) + n
    console.log(`Posts scanned: ${rows.length}. Posts breaking a hard ban: ${rows.filter((r) => r.violations.length).length}.`)
    console.log('Totals:', totals)
    for (const r of rows.slice(0, limit)) {
      const detail = Object.entries(r.counts).map(([id, n]) => `${id}=${n}`).join(' ')
      console.log(`${r.violations.length ? 'WARN' : 'ok  '} ${r.locale} ${r.slug} ${detail}`)
    }
  }
  if (argv.includes('--strict') && rows.some((r) => r.violations.length)) process.exitCode = 1
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main(process.argv.slice(2))
