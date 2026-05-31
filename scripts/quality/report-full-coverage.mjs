import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const parsedTimeoutMs = Number.parseInt(process.env.FULL_COVERAGE_TEST_TIMEOUT_MS ?? "", 10);
const timeoutMs = Number.isInteger(parsedTimeoutMs) && parsedTimeoutMs > 0 ? parsedTimeoutMs : 15000;
const parsedLayoutBudgetMs = Number.parseInt(process.env.FULL_COVERAGE_LAYOUT_RESPONSIVENESS_BUDGET_MS ?? "", 10);
const layoutResponsivenessBudgetMs =
  Number.isInteger(parsedLayoutBudgetMs) && parsedLayoutBudgetMs > 0 ? parsedLayoutBudgetMs : 35000;

const runnerArgs = [
  "vitest",
  "run",
  "--pool=forks",
  "--maxWorkers=2",
  "--coverage.enabled",
  "--coverage.provider=v8",
  "--coverage.include=src/core/**/*.ts",
  "--coverage.include=src/store/**/*.ts",
  "--coverage.include=src/app/**/*.ts",
  "--coverage.include=src/app/**/*.tsx",
  "--coverage.reporter=text-summary",
  "--coverage.reporter=json-summary",
  "--coverage.reportsDirectory=coverage/full",
  `--testTimeout=${timeoutMs}`,
  `--hookTimeout=${timeoutMs}`
];

console.log("[coverage:full:report] informational signal only (non-blocking threshold).");
console.log(
  `[coverage:full:report] running full suite with src/core + src/store + src/app coverage scope, timeout=${timeoutMs}ms, layoutBudget=${layoutResponsivenessBudgetMs}ms.`
);

const result = spawnSync("npx", runnerArgs, {
  stdio: "inherit",
  shell: false,
  env: {
    ...process.env,
    LAYOUT_RESPONSIVENESS_BUDGET_MS: String(layoutResponsivenessBudgetMs)
  }
});

if (result.error) {
  console.error("[coverage:full:report] failed to execute vitest:", result.error.message);
  process.exit(1);
}

const summaryPath = path.resolve(process.cwd(), "coverage/full/coverage-summary.json");
if (existsSync(summaryPath)) {
  try {
    const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
    const total = summary.total;
    if (total) {
      const fmt = (entry) => `${entry?.pct ?? "?"}% (${entry?.covered ?? 0}/${entry?.total ?? 0})`;
      console.log("[coverage:full:report] full-suite totals:");
      console.log(`  lines:      ${fmt(total.lines)}`);
      console.log(`  statements: ${fmt(total.statements)}`);
      console.log(`  branches:   ${fmt(total.branches)}`);
      console.log(`  functions:  ${fmt(total.functions)}`);
    }
  } catch (error) {
    console.warn("[coverage:full:report] could not parse coverage summary:", error?.message ?? error);
  }
}

process.exit(result.status ?? 1);
