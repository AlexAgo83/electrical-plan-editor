import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const UI_MODULARIZATION_MAX_LINES = 500;

export const REQUIRED_UI_MODULES = [
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

export const FORBIDDEN_LEGACY_FILES = ["src/tests/app.ui.spec.tsx"];

export const ALLOWED_OVERSIZE = {
  "src/tests/app.ui.network-summary-workflow-polish.spec.tsx":
    "High-scope integration regression suite for network-summary workflows; split planned once fixture/setup extraction is complete.",
  "src/app/styles/tables.css":
    "Shared table primitives are intentionally centralized; modular split planned after table-token and density refactor lands.",
  "src/app/styles/validation-settings/validation-and-settings-layout.css":
    "Validation/settings layout shares tightly coupled responsive rules; split deferred to avoid regressions during mobile pass."
};

export const LOCKED_LINE_BUDGETS = {
  "src/app/AppController.tsx": 1100,
  "src/app/components/NetworkSummaryPanel.tsx": 1000
};

export function lineCount(filePath) {
  const content = readFileSync(filePath, "utf8");
  if (content.length === 0) {
    return 0;
  }
  const lines = content.split(/\r?\n/);
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    return lines.length - 1;
  }
  return lines.length;
}

export function walk(directory, predicate) {
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

export function evaluateUiModularizationQualityGate({
  root = process.cwd(),
  maxLines = UI_MODULARIZATION_MAX_LINES,
  requiredUiModules = REQUIRED_UI_MODULES,
  forbiddenLegacyFiles = FORBIDDEN_LEGACY_FILES,
  allowedOversize = ALLOWED_OVERSIZE,
  lockedLineBudgets = LOCKED_LINE_BUDGETS
} = {}) {
  const targetFiles = [
    "src/app/App.tsx",
    "src/app/styles.css",
    ...walk(path.join(root, "src", "app", "styles"), (filePath) => filePath.endsWith(".css")).map((filePath) =>
      path.relative(root, filePath)
    ),
    ...walk(path.join(root, "src", "tests"), (filePath) => /app\.ui\..+\.spec\.tsx$/.test(filePath)).map((filePath) =>
      path.relative(root, filePath)
    )
  ];

  const missingModules = requiredUiModules.filter((relativePath) => !existsSync(path.join(root, relativePath)));
  const presentLegacyFiles = forbiddenLegacyFiles.filter((relativePath) => existsSync(path.join(root, relativePath)));

  const oversizeEntries = targetFiles
    .map((relativePath) => ({
      relativePath,
      lines: lineCount(path.join(root, relativePath))
    }))
    .filter(({ lines }) => lines > maxLines)
    .sort((left, right) => right.lines - left.lines);

  const unauthorizedOversize = oversizeEntries.filter(({ relativePath }) => !(relativePath in allowedOversize));

  const lockedBudgetViolations = Object.entries(lockedLineBudgets)
    .map(([relativePath, limit]) => {
      const absolutePath = path.join(root, relativePath);
      if (!existsSync(absolutePath)) {
        return {
          relativePath,
          maxLines: limit,
          lines: null,
          reason: "missing"
        };
      }

      const lines = lineCount(absolutePath);
      if (lines <= limit) {
        return null;
      }
      return {
        relativePath,
        maxLines: limit,
        lines,
        reason: "exceeded"
      };
    })
    .filter((entry) => entry !== null);

  return {
    targetFiles,
    missingModules,
    presentLegacyFiles,
    oversizeEntries,
    unauthorizedOversize,
    allowedOversize,
    maxLines,
    lockedBudgetViolations
  };
}
