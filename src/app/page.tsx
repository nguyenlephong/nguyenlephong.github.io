import { routing } from '@/i18n/routing'

const DEFAULT = `/${routing.defaultLocale}`

export const metadata = {
  title: 'Redirecting…',
  robots: { index: false, follow: false },
  other: {
    'http-equiv:refresh': `0;url=${DEFAULT}`,
  },
}

export default function RootPage() {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="refresh" content={`0;url=${DEFAULT}`} />
        <link rel="canonical" href={DEFAULT} />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.replace(${JSON.stringify(DEFAULT)});`,
          }}
        />
        <p style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
          Redirecting to <a href={DEFAULT}>{DEFAULT}</a>…
        </p>
      </body>
    </html>
  )
}
