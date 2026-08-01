import playwright from "playwright";

const { chromium } = playwright;
const targetUrl = process.env.HERO_URL ?? "http://localhost:10505/vi";
const sampleMs = Number(process.env.HERO_SAMPLE_MS ?? 2400);
const cpuRate = Number(process.env.HERO_CPU_RATE ?? 4);
const deviceScaleFactor = Number(process.env.HERO_DPR ?? 2);

function percentile(values, ratio) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))];
}

async function measure(browser, reducedMotion) {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor,
    reducedMotion: reducedMotion ? "reduce" : "no-preference"
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpuRate });
  await cdp.send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await page.bringToFront();

  await page.addInitScript(() => {
    const originalRequestAnimationFrame =
      window.requestAnimationFrame.bind(window);
    const state = {
      enabled: false,
      callbackDurations: [],
      longTasks: []
    };
    window.__heroAnimationPerf = state;

    window.requestAnimationFrame = (callback) =>
      originalRequestAnimationFrame((timestamp) => {
        if (!state.enabled) return callback(timestamp);
        const startedAt = performance.now();
        try {
          return callback(timestamp);
        } finally {
          state.callbackDurations.push(performance.now() - startedAt);
        }
      });

    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        if (!state.enabled) return;
        for (const entry of list.getEntries())
          state.longTasks.push(entry.duration);
      });
      try {
        observer.observe({ type: "longtask", buffered: false });
      } catch {
        // RAF callback timing remains available where Long Task API is absent.
      }
    }
  });

  await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("radio", { name: "Dark theme" }).click();
  await page.waitForTimeout(4200);
  await page.evaluate(() => {
    window.__heroAnimationPerf.callbackDurations.length = 0;
    window.__heroAnimationPerf.longTasks.length = 0;
    window.__heroAnimationPerf.enabled = true;
  });
  await page.waitForTimeout(sampleMs);
  const raw = await page.evaluate(() => {
    window.__heroAnimationPerf.enabled = false;
    const canvas = document.querySelector("canvas.ai-particle-field");
    const rect = canvas?.getBoundingClientRect();
    return {
      callbackDurations: window.__heroAnimationPerf.callbackDurations,
      longTasks: window.__heroAnimationPerf.longTasks,
      canvas: canvas
        ? {
            cssWidth: Math.round(rect.width),
            cssHeight: Math.round(rect.height),
            bitmapWidth: canvas.width,
            bitmapHeight: canvas.height,
            renderer: canvas.getContext("webgl") ? "webgl" : "unavailable"
          }
        : null
    };
  });
  await context.close();

  const callbackBusyMs = raw.callbackDurations.reduce(
    (sum, value) => sum + value,
    0
  );
  return {
    reducedMotion,
    sampleMs,
    cpuRate,
    deviceScaleFactor,
    canvas: raw.canvas,
    raf: {
      callbacks: raw.callbackDurations.length,
      p50Ms: Number(percentile(raw.callbackDurations, 0.5).toFixed(2)),
      p95Ms: Number(percentile(raw.callbackDurations, 0.95).toFixed(2)),
      maxMs: Number(Math.max(0, ...raw.callbackDurations).toFixed(2)),
      busyPercent: Number(((callbackBusyMs / sampleMs) * 100).toFixed(1))
    },
    longTasks: {
      count: raw.longTasks.length,
      maxMs: Number(Math.max(0, ...raw.longTasks).toFixed(2))
    }
  };
}

const browser = await chromium.launch({
  headless: true,
  args: [
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding"
  ]
});

try {
  const active = await measure(browser, false);
  const reduced = await measure(browser, true);
  const extraBusyPercent = Number(
    Math.max(0, active.raf.busyPercent - reduced.raf.busyPercent).toFixed(1)
  );
  const budgets = {
    extraBusyPercentMax: 12,
    rafP95MsMax: 16,
    longTaskMsMaxExclusive: 50,
    activeCallbacksMin: 30
  };
  const result = {
    pass:
      active.canvas?.renderer === "webgl" &&
      active.raf.callbacks >= budgets.activeCallbacksMin &&
      reduced.raf.callbacks === 0 &&
      extraBusyPercent <= budgets.extraBusyPercentMax &&
      active.raf.p95Ms <= budgets.rafP95MsMax &&
      active.longTasks.maxMs < budgets.longTaskMsMaxExclusive,
    budgets,
    extraBusyPercent,
    active,
    reduced
  };

  console.log(JSON.stringify(result, null, 2));
  if (!result.pass) process.exitCode = 1;
} finally {
  await browser.close();
}
