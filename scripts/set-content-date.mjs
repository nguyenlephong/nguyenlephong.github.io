#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

function arg(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? null : process.argv[index + 1]
}

const surface = arg('--surface')
const slug = arg('--slug')
const date = arg('--date')

if (!['blog', 'notes'].includes(surface) || !slug || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) {
  console.error('Usage: node scripts/set-content-date.mjs --surface blog|notes --slug <slug> --date yyyy-mm-dd')
  process.exit(1)
}

const root = process.cwd()
const dataDir = path.join(root, 'public', surface === 'blog' ? 'blog-data' : 'notes-data')

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'))
}

async function writeJson(file, value) {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function pathExists(file) {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}

async function updateIndex(file) {
  if (!(await pathExists(file))) return false
  const json = await readJson(file)
  const post = json.posts?.find((item) => item.slug === slug)
  if (!post) return false
  post.date = date
  await writeJson(file, json)
  return true
}

async function updatePost(file) {
  if (!(await pathExists(file))) return false
  const json = await readJson(file)
  if (json.slug !== slug) return false
  json.date = date
  await writeJson(file, json)
  return true
}

let changed = 0
if (await updateIndex(path.join(dataDir, '_index.json'))) changed += 1
if (await updatePost(path.join(dataDir, 'posts', `${slug}.json`))) changed += 1

for (const entry of await fs.readdir(dataDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  if (entry.name === 'posts' || entry.name.startsWith('.')) continue
  const localeDir = path.join(dataDir, entry.name)
  if (await updateIndex(path.join(localeDir, '_index.json'))) changed += 1
  if (await updatePost(path.join(localeDir, 'posts', `${slug}.json`))) changed += 1
}

if (changed === 0) {
  console.error(`No ${surface} content found for slug: ${slug}`)
  process.exit(1)
}

console.log(`[set-content-date] ${surface}/${slug} -> ${date} (${changed} file(s))`)
