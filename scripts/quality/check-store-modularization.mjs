import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const STORE_ROOT = path.join(ROOT, "src", "store");
const MAX_LINES = 500;

function walkTsFiles(directory) {
  const entries = readdirSync(directory);
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...walkTsFiles(fullPath));
      continue;
    }

    if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }

  return files;
}

function lineCount(filePath) {
  const content = readFileSync(filePath, "utf8");
  if (content.length === 0) {
    return 0;
  }

  return content.split(/\r?\n/).length;
}

const requiredStoreModules = [
  "src/store/reducer.ts",
  "src/store/reducer/shared.ts",
  "src/store/reducer/connectorReducer.ts",
  "src/store/reducer/spliceReducer.ts",
  "src/store/reducer/nodeReducer.ts",
  "src/store/reducer/segmentReducer.ts",
  "src/store/reducer/wireReducer.ts",
  "src/store/reducer/uiReducer.ts",
  "src/store/reducer/helpers/occupancy.ts",
  "src/store/reducer/helpers/wireTransitions.ts"
];

const requiredStoreTests = [
  "src/tests/store.reducer.entities.spec.ts",
  "src/tests/store.reducer.wires.spec.ts",
  "src/tests/store.reducer.helpers.spec.ts",
  "src/tests/store.create-store.spec.ts"
];

const forbiddenLegacyFiles = ["src/tests/store.reducer.spec.ts"];

const missingModules = requiredStoreModules.filter((relativePath) => !existsSync(path.join(ROOT, relativePath)));
const missingTests = requiredStoreTests.filter((relativePath) => !existsSync(path.join(ROOT, relativePath)));
const presentLegacyFiles = forbiddenLegacyFiles.filter((relativePath) => existsSync(path.join(ROOT, relativePath)));

const oversizeFiles = walkTsFiles(STORE_ROOT)
  .map((filePath) => ({
    filePath,
    lines: lineCount(filePath)
  }))
  .filter(({ lines }) => lines > MAX_LINES)
  .sort((left, right) => right.lines - left.lines);

if (missingModules.length > 0 || missingTests.length > 0 || presentLegacyFiles.length > 0 || oversizeFiles.length > 0) {
  console.error("Store modularization quality gate failed.");

  if (missingModules.length > 0) {
    console.error("Missing required store modules:");
    for (const relativePath of missingModules) {
      console.error(`- ${relativePath}`);
    }
  }

  if (missingTests.length > 0) {
    console.error("Missing required store tests:");
    for (const relativePath of missingTests) {
      console.error(`- ${relativePath}`);
    }
  }

  if (presentLegacyFiles.length > 0) {
    console.error("Forbidden legacy store files still present:");
    for (const relativePath of presentLegacyFiles) {
      console.error(`- ${relativePath}`);
    }
  }

  if (oversizeFiles.length > 0) {
    console.error(`Store files above ${MAX_LINES} lines:`);
    for (const file of oversizeFiles) {
      const relativePath = path.relative(ROOT, file.filePath);
      console.error(`- ${relativePath}: ${file.lines} lines`);
    }
  }

  process.exit(1);
}

console.log("Store modularization quality gate passed.");
console.log(`Checked ${walkTsFiles(STORE_ROOT).length} files under src/store (max ${MAX_LINES} lines per file).`);
