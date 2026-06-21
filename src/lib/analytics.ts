declare global {
  interface Window {
    posthog?: {
      capture: (event: string, props?: Record<string, unknown>) => void
      identify: (id: string, props?: Record<string, unknown>) => void
      register: (props: Record<string, unknown>) => void
      register_once?: (props: Record<string, unknown>) => void
      set_config?: (props: Record<string, unknown>) => void
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
  | 'locale_change'
  // Web vitals
  | 'web_vital'
  // Apps page
  | 'apps_view'
  | 'apps_card_view'
  | 'apps_app_select'
  | 'apps_filter_click'
  | 'apps_link_click'
  | 'apps_hotkey_view'
  | 'apps_cta_click'
  | 'english_practice_select_slang'
  | 'english_practice_next'
  | 'english_practice_shuffle'
  | 'english_practice_reset'
  | 'english_practice_mark_hard'
  | 'english_practice_mode_change'
  | 'english_practice_reveal'
  | 'english_practice_answer'
  | 'english_practice_tts'
  // Gallery
  | 'gallery_view'
  | 'gallery_tab_click'
  | 'gallery_item_click'
  // About
  | 'about_view'
  | 'about_section_view'
  // Thoughts
  | 'thoughts_view_toggle'
  | 'thoughts_share'
  // Blog and notes explorer
  | 'blog_view'
  | 'blog_category_view'
  | 'blog_category_click'
  | 'blog_card_click'
  | 'notes_card_click'
  | 'explorer_search'
  | 'explorer_filter_select'
  | 'explorer_tag_select'
  | 'explorer_page_change'
  | 'explorer_clear'
  | 'explorer_palette_toggle'
  // Blog articles
  | 'blog_article_view'
  | 'blog_scroll_depth'
  | 'blog_read_time'
  | 'blog_read_complete'
  | 'blog_share'
  | 'blog_reaction'
  | 'blog_nav_jump'
  | 'blog_related_click'
  // Notes articles
  | 'notes_view'
  | 'notes_article_view'
  | 'notes_scroll_depth'
  | 'notes_read_time'
  | 'notes_read_complete'
  | 'notes_share'
  | 'notes_reaction'
  | 'notes_nav_jump'
  // Reader controls
  | 'reader_tool_scroll'
  | 'reader_tool_toggle'
  | 'reading_font_change'
  | 'reading_background_change'
  // Studio
  | 'studio_view'
  | 'studio_route_open'
  | 'studio_command_open'
  | 'studio_command_result_click'
  | 'studio_profile_nav_click'
  | 'studio_preferences_panel_toggle'
  | 'studio_preference_change'
  | 'studio_preference_restore'
  | 'studio_sidebar_toggle'
  | 'studio_ai_skill_filter'
  | 'studio_ai_skill_select'
  | 'studio_ai_skill_copy'
  | 'studio_checklist_select'
  | 'studio_checklist_copy'
  | 'studio_checklist_item_toggle'
  | 'studio_blog_roadmap_topic_select'
  | 'studio_blog_roadmap_day_select'
  | 'studio_blog_roadmap_ticket_action'
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

/** Honour the browser's Do-Not-Track signal across vendor prefixes. */
function isDoNotTrack(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { msDoNotTrack?: string }
  const win = window as Window & { doNotTrack?: string }
  const dnt = nav.doNotTrack ?? win.doNotTrack ?? nav.msDoNotTrack
  return dnt === '1' || dnt === 'yes'
}

export function track(
  event: AnalyticsEvent | string,
  props?: Record<string, unknown>,
  options?: TrackOptions
): void {
  if (typeof window === 'undefined') return
  if (isDoNotTrack()) return
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
