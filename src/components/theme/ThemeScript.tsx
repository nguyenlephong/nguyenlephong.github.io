import { createThemeBootstrapScript } from './theme-preference'

const themeScript = createThemeBootstrapScript()

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />
}
