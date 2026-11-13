'use client'

import { useEffect, useState } from 'react'
import { FaXTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa6'
import type { IconType } from 'react-icons'
import { track } from '@/lib/analytics'
import { useEngagement } from './EngagementProvider'

export interface ArticleShareLabels {
  share: string
  copyLink: string
  copied: string
  /** Shown when the clipboard refuses: the link is selected in a field instead. */
  copyFailed: string
  /** Opens the device share sheet (only offered when `navigator.share` exists). */
  nativeShare: string
}

export interface ArticleShareProps {
  url: string
  title: string
  labels: ArticleShareLabels
  surface?: 'blog' | 'notes'
  category?: string
  slug?: string
}

export interface ShareTarget {
  key: 'x' | 'facebook' | 'linkedin'
  label: string
  Icon: IconType
  href: string
}

export function shareTargets(url: string, title: string): ShareTarget[] {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  return [
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
}

/**
 * Share behaviour shared by the desktop rail and the reader sheet: targets,
 * copy link (with a visible fallback when the clipboard refuses), the native
 * share sheet, the engagement counter and the `${surface}_share` event.
 */
export function useArticleShare({
  url,
  title,
  surface = 'blog',
  category,
  slug,
}: Omit<ArticleShareProps, 'labels'>) {
  const engagement = useEngagement()
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)

  useEffect(() => {
    // navigator only exists after hydration; reading it in render would mismatch.
    const frame = window.requestAnimationFrame(() =>
      setCanNativeShare(typeof navigator.share === 'function'),
    )
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const trackShare = (method: string) => {
    track(`${surface}_share`, {
      content_surface: surface,
      content_category: category ?? null,
      content_slug: slug ?? null,
      method,
    })
  }

  const recordShare = (method: string) => {
    engagement?.recordShare()
    trackShare(method)
  }

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(url)
      setCopyFailed(false)
      setCopied(true)
      recordShare('copy')
    } catch {
      setCopyFailed(true)
      trackShare('copy_failed')
    }
  }

  async function nativeShare(): Promise<void> {
    try {
      await navigator.share({ title, url })
      recordShare('native')
    } catch {
      /* the reader closed the share sheet */
    }
  }

  return {
    targets: shareTargets(url, title),
    copied,
    copyFailed,
    canNativeShare,
    copy,
    nativeShare,
    recordShare,
    dismissCopyFailure: () => setCopyFailed(false),
  }
}
