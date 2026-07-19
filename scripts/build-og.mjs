#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { existsSync, readFileSync, rmSync, statSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import { getValidatedExportFallback } from './lib/export-completion.mjs'
import {
  exportCompletionSignature,
  isAuthoritativeExportComplete,
  isAuthoritativeExportDetail,
  isExportQuiet,
  removeStaleExportDetail,
  resolveBuildExitCode,
} from './lib/build-export-guard.mjs'
import { resolveContentBuildDate } from '../src/lib/content/publication-contract.mjs'
import { validateAuthoredArticleSlugUniqueness } from './lib/article-slug-contract.mjs'

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

function positiveDurationFromEnv(name, fallback) {
  const value = Number(process.env[name] ?? fallback)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

const EXPORT_DETAIL = path.join(process.cwd(), '.next', 'export-detail.json')
const EXPECTED_OUT_DIR = path.join(process.cwd(), 'out')
const EXPORT_EXIT_GRACE_MS = Number(process.env.OG_EXPORT_EXIT_GRACE_MS ?? 5_000)
const KILL_GRACE_MS = Number(process.env.OG_KILL_GRACE_MS ?? 5_000)
const SIGNAL_EXIT_GRACE_MS = Number(process.env.OG_SIGNAL_EXIT_GRACE_MS ?? KILL_GRACE_MS)
const BUILD_HEARTBEAT_MS = Number(process.env.OG_BUILD_HEARTBEAT_MS ?? 15_000)
const BUILD_TIMEOUT_MS = positiveDurationFromEnv('OG_BUILD_TIMEOUT_MS', 20 * 60_000)
const activeChildren = new Set()

function getExportState(startedAt) {
  let detailFresh = false
  let detailSuccess = false
  let detailMtimeMs = 0

  if (existsSync(EXPORT_DETAIL)) {
    const stat = statSync(EXPORT_DETAIL)
    detailMtimeMs = stat.mtimeMs

    if (stat.mtimeMs >= startedAt) {
      detailFresh = true
      try {
        const detail = JSON.parse(readFileSync(EXPORT_DETAIL, 'utf8'))
        detailSuccess = isAuthoritativeExportDetail({
          detail,
          detailMtimeMs: stat.mtimeMs,
          startedAt,
          expectedOutDirectory: EXPECTED_OUT_DIR,
        })
      } catch {
        detailSuccess = false
      }
    }
  }

  const fallback = getValidatedExportFallback({ rootDir: process.cwd(), startedAt })

  return {
    detailFresh,
    detailSuccess,
    fallbackSatisfied: fallback.fallbackSatisfied,
    fallbackExpectedPageCount: fallback.expectedPageCount,
    latestActivityMtimeMs: Math.max(detailMtimeMs, fallback.latestActivityMtimeMs),
  }
}

function killChildProcess({ child, detached }, signal) {
  if (!child.pid) return false
  try {
    if (detached && process.platform !== 'win32') {
      return process.kill(-child.pid, signal) !== false
    } else {
      return child.kill(signal) !== false
    }
  } catch (err) {
    if (err?.code !== 'ESRCH') throw err
    return false
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
    let buildTimeoutTimer = null
    let buildTimedOut = false
    let exportTerminationStarted = false
    const exportTerminationSignalsSent = new Set()
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

    const killChild = (signal, { authorizeExportSuccess = false } = {}) => {
      const sent = killChildProcess(childEntry, signal)
      if (sent && authorizeExportSuccess && acceptSuccessfulExportSignal) {
        exportTerminationSignalsSent.add(signal)
      }
      return sent
    }

    const finish = (code) => {
      if (settled) return
      settled = true
      activeChildren.delete(childEntry)
      clearInterval(exportWatch)
      clearTimeout(forceKillTimer)
      clearTimeout(buildTimeoutTimer)
      resolve(code)
    }

    if (monitorExport) {
      buildTimeoutTimer = setTimeout(() => {
        buildTimedOut = true
        console.error(
          `[build-og] timed out after ${BUILD_TIMEOUT_MS}ms without a clean build exit`,
        )
        killChild('SIGTERM')
        forceKillTimer = setTimeout(() => {
          if (!settled) killChild('SIGKILL')
        }, KILL_GRACE_MS)
      }, BUILD_TIMEOUT_MS)
    }

    const exportWatch = monitorExport
      ? setInterval(() => {
          const now = Date.now()
          const exportState = getExportState(startedAt)
          const exportSucceeded = isAuthoritativeExportComplete(exportState)
          const exportSignature = exportCompletionSignature(exportState)

          if (exportSucceeded && exportSignature !== lastExportSignature) {
            lastExportSignature = exportSignature
            exportStableSince = now
          } else if (exportSucceeded) {
            exportStableSince ??= now
          }

          if (now - lastHeartbeatAt >= BUILD_HEARTBEAT_MS) {
            lastHeartbeatAt = now
            if (exportSucceeded) {
              console.log(
                '[build-og] next build export detail succeeded; waiting for the output to go quiet',
              )
            } else if (exportState.fallbackSatisfied) {
              console.log(
                `[build-og] ${exportState.fallbackExpectedPageCount} expected HTML page(s) are present; ` +
                  'waiting for authoritative export-detail success',
              )
            } else {
              console.log('[build-og] waiting for next build export to finish')
            }
          }

          if (!exportSucceeded) return

          const quietMs = EXPORT_EXIT_GRACE_MS
          const outputQuiet = isExportQuiet({
            now,
            quietMs,
            lastChildOutputAt,
            latestActivityMtimeMs: exportState.latestActivityMtimeMs,
          })
          if (
            terminateAfterSuccessfulExport &&
            !exportTerminationStarted &&
            exportStableSince !== null &&
            Date.now() - exportStableSince >= quietMs &&
            outputQuiet
          ) {
            const termSent = killChild('SIGTERM', { authorizeExportSuccess: true })
            if (termSent) {
              exportTerminationStarted = true
              console.warn(
                `[build-og] next build export looks complete and quiet for ${quietMs}ms; terminating stale child process`,
              )
              forceKillTimer = setTimeout(() => {
                if (!settled) {
                  killChild('SIGKILL', { authorizeExportSuccess: true })
                }
              }, KILL_GRACE_MS)
            }
          }
        }, 1000)
      : null

    child.on('error', (err) => {
      console.error(`[build-og] failed to start ${command}:`, err)
      finish(1)
    })

    child.on('close', (code, signal) => {
      const exportState = getExportState(startedAt)
      const exportSucceeded = isAuthoritativeExportComplete(exportState)
      const exitCode = resolveBuildExitCode({
        code,
        signal,
        exportTerminationSignalsSent,
        authoritativeExportSucceeded: exportSucceeded,
        timedOut: buildTimedOut,
      })
      if (exitCode === 0 && code !== 0) {
        console.warn(
          `[build-og] next build ended with ${signal ?? `code ${code}`} after a successful export; continuing to postbuild`
        )
      }
      finish(exitCode)
    })
  })
}

const cliTargets = collectTargets()
const targets = cliTargets.length > 0 ? cliTargets : collectEnvTargets()
const forceFull = hasFlag('--full', '--force')
const skipDynamicOg = hasFlag('--skip', '--cache-only')
const strictCache = hasFlag('--strict-cache')

let contentBuildDate
try {
  contentBuildDate = resolveContentBuildDate(process.env.CONTENT_BUILD_DATE)
  await validateAuthoredArticleSlugUniqueness()
} catch (error) {
  console.error(`[build-og] ${error instanceof Error ? error.message : error}`)
  process.exit(1)
}

let mode = 'targeted'
if (forceFull) mode = 'full'
else if (skipDynamicOg || targets.length === 0) mode = 'skip'

const env = {
  ...process.env,
  CONTENT_BUILD_DATE: contentBuildDate,
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
try {
  removeStaleExportDetail({
    exists: () => existsSync(EXPORT_DETAIL),
    unlink: () => unlinkSync(EXPORT_DETAIL),
  })
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
rmSync(EXPECTED_OUT_DIR, { recursive: true, force: true })
const buildStartedAt = Date.now()
const buildCode = await run(nextBin, ['build', '--turbopack'], env, {
  acceptSuccessfulExportSignal: true,
  detached: true,
  terminateAfterSuccessfulExport: true,
  startedAt: buildStartedAt,
})
if (buildCode !== 0) process.exit(buildCode)

const postbuildCode = await run(process.execPath, ['scripts/postbuild.mjs'], env)
if (postbuildCode !== 0) process.exit(postbuildCode)
