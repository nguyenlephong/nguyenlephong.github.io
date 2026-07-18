import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

async function loadThemeModule() {
  const source = await readFile(
    'src/components/theme/theme-preference.ts',
    'utf8',
  )
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  })
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
  )
}

test('theme preference parser preserves the active persisted contract', async () => {
  const {
    THEME_STORAGE_KEY,
    parseThemeSetting,
    resolveTheme,
    serializeThemePreference,
  } = await loadThemeModule()

  assert.equal(THEME_STORAGE_KEY, 'theme_preference')
  assert.equal(parseThemeSetting(null), 'system')
  assert.equal(parseThemeSetting('{broken'), 'system')
  assert.equal(parseThemeSetting('{"theme_setting":"sepia"}'), 'system')
  assert.equal(parseThemeSetting('{"theme_setting":"dark"}'), 'dark')
  assert.equal(resolveTheme('system', true), 'dark')
  assert.equal(resolveTheme('system', false), 'light')
  assert.equal(resolveTheme('light', true), 'light')
  assert.deepEqual(JSON.parse(serializeThemePreference('system', true)), {
    theme: 'dark',
    theme_setting: 'system',
  })
})

test('early bootstrap uses the same parser and resolver contract', async () => {
  const { createThemeBootstrapScript } = await loadThemeModule()
  let applied = null
  const context = {
    localStorage: {
      getItem: () => JSON.stringify({ theme_setting: 'system' }),
    },
    window: {
      matchMedia: () => ({ matches: true }),
    },
    document: {
      documentElement: {
        setAttribute: (name, value) => {
          assert.equal(name, 'data-theme')
          applied = value
        },
      },
    },
  }

  vm.runInNewContext(createThemeBootstrapScript(), context)
  assert.equal(applied, 'dark')
})

test('only the centralized active theme stack remains', async () => {
  const [script, sync, toggle] = await Promise.all([
    readFile('src/components/theme/ThemeScript.tsx', 'utf8'),
    readFile('src/components/theme/ThemeSync.tsx', 'utf8'),
    readFile('src/components/theme/ThemeToggle.tsx', 'utf8'),
  ])

  assert.match(script, /createThemeBootstrapScript/)
  assert.match(sync, /parseThemeSetting/)
  assert.match(sync, /resolveTheme/)
  assert.match(toggle, /parseThemeSetting/)
  assert.match(toggle, /resolveTheme/)
  assert.match(toggle, /cv_theme_toggle/)

  for (const deadPath of [
    'src/components/apps/AppCard.tsx',
    'src/components/theme/ThemeProvider.tsx',
    'src/components/theme/ThemeSwitcher.tsx',
    'src/components/theme/hooks/useThemeSetting.tsx',
  ]) {
    assert.equal(existsSync(deadPath), false, `${deadPath} must stay removed`)
  }
})
