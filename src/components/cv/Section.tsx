'use client'
import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { track } from '@/lib/analytics'

type SectionProps = {
  id: string
  eyebrow: string
  title: string
  children: React.ReactNode
}

const ease = [0.16, 1, 0.3, 1] as const

export default function Section({ id, eyebrow, title, children }: SectionProps) {
  const ref = useRef<HTMLElement | null>(null)
  const seenRef = useRef(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!ref.current || seenRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !seenRef.current) {
            seenRef.current = true
            track('cv_section_view', { section: id })
            observer.disconnect()
          }
        }
      },
      { threshold: 0.25 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [id])

  const reveal = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '0px 0px -80px 0px' },
        transition: { duration: 0.6, ease },
      } as const

  return (
    <section ref={ref} id={id} className="cv-section" aria-labelledby={`${id}-title`}>
      <motion.header className="cv-section-head" {...reveal}>
        <span className="cv-section-eyebrow">{eyebrow}</span>
        <h2 id={`${id}-title`} className="cv-section-title">
          {title}
        </h2>
      </motion.header>
      <div className="cv-section-body">{children}</div>
    </section>
  )
}
