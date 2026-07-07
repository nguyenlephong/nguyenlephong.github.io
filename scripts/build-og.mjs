#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync, unlinkSync } from 'node:fs'
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

const EXPORT_DETAIL = path.join(process.cwd(), '.next', 'export-detail.json')
const EXPORT_EXIT_GRACE_MS = Number(process.env.OG_EXPORT_EXIT_GRACE_MS ?? 5_000)
const EXPORT_FALLBACK_QUIET_MS = Number(
  process.env.OG_EXPORT_FALLBACK_QUIET_MS ?? Math.max(EXPORT_EXIT_GRACE_MS, 120_000)
)
const KILL_GRACE_MS = Number(process.env.OG_KILL_GRACE_MS ?? 5_000)
const SIGNAL_EXIT_GRACE_MS = Number(process.env.OG_SIGNAL_EXIT_GRACE_MS ?? KILL_GRACE_MS)
const BUILD_HEARTBEAT_MS = Number(process.env.OG_BUILD_HEARTBEAT_MS ?? 15_000)
const activeChildren = new Set()

function getExportState(startedAt) {
  const htmlState = getFreshDeepHtmlState(path.join(process.cwd(), 'out'), startedAt)
  let detailFresh = false
  let detailSuccess = false
  let detailMtimeMs = 0

  if (existsSync(EXPORT_DETAIL)) {
    const stat = statSync(EXPORT_DETAIL)
    detailMtimeMs = stat.mtimeMs

    if (stat.mtimeMs + 1000 >= startedAt) {
      detailFresh = true
      try {
        const detail = JSON.parse(readFileSync(EXPORT_DETAIL, 'utf8'))
        detailSuccess = detail?.success === true
      } catch {
        detailSuccess = false
      }
    }
  }

  return {
    detailFresh,
    detailSuccess,
    fallbackSatisfied: htmlState.count > 0,
    latestActivityMtimeMs: Math.max(detailMtimeMs, htmlState.latestMtimeMs),
    htmlCount: htmlState.count,
  }
}

function getFreshDeepHtmlState(dir, startedAt, depth = 0) {
  if (!existsSync(dir)) return { count: 0, latestMtimeMs: 0 }

  let count = 0
  let latestMtimeMs = 0
  let entries = []

  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch (err) {
    if (err?.code === 'ENOENT') return { count: 0, latestMtimeMs: 0 }
    throw err
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const childState = getFreshDeepHtmlState(fullPath, startedAt, depth + 1)
      count += childState.count
      latestMtimeMs = Math.max(latestMtimeMs, childState.latestMtimeMs)
      continue
    }

    // Count exported locale routes like out/en/notes/foo.html as a valid export signal.
    if (!entry.isFile() || !entry.name.endsWith('.html') || depth < 2) continue

    let stat
    try {
      stat = statSync(fullPath)
    } catch (err) {
      if (err?.code === 'ENOENT') continue
      throw err
    }
    if (stat.mtimeMs + 1000 < startedAt) continue

    count += 1
    latestMtimeMs = Math.max(latestMtimeMs, stat.mtimeMs)
  }

  return { count, latestMtimeMs }
}

function killChildProcess({ child, detached }, signal) {
  if (!child.pid) return
  try {
    if (detached && process.platform !== 'win32') {
      process.kill(-child.pid, signal)
    } else {
      child.kill(signal)
    }
  } catch (err) {
    if (err?.code !== 'ESRCH') throw err
  }
}

function waitForChildExit(child) {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve()

  return new Promise((resolve) => {
    child.once('close', resolve)
  })
}

function installSignalCleanup() {
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      const exitCode = signal === 'SIGINT' ? 130 : 143
      const childrenToCleanUp = [...activeChildren]

      for (const entry of childrenToCleanUp) {
        try {
          killChildProcess(entry, signal)
        } catch (err) {
          console.warn(`[build-og] failed to forward ${signal} to child:`, err)
        }
      }

      if (childrenToCleanUp.length === 0) {
        process.exit(exitCode)
      }

      const forceExit = setTimeout(() => {
        for (const entry of activeChildren) {
          try {
            killChildProcess(entry, 'SIGKILL')
          } catch (err) {
            console.warn('[build-og] failed to force-kill child:', err)
          }
        }
        process.exit(exitCode)
      }, SIGNAL_EXIT_GRACE_MS)
      forceExit.unref()

      Promise.all(childrenToCleanUp.map(({ child }) => waitForChildExit(child))).then(() => {
        clearTimeout(forceExit)
        process.exit(exitCode)
      })
    })
  }
}

installSignalCleanup()

function run(command, commandArgs, env, options = {}) {
  const {
    acceptSuccessfulExportSignal = false,
    detached = false,
    terminateAfterSuccessfulExport = false,
    startedAt = Date.now(),
  } = options
  const monitorExport = acceptSuccessfulExportSignal || terminateAfterSuccessfulExport

  return new Promise((resolve) => {
    const child = spawn(command, commandArgs, {
      cwd: process.cwd(),
      detached,
      env,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: false,
    })
    const childEntry = { child, detached }
    activeChildren.add(childEntry)

    let settled = false
    let exportStableSince = null
    let lastExportSignature = ''
    let forceKillTimer = null
    let terminationRequested = false
    let lastChildOutputAt = Date.now()
    let lastHeartbeatAt = Date.now()

    child.stdout?.on('data', (chunk) => {
      lastChildOutputAt = Date.now()
      process.stdout.write(chunk)
    })
    child.stderr?.on('data', (chunk) => {
      lastChildOutputAt = Date.now()
      process.stderr.write(chunk)
    })

    const killChild = (signal) => {
      killChildProcess(childEntry, signal)
    }

    const finish = (code) => {
      if (settled) return
      settled = true
      activeChildren.delete(childEntry)
      clearInterval(exportWatch)
      clearTimeout(forceKillTimer)
      resolve(code)
    }

    const exportWatch = monitorExport
      ? setInterval(() => {
          const now = Date.now()
          const exportState = getExportState(startedAt)
          const exportSucceeded = exportState.detailSuccess || exportState.fallbackSatisfied
          const exportSignature = exportSucceeded
            ? exportState.detailSuccess
              ? ['detail', exportState.latestActivityMtimeMs, exportState.htmlCount].join(':')
              : ['fallback', exportState.htmlCount].join(':')
            : ''

          if (exportSucceeded && exportSignature !== lastExportSignature) {
            lastExportSignature = exportSignature
            exportStableSince = now
          } else if (exportSucceeded) {
            exportStableSince ??= now
          }

          if (now - lastHeartbeatAt >= BUILD_HEARTBEAT_MS) {
            lastHeartbeatAt = now
            const exportHeartbeat = exportState.detailSuccess
              ? '[build-og] next build export detail succeeded; waiting for the output to go quiet'
              : `[build-og] next build is exporting static HTML (${exportState.htmlCount} routes); waiting for route count and output to settle`

            console.log(
              exportSucceeded
                ? exportHeartbeat
                : '[build-og] waiting for next build export to finish'
            )
          }

          if (!exportSucceeded) return

          const quietMs = exportState.detailSuccess ? EXPORT_EXIT_GRACE_MS : EXPORT_FALLBACK_QUIET_MS
          const outputQuiet = now - lastChildOutputAt >= quietMs
          if (
            terminateAfterSuccessfulExport &&
            !terminationRequested &&
            exportStableSince !== null &&
            Date.now() - exportStableSince >= quietMs &&
            (exportState.detailSuccess || outputQuiet)
          ) {
            terminationRequested = true
            console.warn(
              `[build-og] next build export looks complete and quiet for ${quietMs}ms; terminating stale child process`
            )
            killChild('SIGTERM')
            forceKillTimer = setTimeout(() => {
              if (!settled) killChild('SIGKILL')
            }, KILL_GRACE_MS)
          }
        }, 1000)
      : null

    child.on('error', (err) => {
      console.error(`[build-og] failed to start ${command}:`, err)
      finish(1)
    })

    child.on('close', (code, signal) => {
      const exportState = getExportState(startedAt)
      const exportSucceeded = exportState.detailSuccess || exportState.fallbackSatisfied
      if (code === 0) {
        finish(0)
        return
      }

      if (
        acceptSuccessfulExportSignal &&
        exportSucceeded &&
        (signal === 'SIGINT' ||
          signal === 'SIGTERM' ||
          signal === 'SIGKILL' ||
          code === 130 ||
          code === 143)
      ) {
        console.warn(
          `[build-og] next build ended with ${signal ?? `code ${code}`} after a successful export; continuing to postbuild`
        )
        finish(0)
        return
      }

      finish(code ?? 1)
    })
  })
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
if (existsSync(EXPORT_DETAIL)) {
  try {
    unlinkSync(EXPORT_DETAIL)
  } catch (err) {
    console.warn('[build-og] failed to remove stale export-detail.json before build:', err)
  }
}
const buildStartedAt = Date.now()
const buildCode = await run(nextBin, ['build', '--turbopack'], env, {
  acceptSuccessfulExportSignal: true,
  detached: true,
  terminateAfterSuccessfulExport: true,
  startedAt: buildStartedAt,
})
if (buildCode !== 0) process.exit(buildCode)

const postbuildCode = await run(process.execPath, ['scripts/postbuild-og.mjs'], env)
if (postbuildCode !== 0) process.exit(postbuildCode)

const offlinePostbuildCode = await run(process.execPath, ['scripts/postbuild-offline.mjs'], env)
if (offlinePostbuildCode !== 0) process.exit(offlinePostbuildCode)
