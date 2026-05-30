'use client'

import { useState } from 'react'
import {
  LuEye,
  LuThumbsUp,
  LuHeart,
  LuLightbulb,
  LuPartyPopper,
  LuShare2,
  LuLink,
  LuCheck,
} from 'react-icons/lu'
import { FaXTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa6'
import type { IconType } from 'react-icons'
import type { ReactionKey } from '@/lib/firebase/postStats'
import { usePostEngagement } from './usePostEngagement'

interface BlogEngagementProps {
  category: string
  slug: string
  /** Absolute canonical URL of the article, used for sharing. */
  url: string
  title: string
  labels: {
    reactionsPrompt: string
    views: string
    share: string
    copyLink: string
    copied: string
    reactions: Record<ReactionKey, string>
  }
}

const REACTIONS: { key: ReactionKey; Icon: IconType }[] = [
  { key: 'like', Icon: LuThumbsUp },
  { key: 'love', Icon: LuHeart },
  { key: 'insightful', Icon: LuLightbulb },
  { key: 'clap', Icon: LuPartyPopper },
]

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k'
  return String(n)
}

export default function BlogEngagement({
  category,
  slug,
  url,
  title,
  labels,
}: BlogEngagementProps) {
  const { views, reactions, myReaction, ready, react, recordShare } =
    usePostEngagement(category, slug)
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const shareLinks = [
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

  async function handleNativeShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url })
        recordShare()
      } catch {
        // user cancelled — do nothing
      }
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      recordShare()
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const canNativeShare =
    typeof navigator !== 'undefined' && 'share' in navigator

  return (
    <section
      className={`blog-engagement${ready ? ' blog-engagement--ready' : ''}`}
      aria-label={labels.share}
    >
      <div className="blog-engagement__reactions">
        <span className="blog-engagement__prompt">{labels.reactionsPrompt}</span>
        <div className="blog-engagement__react-row" role="group">
          {REACTIONS.map(({ key, Icon }) => {
            const active = myReaction === key
            return (
              <button
                key={key}
                type="button"
                className={`blog-react${active ? ' blog-react--active' : ''}`}
                aria-pressed={active}
                aria-label={labels.reactions[key]}
                title={labels.reactions[key]}
                onClick={() => react(key)}
              >
                <Icon aria-hidden="true" className="blog-react__icon" />
                <span className="blog-react__count">
                  {formatCount(reactions[key])}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="blog-engagement__aside">
        <span className="blog-engagement__views" title={labels.views}>
          <LuEye aria-hidden="true" />
          <span>{formatCount(views)}</span>
          <span className="blog-engagement__views-label">{labels.views}</span>
        </span>

        <div className="blog-engagement__share">
          {canNativeShare && (
            <button
              type="button"
              className="blog-share-btn blog-share-btn--primary"
              onClick={handleNativeShare}
            >
              <LuShare2 aria-hidden="true" />
              <span>{labels.share}</span>
            </button>
          )}
          {shareLinks.map(({ key, label, Icon, href }) => (
            <a
              key={key}
              className="blog-share-btn"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              onClick={() => recordShare()}
            >
              <Icon aria-hidden="true" />
            </a>
          ))}
          <button
            type="button"
            className="blog-share-btn"
            onClick={handleCopy}
            aria-label={copied ? labels.copied : labels.copyLink}
            title={copied ? labels.copied : labels.copyLink}
          >
            {copied ? <LuCheck aria-hidden="true" /> : <LuLink aria-hidden="true" />}
          </button>
        </div>
      </div>
    </section>
  )
}
