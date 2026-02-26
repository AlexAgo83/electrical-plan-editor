import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function parseTopArg(args) {
  const topArgIndex = args.findIndex((arg) => arg.startsWith("--top="));
  if (topArgIndex < 0) {
    return { top: 10, rest: args };
  }

  const rawValue = args[topArgIndex].slice("--top=".length).trim();
  const parsed = Number(rawValue);
  const top = Number.isInteger(parsed) && parsed > 0 ? parsed : 10;
  return {
    top,
    rest: args.filter((_, index) => index !== topArgIndex)
  };
}

function collectAssertions(report) {
  const assertions = [];
  for (const suiteResult of report?.testResults ?? []) {
    const suiteName = typeof suiteResult?.name === "string" ? suiteResult.name : "unknown-suite";
    for (const assertion of suiteResult?.assertionResults ?? []) {
      if (typeof assertion?.duration !== "number") {
        continue;
      }
      const fullName =
        typeof assertion.fullName === "string" && assertion.fullName.length > 0
          ? assertion.fullName
          : `${suiteName} > ${String(assertion?.title ?? "unknown-test")}`;
      assertions.push({
        fullName,
        duration: assertion.duration
      });
    }
  }
  return assertions.sort((left, right) => right.duration - left.duration);
}

const { top, rest: userArgs } = parseTopArg(process.argv.slice(2));
const vitestEntrypoint = path.resolve(process.cwd(), "node_modules/vitest/vitest.mjs");
const reportFilePath = path.join(os.tmpdir(), `vitest-slow-tests-${Date.now()}.json`);
const vitestArgs = [
  vitestEntrypoint,
  "run",
  "--reporter=json",
  `--outputFile=${reportFilePath}`,
  ...userArgs
];

const runResult = spawnSync(process.execPath, vitestArgs, { stdio: "inherit" });
if (runResult.error) {
  console.error("[test:ci:slow-top] failed to execute vitest:", runResult.error.message);
  process.exit(1);
}

let report = null;
try {
  const rawReport = fs.readFileSync(reportFilePath, "utf8");
  report = JSON.parse(rawReport);
} catch {
  console.warn("[test:ci:slow-top] unable to read JSON report for slow-test summary.");
} finally {
  try {
    fs.unlinkSync(reportFilePath);
  } catch {
    // Best effort cleanup.
  }
}

const assertions = collectAssertions(report);
console.log(`[test:ci:slow-top] top ${top} slowest tests (informational):`);
if (assertions.length === 0) {
  console.log("[test:ci:slow-top] no assertion durations available.");
} else {
  for (const [index, assertion] of assertions.slice(0, top).entries()) {
    console.log(`${index + 1}. ${assertion.duration.toFixed(2)} ms - ${assertion.fullName}`);
  }
}

process.exit(runResult.status ?? 1);
