import { spawnSync } from "node:child_process";
import path from "node:path";

const vitestEntrypoint = path.resolve(process.cwd(), "node_modules/vitest/vitest.mjs");
const vitestArgs = [
  vitestEntrypoint,
  "run",
  "--coverage.enabled",
  "--coverage.provider=v8",
  "--coverage.include=src/app/**/*.ts",
  "--coverage.include=src/app/**/*.tsx",
  "--coverage.reporter=text-summary",
  "--coverage.reporter=json-summary",
  "--coverage.reportsDirectory=coverage/ui"
];

console.log("[coverage:ui:report] informational signal only (non-blocking threshold).");
const result = spawnSync(process.execPath, vitestArgs, { stdio: "inherit" });

if (result.error) {
  console.error("[coverage:ui:report] failed to execute vitest:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
