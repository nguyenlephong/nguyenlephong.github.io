'use client'

import { useEffect, useRef, useState } from 'react'
import {
  LuArrowDownToLine,
  LuArrowUpToLine,
  LuCheck,
  LuLink,
  LuMoreHorizontal,
  LuShare,
  LuX,
} from 'react-icons/lu'
import { usePathname } from 'next/navigation'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import FontSwitcher from '@/components/font/FontSwitcher'
import ReadingBackgroundSwitcher from '@/components/reading/ReadingBackgroundSwitcher'
import { track } from '@/lib/analytics'
import ShareCopyFallback from './ShareCopyFallback'
import { useArticleShare, type ArticleShareProps } from './useArticleShare'
import { useFooterInView } from './useFooterInView'
import { subscribeWindowScroll } from './windowScroll'

interface BlogReaderToolsLabels {
  label: string
  reading: string
  scrollTop: string
  scrollBottom: string
  font: string
  background: string
  language: string
}

interface BlogReaderToolsProps {
  labels: BlogReaderToolsLabels
  /** Share targets for the sheet; the ≥1280px rail covers wide screens. */
  share?: ArticleShareProps
}

/** Ignore scroll jitter smaller than this when reading the scroll direction. */
const DIRECTION_THRESHOLD = 8

function scrollToY(top: number) {
  window.scrollTo({
    top,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
  })
}

function ShareGroup({ share, onDone }: { share: ArticleShareProps; onDone: () => void }) {
  const { labels } = share
  const {
    targets,
    copied,
    copyFailed,
    canNativeShare,
    copy,
    nativeShare,
    recordShare,
    dismissCopyFailure,
  } = useArticleShare(share)

  return (
    <div className="blog-reader-tools__group blog-reader-tools__group--share" role="group" aria-label={labels.share}>
      <p className="blog-reader-tools__heading" aria-hidden="true">
        {labels.share}
      </p>
      <div className="blog-reader-tools__row">
        {canNativeShare && (
          <button
            type="button"
            className="blog-reader-tools__btn"
            aria-label={labels.nativeShare}
            title={labels.nativeShare}
            onClick={() => {
              void nativeShare()
              onDone()
            }}
          >
            <LuShare size={18} aria-hidden="true" />
          </button>
        )}
        {targets.map(({ key, label, Icon, href }) => (
          <a
            key={key}
            className="blog-reader-tools__btn"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            onClick={() => {
              recordShare(key)
              onDone()
            }}
          >
            <Icon size={16} aria-hidden="true" />
          </a>
        ))}
        <button
          type="button"
          className="blog-reader-tools__btn"
          aria-label={copied ? labels.copied : labels.copyLink}
          title={copied ? labels.copied : labels.copyLink}
          onClick={() => void copy()}
        >
          {copied ? <LuCheck size={18} aria-hidden="true" /> : <LuLink size={18} aria-hidden="true" />}
        </button>
      </div>
      {copyFailed && (
        <ShareCopyFallback
          url={share.url}
          message={labels.copyFailed}
          onDismiss={dismissCopyFailure}
        />
      )}
    </div>
  )
}

function ReaderTools({ labels, share }: BlogReaderToolsProps) {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [pastFirstScreen, setPastFirstScreen] = useState(false)
  const [nearBottom, setNearBottom] = useState(false)
  // Narrow screens tuck the cluster away while the reader scrolls down so it
  // never sits on body text; scrolling up brings it back.
  const [tucked, setTucked] = useState(true)
  const atFooter = useFooterInView()
  const ref = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let lastY = window.scrollY
    let frame = 0

    const measure = () => {
      frame = 0
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const current = window.scrollY
      const nextVisible = maxScroll > 640

      setVisible(nextVisible)
      if (!nextVisible) setExpanded(false)
      setPastFirstScreen(current > window.innerHeight)
      setNearBottom(maxScroll - current < 160)
      if (Math.abs(current - lastY) >= DIRECTION_THRESHOLD) {
        setTucked(current > lastY)
        lastY = current
      }
      ref.current?.style.setProperty(
        '--reader-progress',
        String(maxScroll > 0 ? Math.min(1, Math.max(0, current / maxScroll)) : 0),
      )
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure)
    }

    schedule()
    const unsubscribe = subscribeWindowScroll(schedule)
    window.addEventListener('resize', schedule)
    return () => {
      unsubscribe()
      window.removeEventListener('resize', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    if (!expanded) return
    const onDocClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setExpanded(false)
    }
    const onEsc = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      setExpanded(false)
      triggerRef.current?.focus({ preventScroll: true })
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
    // The clicked button unmounts with the panel; keep keyboard focus on the dock.
    triggerRef.current?.focus({ preventScroll: true })
    scrollToY(document.documentElement.scrollHeight)
  }

  const handleToggle = () => {
    const next = !expanded
    track('reader_tool_toggle', { expanded: next })
    setExpanded(next)
  }

  return (
    <aside
      ref={ref}
      className={[
        'blog-reader-tools',
        visible ? 'blog-reader-tools--visible' : '',
        expanded ? 'blog-reader-tools--expanded' : '',
        atFooter ? 'blog-reader-tools--at-footer' : '',
        tucked ? 'blog-reader-tools--tucked' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={labels.label}
    >
      <div className="blog-reader-tools__dock">
        {pastFirstScreen && (
          <button
            type="button"
            className="blog-reader-tools__top"
            aria-label={labels.scrollTop}
            title={labels.scrollTop}
            onClick={handleTop}
          >
            <svg className="blog-reader-tools__ring" viewBox="0 0 44 44" aria-hidden="true">
              <circle className="blog-reader-tools__ring-track" cx="22" cy="22" r="20.5" />
              <circle
                className="blog-reader-tools__ring-fill"
                cx="22"
                cy="22"
                r="20.5"
                pathLength={100}
              />
            </svg>
            <LuArrowUpToLine size={18} aria-hidden="true" />
          </button>
        )}

        <button
          ref={triggerRef}
          type="button"
          className="blog-reader-tools__trigger"
          aria-label={labels.label}
          aria-controls="blog-reader-tools-panel"
          aria-expanded={expanded}
          title={labels.label}
          onClick={handleToggle}
        >
          {expanded ? (
            <LuX size={18} aria-hidden="true" />
          ) : (
            <LuMoreHorizontal size={18} aria-hidden="true" />
          )}
        </button>
      </div>

      {expanded && (
        <div id="blog-reader-tools-panel" className="blog-reader-tools__controls">
          {share && <ShareGroup share={share} onDone={() => setExpanded(false)} />}
          <div className="blog-reader-tools__group" role="group" aria-label={labels.reading}>
            <p className="blog-reader-tools__heading" aria-hidden="true">
              {labels.reading}
            </p>
            <div className="blog-reader-tools__row">
              <div className="blog-reader-tools__item" title={labels.font}>
                <FontSwitcher placement="up" />
              </div>
              <div className="blog-reader-tools__item" title={labels.background}>
                <ReadingBackgroundSwitcher placement="up" />
              </div>
              <div className="blog-reader-tools__item" title={labels.language}>
                <LocaleSwitcher placement="up" compact />
              </div>
              <button
                type="button"
                className="blog-reader-tools__btn"
                aria-label={labels.scrollBottom}
                title={labels.scrollBottom}
                disabled={nearBottom}
                onClick={handleBottom}
              >
                <LuArrowDownToLine size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default function BlogReaderTools(props: BlogReaderToolsProps) {
  const pathname = usePathname()
  return <ReaderTools key={pathname} {...props} />
}
