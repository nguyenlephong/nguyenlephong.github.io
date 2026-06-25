#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const args = process.argv.slice(2)

function collectTargets() {
  const targets = []
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--target' || arg === '-t') {
      const next = args[i + 1]
      if (!next) throw new Error(`${arg} requires a route path`)
      targets.push(next)
      i += 1
      continue
    }
    if (!arg.startsWith('-')) targets.push(arg)
  }
  return targets
}

function collectEnvTargets() {
  return (process.env.OG_TARGETS ?? '')
    .split(',')
    .map((target) => target.trim())
    .filter(Boolean)
}

function hasFlag(...names) {
  return args.some((arg) => names.includes(arg))
}

function run(command, commandArgs, env) {
  const result = spawnSync(command, commandArgs, {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
    shell: false,
  })

  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const cliTargets = collectTargets()
const targets = cliTargets.length > 0 ? cliTargets : collectEnvTargets()
const forceFull = hasFlag('--full', '--force')
const skipDynamicOg = hasFlag('--skip', '--cache-only')
const strictCache = hasFlag('--strict-cache')

let mode = 'targeted'
if (forceFull) mode = 'full'
else if (skipDynamicOg || targets.length === 0) mode = 'skip'

const env = {
  ...process.env,
  OG_BUILD_MODE: mode,
  OG_TARGETS: targets.join(','),
  OG_CACHE_STRICT: strictCache ? '1' : process.env.OG_CACHE_STRICT,
}

const nextBin = path.join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'next.cmd' : 'next',
)

const summary =
  mode === 'full'
    ? 'full OG generation'
    : mode === 'skip'
      ? 'dynamic OG cache restore only'
      : `targeted OG generation for ${targets.join(', ')}`

console.log(`[build-og] ${summary}`)
run(nextBin, ['build', '--turbopack'], env)
run(process.execPath, ['scripts/postbuild-og.mjs'], env)
