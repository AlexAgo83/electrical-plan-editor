import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const UI_LANE_TEST_FILES = [
  "src/tests/app.ui.catalog-csv-import-export.spec.tsx",
  "src/tests/app.ui.catalog.spec.tsx",
  "src/tests/app.ui.creation-flow-ergonomics.spec.tsx",
  "src/tests/app.ui.creation-flow-wire-endpoint-refs.spec.tsx",
  "src/tests/app.ui.form-validation-doctrine.spec.tsx",
  "src/tests/app.ui.home.spec.tsx",
  "src/tests/app.ui.import-export.spec.tsx",
  "src/tests/app.ui.inspector-shell.spec.tsx",
  "src/tests/app.ui.lazy-loading-regression.spec.tsx",
  "src/tests/app.ui.list-ergonomics.spec.tsx",
  "src/tests/app.ui.navigation-canvas-selection-gating.spec.tsx",
  "src/tests/app.ui.navigation-canvas-validation-bridge.spec.tsx",
  "src/tests/app.ui.navigation-canvas.spec.tsx",
  "src/tests/app.ui.network-summary-bom-export.spec.tsx",
  "src/tests/app.ui.network-summary-layering.spec.tsx",
  "src/tests/app.ui.network-summary-workflow-polish.spec.tsx",
  "src/tests/app.ui.networks.spec.tsx",
  "src/tests/app.ui.onboarding.spec.tsx",
  "src/tests/app.ui.settings-pricing.spec.tsx",
  "src/tests/app.ui.settings-samples.spec.tsx",
  "src/tests/app.ui.settings-wire-defaults.spec.tsx",
  "src/tests/app.ui.settings.spec.tsx",
  "src/tests/app.ui.theme.spec.tsx",
  "src/tests/app.ui.undo-redo-global.spec.tsx",
  "src/tests/app.ui.validation.spec.tsx",
  "src/tests/app.ui.wire-free-color-mode.spec.tsx",
  "src/tests/app.ui.workspace-shell-regression.spec.tsx"
];

const lane = process.argv[2] ?? "";
const userArgs = process.argv.slice(3);

function toPosixRelative(absolutePath) {
  const relativePath = path.relative(process.cwd(), absolutePath);
  return relativePath.split(path.sep).join(path.posix.sep);
}

function collectSpecFiles(rootDirectory) {
  if (!fs.existsSync(rootDirectory)) {
    return [];
  }

  const stack = [rootDirectory];
  const specFiles = [];

  while (stack.length > 0) {
    const currentDirectory = stack.pop();
    if (currentDirectory === undefined) {
      continue;
    }

    const entries = fs.readdirSync(currentDirectory, { withFileTypes: true });
    for (const entry of entries) {
      const absoluteEntryPath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        stack.push(absoluteEntryPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (!entry.name.endsWith(".spec.ts") && !entry.name.endsWith(".spec.tsx")) {
        continue;
      }

      specFiles.push(toPosixRelative(absoluteEntryPath));
    }
  }

  return specFiles.sort((left, right) => left.localeCompare(right));
}

function validateLaneContract() {
  const allSpecFiles = collectSpecFiles(path.resolve(process.cwd(), "src/tests"));
  const duplicateUiEntries = UI_LANE_TEST_FILES.filter((filePath, index) => UI_LANE_TEST_FILES.indexOf(filePath) !== index);
  if (duplicateUiEntries.length > 0) {
    console.error("[test:ci:segmentation] duplicate UI lane entries detected:");
    for (const duplicateEntry of duplicateUiEntries) {
      console.error(`- ${duplicateEntry}`);
    }
    return false;
  }

  const missingUiEntries = UI_LANE_TEST_FILES.filter((filePath) => !allSpecFiles.includes(filePath));
  if (missingUiEntries.length > 0) {
    console.error("[test:ci:segmentation] UI lane includes files that are missing:");
    for (const missingEntry of missingUiEntries) {
      console.error(`- ${missingEntry}`);
    }
    return false;
  }

  const uncoveredAppUiSpecs = allSpecFiles.filter(
    (filePath) => path.basename(filePath).startsWith("app.ui.") && !UI_LANE_TEST_FILES.includes(filePath)
  );
  if (uncoveredAppUiSpecs.length > 0) {
    console.error("[test:ci:segmentation] app.ui specs missing from explicit UI lane contract:");
    for (const uncoveredSpec of uncoveredAppUiSpecs) {
      console.error(`- ${uncoveredSpec}`);
    }
    return false;
  }

  const pwaSpecsInUiLane = UI_LANE_TEST_FILES.filter((filePath) => path.basename(filePath).startsWith("pwa."));
  if (pwaSpecsInUiLane.length > 0) {
    console.error("[test:ci:segmentation] pwa.* specs must stay in fast lane by default:");
    for (const invalidEntry of pwaSpecsInUiLane) {
      console.error(`- ${invalidEntry}`);
    }
    return false;
  }

  console.log("[test:ci:segmentation] explicit lane contract is valid.");
  console.log(`[test:ci:segmentation] ui lane files: ${UI_LANE_TEST_FILES.length}`);
  console.log(`[test:ci:segmentation] total spec files: ${allSpecFiles.length}`);
  return true;
}

function runNode(argumentsList) {
  const result = spawnSync(process.execPath, argumentsList, { stdio: "inherit" });
  if (result.error) {
    console.error("[test:ci:segmentation] failed to execute node process:", result.error.message);
    return 1;
  }
  return result.status ?? 1;
}

function runVitest(argumentsList) {
  const vitestEntrypoint = path.resolve(process.cwd(), "node_modules/vitest/vitest.mjs");
  return runNode([vitestEntrypoint, "run", ...argumentsList]);
}

function runUiSlowTop(argumentsList) {
  const reportSlowTestsScript = path.resolve(process.cwd(), "scripts/quality/report-slowest-tests.mjs");
  return runNode([reportSlowTestsScript, ...argumentsList, ...UI_LANE_TEST_FILES]);
}

if (!validateLaneContract()) {
  process.exit(1);
}

if (lane === "check") {
  process.exit(0);
}

if (lane === "ui") {
  process.exit(runVitest([...UI_LANE_TEST_FILES, ...userArgs]));
}

if (lane === "fast") {
  const excludeArgs = UI_LANE_TEST_FILES.map((filePath) => `--exclude=${filePath}`);
  process.exit(runVitest([...excludeArgs, ...userArgs]));
}

if (lane === "ui-slow-top") {
  process.exit(runUiSlowTop(userArgs));
}

console.error("[test:ci:segmentation] unknown lane. Use one of: check, fast, ui, ui-slow-top.");
process.exit(1);
