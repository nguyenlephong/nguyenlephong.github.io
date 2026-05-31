'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { TbNetwork, TbLayoutList } from 'react-icons/tb'
import ThoughtGraph from './ThoughtGraph'
import ThoughtList from './ThoughtList'
import type { PublicThought, ThoughtEdge } from '@/lib/thoughts/types'

type View = 'graph' | 'list'
const STORAGE_KEY = 'thoughts-view'

interface Props {
  thoughts: PublicThought[]
  edges: ThoughtEdge[]
}

export default function ThoughtsViewClient({ thoughts, edges }: Props) {
  const t = useTranslations('Pages.thoughts')
  const [view, setView] = useState<View>('graph')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as View | null
      if (saved === 'graph' || saved === 'list') {
        setView(saved)
        return
      }
    } catch {}
    try {
      if (window.matchMedia('(max-width: 640px)').matches) setView('list')
    } catch {}
  }, [])

  const changeView = (v: View) => {
    setView(v)
    try {
      localStorage.setItem(STORAGE_KEY, v)
    } catch {}
  }

  return (
    <div className={`thoughts-view thoughts-view--${view}`}>
      <div className="thoughts-view__toolbar" role="group" aria-label={t('viewToggle')}>
        <button
          type="button"
          className={`thoughts-view__tab${view === 'graph' ? ' is-active' : ''}`}
          onClick={() => changeView('graph')}
          aria-pressed={view === 'graph'}
        >
          <TbNetwork size={14} aria-hidden />
          {t('viewGraph')}
        </button>
        <button
          type="button"
          className={`thoughts-view__tab${view === 'list' ? ' is-active' : ''}`}
          onClick={() => changeView('list')}
          aria-pressed={view === 'list'}
        >
          <TbLayoutList size={14} aria-hidden />
          {t('viewList')}
        </button>
      </div>

      {view === 'graph' ? (
        <div className="thoughts-view__graph-wrap">
          <ThoughtGraph thoughts={thoughts} edges={edges} fillViewport />
        </div>
      ) : (
        <div className="thoughts-view__list-wrap">
          <ThoughtList thoughts={thoughts} />
        </div>
      )}
    </div>
  )
}
