import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

import {
  CLIENT_MESSAGE_ROUTE_SCOPES,
  CLIENT_MESSAGE_SCOPE_PATHS,
  selectClientMessages,
  selectMessageNamespaces,
  toSerializableClientMessages,
  validateClientMessageScopes
} from "../src/i18n/client-message-scopes.ts";
import {
  CLIENT_PROVIDER_CONSUMER_ROUTES,
  NAVIGATION_MODULE,
  PROVIDER_DEPENDENT_NEXT_INTL_HOOKS,
  RAW_PROVIDER_FILE,
  SCOPED_PROVIDER_PLACEMENTS,
  isSupportedSourceFile,
  inspectIntlProviderPlacement,
  inspectNavigationImports,
  inspectNavigationRuntimeExports,
  inspectNextIntlClientHooks,
  normalizeFileName,
  parseTypeScriptSource,
  validateClientProviderConsumer,
  walkSupportedSourceFiles
} from "./helpers/client-message-source-contract.mjs";
import {
  DependencyBoundaryError,
  validateStudioDependencyBoundary
} from "./helpers/source-dependency-graph.mjs";

const CATALOG = {
  Nav: { home: "Home", font: { label: "Font" } },
  Footer: { tag: "Footer" },
  Offline: {
    banner: { title: "Offline" },
    page: { title: "Server-only offline page" }
  },
  Hero: { title: "Hero" },
  Summary: { title: "Summary" },
  Experience: { title: "Experience" },
  Projects: { title: "Projects" },
  CTA: { title: "CTA" },
  Pages: {
    blog: { title: "Blog" },
    notes: { title: "Notes" },
    gallery: { title: "Gallery" },
    thoughts: { title: "Thoughts" }
  },
  About: { title: "About" },
  ReaderTools: { label: "Reader tools" }
};

function assertNullPrototypeRecords(value) {
  if (Array.isArray(value)) {
    for (const nested of value) assertNullPrototypeRecords(nested);
    return;
  }
  if (value === null || typeof value !== "object") return;
  assert.equal(Object.getPrototypeOf(value), null);
  for (const nested of Object.values(value)) assertNullPrototypeRecords(nested);
}

function assertOrdinaryRecords(value) {
  if (Array.isArray(value)) {
    for (const nested of value) assertOrdinaryRecords(nested);
    return;
  }
  if (value === null || typeof value !== "object") return;
  assert.equal(Object.getPrototypeOf(value), Object.prototype);
  for (const nested of Object.values(value)) assertOrdinaryRecords(nested);
}

function scopedProviderContainsConditional(source, fileName, conditionText) {
  const sourceFile = parseTypeScriptSource(source, fileName);
  let providerBinding = null;
  let providerElement = null;
  const matchingConditions = [];

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== "@/i18n/ScopedIntlProvider" ||
      !statement.importClause?.name
    ) {
      continue;
    }
    providerBinding = statement.importClause.name.text;
  }

  const normalizedCondition = conditionText.replace(/\s+/g, "");
  function visit(node) {
    if (
      providerBinding &&
      ts.isJsxOpeningElement(node) &&
      ts.isIdentifier(node.tagName) &&
      node.tagName.text === providerBinding
    ) {
      providerElement = node.parent;
    }
    if (
      ts.isConditionalExpression(node) &&
      node.condition.getText(sourceFile).replace(/\s+/g, "") ===
        normalizedCondition
    ) {
      matchingConditions.push(node);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  return Boolean(
    providerElement &&
      matchingConditions.some(
        (condition) =>
          providerElement.pos <= condition.pos &&
          condition.end <= providerElement.end
      )
  );
}

function readProjectSourceMap() {
  return new Map(
    walkSupportedSourceFiles("src").map((file) => [
      normalizeFileName(file),
      readFileSync(file, "utf8")
    ])
  );
}

function classifyStudioIntlHazard(fileName, source) {
  if (fileName === "src/i18n/navigation.ts") {
    return "the locale-navigation runtime";
  }
  if (fileName === RAW_PROVIDER_FILE) {
    return "the raw internationalization provider";
  }
  if (Object.hasOwn(SCOPED_PROVIDER_PLACEMENTS, fileName)) {
    return "a scoped internationalization provider";
  }
  if (inspectNextIntlClientHooks(source, fileName).callCount > 0) {
    return "a provider-dependent next-intl hook consumer";
  }
  return null;
}

test("selects nested client namespaces without serializing siblings", () => {
  const siteMessages = selectClientMessages(CATALOG, "site");
  const blogMessages = selectClientMessages(CATALOG, "blog");
  assertNullPrototypeRecords(siteMessages);
  assertNullPrototypeRecords(blogMessages);
  assert.deepEqual(JSON.parse(JSON.stringify(siteMessages)), {
    Nav: CATALOG.Nav,
    Footer: CATALOG.Footer,
    Offline: { banner: CATALOG.Offline.banner }
  });
  assert.deepEqual(JSON.parse(JSON.stringify(blogMessages)), {
    Pages: { blog: CATALOG.Pages.blog }
  });

  const serializableMessages = toSerializableClientMessages(siteMessages);
  assertOrdinaryRecords(serializableMessages);
  assert.deepEqual(
    serializableMessages,
    JSON.parse(JSON.stringify(siteMessages))
  );
});

test("fails closed for missing, empty, overlapping, and duplicate namespace contracts", () => {
  const missing = structuredClone(CATALOG);
  delete missing.Pages.blog;
  const empty = structuredClone(CATALOG);
  empty.Pages.blog = {};

  assert.throws(
    () => selectClientMessages(missing, "blog"),
    /Missing client message namespace: Pages\.blog/
  );
  assert.throws(
    () => selectClientMessages(empty, "blog"),
    /must be a non-empty object: Pages\.blog/
  );
  assert.throws(
    () => selectMessageNamespaces(CATALOG, [], "empty"),
    /must declare at least one namespace: empty/
  );
  assert.throws(
    () => selectMessageNamespaces(CATALOG, ["Pages", "Pages.blog"], "overlap"),
    /Overlapping client message namespaces in overlap/
  );
  assert.throws(
    () =>
      selectMessageNamespaces(
        CATALOG,
        ["Pages.blog", "Pages.blog"],
        "duplicate"
      ),
    /Duplicate client message namespace in duplicate: Pages\.blog/
  );
  assert.throws(
    () => selectClientMessages(CATALOG, "unknown"),
    /Unknown client message scope: unknown/
  );
  for (const inheritedName of ["__proto__", "constructor", "toString"]) {
    assert.throws(
      () => selectClientMessages(CATALOG, inheritedName),
      new RegExp(`Unknown client message scope: ${inheritedName}`)
    );
  }
});

test("rejects inherited and prototype-sensitive namespace traversal without global mutation", () => {
  const inheritedRoot = Object.create({
    Pages: { blog: { title: "Inherited" } }
  });
  const inheritedNested = Object.create(null);
  inheritedNested.Pages = Object.create({ blog: { title: "Inherited" } });

  assert.throws(
    () =>
      selectMessageNamespaces(inheritedRoot, ["Pages.blog"], "inherited-root"),
    /Missing client message namespace: Pages\.blog/
  );
  assert.throws(
    () =>
      selectMessageNamespaces(
        inheritedNested,
        ["Pages.blog"],
        "inherited-nested"
      ),
    /Missing client message namespace: Pages\.blog/
  );

  const pollutionKey = "clientMessageScopePolluted";
  assert.equal(Object.hasOwn(Object.prototype, pollutionKey), false);
  for (const namespace of [
    `constructor.prototype.${pollutionKey}`,
    `prototype.${pollutionKey}`,
    `__proto__.${pollutionKey}`,
    `toString.${pollutionKey}`
  ]) {
    assert.throws(
      () => selectMessageNamespaces(Object.create(null), [namespace], "unsafe"),
      /Forbidden client message namespace segment in unsafe/
    );
  }
  const selectedWithDangerousLeaf = Object.create(null);
  selectedWithDangerousLeaf.Nav = Object.create(null);
  Object.defineProperty(selectedWithDangerousLeaf.Nav, "__proto__", {
    enumerable: true,
    value: { [pollutionKey]: true }
  });
  const serializable = toSerializableClientMessages(selectedWithDangerousLeaf);
  assert.equal(Object.hasOwn(serializable.Nav, "__proto__"), true);
  assert.equal(Object.hasOwn(Object.prototype, pollutionKey), false);
  assert.equal({}[pollutionKey], undefined);
});

test("requires globally disjoint client message scope contracts", () => {
  assert.doesNotThrow(() =>
    validateClientMessageScopes(CLIENT_MESSAGE_SCOPE_PATHS)
  );
  assert.throws(
    () =>
      validateClientMessageScopes({
        first: ["Pages.blog"],
        second: ["Pages.blog"]
      }),
    /Overlapping client message namespaces across scopes/
  );
  assert.throws(
    () =>
      validateClientMessageScopes({ first: ["Pages"], second: ["Pages.blog"] }),
    /Overlapping client message namespaces across scopes/
  );
});

test("AST inventory covers every provider-dependent hook and allows direct import aliases", () => {
  const aliased = inspectNextIntlClientHooks(
    `"use client";\nimport { useLocale as localeHook, useTranslations as useI18n } from "next-intl";\nconst locale = localeHook();\nconst t = useI18n("Nav");`
  );
  assert.deepEqual(aliased, {
    callCount: 2,
    calls: [
      { hook: "useLocale", localName: "localeHook", namespace: null },
      { hook: "useTranslations", localName: "useI18n", namespace: "Nav" }
    ],
    namespaces: ["Nav"],
    bindings: ["useLocale:localeHook", "useTranslations:useI18n"]
  });

  const allHooks = inspectNextIntlClientHooks(
    `"use client";\nimport { useExtracted, useFormatter, useLocale, useMessages, useNow, useTimeZone, useTranslations } from "next-intl";\nuseExtracted();\nuseFormatter();\nuseLocale();\nuseMessages();\nuseNow({ updateInterval: 1000 });\nuseTimeZone();\nuseTranslations("Nav");`
  );
  assert.deepEqual(
    [...new Set(allHooks.calls.map((call) => call.hook))].sort(),
    [...PROVIDER_DEPENDENT_NEXT_INTL_HOOKS].sort()
  );
});

test("AST inventory rejects non-literal and captured client hook calls", () => {
  assert.throws(
    () =>
      inspectNextIntlClientHooks(
        `"use client";\nimport { useTranslations as useI18n } from "next-intl";\nconst namespace = "Nav";\nconst t = useI18n(namespace);`
      ),
    /must use exactly one string-literal namespace/
  );
  assert.throws(
    () =>
      inspectNextIntlClientHooks(
        `"use client";\nimport { useLocale } from "next-intl";\nconst indirect = useLocale;\nconst locale = indirect();`
      ),
    /must be called directly so the provider inventory cannot miss it/
  );
});

test("AST inventory rejects namespace indirection, re-exports, dynamic import, and require", () => {
  const fixtures = [
    {
      source: `"use client";\nimport * as intl from "next-intl";\nintl.useLocale();`,
      expected: /direct named imports only/
    },
    {
      source: `export { useLocale } from "next-intl";`,
      expected: /must not re-export next-intl/
    },
    {
      source: `export * from "next-intl";`,
      expected: /must not re-export next-intl/
    },
    {
      source: `async function loadIntl() { return import("next-intl"); }`,
      expected: /must not load next-intl through dynamic import\(\)/
    },
    {
      source: `const intl = require("next-intl");`,
      expected: /must not load next-intl through require\(\)/
    }
  ];

  for (const fixture of fixtures) {
    assert.throws(
      () => inspectNextIntlClientHooks(fixture.source),
      fixture.expected
    );
  }
});

test("provider placement inventory allows aliases only at declared literal boundaries", () => {
  const siteLayout = "src/app/[locale]/(site)/layout.tsx";
  const aliased = inspectIntlProviderPlacement(
    `import Boundary from "@/i18n/ScopedIntlProvider";\nexport default function Layout({children}) { return <Boundary scope="site">{children}</Boundary>; }`,
    siteLayout
  );
  assert.deepEqual(aliased, {
    rawProviderCount: 0,
    scopedProviderScopes: ["site"]
  });

  const fixtures = [
    {
      file: "src/components/UnexpectedProvider.tsx",
      source: `import Boundary from "@/i18n/ScopedIntlProvider";\nexport default function Fixture({children}) { return <Boundary scope="site">{children}</Boundary>; }`,
      expected: /ScopedIntlProvider is not allowed in this file/
    },
    {
      file: "src/components/ProviderBarrel.ts",
      source: `export { default as Provider } from "@/i18n/ScopedIntlProvider";`,
      expected: /must not re-export ScopedIntlProvider/
    },
    {
      file: siteLayout,
      source: `import Boundary from "@/i18n/ScopedIntlProvider";\nconst scope = "site";\nexport default function Layout({children}) { return <Boundary scope={scope}>{children}</Boundary>; }`,
      expected: /scope must be one direct string literal/
    },
    {
      file: siteLayout,
      source: `import Boundary from "@/i18n/ScopedIntlProvider";\nconst Indirect = Boundary;\nexport default function Layout({children}) { return <Indirect scope="site">{children}</Indirect>; }`,
      expected: /must be used directly as JSX/
    },
    {
      file: siteLayout,
      source: `import Boundary from "@/i18n/ScopedIntlProvider";\nexport default function Layout({children}) { return <Boundary scope="home">{children}</Boundary>; }`,
      expected: /must render scoped providers site exactly once/
    }
  ];

  for (const fixture of fixtures) {
    assert.throws(
      () => inspectIntlProviderPlacement(fixture.source, fixture.file),
      fixture.expected
    );
  }
});

test("collection providers keep empty states inside the declared message scope", () => {
  const contracts = [
    {
      file: "src/components/blog/BlogCollectionPage.tsx",
      condition: "pageData.items.length > 0"
    },
    {
      file: "src/components/notes/NotesCollectionPage.tsx",
      condition: "pageData.items.length > 0"
    },
    {
      file: "src/app/[locale]/(site)/blog/[category]/page.tsx",
      condition: "posts.length > 0"
    }
  ];

  for (const contract of contracts) {
    assert.equal(
      scopedProviderContainsConditional(
        readFileSync(contract.file, "utf8"),
        contract.file,
        contract.condition
      ),
      true,
      `${contract.file} must keep its empty branch inside ScopedIntlProvider`
    );
  }

  const invalidFixture = `
    import ScopedIntlProvider from "@/i18n/ScopedIntlProvider";
    export default function Fixture({items}) {
      return items.length > 0
        ? <ScopedIntlProvider scope="blog"><div>items</div></ScopedIntlProvider>
        : <p>empty</p>;
    }
  `;
  assert.equal(
    scopedProviderContainsConditional(
      invalidFixture,
      "src/components/blog/BlogCollectionPage.tsx",
      "items.length > 0"
    ),
    false
  );
});

test("raw next-intl provider and use-intl imports fail outside the adapter", () => {
  assert.throws(
    () =>
      inspectIntlProviderPlacement(
        `import { NextIntlClientProvider as Provider } from "next-intl";\nexport default function Fixture({children}) { return <Provider messages={{}}>{children}</Provider>; }`,
        "src/components/RawProvider.tsx"
      ),
    /NextIntlClientProvider is allowed only in src\/i18n\/ScopedIntlProvider\.tsx/
  );
  assert.throws(
    () =>
      inspectIntlProviderPlacement(
        `import { useTranslations } from "use-intl";\nexport default useTranslations;`,
        "src/components/DirectUseIntl.tsx"
      ),
    /must not import or re-export use-intl directly/
  );
});

test("Studio rejects every provider-dependent next-intl client hook", () => {
  const file = "src/app/[locale]/studio/fixture.tsx";
  const inspection = inspectNextIntlClientHooks(
    `"use client";\nimport { useLocale } from "next-intl";\nexport default function Fixture() { return useLocale(); }`,
    file
  );
  assert.throws(
    () => validateClientProviderConsumer(file, inspection),
    /must not use provider-dependent internationalization client APIs/
  );
});

test("Studio rejects provider-dependent locale navigation imports", () => {
  const navigationExports = inspectNavigationRuntimeExports(
    readFileSync("src/i18n/navigation.ts", "utf8")
  );
  const file = "src/app/[locale]/studio/fixture.tsx";
  const inspection = inspectNavigationImports(
    `"use client";\nimport { useRouter as routerHook } from "@/i18n/navigation";\nexport default function Fixture() { return routerHook().push("/studio"); }`,
    navigationExports,
    file
  );
  assert.throws(
    () =>
      validateClientProviderConsumer(file, {
        dependencyCount: inspection.importCount,
        namespaces: []
      }),
    /must not use provider-dependent internationalization client APIs/
  );
});

test("navigation inventory reserves the framework adapter and rejects indirect wrappers", () => {
  const navigationSource = readFileSync("src/i18n/navigation.ts", "utf8");
  const navigationExports = inspectNavigationRuntimeExports(navigationSource);
  assert.doesNotThrow(() =>
    inspectNavigationImports(
      navigationSource,
      navigationExports,
      "src/i18n/navigation.ts"
    )
  );

  const fixtures = [
    {
      file: "src/components/DirectFrameworkNavigation.tsx",
      source: `import {createNavigation} from "next-intl/navigation";`,
      expected: /reserved for src\/i18n\/navigation\.ts/
    },
    {
      file: "src/components/FrameworkNavigationBarrel.ts",
      source: `export {createNavigation} from "next-intl/navigation";`,
      expected: /must not re-export next-intl\/navigation/
    },
    {
      file: "src/components/DynamicFrameworkNavigation.ts",
      source: `export async function load() { return import("next-intl/navigation"); }`,
      expected: /must not load next-intl\/navigation indirectly/
    },
    {
      file: "src/components/RequiredFrameworkNavigation.js",
      source: `const navigation = require("next-intl/navigation");`,
      expected: /must not load next-intl\/navigation indirectly/
    },
    {
      file: "src/components/NavigationBarrel.ts",
      source: `export * from "@/i18n/navigation";`,
      expected: /must not re-export locale navigation/
    },
    {
      file: "src/components/DynamicNavigation.mjs",
      source: `export const load = () => import("@/i18n/navigation");`,
      expected: /must not load locale navigation indirectly/
    },
    {
      file: "src/components/RequiredNavigation.js",
      source: `const navigation = require("@/i18n/navigation");`,
      expected: /must not load locale navigation indirectly/
    },
    {
      file: "src/components/DefaultNavigation.jsx",
      source: `import navigation from "@/i18n/navigation";`,
      expected: /direct named imports/
    }
  ];

  for (const fixture of fixtures) {
    assert.throws(
      () =>
        inspectNavigationImports(
          fixture.source,
          navigationExports,
          fixture.file
        ),
      fixture.expected
    );
  }

  assert.deepEqual(
    inspectNavigationImports(
      `import {Link as LocaleLink} from "@/i18n/navigation";\nexport default function Fixture() { return <LocaleLink href="/" />; }`,
      navigationExports,
      "src/components/Fixture.jsx"
    ).imports,
    [{ importedName: "Link", localName: "LocaleLink" }]
  );
});

test("source inventory locks providers and client dependencies to public scopes", () => {
  const sourceMap = readProjectSourceMap();
  assert.equal(isSupportedSourceFile("fixture.jsx"), true);
  assert.equal(isSupportedSourceFile("fixture.mts"), true);
  assert.equal(isSupportedSourceFile("fixture.d.ts"), false);
  assert.equal(isSupportedSourceFile("fixture.json"), false);
  const navigationExports = inspectNavigationRuntimeExports(
    readFileSync("src/i18n/navigation.ts", "utf8")
  );
  assert.deepEqual([...navigationExports].sort(), [
    "Link",
    "getPathname",
    "redirect",
    "usePathname",
    "useRouter"
  ]);

  const consumers = new Map();
  const scopedProviders = new Map();
  const rawProviders = new Map();

  for (const [normalizedFile, source] of sourceMap) {
    const providerInspection = inspectIntlProviderPlacement(
      source,
      normalizedFile
    );
    if (providerInspection.rawProviderCount > 0) {
      rawProviders.set(normalizedFile, providerInspection.rawProviderCount);
    }
    if (providerInspection.scopedProviderScopes.length > 0) {
      scopedProviders.set(
        normalizedFile,
        providerInspection.scopedProviderScopes
      );
    }

    const hooks = inspectNextIntlClientHooks(source, normalizedFile);
    const navigation = inspectNavigationImports(
      source,
      navigationExports,
      normalizedFile
    );
    const dependencyCount = hooks.callCount + navigation.importCount;
    if (dependencyCount > 0) {
      const route = validateClientProviderConsumer(normalizedFile, {
        dependencyCount,
        namespaces: hooks.namespaces
      });
      consumers.set(normalizedFile, { hooks, navigation, route });
    }
  }

  assert.deepEqual(Object.fromEntries(rawProviders), {
    [RAW_PROVIDER_FILE]: 1
  });
  assert.deepEqual(
    Object.fromEntries(scopedProviders),
    SCOPED_PROVIDER_PLACEMENTS
  );

  assert.deepEqual(
    [...consumers.keys()].sort(),
    Object.keys(CLIENT_PROVIDER_CONSUMER_ROUTES).sort()
  );

  for (const [file, consumer] of consumers) {
    assert.equal(consumer.route, CLIENT_PROVIDER_CONSUMER_ROUTES[file]);
  }

  const studioConsumers = [...consumers.keys()].filter((file) =>
    file.startsWith("src/app/[locale]/studio/")
  );
  assert.deepEqual(CLIENT_MESSAGE_ROUTE_SCOPES.studio, []);
  assert.deepEqual(studioConsumers, []);
  const studioBoundary = validateStudioDependencyBoundary(sourceMap, {
    classifyHazard: classifyStudioIntlHazard
  });
  assert.equal(
    studioBoundary.roots.includes("src/app/[locale]/studio/page.tsx"),
    true
  );

  const budgets = JSON.parse(
    readFileSync("config/static-artifact-budgets.json", "utf8")
  );
  assert.deepEqual(
    budgets.performance.clientMessages.scopes,
    CLIENT_MESSAGE_SCOPE_PATHS
  );
  for (const surface of ["home", "blog", "notes", "gallery", "studio"]) {
    assert.deepEqual(
      budgets.performance.clientMessages.localizedRouteSamples[surface]
        .requiredScopes,
      CLIENT_MESSAGE_ROUTE_SCOPES[surface]
    );
  }
});

test("Studio dependency graph rejects transitive navigation and approved public consumers", () => {
  const studioPage = "src/app/[locale]/studio/page.tsx";
  const navigationFile = "src/i18n/navigation.ts";
  const helperFile = "src/app/[locale]/studio/helper.tsx";
  const navigationSource = readFileSync(navigationFile, "utf8");
  const helperGraph = new Map([
    [
      studioPage,
      `import Helper from "./helper";\nexport default function Page() { return <Helper />; }`
    ],
    [
      helperFile,
      `import {Link} from "@/i18n/navigation";\nexport default function Helper() { return <Link href="/">Home</Link>; }`
    ],
    [navigationFile, navigationSource]
  ]);

  assert.throws(
    () =>
      validateStudioDependencyBoundary(helperGraph, {
        classifyHazard: classifyStudioIntlHazard
      }),
    (error) => {
      assert.equal(error instanceof DependencyBoundaryError, true);
      assert.deepEqual(error.chain, [studioPage, helperFile, navigationFile]);
      assert.match(error.message, /locale-navigation runtime/);
      return true;
    }
  );

  const projectSources = readProjectSourceMap();
  for (const publicConsumer of [
    "src/components/LocaleSwitcher.tsx",
    "src/components/AppHeader.tsx"
  ]) {
    const fixtureSources = new Map(projectSources);
    const importName = publicConsumer.endsWith("LocaleSwitcher.tsx")
      ? "LocaleSwitcher"
      : "AppHeader";
    const moduleName = publicConsumer
      .replace(/^src\//, "@/")
      .replace(/\.tsx$/, "");
    fixtureSources.set(
      studioPage,
      `import ${importName} from "${moduleName}";\nexport default function Page() { return <${importName} />; }`
    );

    assert.throws(
      () =>
        validateStudioDependencyBoundary(fixtureSources, {
          classifyHazard: classifyStudioIntlHazard
        }),
      (error) => {
        assert.equal(error instanceof DependencyBoundaryError, true);
        assert.deepEqual(error.chain, [studioPage, publicConsumer]);
        assert.match(error.message, /next-intl hook consumer/);
        return true;
      }
    );
  }
});
