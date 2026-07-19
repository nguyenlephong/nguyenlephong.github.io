import { readFile } from "node:fs/promises";

const REQUIRED_LOCALES = Object.freeze(["en", "vi", "zh", "ja", "ko", "fr"]);
const REQUIRED_CLIENT_MESSAGE_ROUTES = Object.freeze({
  home: Object.freeze({
    path: "{locale}.txt",
    requiredScopes: Object.freeze(["site", "home"])
  }),
  blog: Object.freeze({
    path: "{locale}/blog.txt",
    requiredScopes: Object.freeze(["site", "blog"])
  }),
  notes: Object.freeze({
    path: "{locale}/notes.txt",
    requiredScopes: Object.freeze(["site", "notes"])
  }),
  gallery: Object.freeze({
    path: "{locale}/gallery.txt",
    requiredScopes: Object.freeze(["site", "gallery"])
  }),
  studio: Object.freeze({
    path: "{locale}/studio.txt",
    requiredScopes: Object.freeze([])
  })
});
const SERIALIZED_MESSAGES_PROPERTY_SOURCE = '"messages"\\s*:';
const FORBIDDEN_CLIENT_MESSAGE_SEGMENTS = new Set([
  "prototype",
  ...Object.getOwnPropertyNames(Object.prototype)
]);

function parseLocalizedRoutePath(relativePath) {
  if (typeof relativePath !== "string" || !relativePath.endsWith(".txt")) {
    return null;
  }
  const segments = relativePath.slice(0, -4).split("/");
  const [locale, ...routeSegments] = segments;
  if (!REQUIRED_LOCALES.includes(locale)) return null;
  return { locale, routeSegments };
}

export function expectedClientMessageScopesForLocalizedRoute(relativePath) {
  const route = parseLocalizedRoutePath(relativePath);
  if (!route) return null;

  const [first, second, third] = route.routeSegments;
  if (!first) return ["site", "home"];
  if (first === "studio") return [];
  if (first === "gallery" && route.routeSegments.length === 1) {
    return ["site", "gallery"];
  }
  if (first === "blog") {
    if (route.routeSegments.length <= 2) return ["site", "blog"];
    if (
      route.routeSegments.length === 3 &&
      second === "page" &&
      /^[1-9]\d*$/.test(third)
    ) {
      return ["site", "blog"];
    }
    return ["site"];
  }
  if (first === "notes") {
    if (route.routeSegments.length === 1) return ["site", "notes"];
    if (
      route.routeSegments.length === 3 &&
      second === "page" &&
      /^[1-9]\d*$/.test(third)
    ) {
      return ["site", "notes"];
    }
    return ["site"];
  }
  return ["site"];
}

function arraysEqual(left, right) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function clientMessageScopesOverlap(scopes) {
  const ownedPaths = [];
  for (const selectors of Object.values(scopes)) {
    for (const selector of selectors) {
      for (const owned of ownedPaths) {
        if (
          selector === owned ||
          selector.startsWith(`${owned}.`) ||
          owned.startsWith(`${selector}.`)
        ) {
          return true;
        }
      }
      ownedPaths.push(selector);
    }
  }
  return false;
}

export function validateClientMessageConfig(clientMessages) {
  const scopes = clientMessages?.scopes;
  const routeSamples = clientMessages?.localizedRouteSamples;
  if (
    !scopes ||
    typeof scopes !== "object" ||
    Array.isArray(scopes) ||
    Object.keys(scopes).length < 1 ||
    Object.values(scopes).some(
      (selectors) =>
        !Array.isArray(selectors) ||
        selectors.length < 1 ||
        selectors.some(
          (selector) =>
            typeof selector !== "string" ||
            !/^[A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)*$/.test(
              selector
            ) ||
            selector
              .split(".")
              .some((segment) => FORBIDDEN_CLIENT_MESSAGE_SEGMENTS.has(segment))
        ) ||
        new Set(selectors).size !== selectors.length ||
        selectors.some((selector, index) =>
          selectors.some(
            (candidate, candidateIndex) =>
              candidateIndex !== index &&
              (selector.startsWith(`${candidate}.`) ||
                candidate.startsWith(`${selector}.`))
          )
        )
    ) ||
    clientMessageScopesOverlap(scopes) ||
    !routeSamples ||
    typeof routeSamples !== "object" ||
    Array.isArray(routeSamples)
  ) {
    return false;
  }

  const requiredRouteEntries = Object.entries(REQUIRED_CLIENT_MESSAGE_ROUTES);
  if (
    Object.keys(routeSamples).length !== requiredRouteEntries.length ||
    !requiredRouteEntries.every(([surface, expected]) => {
      const sample = routeSamples[surface];
      return (
        sample?.path === expected.path &&
        Array.isArray(sample.requiredScopes) &&
        arraysEqual(sample.requiredScopes, expected.requiredScopes) &&
        sample.requiredScopes.every((scope) => Object.hasOwn(scopes, scope))
      );
    })
  ) {
    return false;
  }

  return true;
}

function readSerializedJsonValue(source, start) {
  let valueStart = start;
  while (/\s/.test(source[valueStart] ?? "")) valueStart += 1;
  const first = source[valueStart];
  if (!first) {
    return { error: `missing serialized message value at byte ${start}` };
  }

  if (first !== "{" && first !== "[" && first !== '"') {
    const primitive = source
      .slice(valueStart)
      .match(
        /^(?:null|true|false|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/
      )?.[0];
    if (!primitive) {
      return {
        error: `invalid serialized message value at byte ${valueStart}`
      };
    }
    try {
      return {
        value: JSON.parse(primitive),
        end: valueStart + primitive.length
      };
    } catch (error) {
      return {
        error: `invalid serialized message value at byte ${valueStart}: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  const closingStack = [];
  let inString = false;
  let escaped = false;
  for (let index = valueStart; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') {
        inString = false;
        if (closingStack.length === 0) {
          const serialized = source.slice(valueStart, index + 1);
          try {
            return { value: JSON.parse(serialized), end: index + 1 };
          } catch (error) {
            return {
              error: `invalid serialized message value at byte ${valueStart}: ${error instanceof Error ? error.message : String(error)}`
            };
          }
        }
      }
      continue;
    }
    if (character === '"') {
      inString = true;
      continue;
    }
    if (character === "{") closingStack.push("}");
    else if (character === "[") closingStack.push("]");
    else if (character === "}" || character === "]") {
      if (closingStack.pop() !== character) {
        return {
          error: `mismatched serialized message value at byte ${valueStart}`
        };
      }
      if (closingStack.length === 0) {
        const serialized = source.slice(valueStart, index + 1);
        try {
          return { value: JSON.parse(serialized), end: index + 1 };
        } catch (error) {
          return {
            error: `invalid serialized message value at byte ${valueStart}: ${error instanceof Error ? error.message : String(error)}`
          };
        }
      }
    }
  }
  return {
    error: `unterminated serialized message value at byte ${valueStart}`
  };
}

function extractClientMessageOccurrences(source) {
  const occurrences = [];
  const messagesProperty = new RegExp(SERIALIZED_MESSAGES_PROPERTY_SOURCE, "g");
  let cursor = 0;

  while (cursor < source.length) {
    messagesProperty.lastIndex = cursor;
    const property = messagesProperty.exec(source);
    if (!property) break;
    const propertyStart = property.index;
    const valueStart = messagesProperty.lastIndex;
    const parsed = readSerializedJsonValue(source, valueStart);
    if (parsed.error) {
      occurrences.push({ error: parsed.error, offset: propertyStart });
      cursor = valueStart + 1;
      continue;
    }
    occurrences.push({ value: parsed.value, offset: propertyStart });
    cursor = parsed.end;
  }

  return occurrences;
}

function collectMessageStructuralPaths(value, prefix = "", paths = []) {
  const kind = Array.isArray(value)
    ? "array"
    : value !== null && typeof value === "object"
      ? "object"
      : "value";
  if (prefix) paths.push({ path: prefix, kind });

  if (kind === "object") {
    for (const [key, nested] of Object.entries(value)) {
      collectMessageStructuralPaths(
        nested,
        prefix ? `${prefix}.${key}` : key,
        paths
      );
    }
  }
  return paths;
}

function matchesClientMessageScope(messageObject, selectors) {
  if (
    messageObject === null ||
    typeof messageObject !== "object" ||
    Array.isArray(messageObject)
  ) {
    return false;
  }

  const structuralPaths = collectMessageStructuralPaths(messageObject);
  return (
    structuralPaths.length > 0 &&
    structuralPaths.every((node) =>
      selectors.some(
        (selector) =>
          node.path === selector ||
          node.path.startsWith(`${selector}.`) ||
          selector.startsWith(`${node.path}.`)
      )
    ) &&
    selectors.every((selector) => {
      const namespace = structuralPaths.find((node) => node.path === selector);
      return (
        namespace?.kind === "object" &&
        structuralPaths.some((node) => node.path.startsWith(`${selector}.`))
      );
    })
  );
}

function identifyClientMessageScope(messageObject, scopes) {
  const matches = Object.entries(scopes)
    .filter(([, selectors]) =>
      matchesClientMessageScope(messageObject, selectors)
    )
    .map(([scope]) => scope);
  return matches.length === 1 ? matches[0] : null;
}

export async function verifyClientMessageRoutes({ index, config, failures }) {
  const scopes = config.scopes;
  const routes = [];
  const scopeCounts = Object.fromEntries(
    Object.keys(scopes).map((scope) => [scope, 0])
  );
  let providerCount = 0;
  let expectedProviderCount = 0;

  const localizedRoutePaths = index.files().filter((relativePath) => {
    const requiredScopes =
      expectedClientMessageScopesForLocalizedRoute(relativePath);
    return (
      requiredScopes !== null && index.has(`${relativePath.slice(0, -4)}.html`)
    );
  });

  for (const locale of REQUIRED_LOCALES) {
    for (const [surface, sampleConfig] of Object.entries(
      config.localizedRouteSamples
    )) {
      const relativePath = sampleConfig.path.replaceAll("{locale}", locale);
      const htmlPath = `${relativePath.slice(0, -4)}.html`;
      if (!index.has(relativePath) || !index.has(htmlPath)) {
        failures.push(
          `Missing localized client message route pair: ${locale}/${surface} (${relativePath}, ${htmlPath})`
        );
      }
    }
  }

  for (const relativePath of localizedRoutePaths) {
    const route = parseLocalizedRoutePath(relativePath);
    const requiredScopes =
      expectedClientMessageScopesForLocalizedRoute(relativePath);
    if (!route || !requiredScopes) continue;

    // Keep the complete route scan out of the artifact index's content cache.
    // Only one RSC body needs to be resident while its provider contract is checked.
    const source = await readFile(index.resolve(relativePath), "utf8");
    const occurrences = extractClientMessageOccurrences(source);
    providerCount += occurrences.length;
    expectedProviderCount += requiredScopes.length;
    if (occurrences.length !== requiredScopes.length) {
      failures.push(
        `${relativePath} serializes ${occurrences.length} client message provider occurrence(s); expected ${requiredScopes.length}`
      );
    }

    const identifiedScopes = [];
    for (const occurrence of occurrences) {
      if (occurrence.error) {
        failures.push(`${relativePath}: ${occurrence.error}`);
        continue;
      }
      const scope = identifyClientMessageScope(occurrence.value, scopes);
      if (!scope) {
        failures.push(
          `${relativePath} serializes an unrecognized or overlapping client message scope`
        );
        continue;
      }
      identifiedScopes.push(scope);
      scopeCounts[scope] += 1;
    }

    const actualScopeCounts = new Map();
    for (const scope of identifiedScopes) {
      actualScopeCounts.set(scope, (actualScopeCounts.get(scope) ?? 0) + 1);
    }
    const actualScopes = [...actualScopeCounts.keys()];
    for (const requiredScope of requiredScopes) {
      const count = actualScopeCounts.get(requiredScope) ?? 0;
      if (count === 0) {
        failures.push(
          `${relativePath} is missing required client message scope: ${requiredScope}`
        );
      } else if (count !== 1) {
        failures.push(
          `${relativePath} serializes client message scope ${requiredScope} ${count} times; expected exactly once`
        );
      }
    }
    for (const actualScope of actualScopes) {
      if (!requiredScopes.includes(actualScope)) {
        failures.push(
          `${relativePath} serializes unexpected client message scope: ${actualScope} (${actualScopeCounts.get(actualScope)} instance(s))`
        );
      }
    }

    routes.push({
      locale: route.locale,
      route: route.routeSegments.join("/") || "/",
      path: relativePath,
      requiredScopes,
      providerCount: occurrences.length,
      scopes: actualScopes,
      scopeCounts: Object.fromEntries(actualScopeCounts)
    });
  }

  return {
    routes,
    routeCount: routes.length,
    providerCount,
    expectedProviderCount,
    scopeCounts
  };
}
