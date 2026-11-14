import type { Metadata } from 'next'

export const PUBLIC_THIRD_PARTY = Object.freeze({
  adsenseClientId: 'ca-pub-2196929070546836',
  adsenseOrigin: 'https://pagead2.googlesyndication.com',
  googleAnalyticsId: 'G-RLXNC58343',
  googleTagManagerOrigin: 'https://www.googletagmanager.com',
})

/**
 * MEP-66: AdSense and GA4 are paused (owner decision), not deleted. Off unless the
 * build runs with GOOGLE_THIRD_PARTY=on; scripts/postbuild.mjs reads the same
 * variable to keep or drop out/ads.txt.
 */
export function isGoogleThirdPartyEnabled(
  flag: string | undefined = process.env['GOOGLE_THIRD_PARTY'],
): boolean {
  return flag === 'on'
}

export const GOOGLE_THIRD_PARTY_ENABLED = isGoogleThirdPartyEnabled()

export function publicThirdPartyMetadata(
  enabled = GOOGLE_THIRD_PARTY_ENABLED,
): Metadata {
  if (!enabled) return {}
  return {
    other: {
      'google-adsense-account': PUBLIC_THIRD_PARTY.adsenseClientId,
    },
  }
}
