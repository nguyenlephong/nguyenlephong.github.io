import { routing } from '@/i18n/routing'
import { SITE_URL } from '@/app/seo.config'

const DEFAULT = `/${routing.defaultLocale}`

const SEO_TITLE = 'Nguyen Le Phong — Senior Software Engineer & Tech Lead'
const SEO_DESCRIPTION =
  'Senior Software Engineer & Head of Tech with 8+ years building product, leading delivery, and architecting Micro-Frontend, Kubernetes, and rollout systems. Bachelor of IT — Very Good (GPA 3.36).'
const OG_IMAGE = `${SITE_URL}/opengraph-image`
const OG_ALT = 'Nguyen Le Phong — Senior Software Engineer & Tech Lead'

export const metadata = {
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
}

export default function RootPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}${DEFAULT}`} />

        {/* Hreflang alternates so crawlers know per-locale URLs exist */}
        {routing.locales.map((loc) => (
          <link
            key={loc}
            rel="alternate"
            hrefLang={loc}
            href={`${SITE_URL}/${loc}`}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${DEFAULT}`} />

        {/* Open Graph — pinned to the locale homepage so the thumbnail renders
            even when someone shares the bare nguyenlephong.github.io URL. */}
        <meta property="og:type" content="profile" />
        <meta property="og:site_name" content="Nguyen Le Phong — Software Engineer" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:url" content={`${SITE_URL}${DEFAULT}`} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="vi_VN" />
        <meta property="og:locale:alternate" content="zh_CN" />
        <meta property="og:locale:alternate" content="ja_JP" />
        <meta property="og:locale:alternate" content="ko_KR" />
        <meta property="og:locale:alternate" content="fr_FR" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:secure_url" content={OG_IMAGE} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={OG_ALT} />

        {/* Twitter card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@nguyenlephong17" />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:image:alt" content={OG_ALT} />

        {/* Send humans to the localized homepage. Crawlers will have already
            captured the meta tags above before following the refresh. */}
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
