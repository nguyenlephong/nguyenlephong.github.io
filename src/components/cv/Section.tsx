'use client'
import { useEffect, useRef } from 'react'
import { track } from '@/lib/analytics'

type SectionProps = {
  id: string
  eyebrow: string
  title: string
  children: React.ReactNode
}

export default function Section({ id, eyebrow, title, children }: SectionProps) {
  const ref = useRef<HTMLElement | null>(null)
  const seenRef = useRef(false)

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

  return (
    <section ref={ref} id={id} className="cv-section" aria-labelledby={`${id}-title`}>
      <header className="cv-section-head">
        <span className="cv-section-eyebrow">{eyebrow}</span>
        <h2 id={`${id}-title`} className="cv-section-title">
          {title}
        </h2>
      </header>
      <div className="cv-section-body">{children}</div>
    </section>
  )
}
