import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

const KEYFRAMES_NAME = /^(?:-[\w]+-)?keyframes$/i;

function normalizedSelectorList(selectorSource) {
  const selectors = [];
  selectorParser((root) => {
    root.each((selector) => {
      selector.walkComments((comment) => comment.remove());
      selectors.push(selector.toString());
    });
  }).processSync(selectorSource, { lossless: false });
  return selectors.filter(Boolean);
}

function skipScopeTrivia(source, start) {
  let cursor = start;
  while (cursor < source.length) {
    if (/\s/.test(source[cursor])) {
      cursor += 1;
      continue;
    }
    if (source[cursor] === "/" && source[cursor + 1] === "*") {
      const close = source.indexOf("*/", cursor + 2);
      if (close === -1)
        throw new Error("Unterminated comment in @scope prelude");
      cursor = close + 2;
      continue;
    }
    break;
  }
  return cursor;
}

function readScopeSelector(source, start) {
  if (source[start] !== "(") {
    throw new Error("Expected a parenthesized selector in @scope prelude");
  }

  let depth = 1;
  let quote = "";
  let escaped = false;
  for (let cursor = start + 1; cursor < source.length; cursor += 1) {
    const character = source[cursor];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "\\") {
      cursor += 1;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "/" && source[cursor + 1] === "*") {
      const close = source.indexOf("*/", cursor + 2);
      if (close === -1)
        throw new Error("Unterminated comment in @scope prelude");
      cursor = close + 1;
      continue;
    }
    if (character === "(") depth += 1;
    else if (character === ")" && --depth === 0) {
      return {
        next: cursor + 1,
        selector: source.slice(start + 1, cursor)
      };
    }
  }
  throw new Error("Unterminated selector in @scope prelude");
}

function hasScopeToKeyword(source, start) {
  return (
    source.slice(start, start + 2).toLowerCase() === "to" &&
    !/[\w-]/.test(source[start + 2] ?? "")
  );
}

function scopeSelectorLists(params) {
  const selectorLists = [];
  let cursor = skipScopeTrivia(params, 0);
  if (cursor === params.length) return selectorLists;

  if (params[cursor] === "(") {
    const root = readScopeSelector(params, cursor);
    selectorLists.push(root.selector);
    cursor = skipScopeTrivia(params, root.next);
  }

  if (hasScopeToKeyword(params, cursor)) {
    cursor = skipScopeTrivia(params, cursor + 2);
    const limit = readScopeSelector(params, cursor);
    selectorLists.push(limit.selector);
    cursor = skipScopeTrivia(params, limit.next);
  }

  if (cursor !== params.length) {
    throw new Error(`Unsupported @scope prelude: ${params}`);
  }
  return selectorLists;
}

function isInsideKeyframes(rule) {
  for (let parent = rule.parent; parent; parent = parent.parent) {
    if (parent.type === "atrule" && KEYFRAMES_NAME.test(parent.name)) {
      return true;
    }
  }
  return false;
}

export function normalizeCssSelector(selector) {
  try {
    return normalizedSelectorList(selector).join(",");
  } catch {
    return "";
  }
}

export function extractCssSelectors(source) {
  const selectors = new Set();
  const root = postcss.parse(source, { from: undefined });

  root.walk((node) => {
    if (node.type === "atrule" && node.name.toLowerCase() === "scope") {
      for (const selectorList of scopeSelectorLists(node.params)) {
        for (const selector of normalizedSelectorList(selectorList)) {
          selectors.add(selector);
        }
      }
      return;
    }
    if (node.type !== "rule" || isInsideKeyframes(node)) return;
    for (const selector of normalizedSelectorList(node.selector)) {
      selectors.add(selector);
    }
  });

  return selectors;
}

function singleOwnerClass(ownerSelector) {
  let ownerClass = null;
  let classCount = 0;
  try {
    selectorParser((root) => {
      if (root.nodes.length !== 1) return;
      root.walkClasses((classNode) => {
        classCount += 1;
        ownerClass = classNode.value;
      });
    }).processSync(ownerSelector, { lossless: false });
  } catch {
    return null;
  }
  return classCount === 1 ? ownerClass : null;
}

export function selectorContainsOwner(selector, ownerSelector) {
  const ownerClass = singleOwnerClass(ownerSelector);
  if (!ownerClass) return false;

  let found = false;
  try {
    selectorParser((root) => {
      root.walkClasses((classNode) => {
        if (classNode.value === ownerClass) found = true;
      });
    }).processSync(selector, { lossless: false });
  } catch {
    return false;
  }
  return found;
}
