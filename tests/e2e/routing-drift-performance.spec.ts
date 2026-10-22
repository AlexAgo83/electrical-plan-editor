import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Routing drift diagnostics cadence evidence (req_171 AC6). Measures, in a real
 * browser, every diagnostic slice (`routing-drift-slice` performance measures),
 * long tasks overlapping the check and event-loop lag (an input-latency proxy)
 * during the check versus an idle baseline window, on representative and large
 * networks. Set ROUTING_DRIFT_BENCH_RUNS to raise the run count.
 */
const RUNS = Number(process.env.ROUTING_DRIFT_BENCH_RUNS ?? "2");
const MAX_DIAGNOSTIC_TASK_MS = 50;

const FIXTURES = {
  representative: { gridSize: 10, connectorCount: 60, spliceCount: 10, wireCount: 300 },
  large: { gridSize: 20, connectorCount: 200, spliceCount: 30, wireCount: 1500 }
} as const;

interface RunMetrics {
  sliceCount: number;
  sliceMaxMs: number;
  sliceP95Ms: number;
  checkWallMs: number;
  longTasksDuringCheck: number[];
  lagDuringCheckP50: number;
  lagDuringCheckP95: number;
  lagBaselineP50: number;
  lagBaselineP95: number;
  firstSliceAfterDomContentLoadedMs: number;
}

function percentile(values: number[], q: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] ?? 0;
}

async function instrument(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("electrical-plan-editor.onboarding.auto-open-enabled.v1", "false");
    const probe = { lag: [] as Array<{ at: number; lag: number }>, longTasks: [] as Array<{ start: number; duration: number }> };
    (window as unknown as { __routingDriftBench: typeof probe }).__routingDriftBench = probe;
    const intervalMs = 10;
    let expected = performance.now() + intervalMs;
    const tick = () => {
      const now = performance.now();
      probe.lag.push({ at: now, lag: Math.max(0, now - expected) });
      expected = now + intervalMs;
      setTimeout(tick, intervalMs);
    };
    setTimeout(tick, intervalMs);
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          probe.longTasks.push({ start: entry.startTime, duration: entry.duration });
        }
      }).observe({ type: "longtask", buffered: true });
    } catch {
      // Long task API unavailable: lag and slice measures still apply.
    }
  });
}

/** Builds the synthetic network with the app's own modules (served by Vite) and persists it. */
async function seedFixture(page: Page, fixture: (typeof FIXTURES)[keyof typeof FIXTURES]): Promise<void> {
  await page.goto("/");
  await expect(page.locator(".app-shell").first()).toBeVisible();
  await page.evaluate(async (options) => {
    // Served by the Vite dev server from the page; the specifiers are not resolved by Node.
    const load = (specifier: string): Promise<unknown> => import(/* @vite-ignore */ specifier);
    const fixtures = (await load("/src/tests/helpers/routing-drift-fixtures.ts")) as typeof import("../../src/tests/helpers/routing-drift-fixtures");
    const schema = (await load("/src/core/schema.ts")) as typeof import("../../src/core/schema");
    const migrations = (await load("/src/adapters/persistence/migrations.ts")) as typeof import("../../src/adapters/persistence/migrations");
    const state = fixtures.buildSyntheticRoutingNetworkState(options);
    window.localStorage.setItem(
      "electrical-plan-editor.state",
      JSON.stringify({
        payloadKind: migrations.PERSISTED_STATE_PAYLOAD_KIND,
        schemaVersion: migrations.PERSISTED_STATE_SCHEMA_VERSION,
        appVersion: schema.APP_RELEASE_VERSION,
        appSchemaVersion: schema.APP_SCHEMA_VERSION,
        createdAtIso: "2026-10-22T00:00:00.000Z",
        updatedAtIso: "2026-10-22T00:00:00.000Z",
        state
      })
    );
  }, fixture);
}

async function measureRun(page: Page, expectedWireCount: number): Promise<RunMetrics> {
  await page.reload();
  await expect(page.locator(".app-shell").first()).toBeVisible();
  void expectedWireCount;
  // Wait until the debounced check started and its slices stopped growing.
  await expect
    .poll(async () => page.evaluate(() => performance.getEntriesByName("routing-drift-slice").length), { timeout: 30_000 })
    .toBeGreaterThan(0);
  let previous = -1;
  await expect
    .poll(
      async () => {
        const count = await page.evaluate(() => performance.getEntriesByName("routing-drift-slice").length);
        const stable = count === previous;
        previous = count;
        return stable;
      },
      { timeout: 60_000, intervals: [500] }
    )
    .toBe(true);
  // Idle baseline window after the check.
  await page.waitForTimeout(1500);

  return page.evaluate(() => {
    const slices = performance.getEntriesByName("routing-drift-slice");
    const first = slices[0];
    const last = slices[slices.length - 1];
    const checkStart = first?.startTime ?? 0;
    const checkEnd = last === undefined ? 0 : last.startTime + last.duration;
    const probe = (window as unknown as {
      __routingDriftBench: { lag: Array<{ at: number; lag: number }>; longTasks: Array<{ start: number; duration: number }> };
    }).__routingDriftBench;
    const pct = (values: number[], q: number) => {
      const sorted = [...values].sort((left, right) => left - right);
      return sorted.length === 0 ? 0 : sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] ?? 0;
    };
    const during = probe.lag.filter((sample) => sample.at >= checkStart && sample.at <= checkEnd + 20).map((sample) => sample.lag);
    const baseline = probe.lag.filter((sample) => sample.at > checkEnd + 200).map((sample) => sample.lag);
    const durations = slices.map((slice) => slice.duration);
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return {
      firstSliceAfterDomContentLoadedMs: checkStart - (navigation?.domContentLoadedEventEnd ?? 0),
      sliceCount: slices.length,
      sliceMaxMs: Math.max(0, ...durations),
      sliceP95Ms: pct(durations, 0.95),
      checkWallMs: checkEnd - checkStart,
      longTasksDuringCheck: probe.longTasks
        .filter((task) => task.start + task.duration >= checkStart && task.start <= checkEnd)
        .map((task) => task.duration),
      lagDuringCheckP50: pct(during, 0.5),
      lagDuringCheckP95: pct(during, 0.95),
      lagBaselineP50: pct(baseline, 0.5),
      lagBaselineP95: pct(baseline, 0.95)
    };
  });
}

for (const [label, fixture] of Object.entries(FIXTURES)) {
  test(`routing drift diagnostics stay within the main-thread budget on the ${label} network`, async ({ page, browserName }) => {
    test.setTimeout(180_000);
    await instrument(page);
    await seedFixture(page, fixture);
    const runs: RunMetrics[] = [];
    for (let run = 0; run < RUNS; run += 1) {
      runs.push(await measureRun(page, fixture.wireCount));
    }

    const summary = {
      fixture: { label, ...fixture },
      browser: browserName,
      runs: runs.length,
      sliceCount: runs.map((run) => run.sliceCount),
      sliceMaxMs: Math.max(...runs.map((run) => run.sliceMaxMs)).toFixed(2),
      sliceP95Ms: percentile(runs.map((run) => run.sliceP95Ms), 0.95).toFixed(2),
      checkWallMsP50: percentile(runs.map((run) => run.checkWallMs), 0.5).toFixed(0),
      longTasksDuringCheck: runs.flatMap((run) => run.longTasksDuringCheck.map((duration) => Math.round(duration))),
      addedLagP50Ms: percentile(runs.map((run) => run.lagDuringCheckP50 - run.lagBaselineP50), 0.5).toFixed(2),
      addedLagP95Ms: percentile(runs.map((run) => run.lagDuringCheckP95 - run.lagBaselineP95), 0.95).toFixed(2),
      lagDuringCheckP95Ms: percentile(runs.map((run) => run.lagDuringCheckP95), 0.95).toFixed(2),
      firstSliceAfterDomContentLoadedMsP50: percentile(runs.map((run) => run.firstSliceAfterDomContentLoadedMs), 0.5).toFixed(0)
    };
    console.log(`[routing-drift-bench] ${JSON.stringify(summary)}`);

    for (const run of runs) {
      expect(run.sliceCount).toBeGreaterThan(0);
      expect(run.sliceMaxMs).toBeLessThan(MAX_DIAGNOSTIC_TASK_MS);
      expect(run.lagDuringCheckP95 - run.lagBaselineP95).toBeLessThan(MAX_DIAGNOSTIC_TASK_MS);
      // Startup is never blocked: the first check is debounced after hydration.
      expect(run.firstSliceAfterDomContentLoadedMs).toBeGreaterThan(0);
    }
  });
}
