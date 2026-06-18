import { strict as assert } from "node:assert";
import test from "node:test";

const moduleUrl = new URL("../src/lib/og/build-targets.ts", import.meta.url);

async function withEnv(env, callback) {
  const previous = {
    OG_BUILD_MODE: process.env.OG_BUILD_MODE,
    OG_TARGETS: process.env.OG_TARGETS
  };

  if ("OG_BUILD_MODE" in env) process.env.OG_BUILD_MODE = env.OG_BUILD_MODE;
  else delete process.env.OG_BUILD_MODE;

  if ("OG_TARGETS" in env) process.env.OG_TARGETS = env.OG_TARGETS;
  else delete process.env.OG_TARGETS;

  const mod = await import(`${moduleUrl.href}?t=${Date.now()}-${Math.random()}`);

  try {
    return await callback(mod);
  } finally {
    if (previous.OG_BUILD_MODE === undefined) delete process.env.OG_BUILD_MODE;
    else process.env.OG_BUILD_MODE = previous.OG_BUILD_MODE;

    if (previous.OG_TARGETS === undefined) delete process.env.OG_TARGETS;
    else process.env.OG_TARGETS = previous.OG_TARGETS;
  }
}

test("full OG mode keeps every static param", async () => {
  await withEnv({}, ({ filterOgStaticParams }) => {
    const params = [
      { locale: "vi", category: "ai", slug: "ai-agents-explained" },
      { locale: "en", category: "ai", slug: "ai-agents-explained" }
    ];

    assert.deepEqual(
      filterOgStaticParams(params, (p) => `/${p.locale}/blog/${p.category}/${p.slug}`),
      params
    );
  });
});

test("targeted OG mode keeps only matching page paths", async () => {
  await withEnv({
    OG_BUILD_MODE: "targeted",
    OG_TARGETS: "/vi/blog/ai/ai-agents-explained, en/notes/a-reading-system/opengraph-image"
  }, ({ filterOgStaticParams }) => {
    const params = [
      { locale: "vi", category: "ai", slug: "ai-agents-explained" },
      { locale: "en", category: "ai", slug: "ai-agents-explained" },
      { locale: "en", slug: "a-reading-system" },
      { locale: "vi", slug: "a-reading-system" }
    ];

    assert.deepEqual(
      filterOgStaticParams(params, (p) =>
        "category" in p
          ? `/${p.locale}/blog/${p.category}/${p.slug}`
          : `/${p.locale}/notes/${p.slug}`
      ),
      [
        { locale: "vi", category: "ai", slug: "ai-agents-explained" },
        { locale: "en", slug: "a-reading-system" }
      ]
    );
  });
});

test("skip OG mode returns no dynamic static params", async () => {
  await withEnv({ OG_BUILD_MODE: "skip" }, ({ filterOgStaticParams }) => {
    assert.deepEqual(
      filterOgStaticParams([{ locale: "vi", slug: "a-reading-system" }], (p) => `/${p.locale}/notes/${p.slug}`),
      []
    );
  });
});

test("skip OG mode can keep one static-export sentinel param", async () => {
  await withEnv({ OG_BUILD_MODE: "skip" }, ({ filterOgStaticParams }) => {
    const params = [
      { locale: "vi", slug: "a-reading-system" },
      { locale: "en", slug: "a-reading-system" }
    ];

    assert.deepEqual(
      filterOgStaticParams(
        params,
        (p) => `/${p.locale}/notes/${p.slug}`,
        { keepFirstWhenEmpty: true }
      ),
      [{ locale: "vi", slug: "a-reading-system" }]
    );
  });
});
