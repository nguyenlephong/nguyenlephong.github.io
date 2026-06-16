export const FONT_STORAGE_KEY = 'reading_font_preference'

export type ReadingFont =
  | 'inter'
  | 'source'
  | 'plex'
  | 'atkinson'
  | 'lora'
  | 'be-vietnam'

export const READING_FONTS: ReadingFont[] = [
  'inter',
  'source',
  'plex',
  'atkinson',
  'lora',
  'be-vietnam',
]

const fontScript = `
(function() {
  try {
    var key = '${FONT_STORAGE_KEY}';
    var allowed = ${JSON.stringify(READING_FONTS)};
    var stored = localStorage.getItem(key);
    var value = allowed.indexOf(stored) >= 0 ? stored : 'inter';
    document.documentElement.setAttribute('data-reading-font', value);
  } catch (e) {
    document.documentElement.setAttribute('data-reading-font', 'inter');
  }
})();
`

export default function FontScript() {
  return <script dangerouslySetInnerHTML={{ __html: fontScript }} />
}
