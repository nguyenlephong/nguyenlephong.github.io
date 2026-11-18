'use client'

import { useState, type CSSProperties } from 'react'
import { LuHeart, LuLightbulb, LuPartyPopper, LuThumbsUp } from 'react-icons/lu'
import type { AdminPostRow, AdminReactionKey } from '@/lib/admin/insights.mjs'
import { categoryStyle, postHref } from './admin-format'
import { useAdminText } from './admin-i18n'

const LEADERBOARD_LIMIT = 10
const NEVER_PREVIEW = 6

const REACTIONS: Array<{ key: AdminReactionKey; Icon: typeof LuHeart }> = [
  { key: 'like', Icon: LuThumbsUp },
  { key: 'love', Icon: LuHeart },
  { key: 'insightful', Icon: LuLightbulb },
  { key: 'clap', Icon: LuPartyPopper },
]

type TitleMap = ReadonlyMap<string, string>
type LocaleMap = ReadonlyMap<string, string>

/** Row style: category hue, stagger index, bar ratio. */
const rowStyle = (category: string, index: number, ratio = 0): CSSProperties =>
  ({ ...categoryStyle(category), '--i': index, '--ratio': ratio }) as CSSProperties

export function PostTitle({ post, localeById }: { post: AdminPostRow; localeById: LocaleMap }) {
  const href = postHref(post, localeById)
  return href ? (
    <a className="admin-post__title" href={href} target="_blank" rel="noopener">
      {post.title}
    </a>
  ) : (
    <span className="admin-post__title admin-post__title--unlisted">{post.title}</span>
  )
}

export function PostMeta({ post, categoryTitles }: { post: AdminPostRow; categoryTitles: TitleMap }) {
  const { t, fmt } = useAdminText()
  return (
    <span className="admin-post__meta">
      <span className="admin-cat">{categoryTitles.get(post.category) ?? post.category}</span>
      {post.date ? (
        <time className="admin-mono" dateTime={post.date}>
          {fmt.date(post.date)}
        </time>
      ) : null}
      {post.listed ? null : <span>{t.love.notInCatalog}</span>}
    </span>
  )
}

function LeaderRow({ post, index, max, categoryTitles, localeById }: {
  post: AdminPostRow
  index: number
  max: number
  categoryTitles: TitleMap
  localeById: LocaleMap
}) {
  const { t, fmt } = useAdminText()
  return (
    <li className="admin-rank" data-cat={post.category} style={rowStyle(post.category, index, max > 0 ? post.views / max : 0)}>
      <span className="admin-rank__n admin-mono" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="admin-rank__body">
        <PostTitle post={post} localeById={localeById} />
        <PostMeta post={post} categoryTitles={categoryTitles} />
        <span className="admin-glow-bar" aria-hidden="true">
          <span className="admin-glow-bar__fill" />
        </span>
      </div>
      <span className="admin-rank__value">
        {fmt.number(post.views)}
        <span className="admin-visually-hidden"> {t.top.readsSuffix}</span>
      </span>
    </li>
  )
}

export function AdminLeaderboard({ posts, categoryTitles, localeById }: {
  posts: AdminPostRow[]
  categoryTitles: TitleMap
  localeById: LocaleMap
}) {
  const { t, fmt } = useAdminText()
  const top = posts.filter((post) => post.views > 0).slice(0, LEADERBOARD_LIMIT)
  const max = top[0]?.views ?? 0
  return (
    <div className="admin-split__main">
      <header className="admin-section__head">
        <h2 id="admin-top" className="admin-title">{t.top.title}</h2>
        <p className="admin-section__note">{t.top.note(fmt.number(LEADERBOARD_LIMIT))}</p>
      </header>
      {top.length === 0 ? (
        <p className="admin-empty">{t.top.empty}</p>
      ) : (
        <ol className="admin-ranks">
          {top.map((post, index) => (
            <LeaderRow key={post.id} post={post} index={index} max={max} categoryTitles={categoryTitles} localeById={localeById} />
          ))}
        </ol>
      )}
    </div>
  )
}

export function AdminReactionList({ reactions, total }: { reactions: Record<AdminReactionKey, number>; total: number }) {
  const { t, fmt } = useAdminText()
  const max = Math.max(0, ...REACTIONS.map(({ key }) => reactions[key]))
  return (
    <aside className="admin-split__side" aria-labelledby="admin-reactions">
      <header className="admin-section__head">
        <h2 id="admin-reactions" className="admin-title admin-title--small">{t.reactions.title}</h2>
        <p className="admin-section__note">{total > 0 ? t.reactions.total(fmt.number(total)) : t.reactions.none}</p>
      </header>
      {total === 0 ? null : (
        <ul className="admin-reacts">
          {REACTIONS.map(({ key, Icon }, index) => (
            <li key={key} className="admin-react" style={rowStyle('', index, max > 0 ? reactions[key] / max : 0)}>
              <span className="admin-react__icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="admin-react__label">{t.reactions[key]}</span>
              <span className="admin-react__value">
                {fmt.number(reactions[key])}
                <span className="admin-react__share admin-mono">{fmt.percent(reactions[key] / total)}</span>
              </span>
              <span className="admin-glow-bar admin-glow-bar--accent" aria-hidden="true">
                <span className="admin-glow-bar__fill" />
              </span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

function IdleNode({ post, index, categoryTitles, localeById, value }: {
  post: AdminPostRow
  index: number
  categoryTitles: TitleMap
  localeById: LocaleMap
  value?: string
}) {
  return (
    <li className="admin-idle__row" data-cat={post.category} style={rowStyle(post.category, index)}>
      <span className="admin-idle__wire" aria-hidden="true" />
      <div className="admin-idle__node">
        <span className="admin-idle__text">
          <PostTitle post={post} localeById={localeById} />
          <PostMeta post={post} categoryTitles={categoryTitles} />
        </span>
        {value ? <span className="admin-idle__value admin-mono">{value}</span> : null}
      </div>
    </li>
  )
}

export function AdminNeedsLove({ never, least, categoryTitles, localeById }: {
  never: AdminPostRow[]
  least: AdminPostRow[]
  categoryTitles: TitleMap
  localeById: LocaleMap
}) {
  const { t, fmt } = useAdminText()
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? never : never.slice(0, NEVER_PREVIEW)
  return (
    <section id="admin-love" className="admin-section" aria-labelledby="admin-love-title" data-reveal>
      <header className="admin-section__head">
        <h2 id="admin-love-title" className="admin-title">{t.love.title}</h2>
        <p className="admin-section__note">{t.love.note}</p>
      </header>
      <div className="admin-love">
        <div className="admin-idle">
          <p className="admin-idle__root">
            <span className="admin-idle__root-name">{t.love.neverTitle}</span>
            <span className="admin-mono">{t.love.neverMeta(fmt.number(never.length))}</span>
          </p>
          {never.length === 0 ? (
            <p className="admin-empty">{t.love.neverEmpty}</p>
          ) : (
            <ul className="admin-idle__list">
              {visible.map((post, index) => (
                <IdleNode key={post.id} post={post} index={index} categoryTitles={categoryTitles} localeById={localeById} />
              ))}
            </ul>
          )}
          {never.length > NEVER_PREVIEW ? (
            <button type="button" className="admin-btn admin-btn--quiet admin-idle__more" aria-expanded={showAll} onClick={() => setShowAll((value) => !value)}>
              {showAll ? t.love.showNewest(fmt.number(NEVER_PREVIEW)) : t.love.showAll(fmt.number(never.length))}
            </button>
          ) : null}
        </div>
        <div className="admin-idle">
          <p className="admin-idle__root">
            <span className="admin-idle__root-name">{t.love.leastTitle}</span>
            <span className="admin-mono">{t.love.leastMeta}</span>
          </p>
          {least.length === 0 ? (
            <p className="admin-empty">{t.love.leastEmpty}</p>
          ) : (
            <ol className="admin-idle__list">
              {least.map((post, index) => (
                <IdleNode
                  key={post.id}
                  post={post}
                  index={index}
                  categoryTitles={categoryTitles}
                  localeById={localeById}
                  value={t.love.reads(fmt.number(post.views))}
                />
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  )
}
