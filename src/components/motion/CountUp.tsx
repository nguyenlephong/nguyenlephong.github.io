'use client'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

type CountUpProps = {
  value: string
  duration?: number
}

function parse(value: string): { num: number; prefix: string; suffix: string } {
  const match = value.match(/^([^\d.-]*)(\d+(?:\.\d+)?)(.*)$/)
  if (!match) return { num: NaN, prefix: '', suffix: value }
  return { prefix: match[1] ?? '', num: parseFloat(match[2]!), suffix: match[3] ?? '' }
}

export default function CountUp({ value, duration = 1100 }: CountUpProps) {
  const { num, prefix, suffix } = parse(value)
  const reduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement | null>(null)
  const [display, setDisplay] = useState<number>(isNaN(num) ? 0 : reduced ? num : 0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (isNaN(num) || reduced) return
    if (!ref.current) return
    const node = ref.current
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !startedRef.current) {
            startedRef.current = true
            const start = performance.now()
            const decimals = num % 1 === 0 ? 0 : 1
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration)
              const eased = 1 - Math.pow(1 - t, 3)
              setDisplay(parseFloat((eased * num).toFixed(decimals)))
              if (t < 1) requestAnimationFrame(tick)
              else setDisplay(num)
            }
            requestAnimationFrame(tick)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [num, duration, reduced])

  if (isNaN(num)) {
    return <span>{value}</span>
  }

  const decimals = num % 1 === 0 ? 0 : 1
  return (
    <span ref={ref}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}
