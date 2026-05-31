import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const HOOKS_MODULARIZATION_MAX_LINES = 500;

export const ALLOWED_HOOKS_OVERSIZE = {
  "src/app/hooks/controller/useAppControllerScreenContentSlices.tsx":
    "Screen-content slice assembly currently centralizes Home/Modeling/Analysis/NetworkScope/Settings/Validation slices on shared selection and handler wiring; split deferred until per-screen slice extractions are landed (see logics/architecture/app-controller-decomposition-plan.md).",
  "src/app/hooks/useWireHandlers.ts":
    "Wire handlers span create, edit, forced-route, occupancy, endpoint, and reference flows that share form/selection bindings; split deferred until wire-form fixtures and forced-route helpers are extracted.",
  "src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx":
    "Modeling + Analysis screen domain assembly shares selection, navigation, and entity-snapshot bindings; split deferred until per-screen domain extraction is complete.",
  "src/app/hooks/useUiPreferences.ts":
    "UI preferences hub centralizes locale, theme, table density, currency/tax, BOM column toggles, and validation labels; split planned alongside preference-slice extraction.",
  "src/app/hooks/useNetworkImportExport.ts":
    "Network import/export hook handles file parse, validation prompts, overwrite confirmation, and grouped/network-scoped flows on shared dialog wiring; split deferred until import dialog fixtures are extracted.",
  "src/app/hooks/useWorkspaceFileStorage.ts":
    "Workspace file storage hook coordinates browser picker, resume, autosave, conflict, and explicit save flows on shared linked-file status wiring; pure File System Access helpers are extracted, and further split is deferred until workspace-file state transitions have dedicated fixtures.",
  "src/app/hooks/useWorkspaceHandlers.ts":
    "Workspace handlers span network create/select/rename/delete and active-network handoff flows that share confirm-dialog and selection bindings; split deferred until workspace dialog fixtures are extracted.",
  "src/app/hooks/controller/useAppControllerNetworkSummaryPanelDomain.tsx":
    "Network-summary panel domain assembly centralizes canvas-display, callout, viewport, and BOM-preview bindings; split deferred until per-domain panel slices land (see logics/architecture/app-controller-decomposition-plan.md).",
  "src/app/hooks/controller/useAppControllerWorkspaceContentAssembly.tsx":
    "Workspace content assembly now wires AI Agent proposal, validation, apply, and rollback flows alongside screen content composition; split deferred until AI Agent controller extraction lands (see logics/architecture/app-controller-decomposition-plan.md).",
  "src/app/hooks/validation/buildValidationIssues.ts":
    "Validation issue builder consolidates rule evaluation across connectors, splices, segments, wires, catalog and harness contexts on a single iteration pass for determinism; split planned after rule-set extraction.",
  "src/app/hooks/useSpliceHandlers.ts":
    "Splice handlers span create, edit, port-mode, occupancy, and directional flows on shared form/selection bindings; split deferred until splice-form helpers are extracted.",
  "src/app/hooks/useCanvasInteractionHandlers.ts":
    "Canvas interaction handlers share pan, zoom, drag-select, and grouped-drag bindings; split deferred until canvas pointer helpers are factored.",
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
