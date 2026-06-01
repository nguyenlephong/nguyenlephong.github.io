declare global {
  interface Window {
    posthog?: {
      capture: (event: string, props?: Record<string, unknown>) => void
      identify: (id: string, props?: Record<string, unknown>) => void
      register: (props: Record<string, unknown>) => void
      register_once?: (props: Record<string, unknown>) => void
    }
  }
}

export type AnalyticsEvent =
  // CV (legacy + still in use)
  | 'cv_view'
  | 'cv_resume_download'
  | 'cv_contact_click'
  | 'cv_social_click'
  | 'cv_section_view'
  | 'cv_theme_toggle'
  | 'cv_nav_click'
  | 'cv_external_link'
  | 'cv_project_view'
  // Page lifecycle
  | 'page_view'
  | 'page_scroll_depth'
  | 'page_time_on_page'
  | 'page_visibility_change'
  // Web vitals
  | 'web_vital'
  // Apps page
  | 'apps_view'
  | 'apps_card_view'
  | 'apps_link_click'
  | 'apps_hotkey_view'
  | 'apps_cta_click'
  // Gallery
  | 'gallery_view'
  | 'gallery_tab_click'
  | 'gallery_item_click'
  // About
  | 'about_view'
  | 'about_section_view'
  // Home (legacy /home page)
  | 'home_view'
  | 'home_social_click'
  // Thoughts
  | 'thoughts_view_toggle'
  | 'thoughts_share'
  // Notes (Ghi chú)
  | 'notes_view'
  | 'notes_article_view'
  | 'notes_scroll_depth'
  | 'notes_read_time'
  | 'notes_read_complete'
  | 'notes_share'
  | 'notes_nav_jump'
  // Outbound
  | 'outbound_click'

export interface TrackOptions {
  /** When true, posthog will flush immediately (used for outbound nav). */
  beacon?: boolean
}

function safePath(): string {
  if (typeof window === 'undefined') return ''
  return window.location.pathname + window.location.search
}

export function track(
  event: AnalyticsEvent | string,
  props?: Record<string, unknown>,
  options?: TrackOptions
): void {
  if (typeof window === 'undefined') return
  try {
    const payload: Record<string, unknown> = {
      ts: Date.now(),
      path: safePath(),
      pathname: window.location.pathname,
      ...props,
    }
    if (options?.beacon) payload.$set_once = { last_outbound_ts: Date.now() }
    window.posthog?.capture(event, payload)
  } catch {
    // swallow — analytics must never break UX
  }
}

/** Register superproperties that ride along every event on this page. */
export function registerPageContext(props: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  try {
    window.posthog?.register(props)
  } catch {
    // ignore
  }
}
