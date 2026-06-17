'use client'

import { useEffect, useState } from 'react'
import { LuArrowDownToLine, LuArrowUpToLine } from 'react-icons/lu'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import FontSwitcher from '@/components/font/FontSwitcher'
import { track } from '@/lib/analytics'

interface BlogReaderToolsLabels {
  label: string
  scrollTop: string
  scrollBottom: string
  font: string
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
  const [nearTop, setNearTop] = useState(true)
  const [nearBottom, setNearBottom] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight
      const current = window.scrollY

      setVisible(maxScroll > 640)
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

  const handleTop = () => {
    track('reader_tool_scroll', { direction: 'top' })
    scrollToY(0)
  }

  const handleBottom = () => {
    track('reader_tool_scroll', { direction: 'bottom' })
    scrollToY(document.documentElement.scrollHeight)
  }

  return (
    <div
      className={[
        'blog-reader-tools',
        visible ? 'blog-reader-tools--visible' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="toolbar"
      aria-label={labels.label}
    >
      <div className="blog-reader-tools__controls">
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
        <div className="blog-reader-tools__item" title={labels.language}>
          <LocaleSwitcher placement="up" compact />
        </div>
      </div>
    </div>
  )
}
