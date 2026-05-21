'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'

const PLATFORM_HINTS: Array<{ host: string; platform: string }> = [
  { host: 'linkedin.com', platform: 'linkedin' },
  { host: 'github.com', platform: 'github' },
  { host: 'leetcode.com', platform: 'leetcode' },
  { host: 'youtube.com', platform: 'youtube' },
  { host: 'twitter.com', platform: 'twitter' },
  { host: 'x.com', platform: 'twitter' },
  { host: 'facebook.com', platform: 'facebook' },
  { host: 'instagram.com', platform: 'instagram' },
]

function inferPlatform(href: string): string | null {
  try {
    const url = new URL(href, window.location.href)
    const host = url.hostname.replace(/^www\./, '')
    return PLATFORM_HINTS.find((p) => host.endsWith(p.host))?.platform ?? null
  } catch {
    return null
  }
}

export default function HomeSocialTracker() {
  useEffect(() => {
    const handler = (event: MouseEvent): void => {
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest<HTMLAnchorElement>('.social-block a')
      if (!anchor) return
      const platform = inferPlatform(anchor.href)
      const title = anchor.querySelector<HTMLElement>('[title]')?.title ?? null
      track('home_social_click', {
        platform,
        title,
        href: anchor.href,
      })
    }
    document.addEventListener('click', handler, { capture: true })
    return () => document.removeEventListener('click', handler, { capture: true })
  }, [])

  return null
}
