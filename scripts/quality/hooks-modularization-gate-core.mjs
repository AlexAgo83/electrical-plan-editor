import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const HOOKS_MODULARIZATION_MAX_LINES = 500;

export const ALLOWED_HOOKS_OVERSIZE = {
  "src/app/hooks/useNetworkImportExport.ts":
    "Orchestrates the full import/export lifecycle (JSON, CSV, SVG, BOM, wire-export preview) across multiple adapters and async rendering steps. Splitting would scatter tightly coupled async state across hooks with no clean seam.",
  "src/app/hooks/controller/useAppControllerWorkspaceContentAssembly.tsx":
    "Top-level workspace content assembly hook that wires together all screen-domain sub-assemblies (home, network-summary, catalog, AI agent, modeling analysis, aux). The coupling between sub-assemblies makes extraction non-trivial without introducing prop-drilling or a context layer.",
  "src/app/hooks/useConnectorHandlers.ts":
    "Single source of truth for the connector form lifecycle (reset/clear/startEdit/submit/delete + cavity reserve/release + terminal/seal/fuse/pin-role serialization). The handlers share store/dispatch wiring and form-mode side effects; splitting one concern out would duplicate that wiring without a clean seam.",
  "src/app/hooks/useCatalogHandlers.ts":
    "Single source of truth for the catalog form lifecycle (reset/clear/startEdit/copy/submit/delete plus connector defaults, accessories, layout, fuse-box, and pin-role serialization). Splitting would duplicate tightly coupled form wiring."
};

function normalizeRelativePath(relativePath) {
  return relativePath.split(path.sep).join("/");
}

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

export function evaluateHooksModularizationQualityGate({
  root = process.cwd(),
  maxLines = HOOKS_MODULARIZATION_MAX_LINES,
  allowedOversize = ALLOWED_HOOKS_OVERSIZE
} = {}) {
  const hooksDirectory = path.join(root, "src", "app", "hooks");
  if (!existsSync(hooksDirectory)) {
    return {
      targetFiles: [],
      oversizeEntries: [],
      unauthorizedOversize: [],
      allowedOversize,
      maxLines,
      staleAllowlistEntries: Object.keys(allowedOversize)
    };
  }

  const targetFiles = walk(hooksDirectory, (filePath) => /\.(ts|tsx)$/.test(filePath) && !/\.spec\.[tj]sx?$/.test(filePath))
    .map((filePath) => normalizeRelativePath(path.relative(root, filePath)));

  const oversizeEntries = targetFiles
    .map((relativePath) => ({
      relativePath,
      lines: lineCount(path.join(root, relativePath))
    }))
    .filter(({ lines }) => lines > maxLines)
    .sort((left, right) => right.lines - left.lines);

  const unauthorizedOversize = oversizeEntries.filter(({ relativePath }) => !(relativePath in allowedOversize));

  const oversizePaths = new Set(oversizeEntries.map((entry) => entry.relativePath));
  const staleAllowlistEntries = Object.keys(allowedOversize).filter((relativePath) => !oversizePaths.has(relativePath));

  return {
    targetFiles,
    oversizeEntries,
    unauthorizedOversize,
    allowedOversize,
    maxLines,
    staleAllowlistEntries
  };
}
