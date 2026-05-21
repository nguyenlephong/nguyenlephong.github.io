import type { CSSProperties, ReactNode } from 'react'

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = 'image/png'

interface Theme {
  bg: string
  accent: string
  accentSoft: string
  text: string
  subtext: string
  chipBg: string
  chipText: string
  glow: string
}

const THEMES: Record<'dark' | 'light' | 'gold' | 'ocean' | 'violet', Theme> = {
  dark: {
    bg: '#0b0d12',
    accent: '#60a5fa',
    accentSoft: 'rgba(96,165,250,0.18)',
    text: '#f5f7fb',
    subtext: 'rgba(245,247,251,0.72)',
    chipBg: 'rgba(255,255,255,0.07)',
    chipText: '#e7ebf3',
    glow: 'radial-gradient(circle at 18% 22%, rgba(96,165,250,0.35), transparent 55%), radial-gradient(circle at 82% 78%, rgba(167,139,250,0.28), transparent 55%)',
  },
  light: {
    bg: '#f8fafc',
    accent: '#2563eb',
    accentSoft: 'rgba(37,99,235,0.12)',
    text: '#0b1220',
    subtext: 'rgba(11,18,32,0.66)',
    chipBg: 'rgba(15,23,42,0.06)',
    chipText: '#0f172a',
    glow: 'radial-gradient(circle at 18% 22%, rgba(37,99,235,0.18), transparent 55%), radial-gradient(circle at 82% 78%, rgba(244,114,182,0.16), transparent 55%)',
  },
  gold: {
    bg: '#0e0a04',
    accent: '#f4c563',
    accentSoft: 'rgba(244,197,99,0.18)',
    text: '#fff8e7',
    subtext: 'rgba(255,248,231,0.78)',
    chipBg: 'rgba(244,197,99,0.12)',
    chipText: '#fde9b3',
    glow: 'radial-gradient(circle at 18% 22%, rgba(244,197,99,0.38), transparent 55%), radial-gradient(circle at 82% 78%, rgba(220,151,38,0.22), transparent 55%)',
  },
  ocean: {
    bg: '#04101b',
    accent: '#5eead4',
    accentSoft: 'rgba(94,234,212,0.18)',
    text: '#ecfeff',
    subtext: 'rgba(236,254,255,0.74)',
    chipBg: 'rgba(94,234,212,0.10)',
    chipText: '#a7f3d0',
    glow: 'radial-gradient(circle at 18% 22%, rgba(94,234,212,0.35), transparent 55%), radial-gradient(circle at 82% 78%, rgba(56,189,248,0.28), transparent 55%)',
  },
  violet: {
    bg: '#0a0814',
    accent: '#c4b5fd',
    accentSoft: 'rgba(196,181,253,0.18)',
    text: '#f5f3ff',
    subtext: 'rgba(245,243,255,0.74)',
    chipBg: 'rgba(196,181,253,0.10)',
    chipText: '#ddd6fe',
    glow: 'radial-gradient(circle at 18% 22%, rgba(196,181,253,0.32), transparent 55%), radial-gradient(circle at 82% 78%, rgba(244,114,182,0.22), transparent 55%)',
  },
}

export type OgTheme = keyof typeof THEMES

interface OgShellProps {
  theme?: OgTheme
  eyebrow: string
  title: string
  subtitle?: string
  chips?: string[]
  badge?: { label: string; value: string }
  footer?: string
  rightSlot?: ReactNode
  titleSize?: number
}

const rootStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: 64,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, "Helvetica Neue", Arial, sans-serif',
  letterSpacing: '-0.01em',
}

export function OgShell({
  theme = 'dark',
  eyebrow,
  title,
  subtitle,
  chips,
  badge,
  footer,
  rightSlot,
  titleSize = 72,
}: OgShellProps) {
  const t = THEMES[theme]
  return (
    <div
      style={{
        ...rootStyle,
        background: t.bg,
        color: t.text,
        position: 'relative',
      }}
    >
      {/* glow layer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: t.glow,
          display: 'flex',
        }}
      />

      {/* top row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 18px',
            borderRadius: 999,
            background: t.accentSoft,
            color: t.accent,
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: t.accent,
              display: 'flex',
              marginRight: 12,
            }}
          />
          {eyebrow}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: t.subtext,
            fontSize: 22,
            fontWeight: 500,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: t.accent,
              color: t.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 800,
              marginRight: 14,
            }}
          >
            NLP
          </div>
          nguyenlephong.github.io
        </div>
      </div>

      {/* spacer */}
      <div style={{ display: 'flex', height: 56 }} />

      {/* title + subtitle + chips */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: titleSize,
            fontWeight: 800,
            lineHeight: 1.05,
            color: t.text,
            maxWidth: rightSlot ? 760 : 1080,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              display: 'flex',
              marginTop: 22,
              fontSize: 26,
              lineHeight: 1.35,
              color: t.subtext,
              fontWeight: 500,
              maxWidth: rightSlot ? 760 : 1080,
            }}
          >
            {subtitle}
          </div>
        )}
        {chips && chips.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              marginTop: 26,
              maxWidth: 1080,
            }}
          >
            {chips.map((c) => (
              <div
                key={c}
                style={{
                  display: 'flex',
                  padding: '8px 16px',
                  borderRadius: 12,
                  background: t.chipBg,
                  color: t.chipText,
                  fontSize: 20,
                  fontWeight: 600,
                  marginRight: 10,
                  marginTop: 10,
                }}
              >
                {c}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* flex spacer fills remaining */}
      <div style={{ display: 'flex', flexGrow: 1 }} />

      {/* footer row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', color: t.subtext, fontSize: 20 }}>
          {footer ?? 'Nguyen Le Phong · Senior Software Engineer · Tech Lead'}
        </div>
        {badge && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              borderRadius: 14,
              background: t.accentSoft,
              color: t.accent,
            }}
          >
            <div style={{ display: 'flex', fontSize: 20, fontWeight: 500, marginRight: 10 }}>
              {badge.label}
            </div>
            <div style={{ display: 'flex', fontSize: 32, fontWeight: 800 }}>{badge.value}</div>
          </div>
        )}
      </div>

      {rightSlot}
    </div>
  )
}
