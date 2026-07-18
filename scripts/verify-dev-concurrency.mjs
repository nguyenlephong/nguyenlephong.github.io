#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { promises as fs } from "node:fs";
import { createServer } from "node:net";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const ROOT = process.cwd();
const HOST = "127.0.0.1";
const READY_TIMEOUT_MS = 60_000;
const REQUEST_TIMEOUT_MS = 120_000;
const NEXT_DIR = path.join(ROOT, ".next");
const DEV_CACHE = path.join(NEXT_DIR, "dev");
const DEV_CACHE_BACKUP = path.join(NEXT_DIR, `.dev-backup-${process.pid}`);
const MANIFEST_PATH = path.join(DEV_CACHE, "prerender-manifest.json");
const NEXT_BIN = path.join(
  ROOT,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
);
const CASES = [
  ["/en", 200],
  ["/en/about", 200],
  ["/en/apps", 200],
  ["/en/apps/english", 200],
  ["/en/blog", 200],
  ["/en/blog/architecture", 200],
  ["/en/blog/architecture/ports-and-adapters", 200],
  ["/en/blog/page/2", 200],
  ["/en/gallery", 200],
  ["/en/heartbeats", 200],
  ["/en/notes", 200],
  ["/en/notes/tri-tue-can-duc-hanh", 200],
  ["/en/notes/page/2", 200],
  ["/en/offline", 200],
  ["/en/search/blog.json", 200],
  ["/en/search/notes.json", 200],
  ["/vi/studio", 200],
  ["/zh/notes", 200],
  ["/__dev-concurrency-missing__", 404]
];

async function reservePort() {
  const server = createServer();
  server.unref();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, HOST, resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const { port } = address;
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
  return port;
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}

async function waitUntilReady(child, readLogs, readSpawnError) {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (/Ready in/.test(readLogs())) return;
    if (readSpawnError()) throw readSpawnError();
    if (child.exitCode !== null) {
      throw new Error(`development server exited with ${child.exitCode}`);
    }
    await delay(100);
  }
  throw new Error("development server readiness timeout");
}

async function stopChild(child) {
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([once(child, "exit"), delay(5_000)]);
  if (child.exitCode === null) {
    child.kill("SIGKILL");
    await once(child, "exit");
  }
}

async function readValidManifest() {
  let lastError;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const raw = await fs.readFile(MANIFEST_PATH, "utf8");
      JSON.parse(raw);
      return;
    } catch (error) {
      lastError = error;
      await delay(100);
    }
  }
  throw lastError;
}

async function main() {
  await fs.mkdir(NEXT_DIR, { recursive: true });
  await fs.rm(DEV_CACHE_BACKUP, { recursive: true, force: true });
  let restorePreviousCache = false;
  try {
    await fs.rename(DEV_CACHE, DEV_CACHE_BACKUP);
    restorePreviousCache = true;
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  let logs = "";
  let child;
  let spawnError;
  const capture = (chunk) => {
    logs = `${logs}${chunk}`.slice(-16_000);
  };

  try {
    const port = await reservePort();
    child = spawn(process.execPath, [NEXT_BIN, "dev", "-p", String(port)], {
      cwd: ROOT,
      env: {
        ...process.env
      },
      stdio: ["ignore", "pipe", "pipe"]
    });
    child.once("error", (error) => {
      spawnError = error;
    });
    child.stdout.on("data", capture);
    child.stderr.on("data", capture);

    await waitUntilReady(
      child,
      () => stripAnsi(logs),
      () => spawnError
    );
    const results = await Promise.all(
      CASES.map(async ([route, expectedStatus]) => {
        const response = await fetch(`http://${HOST}:${port}${route}`, {
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });
        await response.arrayBuffer();
        return { route, expectedStatus, status: response.status };
      })
    );

    for (const result of results) {
      assert.equal(
        result.status,
        result.expectedStatus,
        `${result.route} returned ${result.status}`
      );
    }
    await readValidManifest();
    process.stdout.write(
      `[verify-dev-concurrency] ${results.length} concurrent first hits passed; prerender manifest is valid\n`
    );
  } catch (error) {
    const diagnostic = stripAnsi(logs).trim();
    if (diagnostic) process.stderr.write(`${diagnostic}\n`);
    throw error;
  } finally {
    await stopChild(child);
    await fs.rm(DEV_CACHE, { recursive: true, force: true });
    if (restorePreviousCache) {
      await fs.rename(DEV_CACHE_BACKUP, DEV_CACHE);
    }
  }
}

main().catch((error) => {
  process.stderr.write(
    `[verify-dev-concurrency] failed: ${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exitCode = 1;
});
