export const READING_BACKGROUND_STORAGE_KEY = 'reading_background_preference'

export type ReadingBackground =
  | 'plain'
  | 'parchment'
  | 'linen'
  | 'sepia'
  | 'sage'
  | 'mist'
  | 'night'

export const READING_BACKGROUNDS: ReadingBackground[] = [
  'plain',
  'parchment',
  'linen',
  'sepia',
  'sage',
  'mist',
  'night',
]

const backgroundScript = `
(function() {
  try {
    var key = '${READING_BACKGROUND_STORAGE_KEY}';
    var allowed = ${JSON.stringify(READING_BACKGROUNDS)};
    var stored = localStorage.getItem(key);
    if (allowed.indexOf(stored) >= 0) {
      document.documentElement.setAttribute('data-reading-background', stored);
    } else {
      document.documentElement.removeAttribute('data-reading-background');
    }
  } catch (e) {
    document.documentElement.removeAttribute('data-reading-background');
  }
})();
`

export default function ReadingBackgroundScript() {
  return <script dangerouslySetInnerHTML={{ __html: backgroundScript }} />
}
