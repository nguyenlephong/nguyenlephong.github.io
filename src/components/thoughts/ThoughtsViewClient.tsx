'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { TbNetwork, TbLayoutList } from 'react-icons/tb'
import { track } from '@/lib/analytics'
import ThoughtGraph from './ThoughtGraph'
import ThoughtList from './ThoughtList'
import type { PublicThought, ThoughtEdge } from '@/lib/thoughts/types'

type View = 'graph' | 'list'
const STORAGE_KEY = 'thoughts-view'
const PARAM_KEY = 'view'

function getUrlView(): View | null {
  if (typeof window === 'undefined') return null
  const v = new URLSearchParams(window.location.search).get(PARAM_KEY) as View | null
  return v === 'graph' || v === 'list' ? v : null
}

function setUrlView(v: View) {
  const params = new URLSearchParams(window.location.search)
  params.set(PARAM_KEY, v)
  window.history.replaceState(null, '', `?${params.toString()}`)
}

interface Props {
  thoughts: PublicThought[]
  edges: ThoughtEdge[]
}

export default function ThoughtsViewClient({ thoughts, edges }: Props) {
  const t = useTranslations('Pages.thoughts')
  const [view, setView] = useState<View>('graph')

  useEffect(() => {
    let cancelled = false
    const frame = window.requestAnimationFrame(() => {
      if (cancelled) return
      // Priority: URL param → localStorage → mobile default
      const urlView = getUrlView()
      if (urlView) {
        setView(urlView)
        return
      }
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as View | null
        if (saved === 'graph' || saved === 'list') {
          setView(saved)
          setUrlView(saved)
          return
        }
      } catch {}
      try {
        if (window.matchMedia('(max-width: 640px)').matches) {
          setView('list')
          setUrlView('list')
        }
      } catch {}
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
    }
  }, [])

  const changeView = (v: View) => {
    if (v === view) return
    setView(v)
    setUrlView(v)
    try {
      localStorage.setItem(STORAGE_KEY, v)
    } catch {}
    track('thoughts_view_toggle', { from: view, to: v })
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
