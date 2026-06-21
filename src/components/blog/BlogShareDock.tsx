'use client'

import { useEffect, useRef, useState } from 'react'
import { LuShare2, LuLink, LuCheck, LuX } from 'react-icons/lu'
import { FaXTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa6'
import type { IconType } from 'react-icons'
import { track } from '@/lib/analytics'
import { useEngagement } from './EngagementProvider'

interface ShareLabels {
  share: string
  copyLink: string
  copied: string
  close: string
}

interface BlogShareDockProps {
  url: string
  title: string
  labels: ShareLabels
  surface?: 'blog' | 'notes'
  category?: string
  slug?: string
}

/**
 * One responsive share surface, two shapes (CSS-driven):
 *   • ≥1280px — a sticky vertical rail pinned in the left margin, always open.
 *   • <1280px — a floating action button (bottom-right) that toggles a popover.
 * Reveals itself only after the reader has scrolled past the header.
 */
export default function BlogShareDock({
  url,
  title,
  labels,
  surface = 'blog',
  category,
  slug,
}: BlogShareDockProps) {
  const engagement = useEngagement()
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Reveal after scrolling past the masthead.
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile popover on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const record = () => engagement?.recordShare()
  const trackShare = (method: string) => {
    track(`${surface}_share`, {
      content_surface: surface,
      content_category: category ?? null,
      content_slug: slug ?? null,
      method,
    })
  }

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const links: { key: string; label: string; Icon: IconType; href: string }[] = [
    {
      key: 'x',
      label: 'X',
      Icon: FaXTwitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      Icon: FaFacebookF,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      Icon: FaLinkedinIn,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ]

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      record()
      trackShare('copy')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
    setOpen(false)
  }

  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  async function handleNativeShare() {
    if (canNativeShare) {
      try {
        await navigator.share({ title, url })
        record()
        trackShare('native')
      } catch {
        /* cancelled */
      }
    }
    setOpen(false)
  }

  return (
    <div
      ref={ref}
      className={[
        'blog-share-dock',
        visible ? 'blog-share-dock--visible' : '',
        open ? 'blog-share-dock--open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="blog-share-dock__actions" role="group" aria-label={labels.share}>
        <span className="blog-share-dock__label" aria-hidden="true">
          {labels.share}
        </span>
        {links.map(({ key, label, Icon, href }) => (
          <a
            key={key}
            className="blog-share-dock__btn"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            onClick={() => {
              record()
              trackShare(key)
              setOpen(false)
            }}
          >
            <Icon aria-hidden="true" />
          </a>
        ))}
        <button
          type="button"
          className="blog-share-dock__btn"
          onClick={handleCopy}
          aria-label={copied ? labels.copied : labels.copyLink}
          title={copied ? labels.copied : labels.copyLink}
        >
          {copied ? <LuCheck aria-hidden="true" /> : <LuLink aria-hidden="true" />}
        </button>
      </div>

      <button
        type="button"
        className="blog-share-dock__fab"
        aria-expanded={open}
        aria-label={open ? labels.close : labels.share}
        onClick={() => {
          // Native share sheet is the best mobile UX; fall back to the popover.
          if (!open && canNativeShare) {
            handleNativeShare()
          } else {
            setOpen((v) => !v)
          }
        }}
      >
        {open ? <LuX aria-hidden="true" /> : <LuShare2 aria-hidden="true" />}
      </button>
    </div>
  )
}
