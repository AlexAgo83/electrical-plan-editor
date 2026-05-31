import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const HOOKS_MODULARIZATION_MAX_LINES = 500;

export const ALLOWED_HOOKS_OVERSIZE = {};

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
