import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const UI_CHUNK_SIZE = 8;

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

const allSpecFiles = collectSpecFiles(path.resolve(process.cwd(), "src/tests"));
const uiLaneTestFiles = allSpecFiles.filter((filePath) => path.basename(filePath).startsWith("app.ui."));

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

function runVitestInChunks(argumentsList, testFiles, chunkSize) {
  for (let index = 0; index < testFiles.length; index += chunkSize) {
    const chunk = testFiles.slice(index, index + chunkSize);
    const chunkNumber = Math.floor(index / chunkSize) + 1;
    const chunkCount = Math.ceil(testFiles.length / chunkSize);
    console.log(`[test:ci:segmentation] running UI chunk ${chunkNumber}/${chunkCount} (${chunk.length} files)`);
    const status = runVitest([...argumentsList, ...chunk]);
    if (status !== 0) {
      return status;
    }
  }
  return 0;
}

function runUiSlowTop(argumentsList) {
  const reportSlowTestsScript = path.resolve(process.cwd(), "scripts/quality/report-slowest-tests.mjs");
  return runNode([reportSlowTestsScript, ...argumentsList, ...uiLaneTestFiles]);
}

if (lane === "check") {
  console.log(`[test:ci:segmentation] ui lane files: ${uiLaneTestFiles.length}`);
  console.log(`[test:ci:segmentation] total spec files: ${allSpecFiles.length}`);
  process.exit(0);
}

if (lane === "ui") {
  process.exit(runVitestInChunks(userArgs, uiLaneTestFiles, UI_CHUNK_SIZE));
}

if (lane === "fast") {
  const excludeArgs = uiLaneTestFiles.map((filePath) => `--exclude=${filePath}`);
  process.exit(runVitest([...userArgs, ...excludeArgs]));
}

if (lane === "ui-slow-top") {
  process.exit(runUiSlowTop(userArgs));
}

console.error("[test:ci:segmentation] unknown lane. Use one of: check, fast, ui, ui-slow-top.");
process.exit(1);
