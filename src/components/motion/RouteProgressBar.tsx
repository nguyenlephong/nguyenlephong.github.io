'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

type ProgressPhase = 'idle' | 'loading' | 'finishing'

const FINISH_DELAY_MS = 120
const RESET_DELAY_MS = 520
const FAILSAFE_DELAY_MS = 12000

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
  const isFirstPath = useRef(true)
  const finishTimer = useRef<number | null>(null)
  const resetTimer = useRef<number | null>(null)
  const failsafeTimer = useRef<number | null>(null)

  useEffect(() => {
    const clearTimer = (timer: typeof finishTimer) => {
      if (timer.current) {
        window.clearTimeout(timer.current)
        timer.current = null
      }
    }

    const finish = () => {
      clearTimer(failsafeTimer)
      clearTimer(finishTimer)
      clearTimer(resetTimer)

      finishTimer.current = window.setTimeout(() => {
        setPhase('finishing')
      }, FINISH_DELAY_MS)

      resetTimer.current = window.setTimeout(() => {
        setPhase('idle')
      }, RESET_DELAY_MS)
    }

    const start = () => {
      clearTimer(finishTimer)
      clearTimer(resetTimer)
      clearTimer(failsafeTimer)
      setPhase('loading')
      failsafeTimer.current = window.setTimeout(finish, FAILSAFE_DELAY_MS)
    }

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
      clearTimer(failsafeTimer)
    }
  }, [])

  useEffect(() => {
    if (isFirstPath.current) {
      isFirstPath.current = false
      return
    }

    const finishTimerId = window.setTimeout(() => {
      setPhase('finishing')
    }, FINISH_DELAY_MS)
    const resetTimerId = window.setTimeout(() => {
      setPhase('idle')
    }, RESET_DELAY_MS)

    return () => {
      window.clearTimeout(finishTimerId)
      window.clearTimeout(resetTimerId)
    }
  }, [pathname])

  return (
    <div className={`route-progress route-progress--${phase}`} aria-hidden="true">
      <span className="route-progress__bar" />
    </div>
  )
}
