#!/usr/bin/env node
// Guard for the profile-voice skill (AI/skills/profile-voice/SKILL.md).
// Scans CV/profile copy in messages/*.json, the profile OG cards and the other profile source surfaces
// for AI tells, em dashes, locale format slips and claims the evidence ledger contradicts.
// Usage: node scripts/verify-profile-voice.mjs [--json]
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const PROFILE_NAMESPACES = ['Hero', 'Sections', 'Summary', 'Experience', 'Projects', 'CTA', 'About', 'SEO', 'Author']
export const LOCALES = ['en', 'vi', 'fr', 'ja', 'ko', 'zh']

const EM_DASH_RULE = { id: 'em-dash', re: /—/, why: 'no em dashes anywhere' }

// Ledger (cv-evidence-inventory section 5): Zalo PC is 15M+ MAU; "80M+ MAU" is contradicted.
// The qualified "Zalo Android (~80M users)" experience line stays allowed.
const CLAIM_RULES = [
  {
    id: 'claim-80m-mau',
    re: /\b80\s?M\s?\+|\b80\s?M\s+MAU|\b80\s+(million|triệu)\+?\s+MAU/i,
    why: 'contradicted by the ledger; Zalo PC is 15M+ MAU',
  },
]

const ALL_LOCALE_RULES = [EM_DASH_RULE, ...CLAIM_RULES]

// The OG card has no room for a qualifier, so any 80M figure is out.
const OG_RULES = [{ id: 'og-80m', re: /\b80\s?(M\b|million|triệu)/i, why: 'OG card: use the Zalo PC 15M+ MAU figure' }]

// Profile surfaces outside messages/*.json: file -> rules on the raw text.
export const SOURCE_SURFACES = {
  'README.md': ALL_LOCALE_RULES,
  'src/lib/seo/profile-schema.ts': ALL_LOCALE_RULES,
  'src/content/experience.ts': ALL_LOCALE_RULES,
  'src/content/projects.ts': ALL_LOCALE_RULES,
  'src/content/profile.ts': ALL_LOCALE_RULES,
  'scripts/export-resume-data.mjs': ALL_LOCALE_RULES,
  'scripts/generate-resume-pdf.py': ALL_LOCALE_RULES,
  // Non-profile page alts here still use em dashes, so only the claim rules apply.
  'src/app/seo.config.ts': CLAIM_RULES,
}

const EN_RULES = [
  {
    id: 'en-ai-vocabulary',
    re: /\b(delv\w*|tapestry|testament|pivotal|crucial|intricate|showcas\w*|underscor\w*|leverag\w*|utiliz\w*|seamless\w*|robust|spearhead\w*|passionate|cutting-edge|world-class|best-in-class|invaluable|synerg\w*|game-?changer|results-driven|next-gen|ai-native|ai-powered)\b/i,
    why: 'AI-tell or hype vocabulary',
  },
  { id: 'en-filler', re: /\b(in order to|responsible for|worked on various)\b/i, why: 'filler phrase' },
  { id: 'en-not-only', re: /\bnot only\b[^.]*\bbut also\b/i, why: '"not only X but also Y" construction' },
  { id: 'en-format-narration', re: /\bone (line|sentence|row) each\b/i, why: 'label narrates its own layout; say what the list is' },
  { id: 'en-turn-into', re: /\bturn(s|ed|ing)? [^.]{1,60}\binto\b/i, why: '"turn X into Y" construction' },
]

const VI_RULES = [
  {
    id: 'vi-ai-phrasing',
    re: /(không chỉ[^.]*mà còn|trong bối cảnh|đóng vai trò|quý giá|vượt trội|một cách toàn diện|được thực hiện bởi|chịu trách nhiệm cho|trong khi vẫn|Liên hệ ngay|Đừng bỏ lỡ)/i,
    why: 'AI-tell or translated phrasing',
  },
  { id: 'vi-format-narration', re: /mỗi [^,.]{1,20} một (dòng|câu)/i, why: 'label tả format của chính nó; nói nội dung là gì' },
  { id: 'vi-en-thousands', re: /\d,\d{3}(?!\d)/, why: 'VI thousands use a dot (4.000), not a comma' },
  { id: 'vi-dollar-sign', re: /\$\d/, why: 'VI currency is written 500.000 USD, not $500,000' },
]

const MAX_BOLD_PER_STRING = 2

function* walk(value, keyPath) {
  if (typeof value === 'string') yield [keyPath, value]
  else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* walk(v, `${keyPath}[${i}]`)
  else if (value && typeof value === 'object')
    for (const [k, v] of Object.entries(value)) yield* walk(v, keyPath ? `${keyPath}.${k}` : k)
}

function localeRules(locale) {
  return [...ALL_LOCALE_RULES, ...(locale === 'en' ? EN_RULES : []), ...(locale === 'vi' ? VI_RULES : [])]
}

export function findViolations(messagesByLocale) {
  const out = []
  for (const [locale, messages] of Object.entries(messagesByLocale)) {
    const rules = localeRules(locale)
    for (const ns of PROFILE_NAMESPACES) {
      if (!messages[ns]) continue
      for (const [key, text] of walk(messages[ns], ns)) {
        for (const rule of rules) {
          const m = text.match(rule.re)
          if (m) out.push({ locale, key, rule: rule.id, match: m[0], why: rule.why })
        }
        const bolds = (text.match(/<b>/g) || []).length
        if (bolds > MAX_BOLD_PER_STRING)
          out.push({ locale, key, rule: 'bold-overuse', match: `${bolds} <b>`, why: `max ${MAX_BOLD_PER_STRING} bold spans` })
      }
    }
  }
  return out
}

// cardsByLocale: { en: PROFILE_OG_CONTENT, vi: PROFILE_OG_CONTENT_VI }
export function findCardViolations(cardsByLocale) {
  const out = []
  for (const [locale, card] of Object.entries(cardsByLocale)) {
    const rules = [...localeRules(locale), ...OG_RULES]
    for (const [key, text] of walk(card, `og.${locale}`))
      for (const rule of rules) {
        const m = text.match(rule.re)
        if (m) out.push({ locale, key, rule: rule.id, match: m[0], why: rule.why })
      }
  }
  return out
}

// textByFile: { 'README.md': '...' }, checked with SOURCE_SURFACES rules.
export function findSourceViolations(textByFile) {
  const out = []
  for (const [file, text] of Object.entries(textByFile))
    for (const rule of SOURCE_SURFACES[file] ?? ALL_LOCALE_RULES)
      for (const [i, line] of text.split('\n').entries()) {
        const m = line.match(rule.re)
        if (m) out.push({ locale: '-', key: `${file}:${i + 1}`, rule: rule.id, match: m[0], why: rule.why })
      }
  return out
}

export async function loadProfileOgCards() {
  const { PROFILE_OG_CONTENT, PROFILE_OG_CONTENT_VI } = await import('../src/app/_og/profile-og.ts')
  return { en: PROFILE_OG_CONTENT, vi: PROFILE_OG_CONTENT_VI }
}

export function loadSourceSurfaces() {
  return Object.fromEntries(
    Object.keys(SOURCE_SURFACES).map((f) => [f, readFileSync(path.join(root, f), 'utf8')]),
  )
}

function loadMessages() {
  return Object.fromEntries(
    LOCALES.map((l) => [l, JSON.parse(readFileSync(path.join(root, 'messages', `${l}.json`), 'utf8'))]),
  )
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const violations = [
    ...findViolations(loadMessages()),
    ...findCardViolations(await loadProfileOgCards()),
    ...findSourceViolations(loadSourceSurfaces()),
  ]
  if (process.argv.includes('--json')) console.log(JSON.stringify(violations, null, 2))
  else
    for (const v of violations) console.log(`${v.locale}  ${v.key}  [${v.rule}] "${v.match}"  ${v.why}`)
  console.log(`\n${violations.length} profile-voice violation(s)`)
  process.exit(violations.length ? 1 : 0)
}
