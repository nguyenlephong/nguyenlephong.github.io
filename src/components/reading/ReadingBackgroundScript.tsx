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
    var value = allowed.indexOf(stored) >= 0 ? stored : 'plain';
    document.documentElement.setAttribute('data-reading-background', value);
  } catch (e) {
    document.documentElement.setAttribute('data-reading-background', 'plain');
  }
})();
`

export default function ReadingBackgroundScript() {
  return <script dangerouslySetInnerHTML={{ __html: backgroundScript }} />
}
