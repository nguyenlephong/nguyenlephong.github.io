import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("posthog initialization uses the current sdk host contract", async () => {
  const layout = await readFile("src/app/[locale]/layout.tsx", "utf8");

  assert.match(layout, /https:\/\/us\.i\.posthog\.com/);
  assert.match(layout, /https:\/\/us-assets\.i\.posthog\.com/);
  assert.match(layout, /defaults:'2026-01-30'/);
  assert.match(layout, /crossOrigin="anonymous"/);
  assert.match(layout, /autocapture:\s*false/);
  assert.match(layout, /disable_session_recording:\s*true/);
  assert.match(layout, /respect_dnt:\s*true/);
  assert.doesNotMatch(layout, /api_host:'https:\/\/app\.posthog\.com'/);
});

test("public content surfaces have explicit posthog page and interaction events", async () => {
  const [
    analytics,
    pageTracker,
    blogIndex,
    blogCollection,
    blogCategory,
    notesIndex,
    notesCollection,
    offlinePage,
    blogArticle,
    noteArticle,
    readingTracker,
    shareDock,
    reactions,
    toc,
    related,
    blogCard,
    noteCard,
    categoryCard,
    explorerShell,
    blogExplorer,
    notesExplorer,
    offlineBanner
  ] = await Promise.all([
    readFile("src/lib/analytics.ts", "utf8"),
    readFile("src/components/analytics/PageTracker.tsx", "utf8"),
    readFile("src/app/[locale]/(site)/blog/page.tsx", "utf8"),
    readFile("src/components/blog/BlogCollectionPage.tsx", "utf8"),
    readFile("src/app/[locale]/(site)/blog/[category]/page.tsx", "utf8"),
    readFile("src/app/[locale]/(site)/notes/page.tsx", "utf8"),
    readFile("src/components/notes/NotesCollectionPage.tsx", "utf8"),
    readFile("src/app/[locale]/(site)/offline/page.tsx", "utf8"),
    readFile("src/app/[locale]/(site)/blog/[category]/[slug]/page.tsx", "utf8"),
    readFile("src/app/[locale]/(site)/notes/[slug]/page.tsx", "utf8"),
    readFile("src/components/blog/BlogReadingTracker.tsx", "utf8"),
    readFile("src/components/blog/BlogShareDock.tsx", "utf8"),
    readFile("src/components/blog/BlogReactions.tsx", "utf8"),
    readFile("src/components/blog/BlogToc.tsx", "utf8"),
    readFile("src/components/blog/BlogRelatedPosts.tsx", "utf8"),
    readFile("src/components/blog/BlogPostCard.tsx", "utf8"),
    readFile("src/components/notes/NoteCard.tsx", "utf8"),
    readFile("src/components/blog/BlogCategoryCard.tsx", "utf8"),
    readFile("src/components/explorer/ExplorerShell.tsx", "utf8"),
    readFile("src/components/blog/BlogExplorer.tsx", "utf8"),
    readFile("src/components/notes/NotesExplorer.tsx", "utf8"),
    readFile("src/components/offline/OfflineStatusBanner.tsx", "utf8")
  ]);

  for (const eventName of [
    "blog_view",
    "blog_category_view",
    "blog_category_click",
    "blog_card_click",
    "blog_article_view",
    "blog_share",
    "blog_reaction",
    "blog_nav_jump",
    "blog_related_click",
    "notes_view",
    "notes_card_click",
    "notes_share",
    "notes_reaction",
    "offline_view",
    "offline_mode_ready",
    "offline_status_change",
    "offline_banner_dismiss",
    "explorer_search",
    "explorer_filter_select",
    "explorer_tag_select",
    "explorer_page_change",
    "explorer_clear",
    "explorer_palette_toggle"
  ]) {
    assert.match(analytics, new RegExp(`'${eventName}'`));
  }

  assert.match(pageTracker, /'blog'/);
  assert.match(pageTracker, /'blog_category'/);
  assert.match(pageTracker, /'notes'/);
  assert.match(pageTracker, /'offline'/);
  assert.match(pageTracker, /'blog_view'/);
  assert.match(pageTracker, /'blog_category_view'/);
  assert.match(pageTracker, /'notes_view'/);
  assert.match(pageTracker, /'offline_view'/);
  assert.match(blogIndex, /BlogCollectionPage/);
  assert.match(blogCollection, /page="blog"/);
  assert.match(blogCollection, /eventName="blog_view"/);
  assert.match(blogCategory, /PageTracker page="blog_category" eventName="blog_category_view"/);
  assert.match(notesIndex, /NotesCollectionPage/);
  assert.match(notesCollection, /page="notes"/);
  assert.match(notesCollection, /eventName="notes_view"/);
  assert.match(offlinePage, /PageTracker page="offline" eventName="offline_view"/);

  assert.match(blogArticle, /surface="blog"/);
  assert.match(noteArticle, /surface="notes"/);
  assert.match(readingTracker, /\$\{eventPrefix\}_article_view/);
  assert.match(readingTracker, /\$\{eventPrefix\}_scroll_depth/);
  assert.match(readingTracker, /\$\{eventPrefix\}_read_complete/);
  assert.match(readingTracker, /\$\{eventPrefix\}_read_time/);
  assert.match(shareDock, /\$\{surface\}_share/);
  assert.match(reactions, /\$\{surface\}_reaction/);
  assert.match(toc, /blog_nav_jump/);
  assert.match(toc, /notes_nav_jump/);
  assert.match(related, /blog_related_click/);
  assert.match(blogCard, /blog_card_click/);
  assert.match(noteCard, /notes_card_click/);
  assert.match(categoryCard, /blog_category_click/);

  assert.match(explorerShell, /trackingSurface\?: 'blog' \| 'notes'/);
  assert.match(explorerShell, /explorer_search/);
  assert.match(explorerShell, /query_length/);
  assert.match(blogExplorer, /trackingSurface="blog"/);
  assert.match(notesExplorer, /trackingSurface="notes"/);
  assert.match(offlineBanner, /navigator\.serviceWorker/);
  assert.match(offlineBanner, /offline_mode_ready/);
  assert.match(offlineBanner, /offline_status_change/);
  assert.match(offlineBanner, /offline_banner_dismiss/);
});

test("studio analytics and agent rules cover new workspace interactions", async () => {
  const [analytics, adminShell, agents, claude, gemini] = await Promise.all([
    readFile("src/lib/analytics.ts", "utf8"),
    readFile("src/app/[locale]/studio/studio-admin-shell.tsx", "utf8"),
    readFile("AGENTS.md", "utf8"),
    readFile("CLAUDE.md", "utf8"),
    readFile("GEMINI.md", "utf8")
  ]);

  for (const eventName of [
    "studio_route_open",
    "studio_command_open",
    "studio_command_result_click",
    "studio_profile_nav_click",
    "studio_preferences_panel_toggle",
    "studio_preference_change",
    "studio_preference_restore",
    "studio_sidebar_toggle",
    "studio_ai_skill_filter",
    "studio_ai_skill_select",
    "studio_ai_skill_copy",
    "studio_checklist_select",
    "studio_checklist_copy",
    "studio_checklist_item_toggle",
    "studio_flow_group_select",
    "studio_flow_select",
    "studio_flow_example_select",
    "studio_flow_canvas_mode_change",
    "studio_flow_layout_apply",
    "studio_flow_node_select",
    "studio_flow_node_action",
    "studio_flow_history_action",
    "studio_flow_group_visibility_toggle",
    "studio_flow_board_fullscreen_toggle",
    "studio_flow_focus_toggle",
    "studio_flow_share"
  ]) {
    assert.match(analytics, new RegExp(`'${eventName}'`));
    assert.match(adminShell, new RegExp(`"${eventName}"`));
  }

  assert.match(adminShell, /onActivate\(subItem\.routeId \?\? DEFAULT_ROUTE, "sidebar"\)/);
  assert.match(adminShell, /onActivate\(item\.routeId \?\? DEFAULT_ROUTE, "sidebar"\)/);
  assert.match(adminShell, /onActivate\(route\.id, "command"\)/);
  assert.match(adminShell, /source:\s*"route_actions"/);
  assert.match(adminShell, /source:\s*"sidebar_profile_grid"/);
  assert.match(adminShell, /source:\s*"account_menu"/);
  assert.match(adminShell, /source:\s*"topbar"/);

  for (const rules of [agents, claude, gemini]) {
    assert.match(rules, /Analytics/i);
    assert.match(rules, /PostHog/);
    assert.match(rules, /src\/lib\/analytics\.ts/);
    assert.match(rules, /PageTracker/);
    assert.match(rules, /Studio/);
  }
});
