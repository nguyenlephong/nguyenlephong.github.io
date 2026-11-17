#!/usr/bin/env node
// Copies title, summary, readingMinutes and tags from blog post bodies into the _index.json files,
// so rewriters only edit content/blog-data/{,vi/}posts/<slug>.json. Locales still on the old
// translation (LEGACY_LOCALES) keep their own reading time: the override gets the index value pinned.
// Usage: node scripts/sync-blog-index-metadata.mjs [--check]
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'content/blog-data')
export const SYNCED_FIELDS = ['title', 'summary', 'readingMinutes', 'tags']
export const LEGACY_LOCALES = ['zh', 'ja', 'ko', 'fr']

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// Returns { index, overrides } changes for one locale; pure so it can be tested.
export function planLocale(locale, indexPosts, baseBySlug, overrideBySlug) {
  const indexUpdates = []
  const overrideUpdates = []
  for (const entry of indexPosts) {
    const base = baseBySlug[entry.slug]
    const override = locale === 'en' ? {} : overrideBySlug[entry.slug]
    if (!base || !override) continue
    if (LEGACY_LOCALES.includes(locale)) {
      if (override.readingMinutes === undefined && 'readingMinutes' in entry && entry.readingMinutes !== base.readingMinutes) {
        overrideUpdates.push({ slug: entry.slug, readingMinutes: entry.readingMinutes })
      }
      continue
    }
    const merged = Object.fromEntries(SYNCED_FIELDS.map((f) => [f, override[f] ?? base[f]]))
    // A field the index omits is inherited by the loader, so only fields the index carries are synced.
    const changed = SYNCED_FIELDS.filter((f) => f in entry && merged[f] !== undefined && !same(entry[f], merged[f]))
    if (changed.length) indexUpdates.push({ slug: entry.slug, fields: Object.fromEntries(changed.map((f) => [f, merged[f]])) })
  }
  return { indexUpdates, overrideUpdates }
}

function main(check) {
  const enIndex = readJson(path.join(root, '_index.json'))
  const baseBySlug = Object.fromEntries(
    enIndex.posts.map((p) => [p.slug, readJson(path.join(root, 'posts', `${p.slug}.json`))]),
  )
  let pending = 0
  for (const locale of ['en', 'vi', ...LEGACY_LOCALES]) {
    const dir = locale === 'en' ? root : path.join(root, locale)
    const indexFile = path.join(dir, '_index.json')
    if (!existsSync(indexFile)) continue
    const index = readJson(indexFile)
    const overrideBySlug = {}
    if (locale !== 'en') {
      for (const p of index.posts) {
        const file = path.join(dir, 'posts', `${p.slug}.json`)
        if (existsSync(file)) overrideBySlug[p.slug] = readJson(file)
      }
    }
    const { indexUpdates, overrideUpdates } = planLocale(locale, index.posts, baseBySlug, overrideBySlug)
    pending += indexUpdates.length + overrideUpdates.length
    for (const u of indexUpdates) console.log(`${locale} index ${u.slug}: ${Object.keys(u.fields).join(', ')}`)
    for (const u of overrideUpdates) console.log(`${locale} override ${u.slug}: pin readingMinutes=${u.readingMinutes}`)
    if (check) continue
    if (indexUpdates.length) {
      const bySlug = new Map(indexUpdates.map((u) => [u.slug, u.fields]))
      index.posts = index.posts.map((p) => (bySlug.has(p.slug) ? { ...p, ...bySlug.get(p.slug) } : p))
      writeFileSync(indexFile, JSON.stringify(index, null, 2) + '\n')
    }
    for (const u of overrideUpdates) {
      const file = path.join(dir, 'posts', `${u.slug}.json`)
      // Insert after "date" to keep the field order used by the other overrides.
      const entries = Object.entries(overrideBySlug[u.slug]).flatMap(([k, v]) =>
        k === 'date' ? [[k, v], ['readingMinutes', u.readingMinutes]] : [[k, v]],
      )
      writeFileSync(file, JSON.stringify(Object.fromEntries(entries), null, 2) + '\n')
    }
  }
  console.log(check ? `${pending} change(s) pending` : `${pending} change(s) written`)
  if (check && pending) process.exitCode = 1
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main(process.argv.includes('--check'))
