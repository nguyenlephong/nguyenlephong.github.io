'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { usePathname } from 'next/navigation'

type ProgressPhase = 'idle' | 'loading' | 'finishing'

const FINISH_DELAY_MS = 90
const RESET_DELAY_MS = 660
const PROGRESS_RESET_DELAY_MS = RESET_DELAY_MS + 220
const FAILSAFE_DELAY_MS = 12000
const START_PROGRESS = 0.08
const ROUTE_PROGRESS_STEPS = [
  { delay: 80, value: 0.36 },
  { delay: 420, value: 0.62 },
  { delay: 1100, value: 0.78 },
  { delay: 2200, value: 0.88 },
]

function clearTimer(timer: { current: number | null }) {
  if (timer.current) {
    window.clearTimeout(timer.current)
    timer.current = null
  }
}

function isPlainLeftClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey
  )
}

function findNavigableLink(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null

  const anchor = target.closest('a[href]')
  if (!(anchor instanceof HTMLAnchorElement)) return null
  if (anchor.target && anchor.target !== '_self') return null
  if (anchor.hasAttribute('download')) return null

  const rawHref = anchor.getAttribute('href')
  if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
    return null
  }

  const url = new URL(anchor.href, window.location.href)
  if (url.origin !== window.location.origin) return null

  const currentUrl = new URL(window.location.href)
  const isSamePageHash =
    url.pathname === currentUrl.pathname && url.search === currentUrl.search && url.hash

  if (isSamePageHash || url.href === currentUrl.href) return null

  return anchor
}

export default function RouteProgressBar() {
  const pathname = usePathname()
  const [phase, setPhase] = useState<ProgressPhase>('idle')
  const [progress, setProgress] = useState(0)
  const isFirstPath = useRef(true)
  const finishTimer = useRef<number | null>(null)
  const resetTimer = useRef<number | null>(null)
  const progressResetTimer = useRef<number | null>(null)
  const failsafeTimer = useRef<number | null>(null)
  const advanceTimers = useRef<number[]>([])

  const clearAdvanceTimers = useCallback(() => {
    for (const timer of advanceTimers.current) {
      window.clearTimeout(timer)
    }
    advanceTimers.current = []
  }, [])

  const finish = useCallback(() => {
    clearTimer(failsafeTimer)
    clearTimer(finishTimer)
    clearTimer(resetTimer)
    clearTimer(progressResetTimer)
    clearAdvanceTimers()

    finishTimer.current = window.setTimeout(() => {
      setPhase('finishing')
      setProgress(1)
    }, FINISH_DELAY_MS)

    resetTimer.current = window.setTimeout(() => {
      setPhase('idle')
    }, RESET_DELAY_MS)

    progressResetTimer.current = window.setTimeout(() => {
      setProgress(0)
    }, PROGRESS_RESET_DELAY_MS)
  }, [clearAdvanceTimers])

  const start = useCallback(() => {
    clearTimer(finishTimer)
    clearTimer(resetTimer)
    clearTimer(progressResetTimer)
    clearTimer(failsafeTimer)
    clearAdvanceTimers()
    setPhase('loading')
    setProgress(START_PROGRESS)

    advanceTimers.current = ROUTE_PROGRESS_STEPS.map(({ delay, value }) =>
      window.setTimeout(() => {
        setProgress((current) => Math.max(current, value))
      }, delay),
    )
    failsafeTimer.current = window.setTimeout(finish, FAILSAFE_DELAY_MS)
  }, [clearAdvanceTimers, finish])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || !isPlainLeftClick(event)) return
      if (findNavigableLink(event.target)) start()
    }

    document.addEventListener('click', handleClick, true)
    window.addEventListener('popstate', start)
    window.addEventListener('pageshow', finish)

    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', start)
      window.removeEventListener('pageshow', finish)
      clearTimer(finishTimer)
      clearTimer(resetTimer)
      clearTimer(progressResetTimer)
      clearTimer(failsafeTimer)
      clearAdvanceTimers()
    }
  }, [clearAdvanceTimers, finish, start])

  useEffect(() => {
    if (isFirstPath.current) {
      isFirstPath.current = false
      return
    }

    finish()
  }, [finish, pathname])

  const progressStyle = {
    '--route-progress': progress.toFixed(3),
  } as CSSProperties

  return (
    <div
      className={`route-progress route-progress--${phase}`}
      style={progressStyle}
      aria-hidden="true"
    >
      <span className="route-progress__bar" />
    </div>
  )
}
