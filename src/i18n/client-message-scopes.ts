import type { AbstractIntlMessages } from "next-intl";

/** Only namespaces consumed by Client Component hooks belong in this map. */
export const CLIENT_MESSAGE_SCOPE_PATHS = {
  site: ["Nav", "Footer", "Offline.banner"],
  home: ["Hero", "Summary", "Experience", "Projects", "CTA"],
  blog: ["Pages.blog"],
  notes: ["Pages.notes"],
  gallery: ["Pages.gallery"],
  thoughts: ["Pages.thoughts"]
} as const;

export type ClientMessageScope = keyof typeof CLIENT_MESSAGE_SCOPE_PATHS;

/** Route/surface ownership for source inventory and exported artifact checks. */
export const CLIENT_MESSAGE_ROUTE_SCOPES = {
  site: ["site"],
  home: ["site", "home"],
  blog: ["site", "blog"],
  notes: ["site", "notes"],
  gallery: ["site", "gallery"],
  thoughts: ["site", "thoughts"],
  studio: []
} as const satisfies Record<string, readonly ClientMessageScope[]>;

type MessageRecord = Record<string, unknown>;

const FORBIDDEN_NAMESPACE_SEGMENTS = new Set([
  "prototype",
  ...Object.getOwnPropertyNames(Object.prototype)
]);

function createMessageRecord(): MessageRecord {
  return Object.create(null) as MessageRecord;
}

function isMessageRecord(value: unknown): value is MessageRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateNamespacePaths(paths: readonly string[], label: string): void {
  if (paths.length === 0) {
    throw new Error(
      `Client message scope must declare at least one namespace: ${label}`
    );
  }

  const seen = new Set<string>();
  for (const path of paths) {
    const forbiddenSegment = path
      .split(".")
      .find((segment) => FORBIDDEN_NAMESPACE_SEGMENTS.has(segment));
    if (forbiddenSegment) {
      throw new Error(
        `Forbidden client message namespace segment in ${label}: ${forbiddenSegment} (${path})`
      );
    }
    if (!/^[A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)*$/.test(path)) {
      throw new Error(`Invalid client message namespace in ${label}: ${path}`);
    }
    if (seen.has(path)) {
      throw new Error(
        `Duplicate client message namespace in ${label}: ${path}`
      );
    }
    for (const existing of seen) {
      if (path.startsWith(`${existing}.`) || existing.startsWith(`${path}.`)) {
        throw new Error(
          `Overlapping client message namespaces in ${label}: ${existing} and ${path}`
        );
      }
    }
    seen.add(path);
  }
}

export function validateClientMessageScopes(
  scopes: Readonly<Record<string, readonly string[]>>
): void {
  const entries = Object.entries(scopes);
  if (entries.length === 0) {
    throw new Error("At least one client message scope must be declared");
  }

  const ownedPaths: { scope: string; path: string }[] = [];
  for (const [scope, paths] of entries) {
    validateNamespacePaths(paths, scope);
    for (const path of paths) {
      for (const owned of ownedPaths) {
        if (
          path === owned.path ||
          path.startsWith(`${owned.path}.`) ||
          owned.path.startsWith(`${path}.`)
        ) {
          throw new Error(
            `Overlapping client message namespaces across scopes: ${owned.scope}:${owned.path} and ${scope}:${path}`
          );
        }
      }
      ownedPaths.push({ scope, path });
    }
  }
}

validateClientMessageScopes(CLIENT_MESSAGE_SCOPE_PATHS);

function readMessageBranch(messages: MessageRecord, path: string): unknown {
  let current: unknown = messages;
  for (const segment of path.split(".")) {
    if (!isMessageRecord(current) || !Object.hasOwn(current, segment)) {
      throw new Error(`Missing client message namespace: ${path}`);
    }
    current = current[segment];
  }

  if (!isMessageRecord(current) || Object.keys(current).length === 0) {
    throw new Error(
      `Client message namespace must be a non-empty object: ${path}`
    );
  }
  return current;
}

function cloneMessageValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneMessageValue);
  if (!isMessageRecord(value)) return value;

  const clone = createMessageRecord();
  for (const [key, nested] of Object.entries(value)) {
    clone[key] = cloneMessageValue(nested);
  }
  return clone;
}

function cloneSerializableMessageValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneSerializableMessageValue);
  if (!isMessageRecord(value)) return value;

  const clone: MessageRecord = {};
  for (const [key, nested] of Object.entries(value)) {
    Object.defineProperty(clone, key, {
      configurable: true,
      enumerable: true,
      value: cloneSerializableMessageValue(nested),
      writable: true
    });
  }
  return clone;
}

function writeMessageBranch(
  target: MessageRecord,
  path: string,
  value: unknown
): void {
  const segments = path.split(".");
  let current = target;

  for (const segment of segments.slice(0, -1)) {
    if (!Object.hasOwn(current, segment))
      current[segment] = createMessageRecord();
    const nested = current[segment];
    if (!isMessageRecord(nested)) {
      throw new Error(`Invalid selected client message branch: ${path}`);
    }
    current = nested;
  }
  current[segments.at(-1) as string] = cloneMessageValue(value);
}

export function selectMessageNamespaces(
  messages: AbstractIntlMessages,
  paths: readonly string[],
  label = "custom"
): AbstractIntlMessages {
  validateNamespacePaths(paths, label);

  const selected = createMessageRecord();
  for (const path of paths) {
    writeMessageBranch(
      selected,
      path,
      readMessageBranch(messages as MessageRecord, path)
    );
  }
  return selected as AbstractIntlMessages;
}

export function selectClientMessages(
  messages: AbstractIntlMessages,
  scope: ClientMessageScope
): AbstractIntlMessages {
  if (!Object.hasOwn(CLIENT_MESSAGE_SCOPE_PATHS, scope)) {
    throw new Error(`Unknown client message scope: ${String(scope)}`);
  }
  const paths = CLIENT_MESSAGE_SCOPE_PATHS[scope];
  return selectMessageNamespaces(messages, paths, scope);
}

/** React Server Components only accept ordinary objects at the client boundary. */
export function toSerializableClientMessages(
  messages: AbstractIntlMessages
): AbstractIntlMessages {
  return cloneSerializableMessageValue(messages) as AbstractIntlMessages;
}
