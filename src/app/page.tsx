import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { SITE_URL } from '@/app/seo.config'

const DEFAULT = `/${routing.defaultLocale}`

const SEO_TITLE = 'Nguyen Le Phong — Senior Software Engineer & Tech Lead'
const SEO_DESCRIPTION =
  'Senior Software Engineer & Head of Tech with 8+ years building product, leading delivery, and architecting Micro-Frontend, Kubernetes, and rollout systems. Bachelor of IT — Very Good (GPA 3.36).'
const OG_ALT = 'Nguyen Le Phong — Senior Software Engineer & Tech Lead'

const localeLanguages: Record<string, string> = {}
for (const loc of routing.locales) localeLanguages[loc] = `${SITE_URL}/${loc}`
localeLanguages['x-default'] = `${SITE_URL}${DEFAULT}`

// Proper Metadata API — Next.js injects og:image from the sibling
// opengraph-image.tsx automatically. metadataBase fixes the localhost URL
// that previously slipped into the static export and made crawlers fall
// back to the favicon/avatar.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  alternates: {
    canonical: DEFAULT,
    languages: localeLanguages,
  },
  openGraph: {
    type: 'profile',
    siteName: 'Nguyen Le Phong — Software Engineer',
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    url: `${SITE_URL}${DEFAULT}`,
    locale: 'en_US',
    alternateLocale: ['vi_VN', 'zh_CN', 'ja_JP', 'ko_KR', 'fr_FR'],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@nguyenlephong17',
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
  },
}

export default function RootPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {/* Send humans to the localized homepage. Crawlers read the
            Metadata-injected og:* / twitter:* tags before following this. */}
        <meta httpEquiv="refresh" content={`0;url=${DEFAULT}`} />
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
