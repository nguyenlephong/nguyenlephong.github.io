import type { FirebaseApp } from 'firebase/app'

type AppCheckModule = Pick<
  typeof import('firebase/app-check'),
  'getToken' | 'initializeAppCheck' | 'ReCaptchaEnterpriseProvider'
>

export const APP_CHECK_BOOTSTRAP_TIMEOUT_MS = 4_000

async function loadAppCheckModule(): Promise<AppCheckModule> {
  return import('firebase/app-check')
}

/**
 * Initializes App Check and verifies that the first token exchange succeeds.
 * The injected loader keeps token success/failure deterministic in unit tests.
 */
export async function bootstrapAppCheckToken(
  app: FirebaseApp,
  siteKey: string,
  load: () => Promise<AppCheckModule> = loadAppCheckModule,
  timeoutMs = APP_CHECK_BOOTSTRAP_TIMEOUT_MS,
): Promise<boolean> {
  let timeout: ReturnType<typeof setTimeout> | undefined
  try {
    const timeoutResult = new Promise<boolean>((resolve) => {
      timeout = setTimeout(() => resolve(false), timeoutMs)
    })
    const bootstrapResult = (async () => {
      const {
        getToken,
        initializeAppCheck,
        ReCaptchaEnterpriseProvider,
      } = await load()
      const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(siteKey),
        isTokenAutoRefreshEnabled: true,
      })
      const tokenResult = await getToken(appCheck)
      return tokenResult.token.trim().length > 0
    })()

    return await Promise.race([bootstrapResult, timeoutResult])
  } catch {
    return false
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}
