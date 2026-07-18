import path from 'node:path'

export function removeStaleExportDetail({ exists, unlink }) {
  if (!exists()) return false

  try {
    unlink()
  } catch (cause) {
    throw new Error('[build-og] refusing to build with an unreadable stale export detail', {
      cause,
    })
  }

  if (exists()) {
    throw new Error('[build-og] refusing to build while a stale export detail still exists')
  }
  return true
}

export function isAuthoritativeExportDetail({
  detail,
  detailMtimeMs,
  startedAt,
  expectedOutDirectory,
}) {
  if (!Number.isFinite(detailMtimeMs) || detailMtimeMs < startedAt) return false
  if (detail?.success !== true || typeof detail?.outDirectory !== 'string') return false
  return path.resolve(detail.outDirectory) === path.resolve(expectedOutDirectory)
}

export function isAuthoritativeExportComplete(state) {
  return state?.detailFresh === true && state?.detailSuccess === true
}

export function exportCompletionSignature(state) {
  if (!isAuthoritativeExportComplete(state)) return ''
  return ['detail', state.latestActivityMtimeMs].join(':')
}

export function isExportQuiet({
  now,
  quietMs,
  lastChildOutputAt,
  latestActivityMtimeMs,
}) {
  const lastActivityAt = Math.max(lastChildOutputAt, latestActivityMtimeMs || 0)
  return now - lastActivityAt >= quietMs
}

export function resolveBuildExitCode({
  code,
  signal,
  exportTerminationSignalsSent = [],
  authoritativeExportSucceeded,
  timedOut = false,
}) {
  const failureCode = Number.isInteger(code) && code !== 0 ? code : 1
  if (timedOut) return failureCode
  if (code === 0 && (signal === null || signal === undefined)) return 0
  if (!authoritativeExportSucceeded) return failureCode

  const sentSignals = new Set(exportTerminationSignalsSent)
  const observedTerm =
    ((signal === 'SIGTERM' && (code === null || code === undefined)) ||
      ((signal === null || signal === undefined) && code === 143)) &&
    sentSignals.has('SIGTERM')
  const observedKill =
    ((signal === 'SIGKILL' && (code === null || code === undefined)) ||
      ((signal === null || signal === undefined) && code === 137)) &&
    sentSignals.has('SIGKILL')

  return observedTerm || observedKill ? 0 : failureCode
}
