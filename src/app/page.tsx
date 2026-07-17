import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { SITE_URL } from '@/app/seo.config'
import { buildWebsiteSchema } from '@/lib/seo/profile-schema'

const DEFAULT = `/${routing.defaultLocale}`

const SEO_TITLE = 'Nguyen Le Phong — Senior Software Engineer & Technical Lead'
const SEO_DESCRIPTION =
  'Senior full-stack engineer and technical lead with 8+ years shipping product, platform, Micro-Frontend, Kubernetes, secure fintech integration, and rollout systems.'
const OG_ALT = 'Nguyen Le Phong — Senior Software Engineer & Technical Lead'

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
  const websiteSchema = buildWebsiteSchema(SEO_DESCRIPTION)
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
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
