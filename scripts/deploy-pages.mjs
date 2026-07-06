#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'out')
const CACHE_DIR = path.join(ROOT, '.cache')
const INDEX_FILE = path.join(CACHE_DIR, 'deploy-pages.index')
const REMOTE = process.env.PAGES_REMOTE ?? 'origin'
const BRANCH = process.env.PAGES_BRANCH ?? 'gh-pages'
const COMMIT_MESSAGE =
  process.env.PAGES_COMMIT_MESSAGE ?? `deploy: update GitHub Pages (${new Date().toISOString()})`

function run(command, args, options = {}) {
  console.log(`$ ${[command, ...args].join(' ')}`)
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? ROOT,
    env: options.env ?? process.env,
    stdio: 'inherit',
    shell: false,
  })

  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

function output(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? ROOT,
    encoding: 'utf8',
    env: options.env ?? process.env,
    maxBuffer: 1024 * 1024 * 20,
    shell: false,
  })

  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
  return result.stdout.trim()
}

function currentRemoteBranchSha() {
  const refs = output('git', ['ls-remote', '--heads', REMOTE, BRANCH])
  const [sha] = refs.split(/\s+/)
  return sha || null
}

const GIT_DIR = output('git', ['rev-parse', '--absolute-git-dir'])
const outputTreeGitArgs = ['--git-dir', GIT_DIR, '--work-tree', OUT_DIR]

if (!existsSync(OUT_DIR)) {
  console.error('[deploy-pages] missing out directory. Run `bun run build` first.')
  process.exit(1)
}

writeFileSync(path.join(OUT_DIR, '.nojekyll'), '')

const exportedOgCache = path.join(OUT_DIR, 'og-cache')
if (existsSync(exportedOgCache)) {
  rmSync(exportedOgCache, { recursive: true, force: true })
  console.log('[deploy-pages] removed build-only out/og-cache')
}

for (const relativePath of ['og', 'assets/blog', 'assets/notes', 'assets/photos']) {
  const exportedContentAsset = path.join(OUT_DIR, relativePath)
  if (!existsSync(exportedContentAsset)) continue

  rmSync(exportedContentAsset, { recursive: true, force: true })
  console.log(`[deploy-pages] removed CDN-backed out/${relativePath}`)
}

mkdirSync(CACHE_DIR, { recursive: true })
rmSync(INDEX_FILE, { force: true })
rmSync(`${INDEX_FILE}.lock`, { force: true })

const env = {
  ...process.env,
  GIT_INDEX_FILE: INDEX_FILE,
}

run('git', [...outputTreeGitArgs, 'read-tree', '--empty'], { cwd: OUT_DIR, env })
run('git', [...outputTreeGitArgs, 'add', '-A', '.'], { cwd: OUT_DIR, env })

const tree = output('git', [...outputTreeGitArgs, 'write-tree'], { cwd: OUT_DIR, env })
const commit = output('git', [...outputTreeGitArgs, 'commit-tree', tree, '-m', COMMIT_MESSAGE], {
  cwd: OUT_DIR,
  env,
})
const remoteSha = currentRemoteBranchSha()
const pushArgs = ['push', REMOTE, `${commit}:refs/heads/${BRANCH}`]

if (remoteSha) {
  pushArgs.push(`--force-with-lease=refs/heads/${BRANCH}:${remoteSha}`)
} else {
  pushArgs.push('--force')
}

run('git', pushArgs)
console.log(`[deploy-pages] published ${commit} to ${REMOTE}/${BRANCH}`)
