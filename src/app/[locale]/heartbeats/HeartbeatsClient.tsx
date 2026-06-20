'use client'

import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  LuActivity,
  LuCalendarDays,
  LuCalendarRange,
  LuHeartPulse,
  LuCake,
  LuCalendarClock,
  LuHeartHandshake,
  LuMessageCircle,
  LuSparkles,
  LuUsers,
} from 'react-icons/lu'
import type { ComponentType, CSSProperties, SVGProps } from 'react'
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
  daysSinceBirthday: number
  birthdayProgress: number
  nextBirthday: string
  nextBirthdayIso: string
}

interface EnrichedMember extends FamilyMember, Ages {}

const formatNumber = (n: number): string => n.toLocaleString('vi-VN')

const calculateAges = (dob: string): Ages => {
  const now = dayjs()
  const today = now.startOf('day')
  const birth = dayjs(dob)
  const thisYearBirthday = birth.year(now.year()).startOf('day')
  const lastBirthday = thisYearBirthday.isAfter(today)
    ? thisYearBirthday.subtract(1, 'year')
    : thisYearBirthday
  const nextBirthday = thisYearBirthday.isBefore(today)
    ? thisYearBirthday.add(1, 'year')
    : thisYearBirthday
  const daysSinceBirthday = today.diff(lastBirthday, 'day')
  const birthdayCycleDays = Math.max(nextBirthday.diff(lastBirthday, 'day'), 1)
  const birthdayProgress = Math.min(
    100,
    Math.max(0, Math.round((daysSinceBirthday / birthdayCycleDays) * 100)),
  )

  return {
    dob: birth.format('DD.MM.YYYY'),
    years: now.diff(birth, 'year'),
    months: now.diff(birth, 'month'),
    weeks: now.diff(birth, 'week'),
    days: now.diff(birth, 'day'),
    hours: now.diff(birth, 'hour'),
    minutes: now.diff(birth, 'minute'),
    seconds: now.diff(birth, 'second'),
    daysUntilBirthday: nextBirthday.diff(today, 'day'),
    daysSinceBirthday,
    birthdayProgress,
    nextBirthday: nextBirthday.format('DD.MM.YYYY'),
    nextBirthdayIso: nextBirthday.format('YYYY-MM-DD'),
  }
}

const buildEnriched = (members: FamilyMember[]): EnrichedMember[] =>
  members
    .map((member) => ({ ...member, ...calculateAges(member.dob) }))
    .sort((a, b) => b.years - a.years)

type ProgressStyle = CSSProperties & {
  '--hb-ring': string
}

const progressStyle = (progress: number): ProgressStyle => ({
  '--hb-ring': `${Math.round(Math.min(100, Math.max(0, progress)) * 3.6)}deg`,
})

const countdownLabel = (days: number): string => {
  if (days === 0) return 'Hôm nay'
  if (days === 1) return 'Ngày mai'
  return `${formatNumber(days)} ngày nữa`
}

const constellationLayout = [
  { x: 50, y: 10 },
  { x: 77, y: 23 },
  { x: 86, y: 55 },
  { x: 64, y: 83 },
  { x: 31, y: 84 },
  { x: 13, y: 57 },
  { x: 22, y: 25 },
  { x: 50, y: 42 },
] as const

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

  const list = enriched ?? buildEnriched(members)

  const summary = useMemo(() => {
    const upcoming = [...list].sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday)
    const birthdaysIn30Days = upcoming.filter((person) => person.daysUntilBirthday <= 30).length
    const youngest = [...list].sort((a, b) => a.years - b.years)[0] ?? upcoming[0]

    return {
      upcoming,
      next: upcoming[0],
      birthdaysIn30Days,
      youngest,
    }
  }, [list])

  return (
    <main className="heartbeats-page">
      <div className="heartbeats-field" aria-hidden="true" />
      <div className="heartbeats-shell">
        <section className="heartbeats-hero" aria-labelledby="heartbeats-title">
          <div className="heartbeats-hero__copy">
            <span className="heartbeats-eyebrow" aria-live="polite">
              <span className="heartbeats-live-dot" aria-hidden="true" />
              Private · Family Signal Atlas
            </span>
            <h1 id="heartbeats-title" className="heartbeats-title">
              Một bản đồ nhỏ cho những dịp mình muốn nhớ.
            </h1>
            <p className="heartbeats-lead">
              Mở trang này mỗi ngày để nhìn thấy sinh nhật nào đang đến gần,
              chuẩn bị một lời nhắn đúng lúc, và giữ các dịp gia đình quan
              trọng trong một góc thật dễ nhìn.
            </p>
            <div className="heartbeats-meta">
              <span>
                Thành viên <strong>{list.length}</strong>
              </span>
              <span suppressHydrationWarning>
                Cập nhật <strong>{now}</strong>
              </span>
            </div>
          </div>

          {summary.next && (
            <ConstellationMap
              people={summary.upcoming.slice(0, constellationLayout.length)}
              next={summary.next}
            />
          )}
        </section>

        <section className="heartbeats-overview" aria-label="Tổng quan hôm nay" suppressHydrationWarning>
          <DashboardMetric icon={LuUsers} label="Thành viên" value={formatNumber(list.length)} note="người trong vòng nhớ" />
          <DashboardMetric icon={LuActivity} label="Mốc kỷ niệm" value={formatNumber(list.length)} note="ngày sinh được lưu riêng tư" />
          <DashboardMetric icon={LuCalendarClock} label="Trong 30 ngày" value={formatNumber(summary.birthdaysIn30Days)} note="dịp nên chuẩn bị" />
          <DashboardMetric icon={LuHeartHandshake} label="Người nhỏ nhất" value={summary.youngest?.alias ?? '—'} note={summary.youngest ? `${summary.youngest.years} tuổi` : 'chưa có dữ liệu'} />
        </section>

        <div className="heartbeats-workspace">
          <aside className="heartbeats-sidebar" aria-label="Góc nhắc nhớ">
            <section className="hb-panel hb-panel--sticky">
              <div className="hb-panel__head">
                <LuSparkles aria-hidden="true" />
                <h2>Tuyến sắp tới</h2>
              </div>
              <ol className="hb-upcoming-list">
                {summary.upcoming.slice(0, 4).map((person, index) => (
                  <li key={person.id}>
                    <span className="hb-upcoming-rank">{index + 1}</span>
                    <div>
                      <strong>{person.alias}</strong>
                      <small>{person.relation}</small>
                    </div>
                    <time dateTime={person.nextBirthdayIso}>{countdownLabel(person.daysUntilBirthday)}</time>
                  </li>
                ))}
              </ol>
            </section>

            <section className="hb-panel hb-panel--note">
              <div className="hb-panel__head">
                <LuMessageCircle aria-hidden="true" />
                <h2>Gợi ý hôm nay</h2>
              </div>
              <p>
                Chọn một người trong danh sách, nhắn một câu ngắn, hoặc lưu lại
                một việc nhỏ mình muốn chuẩn bị trước dịp kế tiếp.
              </p>
            </section>
          </aside>

          <section className="heartbeats-grid" aria-label="Danh sách thành viên" suppressHydrationWarning>
            {list.map((person) => {
              const rank = summary.upcoming.findIndex((item) => item.id === person.id) + 1
              return <MemberCard key={person.id} person={person} rank={rank <= 3 ? rank : undefined} />
            })}
          </section>
        </div>
      </div>
    </main>
  )
}

interface DashboardMetricProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  value: string
  note: string
}

interface ConstellationMapProps {
  people: EnrichedMember[]
  next: EnrichedMember
}

function ConstellationMap({ people, next }: ConstellationMapProps) {
  const points = people.map((person, index) => ({
    person,
    index,
    ...constellationLayout[index],
  }))
  const path = points.map((point) => `${point.x},${point.y}`).join(' ')

  return (
    <aside className="heartbeats-focus" aria-label="Bản đồ sinh nhật gia đình" suppressHydrationWarning>
      <div className="heartbeats-focus__header">
        <span className="heartbeats-focus__label">Sinh nhật gần nhất</span>
        <strong>{next.alias}</strong>
        <time dateTime={next.nextBirthdayIso}>{next.nextBirthday}</time>
      </div>

      <div className="heartbeats-focus__map" style={progressStyle(next.birthdayProgress)}>
        <svg className="hb-constellation" viewBox="0 0 100 100" role="img" aria-label="Các sinh nhật sắp tới được nối thành bản đồ">
          <circle className="hb-constellation__outer" cx="50" cy="50" r="42" />
          <circle className="hb-constellation__middle" cx="50" cy="50" r="27" />
          <circle className="hb-constellation__inner" cx="50" cy="50" r="12" />
          <polyline className="hb-constellation__line" points={path} />
          {points.map(({ person, index, x, y }) => (
            <g key={person.id} className={`hb-constellation__point hb-tier-${person.tier}`}>
              <circle cx={x} cy={y} r={index === 0 ? 4.8 : 3.8} />
              <text x={x} y={y + 1.4}>{index + 1}</text>
            </g>
          ))}
        </svg>
        <div className="heartbeats-focus__center">
          <LuHeartPulse aria-hidden="true" />
          <span>{next.daysUntilBirthday}</span>
          <small>{countdownLabel(next.daysUntilBirthday)}</small>
        </div>
      </div>

      <ol className="hb-orbit-list" aria-label="Thứ tự sinh nhật sắp tới">
        {points.slice(0, 4).map(({ person, index }) => (
          <li key={person.id}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <strong>{person.alias}</strong>
              <small>{person.relation}</small>
            </div>
            <time dateTime={person.nextBirthdayIso}>{countdownLabel(person.daysUntilBirthday)}</time>
          </li>
        ))}
      </ol>
    </aside>
  )
}

function DashboardMetric({ icon: Icon, label, value, note }: DashboardMetricProps) {
  return (
    <article className="hb-metric">
      <Icon className="hb-metric__icon" aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  )
}

interface MemberCardProps {
  person: EnrichedMember
  rank?: number
}

function MemberCard({ person, rank }: MemberCardProps) {
  const isUpcoming = rank !== undefined

  return (
    <article
      className={`hb-card hb-tier-${person.tier}${isUpcoming ? ' is-upcoming' : ''}`}
      style={progressStyle(person.birthdayProgress)}
      suppressHydrationWarning
    >
      <div className="hb-card-head">
        <div className="hb-card-avatar" aria-hidden="true">
          {person.alias.slice(0, 1)}
        </div>
        <div className="hb-card-id">
          <h2 className="hb-card-alias">{person.alias}</h2>
          <p className="hb-card-dob">
            <LuCake className="hb-card-dob-icon" aria-hidden="true" />
            <time>{person.dob}</time>
          </p>
        </div>
        <span className={`hb-card-relation hb-relation-${person.tier}`}>
          {person.relation}
        </span>
      </div>

      <div className="hb-card-core">
        <div className="hb-age-row">
          <span className="hb-age-num">{formatNumber(person.years)}</span>
          <span className="hb-age-label">tuổi</span>
        </div>
        <div className="hb-card-orbit" aria-hidden="true">
          <span />
        </div>
      </div>

      <div className="hb-next-row">
        <span>Sinh nhật kế tiếp</span>
        <strong>{countdownLabel(person.daysUntilBirthday)}</strong>
      </div>

      <ul className="hb-stats-flow">
        <StatLine icon={LuCalendarDays} label="Ngày sinh" value={person.dob} />
        <StatLine icon={LuCalendarRange} label="Chu kỳ năm" value={`${person.birthdayProgress}%`} />
        <StatLine icon={LuHeartHandshake} label="Vai trò" value={person.relation} />
        <StatLine icon={LuHeartPulse} label="Nhịp nhắc" value={countdownLabel(person.daysUntilBirthday)} live />
      </ul>

      <div className="hb-card-footer">
        <span className="hb-birthday">
          <LuCake aria-hidden="true" className="hb-birthday-icon" />
          <time dateTime={person.nextBirthdayIso}>{person.nextBirthday}</time>
        </span>
        {isUpcoming && (
          <span className="hb-upcoming-chip">
            <LuSparkles aria-hidden="true" />
            Sắp tới · #{rank}
          </span>
        )}
      </div>
    </article>
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
