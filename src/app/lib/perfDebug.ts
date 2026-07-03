import { useRef } from "react";
import type { ProfilerOnRenderCallback } from "react";

const PERF_LOG_THRESHOLD_MS = 16;
const PERF_DEBUG_STORAGE_KEY = "debug:perf";

export function isPerfDebugEnabled(): boolean {
  if (!import.meta.env.DEV) {
    return false;
  }
  try {
    return globalThis.localStorage?.getItem(PERF_DEBUG_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setPerfDebugEnabled(enabled: boolean): void {
  try {
    globalThis.localStorage?.setItem(PERF_DEBUG_STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore storage failures; debug logging is optional.
  }
  if (enabled) {
    installLongTaskPerfLogger();
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

// ponytail: dev-only diagnostic, logs which prop identities changed between renders
export function usePerfChangedProps(label: string, props: Record<string, unknown>): void {
  const previousRef = useRef<Record<string, unknown> | null>(null);
  if (isPerfDebugEnabled()) {
    const previous = previousRef.current;
    if (previous !== null) {
      const changed = Object.keys(props).filter((key) => !Object.is(previous[key], props[key]));
      console.info(`[perf] changed props ${label}:`, changed.length > 0 ? changed.join(", ") : "(none)");
    }
  }
  previousRef.current = props;
}

let longTaskLoggerInstalled = false;

export function installLongTaskPerfLogger(): void {
  if (longTaskLoggerInstalled || !import.meta.env.DEV || typeof PerformanceObserver === "undefined") {
    return;
  }
  longTaskLoggerInstalled = true;
  try {
    new PerformanceObserver((list) => {
      if (!isPerfDebugEnabled()) {
        return;
      }
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
