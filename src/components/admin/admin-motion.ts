'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const COUNT_MS = 700

export const prefersReducedMotion = () =>
  typeof window === 'undefined' || window.matchMedia(REDUCED_MOTION).matches

/**
 * Counts from the previously shown value to `target` (from 0 the first time).
 * Reduced motion jumps straight to the target.
 */
export function useCountUp(target: number): number {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? target : 0))
  const shownRef = useRef(shown)

  useEffect(() => {
    if (prefersReducedMotion()) {
      shownRef.current = target
      queueMicrotask(() => setShown(target))
      return
    }
    const from = shownRef.current
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS)
      const eased = 1 - Math.pow(2, -10 * t) // expo out, the site's --ease
      const value = Math.round(from + (target - from) * (t === 1 ? 1 : eased))
      shownRef.current = value
      setShown(value)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])

  return shown
}

/**
 * Scroll reveal for every `[data-reveal]` inside `root`: content is visible by
 * default; with motion allowed, blocks below the fold are marked `pending` and
 * flip to `in` once they enter the viewport. CSS owns the actual transitions.
 */
export function useReveal(root: RefObject<HTMLElement | null>, ready: boolean): void {
  useEffect(() => {
    const container = root.current
    if (!ready || !container || prefersReducedMotion() || !('IntersectionObserver' in window)) return
    const blocks = [...container.querySelectorAll<HTMLElement>('[data-reveal]')]
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          ;(entry.target as HTMLElement).dataset['reveal'] = 'in'
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )
    for (const block of blocks) {
      if (block.dataset['reveal'] === 'in') continue
      block.dataset['reveal'] = 'pending'
      observer.observe(block)
    }
    return () => observer.disconnect()
  }, [root, ready])
}
