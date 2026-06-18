'use client'

import { useEffect, useRef, useState } from 'react'
import {
  LuArrowDownToLine,
  LuArrowUpToLine,
  LuSettings2,
} from 'react-icons/lu'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import FontSwitcher from '@/components/font/FontSwitcher'
import ReadingBackgroundSwitcher from '@/components/reading/ReadingBackgroundSwitcher'
import { track } from '@/lib/analytics'

interface BlogReaderToolsLabels {
  label: string
  scrollTop: string
  scrollBottom: string
  font: string
  background: string
  language: string
}

interface BlogReaderToolsProps {
  labels: BlogReaderToolsLabels
}

function scrollToY(top: number) {
  window.scrollTo({
    top,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
  })
}

export default function BlogReaderTools({ labels }: BlogReaderToolsProps) {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [nearTop, setNearTop] = useState(true)
  const [nearBottom, setNearBottom] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight
      const current = window.scrollY
      const nextVisible = maxScroll > 640

      setVisible(nextVisible)
      if (!nextVisible) setExpanded(false)
      setNearTop(current < 120)
      setNearBottom(maxScroll - current < 160)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!expanded) return
    const onDocClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setExpanded(false)
    }
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [expanded])

  const handleTop = () => {
    track('reader_tool_scroll', { direction: 'top' })
    setExpanded(false)
    scrollToY(0)
  }

  const handleBottom = () => {
    track('reader_tool_scroll', { direction: 'bottom' })
    setExpanded(false)
    scrollToY(document.documentElement.scrollHeight)
  }

  const handleToggle = () => {
    setExpanded((value) => {
      const next = !value
      track('reader_tool_toggle', { expanded: next })
      return next
    })
  }

  return (
    <div
      ref={ref}
      className={[
        'blog-reader-tools',
        visible ? 'blog-reader-tools--visible' : '',
        expanded ? 'blog-reader-tools--expanded' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="toolbar"
      aria-label={labels.label}
    >
      <button
        type="button"
        className="blog-reader-tools__trigger"
        aria-label={labels.label}
        aria-controls="blog-reader-tools-panel"
        aria-expanded={expanded}
        title={labels.label}
        onClick={handleToggle}
      >
        <LuSettings2 size={17} aria-hidden="true" />
      </button>

      {expanded && (
        <div id="blog-reader-tools-panel" className="blog-reader-tools__controls">
          <button
            type="button"
            className="blog-reader-tools__btn"
            aria-label={labels.scrollTop}
            title={labels.scrollTop}
            disabled={nearTop}
            onClick={handleTop}
          >
            <LuArrowUpToLine size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="blog-reader-tools__btn"
            aria-label={labels.scrollBottom}
            title={labels.scrollBottom}
            disabled={nearBottom}
            onClick={handleBottom}
          >
            <LuArrowDownToLine size={17} aria-hidden="true" />
          </button>
          <span className="blog-reader-tools__divider" aria-hidden="true" />
          <div className="blog-reader-tools__item" title={labels.font}>
            <FontSwitcher placement="up" />
          </div>
          <div className="blog-reader-tools__item" title={labels.background}>
            <ReadingBackgroundSwitcher placement="up" />
          </div>
          <div className="blog-reader-tools__item" title={labels.language}>
            <LocaleSwitcher placement="up" compact />
          </div>
        </div>
      )}
    </div>
  )
}
