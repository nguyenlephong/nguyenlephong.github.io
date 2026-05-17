export const THEME_STORAGE_KEY = 'theme_preference'

const themeScript = `
(function() {
  try {
    var key = '${THEME_STORAGE_KEY}';
    var stored = localStorage.getItem(key);
    var pref = stored ? JSON.parse(stored).theme_setting : 'system';
    var dark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />
}
