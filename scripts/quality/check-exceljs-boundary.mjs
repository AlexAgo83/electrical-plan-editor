import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_ROOT = path.join(ROOT, "src");
const ALLOWED_EXCELJS_FILE = "src/app/lib/tabularExport.ts";
const IGNORED_DIRECTORIES = new Set([".git", "coverage", "dist", "node_modules", "test-results"]);
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]);

function walkSourceFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry)) {
        files.push(...walkSourceFiles(fullPath));
      }
      continue;
    }

    if (SOURCE_EXTENSIONS.has(path.extname(entry))) {
      files.push(fullPath);
    }
  }

  return files;
}

function relativePath(filePath) {
  return path.relative(ROOT, filePath).replaceAll(path.sep, "/");
}

function findExceljsReferences(filePath) {
  const content = readFileSync(filePath, "utf8");
  const references = [];
  const patterns = [
    { kind: "dynamic import", regex: /import\s*\(\s*["']exceljs["']\s*\)/g },
    { kind: "static import", regex: /import\s+(?!type\b)[^;\n]*\s+from\s+["']exceljs["']/g },
    { kind: "type import", regex: /import\s+type\s+[^;\n]*\s+from\s+["']exceljs["']/g },
    { kind: "require", regex: /require\s*\(\s*["']exceljs["']\s*\)/g }
  ];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern.regex)) {
      references.push({
        kind: pattern.kind,
        index: match.index ?? 0
      });
    }
  }

  return references;
}

const violations = [];
const allowedReferences = [];

for (const filePath of walkSourceFiles(SOURCE_ROOT)) {
  const relative = relativePath(filePath);
  const references = findExceljsReferences(filePath);
  if (references.length === 0) {
    continue;
  }

  if (relative !== ALLOWED_EXCELJS_FILE) {
    violations.push({
      relative,
      reason: "exceljs must stay isolated behind the tabular export adapter"
    });
    continue;
  }

  for (const reference of references) {
    if (reference.kind === "static import" || reference.kind === "require") {
      violations.push({
        relative,
        reason: `runtime ${reference.kind} is forbidden; use a dynamic import inside the XLSX export path`
      });
      continue;
    }
    allowedReferences.push({ relative, kind: reference.kind });
  }
}

if (violations.length > 0) {
  console.error("ExcelJS dependency boundary failed.");
  for (const violation of violations) {
    console.error(`- ${violation.relative}: ${violation.reason}`);
  }
  process.exit(1);
}

console.log("ExcelJS dependency boundary passed.");
console.log(`Allowed file: ${ALLOWED_EXCELJS_FILE}`);
for (const reference of allowedReferences) {
  console.log(`- ${reference.relative}: ${reference.kind}`);
}
