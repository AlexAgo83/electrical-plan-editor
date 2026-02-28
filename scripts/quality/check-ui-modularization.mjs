import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MAX_LINES = 500;

function lineCount(filePath) {
  const content = readFileSync(filePath, "utf8");
  if (content.length === 0) {
    return 0;
  }

  return content.split(/\r?\n/).length;
}

function walk(directory, predicate) {
  const entries = readdirSync(directory);
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...walk(fullPath, predicate));
      continue;
    }

    if (predicate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

const requiredUiModules = [
  "src/app/components/InspectorContextPanel.tsx",
  "src/app/components/NetworkSummaryPanel.tsx",
  "src/app/components/WorkspaceNavigation.tsx",
  "src/app/hooks/useKeyboardShortcuts.ts",
  "src/app/hooks/useUiPreferences.ts",
  "src/app/hooks/useWorkspaceNavigation.ts",
  "src/app/styles/base.css",
  "src/app/styles/workspace.css",
  "src/app/styles/forms.css",
  "src/app/styles/tables.css",
  "src/app/styles/canvas.css",
  "src/app/styles/validation-settings.css",
  "src/tests/app.ui.navigation-canvas.spec.tsx",
  "src/tests/app.ui.validation.spec.tsx",
  "src/tests/app.ui.settings.spec.tsx",
  "src/tests/app.ui.list-ergonomics.spec.tsx",
  "src/tests/helpers/app-ui-test-utils.tsx"
];

const forbiddenLegacyFiles = ["src/tests/app.ui.spec.tsx"];

const allowedOversize = {
  "src/tests/app.ui.network-summary-workflow-polish.spec.tsx":
    "High-scope integration regression suite for network-summary workflows; split planned once fixture/setup extraction is complete.",
  "src/app/styles/tables.css":
    "Shared table primitives are intentionally centralized; modular split planned after table-token and density refactor lands.",
  "src/app/styles/validation-settings/validation-and-settings-layout.css":
    "Validation/settings layout shares tightly coupled responsive rules; split deferred to avoid regressions during mobile pass."
};

const targetFiles = [
  "src/app/App.tsx",
  "src/app/styles.css",
  ...walk(path.join(ROOT, "src", "app", "styles"), (filePath) => filePath.endsWith(".css")).map((filePath) =>
    path.relative(ROOT, filePath)
  ),
  ...walk(path.join(ROOT, "src", "tests"), (filePath) => /app\.ui\..+\.spec\.tsx$/.test(filePath)).map((filePath) =>
    path.relative(ROOT, filePath)
  )
];

const missingModules = requiredUiModules.filter((relativePath) => !existsSync(path.join(ROOT, relativePath)));
const presentLegacyFiles = forbiddenLegacyFiles.filter((relativePath) => existsSync(path.join(ROOT, relativePath)));

const oversizeEntries = targetFiles
  .map((relativePath) => ({
    relativePath,
    lines: lineCount(path.join(ROOT, relativePath))
  }))
  .filter(({ lines }) => lines > MAX_LINES)
  .sort((left, right) => right.lines - left.lines);

const unauthorizedOversize = oversizeEntries.filter(({ relativePath }) => !(relativePath in allowedOversize));

if (missingModules.length > 0 || presentLegacyFiles.length > 0 || unauthorizedOversize.length > 0) {
  console.error("UI modularization quality gate failed.");

  if (missingModules.length > 0) {
    console.error("Missing required UI modules:");
    for (const relativePath of missingModules) {
      console.error(`- ${relativePath}`);
    }
  }

  if (presentLegacyFiles.length > 0) {
    console.error("Forbidden legacy UI files still present:");
    for (const relativePath of presentLegacyFiles) {
      console.error(`- ${relativePath}`);
    }
  }

  if (unauthorizedOversize.length > 0) {
    console.error(`Files above ${MAX_LINES} lines without approved exception:`);
    for (const file of unauthorizedOversize) {
      console.error(`- ${file.relativePath}: ${file.lines} lines`);
    }
  }

  process.exit(1);
}

console.log("UI modularization quality gate passed.");
console.log(`Checked ${targetFiles.length} scoped UI files (max ${MAX_LINES} lines, documented exceptions allowed).`);
if (oversizeEntries.length > 0) {
  console.log("Documented oversize exceptions:");
  for (const file of oversizeEntries) {
    const reason = allowedOversize[file.relativePath] ?? "No reason provided";
    console.log(`- ${file.relativePath}: ${file.lines} lines`);
    console.log(`  ${reason}`);
  }
}
