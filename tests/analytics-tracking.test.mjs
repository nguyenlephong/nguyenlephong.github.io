import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function readSources(paths) {
  return (await Promise.all(paths.map((path) => readFile(path, "utf8")))).join("\n");
}

async function importTypeScript(source) {
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022
    }
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`
  );
}

async function importAnalytics(source) {
  const privacySource = await readFile("src/lib/posthog-privacy.ts", "utf8");
  const privacyOutput = ts.transpileModule(privacySource, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022
    }
  }).outputText;
  const privacyUrl = `data:text/javascript;base64,${Buffer.from(privacyOutput).toString("base64")}`;
  const output = ts
    .transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022
      }
    })
    .outputText.replaceAll("@/lib/posthog-privacy", privacyUrl);
  return import(
    `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`
  );
}

test("posthog initialization uses the current sdk host contract", async () => {
  const [layout, bootstrap, privacy] = await Promise.all([
    readFile("src/app/[locale]/layout.tsx", "utf8"),
    readFile("src/components/analytics/PostHogBootstrap.tsx", "utf8"),
    readFile("src/lib/posthog-privacy.ts", "utf8")
  ]);

  assert.match(layout, /https:\/\/us\.i\.posthog\.com/);
  assert.match(layout, /https:\/\/us-assets\.i\.posthog\.com/);
  assert.match(layout, /<PostHogBootstrap locale=\{locale\} \/>/);
  assert.match(bootstrap, /defaults:'2026-01-30'/);
  assert.match(bootstrap, /crossOrigin="anonymous"/);
  assert.match(bootstrap, /autocapture:\s*false/);
  assert.match(bootstrap, /disable_session_recording:\s*true/);
  assert.match(bootstrap, /respect_dnt:\s*true/);
  assert.match(bootstrap, /before_send:/);
  assert.match(bootstrap, /getPostHogBeforeSendSource\(surface === "not_found"\)/);
  assert.match(privacy, /normalized\.endsWith\('_url'\)/);
  assert.match(privacy, /normalized\.endsWith\('_referrer'\)/);
  assert.doesNotMatch(bootstrap, /api_host:'https:\/\/app\.posthog\.com'/);
});

test("analytics strips search data and clears stale page context before lazy bootstrap", async () => {
  const analyticsSource = await readFile("src/lib/analytics.ts", "utf8");
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalNavigator = Object.getOwnPropertyDescriptor(
    globalThis,
    "navigator"
  );

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: {
        pathname: "/en/blog",
        search: "?q=private-email%40example.com&page=2"
      }
    }
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { doNotTrack: "0" }
  });

  try {
    const analytics = await importAnalytics(analyticsSource);
    analytics.registerPageContext({
      page_type: "blog_article",
      blog_slug: "stale-article",
      ignored_unowned_context: "must-not-persist"
    });
    analytics.registerPageContext({
      page_type: "apps",
      page_section: "showroom"
    });
    analytics.track("apps_view", {
      section: "index",
      q: "private-email@example.com",
      search: "another-private-email@example.com",
      path: "/unsafe?q=private-email%40example.com",
      referrer: "https://search.example/?q=private-email%40example.com#result"
    });

    assert.equal(Array.isArray(window.posthog), true);
    const pageContextKeys = [
      "page_type",
      "page_section",
      "content_surface",
      "content_category",
      "content_slug",
      "blog_category",
      "blog_slug",
      "notes_category",
      "notes_slug",
      "detected_locale",
      "requested_surface"
    ];
    const registers = window.posthog.filter(([operation]) => operation === "register");
    assert.deepEqual(registers, [
      ["register", { page_type: "blog_article", blog_slug: "stale-article" }],
      ["register", { page_type: "apps", page_section: "showroom" }]
    ]);

    let previousRegisterIndex = -1;
    for (const register of registers) {
      const registerIndex = window.posthog.indexOf(register);
      assert.deepEqual(
        window.posthog.slice(previousRegisterIndex + 1, registerIndex),
        pageContextKeys.map((key) => ["unregister", key]),
        "every owned page-context key must be cleared before registering the next page"
      );
      previousRegisterIndex = registerIndex;
    }

    const capture = window.posthog.find(([operation]) => operation === "capture");
    assert.equal(capture[1], "apps_view");
    assert.equal(capture[2].path, "/en/blog");
    assert.equal(capture[2].pathname, "/en/blog");
    assert.equal(capture[2].referrer, "https://search.example/");
    assert.equal(capture[2].section, "index");
    assert.equal(Object.hasOwn(capture[2], "q"), false);
    assert.equal(Object.hasOwn(capture[2], "search"), false);
    assert.doesNotMatch(JSON.stringify(window.posthog), /private-email/);

    assert.equal(analytics.getAnalyticsPathname(), "/en/blog");
  } finally {
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      delete globalThis.window;
    }
    if (originalNavigator) {
      Object.defineProperty(globalThis, "navigator", originalNavigator);
    } else {
      delete globalThis.navigator;
    }
  }
});

test("posthog before_send sanitizes SDK URL properties and keeps 404 strict", async () => {
  const privacySource = await readFile("src/lib/posthog-privacy.ts", "utf8");
  const privacy = await importTypeScript(privacySource);
  const locationProperties = {
    $current_url: "https://nguyenlephong.github.io/en/blog?q=secret#result",
    $pathname: "/en/blog?q=secret#result",
    $referrer: "https://search.example/results?q=secret#result",
    $session_entry_url: "https://nguyenlephong.github.io/en?q=secret#result",
    $initial_current_url: "https://nguyenlephong.github.io/vi?q=secret#result",
    $initial_referrer: "https://search.example/start?q=secret#result",
    current_path: "/en/blog?q=secret#result",
    referring_domain: "search.example?q=secret#result"
  };
  const capture = {
    event: "$pageview",
    properties: {
      ...locationProperties,
      q: "secret",
      query: "secret",
      search: "secret",
      search_query: "secret",
      search_term: "secret",
      nested: {
        pathname: "/en/blog?q=secret#result",
        session_entry_url: "https://nguyenlephong.github.io/en?q=secret#result",
        q: "secret",
        search: "secret",
        query_length: 6
      }
    }
  };

  const publicBeforeSend = Function(
    `return (${privacy.getPostHogBeforeSendSource(false)})`
  )();
  const sanitized = publicBeforeSend(capture);
  for (const [key, value] of Object.entries(locationProperties)) {
    assert.equal(
      sanitized.properties[key],
      value.replace(/[?#].*$/, ""),
      `${key} must not retain a query string or hash`
    );
  }
  for (const key of ["q", "query", "search", "search_query", "search_term"]) {
    assert.equal(Object.hasOwn(sanitized.properties, key), false);
  }
  assert.deepEqual(sanitized.properties.nested, {
    pathname: "/en/blog",
    session_entry_url: "https://nguyenlephong.github.io/en",
    query_length: 6
  });
  assert.equal(capture.properties.q, "secret", "sanitizing must not mutate the SDK input");

  const notFoundBeforeSend = Function(
    `return (${privacy.getPostHogBeforeSendSource(true)})`
  )();
  const strict = notFoundBeforeSend(capture);
  for (const key of Object.keys(locationProperties)) {
    assert.equal(
      Object.hasOwn(strict.properties, key),
      false,
      `strict 404 privacy must drop ${key}`
    );
  }
  assert.deepEqual(strict.properties.nested, { query_length: 6 });
  assert.equal(strict.event, "$pageview");
});

test("page exit reporting keeps the outgoing pathname exactly once", async (t) => {
  const analyticsSource = await readFile("src/lib/analytics.ts", "utf8");
  const analytics = await importAnalytics(analyticsSource);
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalNavigator = Object.getOwnPropertyDescriptor(
    globalThis,
    "navigator"
  );

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: { pathname: "/en/blog/outgoing", search: "" }
    }
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { doNotTrack: "0" }
  });

  try {
    for (const signals of [
      ["unmount"],
      ["pagehide", "unmount"],
      ["beforeunload", "pagehide", "unmount"]
    ]) {
      await t.test(signals.join(" then "), () => {
        window.posthog = undefined;
        window.location.pathname = "/en/blog/outgoing";
        const outgoingPathname = analytics.getAnalyticsPathname();
        window.location.pathname = "/en/apps/incoming";

        const reportTime = analytics.createOnceReporter(() => {
          analytics.track(
            "page_time_on_page",
            { page_type: "blog_article", total_ms: 250 },
            { pathnameOverride: outgoingPathname }
          );
        });
        const exitHandlers = {
          pagehide: reportTime,
          beforeunload: reportTime,
          unmount: reportTime
        };

        for (const signal of signals) exitHandlers[signal]();

        const captures = window.posthog.filter(
          ([operation, event]) =>
            operation === "capture" && event === "page_time_on_page"
        );
        assert.equal(captures.length, 1);
        assert.equal(captures[0][2].page_type, "blog_article");
        assert.equal(captures[0][2].path, "/en/blog/outgoing");
        assert.equal(captures[0][2].pathname, "/en/blog/outgoing");
      });
    }

    window.posthog = undefined;
    analytics.track(
      "page_time_on_page",
      { page_type: "blog_article" },
      { pathnameOverride: "/en/blog/outgoing?q=private#fragment" }
    );
    analytics.track(
      "page_time_on_page",
      { page_type: "blog_article" },
      { pathnameOverride: "https://attacker.example/raw?q=private" }
    );
    const overrideCaptures = window.posthog.filter(
      ([operation]) => operation === "capture"
    );
    assert.equal(overrideCaptures[0][2].path, "/en/blog/outgoing");
    assert.equal(overrideCaptures[1][2].path, "/en/apps/incoming");
    assert.doesNotMatch(JSON.stringify(overrideCaptures), /private|attacker/);
  } finally {
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      delete globalThis.window;
    }
    if (originalNavigator) {
      Object.defineProperty(globalThis, "navigator", originalNavigator);
    } else {
      delete globalThis.navigator;
    }
  }
});

test("PageTracker wires the same final reporter to all three exit paths", async () => {
  const pageTracker = await readFile("src/components/analytics/PageTracker.tsx", "utf8");
  assert.match(pageTracker, /const pagePathname = getAnalyticsPathname\(\)/);
  assert.match(pageTracker, /pathnameOverride: pagePathname/);
  assert.match(pageTracker, /const reportTime = createOnceReporter/);
  assert.match(pageTracker, /addEventListener\('pagehide', reportTime\)/);
  assert.match(pageTracker, /addEventListener\('beforeunload', reportTime\)/);
  assert.match(pageTracker, /return \(\) => \{\s*reportTime\(\)/);
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
  assert.match(
    blogCategory,
    /PageTracker page="blog_category" eventName="blog_category_view"/
  );
  assert.match(notesIndex, /NotesCollectionPage/);
  assert.match(notesCollection, /page="notes"/);
  assert.match(notesCollection, /eventName="notes_view"/);
  assert.match(
    offlinePage,
    /PageTracker page="offline" eventName="offline_view"/
  );

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
    readSources([
      "src/app/[locale]/studio/studio-admin-shell.tsx",
      "src/app/[locale]/studio/StudioShellChrome.tsx",
      "src/app/[locale]/studio/studio-shell-navigation.ts",
      "src/app/[locale]/studio/StudioWelcomeFeature.tsx",
      "src/app/[locale]/studio/StudioAiSkillsFeature.tsx",
      "src/app/[locale]/studio/StudioChecklistsFeature.tsx",
      "src/app/[locale]/studio/StudioFlowFeature.tsx",
      "src/app/[locale]/studio/StudioFlowChart.tsx",
      "src/app/[locale]/studio/StudioRouteFeatureRegistry.tsx",
      "src/app/[locale]/studio/StudioWorkspace.tsx",
      "src/app/[locale]/studio/StudioDeliverySignalFeature.tsx",
      "src/app/[locale]/studio/StudioFlowCanvasFeature.tsx",
      "src/app/[locale]/studio/StudioDashboardRoutesFeature.tsx",
      "src/app/[locale]/studio/studio-feature-load-error.ts"
    ]),
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
    "studio_feature_load_error",
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

  assert.match(
    adminShell,
    /onActivate\(subItem\.routeId \?\? DEFAULT_ROUTE, "sidebar"\)/
  );
  assert.match(
    adminShell,
    /onActivate\(item\.routeId \?\? DEFAULT_ROUTE, "sidebar"\)/
  );
  assert.match(adminShell, /onActivate\(route\.id, "command"\)/);
  assert.match(adminShell, /onActivate\([^\n]+, "route_actions"\)/);
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

test("Studio emits one initial-location route event and ignores same-route history", async () => {
  const [deduperSource, adminShell] = await Promise.all([
    readFile("src/app/[locale]/studio/studio-route-open-deduper.ts", "utf8"),
    readFile("src/app/[locale]/studio/studio-admin-shell.tsx", "utf8")
  ]);
  const { StudioRouteOpenDeduper } = await importTypeScript(deduperSource);
  const deduper = new StudioRouteOpenDeduper();

  assert.equal(deduper.claimInitialLocation(), true);
  assert.equal(deduper.claimInitialLocation(), false, "hydration/effect replay must not emit twice");
  assert.equal(deduper.isHistoryTransition("welcome", "welcome"), false);
  assert.equal(deduper.isHistoryTransition("welcome", "ai-skills"), true);

  assert.equal(
    adminShell.match(/source:\s*"initial_location"/g)?.length,
    1,
    "the shell must contain one initial-location studio_route_open emission"
  );
  assert.match(adminShell, /routeOpenDeduperRef\.current\.claimInitialLocation\(\)/);
  assert.match(adminShell, /routeOpenDeduperRef\.current\.isHistoryTransition\(currentRoute, nextRoute\)/);
});
