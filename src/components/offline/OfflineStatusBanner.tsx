'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { track } from '@/lib/analytics'

type OfflinePhase = 'idle' | 'syncing' | 'reading' | 'extended'
type OfflineCompleteness = 'unknown' | 'complete' | 'partial'
type OfflineState = {
  phase: OfflinePhase
  completeness: OfflineCompleteness
}
type OfflineStatusBannerInnerProps = {
  locale: string
  pathname: string | null
}

const STORAGE_PREFIX = 'offline-locale-state:v2:'
const LEGACY_STORAGE_PREFIX = 'offline-locale-phase:v1:'
const READY_TOAST_MS = 3600

function readStoredState(locale: string): OfflineState {
  if (typeof window === 'undefined') {
    return { phase: 'idle', completeness: 'unknown' }
  }
  try {
    const stored = window.localStorage.getItem(`${STORAGE_PREFIX}${locale}`)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<OfflineState>
      const phase =
        parsed.phase === 'reading' || parsed.phase === 'extended'
          ? parsed.phase
          : parsed.phase === 'syncing'
            ? 'syncing'
            : 'idle'
      const completeness =
        parsed.completeness === 'partial' || parsed.completeness === 'complete'
          ? parsed.completeness
          : 'unknown'
      return { phase, completeness }
    }
  } catch {
    // Ignore storage failures in private mode.
  }

  try {
    const legacy = window.localStorage.getItem(`${LEGACY_STORAGE_PREFIX}${locale}`)
    if (legacy === 'reading' || legacy === 'extended') {
      return { phase: legacy, completeness: 'complete' }
    }
  } catch {
    // Ignore storage failures in private mode.
  }

  return { phase: 'idle', completeness: 'unknown' }
}

function persistState(locale: string, state: OfflineState): void {
  if (typeof window === 'undefined') return
  try {
    if (state.phase !== 'reading' && state.phase !== 'extended') {
      window.localStorage.removeItem(`${STORAGE_PREFIX}${locale}`)
      return
    }
    window.localStorage.setItem(`${STORAGE_PREFIX}${locale}`, JSON.stringify(state))
  } catch {
    // Ignore storage failures in private mode.
  }
}

function postToWorker(
  registration: ServiceWorkerRegistration,
  message: { type: 'OFFLINE_WARM_LOCALE'; locale: string; pathname: string | null } | { type: 'OFFLINE_WARM_PATH'; pathname: string },
) {
  const target =
    navigator.serviceWorker.controller ||
    registration.active ||
    registration.waiting ||
    registration.installing
  target?.postMessage(message)
}

export default function OfflineStatusBanner() {
  const locale = useLocale()
  const pathname = usePathname()

  return <OfflineStatusBannerInner key={locale} locale={locale} pathname={pathname} />
}

function OfflineStatusBannerInner({
  locale,
  pathname,
}: OfflineStatusBannerInnerProps) {
  const t = useTranslations('Offline.banner')
  const [offlineState, setOfflineState] = useState<OfflineState>(() => readStoredState(locale))
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )
  const [showReadyToast, setShowReadyToast] = useState(false)
  const isOnlineRef = useRef(isOnline)
  const readyToastTimerRef = useRef<number | null>(null)
  const lastTrackedStatusRef = useRef<string | null>(null)
  const phase = offlineState.phase
  const completeness = offlineState.completeness

  useEffect(() => {
    isOnlineRef.current = isOnline
  }, [isOnline])

  useEffect(() => {
    const report = (nextOnline: boolean) => {
      const nextStatus = nextOnline ? 'online' : 'offline'
      if (lastTrackedStatusRef.current === null) {
        lastTrackedStatusRef.current = nextStatus
        return
      }
      if (lastTrackedStatusRef.current === nextStatus) return
      lastTrackedStatusRef.current = nextStatus
      track('offline_status_change', {
        locale,
        status: nextStatus,
      })
    }

    const onOnline = () => {
      setIsOnline(true)
      report(true)
    }
    const onOffline = () => {
      setIsOnline(false)
      report(false)
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [locale])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let cancelled = false

    const onMessage = (event: MessageEvent) => {
      const data = event.data as
        | {
            type?: string
            locale?: string
            phase?: OfflinePhase
            version?: string
            completeness?: OfflineCompleteness
            requested?: number
            fulfilled?: number
            failed?: number
          }
        | undefined
      if (!data || data.type !== 'OFFLINE_CACHE_READY' || data.locale !== locale) return

      const nextPhase =
        data.phase === 'extended'
          ? 'extended'
          : data.phase === 'reading'
            ? 'reading'
            : null
      if (!nextPhase) return
      const nextCompleteness =
        data.completeness === 'partial' || data.completeness === 'complete'
          ? data.completeness
          : 'unknown'
      const nextState = {
        phase: nextPhase,
        completeness: nextCompleteness,
      } satisfies OfflineState

      persistState(locale, nextState)
      setOfflineState(nextState)
      track('offline_mode_ready', {
        locale,
        phase: nextPhase,
        completeness: nextCompleteness,
        requested: data.requested ?? null,
        fulfilled: data.fulfilled ?? null,
        failed: data.failed ?? null,
        version: data.version ?? null,
      })

      if (
        nextPhase === 'reading' &&
        nextCompleteness === 'complete' &&
        isOnlineRef.current
      ) {
        setShowReadyToast(true)
        if (readyToastTimerRef.current !== null) {
          window.clearTimeout(readyToastTimerRef.current)
        }
        readyToastTimerRef.current = window.setTimeout(() => {
          setShowReadyToast(false)
        }, READY_TOAST_MS)
      }
    }

    const registerAndWarm = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js')
        if (cancelled) return

        setOfflineState((current) => {
          if (current.phase === 'reading' || current.phase === 'extended') return current
          return {
            phase: 'syncing',
            completeness: current.completeness,
          }
        })

        const readyRegistration = await navigator.serviceWorker.ready
        if (cancelled) return

        postToWorker(readyRegistration, {
          type: 'OFFLINE_WARM_LOCALE',
          locale,
          pathname,
        })
      } catch {
        // Offline support is best-effort; the site must still work without it.
      }
    }

    navigator.serviceWorker.addEventListener('message', onMessage)
    registerAndWarm()

    return () => {
      cancelled = true
      navigator.serviceWorker.removeEventListener('message', onMessage)
      if (readyToastTimerRef.current !== null) {
        window.clearTimeout(readyToastTimerRef.current)
        readyToastTimerRef.current = null
      }
    }
  }, [locale, pathname])

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !pathname) return

    navigator.serviceWorker.ready
      .then((registration) => {
        postToWorker(registration, {
          type: 'OFFLINE_WARM_PATH',
          pathname,
        })
      })
      .catch(() => {
        // Ignore registration readiness failures.
      })
  }, [pathname])

  let tone: 'syncing' | 'ready' | 'offline' | 'partial' | null = null
  let message = ''

  if (!isOnline) {
    tone = 'offline'
    message =
      (phase === 'reading' || phase === 'extended') && completeness === 'complete'
        ? t('offlineReady')
        : t('offlinePartial')
  } else if (phase === 'syncing') {
    tone = 'syncing'
    message = t('syncing')
  } else if (
    completeness === 'partial' &&
    (phase === 'reading' || phase === 'extended')
  ) {
    tone = 'partial'
    message = t('partial')
  } else if (showReadyToast) {
    tone = 'ready'
    message = t('ready')
  }

  if (!tone) return null

  return (
    <div
      className={`offline-banner offline-banner--${tone}`}
      role="status"
      aria-live="polite"
    >
      <span className="offline-banner__dot" aria-hidden="true" />
      <span className="offline-banner__message">{message}</span>
    </div>
  )
}
