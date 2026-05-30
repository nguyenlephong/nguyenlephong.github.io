'use client'

import {
  LuThumbsUp,
  LuHeart,
  LuLightbulb,
  LuPartyPopper,
} from 'react-icons/lu'
import type { IconType } from 'react-icons'
import { formatCount, type ReactionKey } from '@/lib/firebase/postStats'
import { useEngagement } from './EngagementProvider'

interface BlogReactionsProps {
  prompt: string
  reactionLabels: Record<ReactionKey, string>
}

const REACTIONS: { key: ReactionKey; Icon: IconType }[] = [
  { key: 'like', Icon: LuThumbsUp },
  { key: 'love', Icon: LuHeart },
  { key: 'insightful', Icon: LuLightbulb },
  { key: 'clap', Icon: LuPartyPopper },
]

/** Bottom-of-article "What did you think?" reaction bar. */
export default function BlogReactions({
  prompt,
  reactionLabels,
}: BlogReactionsProps) {
  const engagement = useEngagement()
  if (!engagement) return null
  const { reactions, myReaction, ready, react } = engagement

  return (
    <section
      className={`blog-reactions${ready ? ' blog-reactions--ready' : ''}`}
      aria-label={prompt}
    >
      <span className="blog-reactions__prompt">{prompt}</span>
      <div className="blog-reactions__row" role="group">
        {REACTIONS.map(({ key, Icon }) => {
          const active = myReaction === key
          return (
            <button
              key={key}
              type="button"
              className={`blog-react${active ? ' blog-react--active' : ''}`}
              aria-pressed={active}
              aria-label={reactionLabels[key]}
              title={reactionLabels[key]}
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
    </section>
  )
}
