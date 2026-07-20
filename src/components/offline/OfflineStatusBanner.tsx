'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { LuX } from 'react-icons/lu'
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
const DISMISS_STORAGE_PREFIX = 'offline-banner-dismissed:v1:'
const SERVICE_WORKER_VERSION_META = 'offline-manifest-version'
const FALLBACK_APP_VERSION = process.env['NEXT_PUBLIC_APP_VERSION'] ?? 'dev'
const SSR_OFFLINE_STATE = {
  phase: 'idle',
  completeness: 'unknown',
} satisfies OfflineState

function serviceWorkerUrl(): string {
  const version =
    typeof document === 'undefined'
      ? FALLBACK_APP_VERSION
      : document
          .querySelector(`meta[name="${SERVICE_WORKER_VERSION_META}"]`)
          ?.getAttribute('content')
          ?.trim() || FALLBACK_APP_VERSION

  return `/sw.js?v=${encodeURIComponent(version)}`
}

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

function readDismissed(locale: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(`${DISMISS_STORAGE_PREFIX}${locale}`) === 'true'
  } catch {
    return false
  }
}

function persistDismissed(locale: string, dismissed: boolean): void {
  if (typeof window === 'undefined') return
  try {
    if (dismissed) {
      window.localStorage.setItem(`${DISMISS_STORAGE_PREFIX}${locale}`, 'true')
      return
    }
    window.localStorage.removeItem(`${DISMISS_STORAGE_PREFIX}${locale}`)
  } catch {
    // Ignore storage failures in private mode.
  }
}

function postToWorker(
  registration: ServiceWorkerRegistration,
  message: { type: 'OFFLINE_WARM_PATH'; pathname: string },
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
  const [offlineState, setOfflineState] = useState<OfflineState>(SSR_OFFLINE_STATE)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const lastTrackedStatusRef = useRef<string | null>(null)
  const completeness = offlineState.completeness

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
      setIsDismissed(false)
      persistDismissed(locale, false)
      report(true)
    }
    const onOffline = () => {
      setIsOnline(false)
      report(false)
    }

    const initialOnline = window.navigator.onLine
    lastTrackedStatusRef.current = initialOnline ? 'online' : 'offline'
    setOfflineState(readStoredState(locale))
    setIsOnline(initialOnline)
    if (initialOnline) {
      setIsDismissed(false)
      persistDismissed(locale, false)
    } else {
      setIsDismissed(readDismissed(locale))
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
    }

    const registerWorker = async () => {
      try {
        await navigator.serviceWorker.register(serviceWorkerUrl())
      } catch {
        // Offline support is best-effort; the site must still work without it.
      }
    }

    navigator.serviceWorker.addEventListener('message', onMessage)
    registerWorker()

    return () => {
      navigator.serviceWorker.removeEventListener('message', onMessage)
    }
  }, [locale])

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

  if (isOnline || isDismissed) return null

  const tone: 'offline' | 'partial' =
    completeness === 'complete' ? 'offline' : 'partial'
  const message =
    completeness === 'complete' ? t('offlineReady') : t('offlinePartial')
  const dismissLabel = t('dismiss')

  const onDismiss = () => {
    setIsDismissed(true)
    persistDismissed(locale, true)
    track('offline_banner_dismiss', {
      locale,
      phase: offlineState.phase,
      completeness,
      tone,
    })
  }

  return (
    <div
      className={`offline-banner offline-banner--${tone}`}
      role="status"
      aria-live="polite"
    >
      <span className="offline-banner__dot" aria-hidden="true" />
      <span className="offline-banner__message">{message}</span>
      <button
        type="button"
        className="offline-banner__dismiss"
        aria-label={dismissLabel}
        title={dismissLabel}
        onClick={onDismiss}
      >
        <LuX aria-hidden="true" />
      </button>
    </div>
  )
}
