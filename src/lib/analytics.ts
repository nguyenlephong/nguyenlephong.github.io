declare global {
  interface Window {
    posthog?: {
      capture: (event: string, props?: Record<string, unknown>) => void
      identify: (id: string, props?: Record<string, unknown>) => void
      register: (props: Record<string, unknown>) => void
    }
  }
}

export type AnalyticsEvent =
  | 'cv_view'
  | 'cv_resume_download'
  | 'cv_contact_click'
  | 'cv_social_click'
  | 'cv_section_view'
  | 'cv_theme_toggle'
  | 'cv_nav_click'
  | 'cv_external_link'
  | 'cv_project_view'

export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  try {
    window.posthog?.capture(event, {
      ts: Date.now(),
      path: window.location.pathname,
      ...props,
    })
  } catch {
    // swallow — analytics must never break UX
  }
}
