export const dynamic = 'force-static'

const SOURCE = `/* Development fallback only.
 * The export build rewrites out/sw.js with the generated offline worker.
 */
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
`

export function GET() {
  return new Response(SOURCE, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
