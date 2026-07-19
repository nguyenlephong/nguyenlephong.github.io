'use client'

import Script from 'next/script'
import ReactDOM from 'react-dom'
import { PUBLIC_THIRD_PARTY } from '@/lib/public-third-party'

export default function PublicThirdPartyResources() {
  ReactDOM.preconnect(PUBLIC_THIRD_PARTY.googleTagManagerOrigin, {
    crossOrigin: '',
  })
  ReactDOM.prefetchDNS(PUBLIC_THIRD_PARTY.googleTagManagerOrigin)
  ReactDOM.prefetchDNS(PUBLIC_THIRD_PARTY.adsenseOrigin)

  return (
    <>
      <Script
        strategy="lazyOnload"
        id="GTM"
        src={`${PUBLIC_THIRD_PARTY.googleTagManagerOrigin}/gtag/js?id=${PUBLIC_THIRD_PARTY.googleAnalyticsId}`}
      />
      <Script
        strategy="lazyOnload"
        id="adsbygoogle"
        src={`${PUBLIC_THIRD_PARTY.adsenseOrigin}/pagead/js/adsbygoogle.js?client=${PUBLIC_THIRD_PARTY.adsenseClientId}`}
        crossOrigin="anonymous"
      />
      <Script
        id="GTM_datalayer"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', ${JSON.stringify(PUBLIC_THIRD_PARTY.googleAnalyticsId)}, { page_path: window.location.pathname });
          `,
        }}
      />
    </>
  )
}
