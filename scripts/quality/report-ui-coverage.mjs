import { spawnSync } from "node:child_process";
import path from "node:path";

const segmentedRunnerEntrypoint = path.resolve(process.cwd(), "scripts/quality/run-vitest-segmented.mjs");
const timeoutMs = 15000;
const reportTimeoutMs = 600000;
const runnerArgs = [
  segmentedRunnerEntrypoint,
  "ui",
  "--coverage.enabled",
  "--coverage.provider=v8",
  "--coverage.include=src/app/**/*.ts",
  "--coverage.include=src/app/**/*.tsx",
  "--coverage.reporter=text-summary",
  "--coverage.reporter=json-summary",
  "--coverage.reportsDirectory=coverage/ui",
  `--testTimeout=${timeoutMs}`,
  `--hookTimeout=${timeoutMs}`
];

console.log("[coverage:ui:report] informational signal only (non-blocking threshold).");
console.log(`[coverage:ui:report] using UI lane with timeout=${timeoutMs}ms for stability.`);
console.log(`[coverage:ui:report] using report timeout=${reportTimeoutMs}ms.`);
const result = spawnSync(process.execPath, runnerArgs, { stdio: "inherit", timeout: reportTimeoutMs });

if (result.error) {
  console.error("[coverage:ui:report] failed to execute vitest:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
