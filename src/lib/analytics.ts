import { sanitizeAnalyticsProperties } from '@/lib/posthog-privacy'

declare global {
  interface Window {
    posthog?: PostHogClient
  }
}

type PostHogClient = {
  capture: (
    event: string,
    props?: Record<string, unknown>,
    options?: { send_instantly?: boolean; transport?: 'sendBeacon' },
  ) => void
  identify: (id: string, props?: Record<string, unknown>) => void
  register: (props: Record<string, unknown>) => void
  unregister: (key: string) => void
  register_once?: (props: Record<string, unknown>) => void
  set_config?: (props: Record<string, unknown>) => void
}

type PostHogQueue = PostHogClient & Array<unknown>

export type AnalyticsEvent =
  // CV (legacy + still in use)
  | 'cv_view'
  | 'cv_resume_download'
  | 'cv_contact_click'
  | 'cv_email_copy'
  | 'cv_social_click'
  | 'cv_section_view'
  | 'cv_theme_toggle'
  | 'cv_nav_click'
  | 'cv_external_link'
  | 'cv_experience_evidence_click'
  | 'cv_experience_expand'
  | 'cv_project_view'
  | 'cv_project_evidence_click'
  | 'cv_project_website_click'
  | 'cv_case_file_open'
  | 'cv_announcement_click'
  | 'cv_capability_select'
  // state: playing | paused, from the capability map's visible toggle (MEP-78)
  | 'cv_capability_autoplay_toggle'
  | 'cv_hero_node_select'
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
  // apps_card_view and apps_link_click carry source: 'apps_list' since MEP-57 (was 'apps_console_focus').
  | 'apps_card_view'
  | 'apps_link_click'
  | 'apps_cta_click'
  // Unused since MEP-57 removed the app picker; names kept so old dashboards still resolve.
  // apps_filter_click (search and platform filter) was deleted with those controls.
  | 'apps_app_select'
  | 'apps_hotkey_view'
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
  // filter: all | bonbon | recognition | education | outside | earlier (MEP-29; was certificates/awards/projects/activities)
  | 'gallery_tab_click'
  | 'gallery_item_click'
  // About
  | 'about_view'
  | 'about_section_view'
  // target: arc (with period) | blog | notes | note | post
  | 'about_link_click'
  // Site index
  | 'sitemap_view'
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
  // Site-wide search dialog (MEP-48). Only lengths and counts, never the query text.
  | 'global_search_open'
  | 'global_search_query'
  | 'global_search_no_results'
  | 'global_search_result_click'
  // Curated static content hubs
  | 'content_hub_view'
  | 'content_hub_click'
  | 'content_hub_archive_click'
  | 'content_hub_article_click'
  | 'content_hub_page_change'
  // Blog and Notes index intros linking to each other
  | 'content_cross_link_click'
  // Blog articles
  | 'blog_article_view'
  | 'blog_scroll_depth'
  | 'blog_read_time'
  | 'blog_read_complete'
  | 'blog_share'
  | 'blog_reaction'
  | 'blog_nav_jump'
  // Collapsed outline under the header (<1080px); jumps report source: 'mobile' | 'rail'
  | 'blog_toc_open'
  | 'blog_related_click'
  // Article tag row linking back into the archive filter or search
  | 'blog_tag_click'
  // Byline and author box on blog posts and notes (target: byline | cv | resume | email)
  | 'blog_author_click'
  // Notes articles
  | 'notes_view'
  | 'notes_article_view'
  | 'notes_scroll_depth'
  | 'notes_read_time'
  | 'notes_read_complete'
  | 'notes_share'
  | 'notes_reaction'
  | 'notes_nav_jump'
  | 'notes_toc_open'
  | 'notes_related_click'
  // Article tag row on notes linking into the notes archive filter (MEP-51)
  | 'notes_tag_click'
  | 'content_fallback_language_click'
  // Reader controls
  | 'reader_tool_scroll'
  | 'reader_tool_toggle'
  | 'reading_font_change'
  | 'reading_background_change'
  // Offline reading
  | 'offline_view'
  | 'offline_mode_ready'
  | 'offline_status_change'
  | 'offline_banner_dismiss'
  // Service worker update notice (a new build took over an open tab)
  | 'app_update_reload'
  | 'app_update_dismiss'
  // Not found recovery
  | 'not_found_view'
  | 'not_found_recovery_click'
  | 'not_found_trailing_slash_recovery'
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
  | 'studio_feature_load_error'
  | 'studio_ai_skill_filter'
  | 'studio_ai_skill_select'
  | 'studio_ai_skill_copy'
  | 'studio_checklist_select'
  | 'studio_checklist_copy'
  | 'studio_checklist_item_toggle'
  | 'studio_flow_group_select'
  | 'studio_flow_select'
  | 'studio_flow_example_select'
  | 'studio_flow_canvas_mode_change'
  | 'studio_flow_layout_apply'
  | 'studio_flow_node_select'
  | 'studio_flow_node_action'
  | 'studio_flow_history_action'
  | 'studio_flow_group_visibility_toggle'
  | 'studio_flow_board_fullscreen_toggle'
  // open_next: the mobile "Diagram options" disclosure under the canvas (MEP-59)
  | 'studio_flow_options_toggle'
  | 'studio_flow_focus_toggle'
  | 'studio_flow_share'
  // Outbound
  | 'outbound_click'

export type WebVitalAnalyticsPayload = {
  name: string
  value: number
  delta: number
  rating: string
  id: string
  navigation_type: string
  path: string
  surface: 'site' | 'studio'
  locale: string
}

export interface TrackOptions {
  /** When true, posthog will flush immediately (used for outbound nav). */
  beacon?: boolean
  /** Omit the browser URL for surfaces where the requested path may contain secrets. */
  omitLocation?: boolean
  /**
   * Attribute an event to a previously captured route. Only the normalized
   * pathname is accepted; origins, query strings, and hashes are discarded.
   */
  pathnameOverride?: string
}

const PAGE_CONTEXT_KEYS = [
  'page_type',
  'page_section',
  'content_surface',
  'content_category',
  'content_slug',
  'blog_category',
  'blog_slug',
  'notes_category',
  'notes_slug',
  'content_hub_kind',
  'content_hub_id',
  'content_hub_page',
  'detected_locale',
  'requested_surface',
] as const

/** Return the stable route identity used by custom events and RUM. */
export function getAnalyticsPathname(): string {
  if (typeof window === 'undefined') return ''
  return window.location.pathname
}

function normalizeAnalyticsPathname(pathname: string | undefined): string | undefined {
  if (!pathname) return undefined
  const candidate = pathname.trim()
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return undefined

  try {
    const baseUrl = 'https://analytics-path.invalid'
    const normalized = new URL(candidate, baseUrl)
    return normalized.origin === baseUrl ? normalized.pathname : undefined
  } catch {
    return undefined
  }
}

/** Create a callback that can safely be wired to several page-leave signals. */
export function createOnceReporter(report: () => void): () => void {
  let reported = false
  return () => {
    if (reported) return
    reported = true
    report()
  }
}

/** Honour the browser's Do-Not-Track signal across vendor prefixes. */
function isDoNotTrack(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { msDoNotTrack?: string }
  const win = window as Window & { doNotTrack?: string }
  const dnt = nav.doNotTrack ?? win.doNotTrack ?? nav.msDoNotTrack
  return dnt === '1' || dnt === 'yes'
}

/**
 * Queue explicit events immediately, even when the lazy PostHog bootstrap has
 * not run yet. The official loader consumes this same array once initialized.
 */
function ensurePostHogClient(): PostHogClient {
  if (window.posthog) return window.posthog

  const queue = [] as unknown as PostHogQueue
  queue.capture = (event, props, options) => {
    queue.push(
      options
        ? ['capture', event, props, options]
        : ['capture', event, props],
    )
  }
  queue.identify = (id, props) => {
    queue.push(['identify', id, props])
  }
  queue.register = (props) => {
    queue.push(['register', props])
  }
  queue.unregister = (key) => {
    queue.push(['unregister', key])
  }
  window.posthog = queue
  return queue
}

export function track(
  event: AnalyticsEvent | string,
  props?: Record<string, unknown>,
  options?: TrackOptions,
): void {
  if (typeof window === 'undefined') return
  if (isDoNotTrack()) return
  try {
    const omitLocation = options?.omitLocation === true
    const safeProps = sanitizeAnalyticsProperties(props ?? {}, omitLocation)
    const pathname =
      normalizeAnalyticsPathname(options?.pathnameOverride) ?? getAnalyticsPathname()
    const payload: Record<string, unknown> = {
      ts: Date.now(),
      ...safeProps,
      ...(omitLocation
        ? {}
        : {
            path: pathname,
            pathname,
          }),
    }
    if (options?.beacon) {
      payload['$set_once'] = { last_outbound_ts: Date.now() }
    }
    ensurePostHogClient().capture(
      event,
      payload,
      options?.beacon
        ? { send_instantly: true, transport: 'sendBeacon' }
        : undefined,
    )
  } catch {
    // swallow — analytics must never break UX
  }
}

/** Register superproperties that ride along every event on this page. */
export function registerPageContext(props: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  try {
    const client = ensurePostHogClient()
    const nextContext = PAGE_CONTEXT_KEYS.reduce<Record<string, unknown>>((context, key) => {
      if (Object.hasOwn(props, key)) context[key] = props[key]
      return context
    }, {})

    for (const key of PAGE_CONTEXT_KEYS) client.unregister(key)
    client.register(sanitizeAnalyticsProperties(nextContext, false))
  } catch {
    // ignore
  }
}
