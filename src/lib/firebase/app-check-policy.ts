export const APP_CHECK_MODES = ['optional', 'required'] as const

export type AppCheckMode = (typeof APP_CHECK_MODES)[number] | 'invalid'
export type AppCheckState =
  | 'not-configured'
  | 'pending'
  | 'active'
  | 'failed'
export type AppCheckFailure =
  | 'missing-site-key'
  | 'initialization-failed'
  | 'invalid-mode'
  | null

export interface FirebaseAppCheckStatus {
  mode: AppCheckMode
  state: AppCheckState
  configured: boolean
  active: boolean
  failure: AppCheckFailure
}

export function parseAppCheckMode(value: string | undefined): AppCheckMode {
  const normalized = value?.trim().toLowerCase() ?? ''
  if (!normalized || normalized === 'optional') return 'optional'
  if (normalized === 'required') return 'required'
  return 'invalid'
}

export function createInitialAppCheckStatus(
  mode: AppCheckMode,
  siteKey: string,
): FirebaseAppCheckStatus {
  const configured = siteKey.trim().length > 0
  if (mode === 'invalid') {
    return {
      mode,
      state: 'failed',
      configured,
      active: false,
      failure: 'invalid-mode',
    }
  }
  if (!configured) {
    return {
      mode,
      state: mode === 'required' ? 'failed' : 'not-configured',
      configured: false,
      active: false,
      failure: mode === 'required' ? 'missing-site-key' : null,
    }
  }

  return {
    mode,
    state: 'pending',
    configured: true,
    active: false,
    failure: null,
  }
}

export function activateAppCheck(
  status: FirebaseAppCheckStatus,
): FirebaseAppCheckStatus {
  if (status.mode === 'invalid') return status
  return { ...status, state: 'active', active: true, failure: null }
}

export function failAppCheck(
  status: FirebaseAppCheckStatus,
): FirebaseAppCheckStatus {
  return {
    ...status,
    state: 'failed',
    active: false,
    failure:
      status.mode === 'invalid'
        ? 'invalid-mode'
        : status.configured
          ? 'initialization-failed'
          : 'missing-site-key',
  }
}

/**
 * Optional mode preserves the existing best-effort write behavior. Required
 * mode denies every engagement mutation until App Check bootstrap succeeds.
 */
export function engagementWritesAllowed(
  status: FirebaseAppCheckStatus,
): boolean {
  return (
    status.mode === 'optional' ||
    (status.mode === 'required' && status.active)
  )
}
