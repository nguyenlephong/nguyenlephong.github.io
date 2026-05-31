'use client'

import { useEffect, useRef, useState } from 'react'
import { LuShare2, LuLink, LuCheck, LuX } from 'react-icons/lu'
import { FaXTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa6'
import type { IconType } from 'react-icons'
import { track } from '@/lib/analytics'
import { incrementShare, postStatsId } from '@/lib/firebase/postStats'

interface Props {
  url: string
  title: string
  slug: string
  labels: {
    share: string
    copyLink: string
    copied: string
    close: string
  }
}

export default function ThoughtShareDock({ url, title, slug, labels }: Props) {
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const recordShare = (method: string) => {
    incrementShare(postStatsId('thoughts', slug))
    track('thoughts_share', { slug, method })
  }

  // Reveal after 200px — thoughts are often short, keep threshold low
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close on outside click or Escape
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

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const links: { key: string; label: string; Icon: IconType; href: string }[] = [
    {
      key: 'x',
      label: 'X / Twitter',
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
      recordShare('copy')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {}
    setOpen(false)
  }

  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  async function handleNativeShare() {
    if (canNativeShare) {
      try {
        await navigator.share({ title, url })
        recordShare('native')
      } catch {}
    }
    setOpen(false)
  }

  return (
    <div
      ref={ref}
      className={[
        'thought-share-dock',
        visible ? 'thought-share-dock--visible' : '',
        open ? 'thought-share-dock--open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Social links + copy — popover on mobile, always-on rail on desktop */}
      <div className="thought-share-dock__actions" role="group" aria-label={labels.share}>
        <span className="thought-share-dock__label" aria-hidden="true">
          {labels.share}
        </span>
        {links.map(({ key, label, Icon, href }) => (
          <a
            key={key}
            className="thought-share-dock__btn"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            onClick={() => {
              recordShare(key)
              setOpen(false)
            }}
          >
            <Icon aria-hidden="true" />
          </a>
        ))}
        <button
          type="button"
          className="thought-share-dock__btn"
          onClick={handleCopy}
          aria-label={copied ? labels.copied : labels.copyLink}
          title={copied ? labels.copied : labels.copyLink}
        >
          {copied ? <LuCheck aria-hidden="true" /> : <LuLink aria-hidden="true" />}
        </button>
      </div>

      {/* FAB — mobile only trigger */}
      <button
        type="button"
        className="thought-share-dock__fab"
        aria-expanded={open}
        aria-label={open ? labels.close : labels.share}
        onClick={() => {
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
