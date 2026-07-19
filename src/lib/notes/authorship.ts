import { SITE, SITE_URL } from '@/app/seo.config'

export interface NoteAuthorIdentity {
  name: string
  profileUrl?: string
  structuredData: {
    '@type': 'Person'
    '@id'?: string
    name: string
    url?: string
  }
}

/** Keep guest authors distinct from the site-owner Person identity. */
export function resolveNoteAuthorIdentity(
  author: string | undefined,
): NoteAuthorIdentity | null {
  const name = author?.trim()
  if (!name) return null
  if (name !== SITE.brandShort) {
    return { name, structuredData: { '@type': 'Person', name } }
  }

  return {
    name,
    profileUrl: SITE_URL,
    structuredData: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name,
      url: SITE_URL,
    },
  }
}
