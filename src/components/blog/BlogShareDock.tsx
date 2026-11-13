'use client'

import { useEffect, useState } from 'react'
import { LuLink, LuCheck } from 'react-icons/lu'
import ShareCopyFallback from './ShareCopyFallback'
import { useArticleShare, type ArticleShareProps } from './useArticleShare'
import { subscribeWindowScroll } from './windowScroll'

/**
 * Desktop share rail (≥1280px): sticky in the left margin of the article body.
 * Below 1280px the same targets live in the reader sheet (BlogReaderTools), so
 * the rail is not rendered visible there. Reveals itself after the masthead.
 */
export default function BlogShareDock({ labels, ...share }: ArticleShareProps) {
  const [visible, setVisible] = useState(false)
  const { targets, copied, copyFailed, copy, recordShare, dismissCopyFailure } =
    useArticleShare(share)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    onScroll()
    return subscribeWindowScroll(onScroll)
  }, [])

  return (
    <div
      className={['blog-share-dock', visible ? 'blog-share-dock--visible' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className="blog-share-dock__actions" role="group" aria-label={labels.share}>
        <span className="blog-share-dock__label" aria-hidden="true">
          {labels.share}
        </span>
        {targets.map(({ key, label, Icon, href }) => (
          <a
            key={key}
            className="blog-share-dock__btn"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            onClick={() => recordShare(key)}
          >
            <Icon aria-hidden="true" />
          </a>
        ))}
        <button
          type="button"
          className="blog-share-dock__btn"
          onClick={copy}
          aria-label={copied ? labels.copied : labels.copyLink}
          title={copied ? labels.copied : labels.copyLink}
        >
          {copied ? <LuCheck aria-hidden="true" /> : <LuLink aria-hidden="true" />}
        </button>
        {copyFailed && (
          <ShareCopyFallback
            url={share.url}
            message={labels.copyFailed}
            onDismiss={dismissCopyFailure}
          />
        )}
      </div>
    </div>
  )
}
