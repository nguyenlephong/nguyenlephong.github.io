import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { PAGE_SEO, SITE, SITE_URL } from '@/app/seo.config'
import {
  buildSiteNavigationSchema,
  buildWebsiteSchema,
} from '@/lib/seo/profile-schema'
import { serializeJsonLd } from '@/lib/seo/json-ld'
import { SITE_SECTIONS, sectionUrl } from '@/lib/seo/site-sections'

const DEFAULT = `/${routing.defaultLocale}`

// Same brand title and description as /en (messages SEO.home) so the stub and
// the page it hands off to never disagree about what the site is called.
const SEO_TITLE = PAGE_SEO.home.title
const SEO_DESCRIPTION = PAGE_SEO.home.description

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
    siteName: SITE.name,
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
  const navigationSchema = buildSiteNavigationSchema(routing.defaultLocale)
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
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(navigationSchema) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.replace(${JSON.stringify(DEFAULT)});`,
          }}
        />
        <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
          <h1>Nguyen Le Phong</h1>
          <p>
            Redirecting to{' '}
            <a href={DEFAULT}>Nguyen Le Phong, Lead Software Engineer</a>…
          </p>
          <nav aria-label="Main sections">
            <ul>
              {SITE_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a href={sectionUrl(section, routing.defaultLocale)}>
                    {section.name}
                  </a>
                  {': '}
                  {section.description}
                </li>
              ))}
            </ul>
          </nav>
        </main>
      </body>
    </html>
  )
}
