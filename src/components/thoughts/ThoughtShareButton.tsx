'use client'

import { useState } from 'react'
import { LuShare2, LuCheck } from 'react-icons/lu'
import { track } from '@/lib/analytics'
import { incrementShare, postStatsId } from '@/lib/firebase/postStats'

interface Props {
  url: string
  title: string
  slug: string
  label: string
  copiedLabel: string
}

export default function ThoughtShareButton({ url, title, slug, label, copiedLabel }: Props) {
  const [copied, setCopied] = useState(false)

  const recordShare = () => {
    incrementShare(postStatsId('thoughts', slug))
    track('thoughts_share', { slug, method: 'copy' })
  }

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url })
        incrementShare(postStatsId('thoughts', slug))
        track('thoughts_share', { slug, method: 'native' })
      } catch {}
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      recordShare()
      window.setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button
      type="button"
      className="thought-share-btn"
      onClick={handleShare}
      aria-label={label}
    >
      {copied ? <LuCheck size={13} aria-hidden /> : <LuShare2 size={13} aria-hidden />}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  )
}
