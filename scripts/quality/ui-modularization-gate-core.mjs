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
  "src/tests/app.ui.navigation-canvas.spec.tsx":
    "Broad navigation/canvas integration regression matrix retained as a single flow to preserve cross-screen state assertions; split follow-up should separate pure canvas interaction cases.",
  "src/tests/app.ui.catalog.spec.tsx":
    "Catalog integration regression matrix covers creation, editing, navigation, layout, pricing, and reference behavior in one stateful UI flow; split when catalog workflows are decomposed.",
  "src/app/styles/confirm-dialog.css":
    "Shared confirmation and delete-impact dialog styling keeps modal variants co-located while the dialog surface is consolidated; extraction should happen with a design-token pass."
};

function normalizeRelativePath(relativePath) {
  return relativePath.split(path.sep).join("/");
}

export const LOCKED_LINE_BUDGETS = {
  "src/app/AppController.tsx": 1100,
  "src/app/components/NetworkSummaryPanel.tsx": 1020
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
      normalizeRelativePath(path.relative(root, filePath))
    ),
    ...walk(path.join(root, "src", "tests"), (filePath) => /app\.ui\..+\.spec\.tsx$/.test(filePath)).map((filePath) =>
      normalizeRelativePath(path.relative(root, filePath))
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
