import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const privateRouteRoot = path.join(root, "src/app/[locale]/(site)/heartbeats");
const publicSourceRoots = ["src", "public", "messages", "config"];
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".xml",
]);

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

function projectPath(absolutePath) {
  return path.relative(root, absolutePath).split(path.sep).join("/");
}

test("public source has no Heartbeats route or family seed", () => {
  assert.equal(existsSync(privateRouteRoot), false);

  const files = publicSourceRoots.flatMap((directory) => walk(path.join(root, directory)));
  for (const absolutePath of files) {
    const relativePath = projectPath(absolutePath);
    assert.doesNotMatch(
      relativePath,
      /(?:^|\/)heartbeats(?:\/|\.|$)/i,
      `private route source must not exist: ${relativePath}`,
    );

    if (!textExtensions.has(path.extname(relativePath).toLowerCase())) continue;
    const content = readFileSync(absolutePath, "utf8");
    assert.doesNotMatch(
      content,
      /\b(?:dob|birthdate|birth_date|dateofbirth|date_of_birth)\b\s*[:=]\s*["'`]\d{4}-\d{2}-\d{2}/i,
      `birth-date seed must not exist in public source: ${relativePath}`,
    );
    assert.doesNotMatch(
      content,
      /\b(?:FamilyMember|familyMembers)\b/,
      `family seed contract must not exist in public source: ${relativePath}`,
    );
  }
});

test("removed Heartbeats URLs stay crawlable so search engines can observe 404", () => {
  const robots = readFileSync(path.join(root, "src/app/robots.ts"), "utf8");

  assert.doesNotMatch(robots, /heartbeats/i);
  assert.match(robots, /disallow: \['\/private\/', '\/api\/'\]/);
});

test("Heartbeats-only date dependency is removed from the package contract", () => {
  const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const packageLock = JSON.parse(readFileSync(path.join(root, "package-lock.json"), "utf8"));

  assert.equal(packageJson.dependencies?.dayjs, undefined);
  assert.equal(packageLock.packages?.[""]?.dependencies?.dayjs, undefined);
  assert.equal(packageLock.packages?.["node_modules/dayjs"], undefined);
});
