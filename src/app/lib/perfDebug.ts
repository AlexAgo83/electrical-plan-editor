import type { ProfilerOnRenderCallback } from "react";

const PERF_LOG_THRESHOLD_MS = 16;

function isPerfDebugEnabled(): boolean {
  if (!import.meta.env.DEV) {
    return false;
  }
  try {
    return globalThis.localStorage?.getItem("debug:perf") !== "false";
  } catch {
    return true;
  }
}

export function logPerfDuration(label: string, startedAt: number, details?: Record<string, unknown>): void {
  if (!isPerfDebugEnabled()) {
    return;
  }
  const durationMs = performance.now() - startedAt;
  if (durationMs >= PERF_LOG_THRESHOLD_MS) {
    console.info(`[perf] ${label}: ${durationMs.toFixed(1)}ms`, details ?? "");
  }
}

export const logReactRender: ProfilerOnRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
  if (!isPerfDebugEnabled() || actualDuration < PERF_LOG_THRESHOLD_MS) {
    return;
  }
  console.info(`[perf] render ${id}: ${actualDuration.toFixed(1)}ms`, {
    phase,
    baseDuration: Number(baseDuration.toFixed(1)),
    commitDelay: Number((commitTime - startTime).toFixed(1))
  });
};

let longTaskLoggerInstalled = false;

export function installLongTaskPerfLogger(): void {
  if (longTaskLoggerInstalled || !isPerfDebugEnabled() || typeof PerformanceObserver === "undefined") {
    return;
  }
  longTaskLoggerInstalled = true;
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.info(`[perf] longtask: ${entry.duration.toFixed(1)}ms`, {
          startTime: Number(entry.startTime.toFixed(1))
        });
      }
    }).observe({ entryTypes: ["longtask"] });
  } catch {
    // Long task timing is best-effort and not available in every browser.
  }
}
