'use client'

import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  LuCalendarDays,
  LuCalendarRange,
  LuSun,
  LuClock,
  LuTimer,
  LuHeartPulse,
  LuCake,
  LuSparkles,
} from 'react-icons/lu'
import type { ComponentType, SVGProps } from 'react'
import type { FamilyMember } from './family.data'

dayjs.extend(duration)
dayjs.extend(relativeTime)

interface Ages {
  dob: string
  years: number
  months: number
  weeks: number
  days: number
  hours: number
  minutes: number
  seconds: number
  daysUntilBirthday: number
}

interface EnrichedMember extends FamilyMember, Ages {}

const formatNumber = (n: number): string => n.toLocaleString('vi-VN')

const calculateAges = (dob: string): Ages => {
  const now = dayjs()
  const birth = dayjs(dob)
  const thisYearBirthday = birth.year(now.year())
  const nextBirthday = thisYearBirthday.isAfter(now)
    ? thisYearBirthday
    : thisYearBirthday.add(1, 'year')

  return {
    dob: birth.format('DD.MM.YYYY'),
    years: now.diff(birth, 'year'),
    months: now.diff(birth, 'month'),
    weeks: now.diff(birth, 'week'),
    days: now.diff(birth, 'day'),
    hours: now.diff(birth, 'hour'),
    minutes: now.diff(birth, 'minute'),
    seconds: now.diff(birth, 'second'),
    daysUntilBirthday: nextBirthday.diff(now, 'day'),
  }
}

const buildEnriched = (members: FamilyMember[]): EnrichedMember[] =>
  members
    .map((member) => ({ ...member, ...calculateAges(member.dob) }))
    .sort((a, b) => b.years - a.years)

interface HeartbeatsClientProps {
  members: FamilyMember[]
}

export default function HeartbeatsClient({ members }: HeartbeatsClientProps) {
  const [enriched, setEnriched] = useState<EnrichedMember[] | null>(null)
  const [now, setNow] = useState('—')

  useEffect(() => {
    const tick = () => {
      setEnriched(buildEnriched(members))
      setNow(dayjs().format('HH:mm:ss · DD.MM.YYYY'))
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [members])

  const list = enriched ?? members.map((m) => ({ ...m, ...calculateAges(m.dob) }))

  const upcomingRank = useMemo(() => {
    const ranked = [...list]
      .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday)
      .slice(0, 3)
    const map = new Map<string, number>()
    ranked.forEach((p, i) => map.set(p.name, i + 1))
    return map
  }, [list])

  return (
    <main className="heartbeats-page">
      <div className="heartbeats-aurora" aria-hidden="true">
        <span className="heartbeats-aurora-blob b1" />
        <span className="heartbeats-aurora-blob b2" />
        <span className="heartbeats-aurora-blob b3" />
        <span className="heartbeats-aurora-blob b4" />
      </div>
      <div className="heartbeats-shell">
        <header>
          <span className="heartbeats-eyebrow" aria-live="polite">
            <span className="dot" aria-hidden="true" />
            Private · Family Pulse
          </span>
          <h1 className="heartbeats-title">
            Mỗi nhịp tim, <em>một lời nhắc nhớ</em>.
          </h1>
          <p className="heartbeats-lead">
            Trang riêng theo dõi thời gian của những người thân yêu — đếm từng giây
            đã đi qua, và những ngày còn lại đến sinh nhật kế tiếp.
          </p>
          <div className="heartbeats-meta">
            <span>
              Thành viên: <strong>{list.length}</strong>
            </span>
            <span suppressHydrationWarning>
              Cập nhật: <strong>{now}</strong>
            </span>
          </div>
        </header>

        <section
          className="heartbeats-grid"
          aria-label="Danh sách thành viên"
          suppressHydrationWarning
        >
          {list.map((person) => {
            const rank = upcomingRank.get(person.name)
            const isUpcoming = rank !== undefined
            return (
              <article
                key={person.name}
                className={
                  `hb-card hb-tier-${person.tier}` +
                  (isUpcoming ? ` is-upcoming hb-upcoming-${rank}` : '')
                }
                suppressHydrationWarning
              >
                <span className="hb-card-glow" aria-hidden="true" />

                <div className="hb-card-head">
                  <div className="hb-card-id">
                    <h2 className="hb-card-alias">{person.alias}</h2>
                    <p className="hb-card-name">{person.name}</p>
                    <p className="hb-card-dob">
                      <LuCake className="hb-card-dob-icon" aria-hidden="true" />
                      <time>{person.dob}</time>
                    </p>
                  </div>
                  <span className={`hb-card-relation hb-relation-${person.tier}`}>
                    <span className="hb-relation-dot" aria-hidden="true" />
                    {person.relation}
                  </span>
                </div>

                <div className="hb-age-row">
                  <span className="hb-age-num">{formatNumber(person.years)}</span>
                  <span className="hb-age-label">tuổi</span>
                </div>

                <ul className="hb-stats-flow">
                  <StatLine icon={LuCalendarDays} label="Tháng" value={formatNumber(person.months)} />
                  <StatLine icon={LuCalendarRange} label="Tuần" value={formatNumber(person.weeks)} />
                  <StatLine icon={LuSun} label="Ngày" value={formatNumber(person.days)} />
                  <StatLine icon={LuClock} label="Giờ" value={formatNumber(person.hours)} />
                  <StatLine icon={LuTimer} label="Phút" value={formatNumber(person.minutes)} full />
                  <StatLine icon={LuHeartPulse} label="Giây" value={formatNumber(person.seconds)} full live />
                </ul>

                <div className="hb-card-footer">
                  <span
                    className={
                      'hb-birthday' +
                      (isUpcoming || person.daysUntilBirthday <= 14
                        ? ' hb-birthday-soon'
                        : '')
                    }
                  >
                    <LuCake aria-hidden="true" className="hb-birthday-icon" />
                    Sinh nhật kế tiếp · <strong>{person.daysUntilBirthday}</strong> ngày
                  </span>
                  {isUpcoming && (
                    <span className={`hb-upcoming-chip hb-upcoming-${rank}`}>
                      <LuSparkles aria-hidden="true" />
                      Sắp tới · #{rank}
                    </span>
                  )}
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </main>
  )
}

interface StatLineProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  value: string
  live?: boolean
  full?: boolean
}

function StatLine({ icon: Icon, label, value, live, full }: StatLineProps) {
  return (
    <li
      className={
        'hb-stat-line' +
        (live ? ' is-live' : '') +
        (full ? ' is-full' : '')
      }
    >
      <span className="hb-stat-line-label">{label}</span>
      <span className="hb-stat-line-row">
        <Icon className="hb-stat-line-icon" aria-hidden="true" />
        <span className="hb-stat-line-value" suppressHydrationWarning>{value}</span>
      </span>
    </li>
  )
}
