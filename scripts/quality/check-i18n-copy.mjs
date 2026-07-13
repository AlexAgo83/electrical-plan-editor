import { readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import ts from "typescript";

const appRoot = resolve("src/app");
const enCatalog = JSON.parse(readFileSync(resolve(appRoot, "i18n/en.json"), "utf8"));
const frCatalog = JSON.parse(readFileSync(resolve(appRoot, "i18n/fr.json"), "utf8"));
const technicalValues = new Set([
  "CSV", "SVG", "PNG", "PDF", "XLSX", "JSON", "OpenAI", "Gemini", "mm", "mm²", "EUR (€)", "USD ($)",
  "GBP (£)", "CAD (C$)", "CHF", ".xlsx", "Ctrl/Cmd + Z", "Ctrl/Cmd + Shift + Z", "Ctrl/Cmd + Y", "Ctrl/Cmd + S",
  "Alt + 1..7", "Alt + Shift + 1..5", "Alt + F", "Alt + J / Alt + K", "&rarr;"
]);
const productCopyProperties = new Set([
  "label", "title", "message", "description", "ariaLabel", "ariaDescription", "placeholder", "emptyMessage"
]);
const translatableAttributes = new Set(["aria-label", "aria-description", "placeholder", "title"]);

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name) ? [path] : [];
  });
}

function flatten(value, prefix = "", result = new Map()) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix.length === 0 ? key : `${prefix}.${key}`;
    if (typeof child === "string") result.set(path, child);
    else if (child !== null && typeof child === "object") flatten(child, path, result);
  }
  return result;
}

function placeholders(value) {
  return [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map((match) => match[1]).sort();
}

function isProductCopy(value) {
  const text = value.trim();
  if (text.length < 2 || !/[A-Za-zÀ-ÿ]/.test(text) || technicalValues.has(text)) return false;
  if (/^(?:https?:\/\/|[A-Z]{2,}[-_]|[a-z]+-\d|#[\da-f]{6}|[\w-]+,[\w,]+$)/i.test(text)) return false;
  if (/^(?:NET|LAT|BAT|KL|LS)[+\w.-]*$/.test(text) || /^(?:[A-Z]+-)+[A-Z-]+$/.test(text)) return false;
  return true;
}

function findHardcodedCopy(file) {
  const sourceText = readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const findings = [];
  const report = (node, value) => {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
    findings.push(`${relative(process.cwd(), file)}:${line + 1}: ${JSON.stringify(value.trim())}`);
  };
  const isLabelsArrayValue = (node) => ts.isArrayLiteralExpression(node.parent) &&
    ts.isPropertyAssignment(node.parent.parent) && node.parent.parent.name.getText(source).replace(/["']/g, "") === "labels";

  function visit(node) {
    if (ts.isJsxText(node) && isProductCopy(node.text)) {
      report(node, node.text);
    } else if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer) &&
      translatableAttributes.has(node.name.getText(source)) && isProductCopy(node.initializer.text)) {
      report(node, node.initializer.text);
    } else if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      ts.isPropertyAssignment(node.parent) && !file.endsWith("/lib/aiAgentProposal.ts") &&
      productCopyProperties.has(node.parent.name.getText(source).replace(/["']/g, "")) && isProductCopy(node.text)) {
      report(node, node.text);
    } else if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      isLabelsArrayValue(node) && isProductCopy(node.text)) {
      report(node, node.text);
    } else if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      ts.isConditionalExpression(node.parent) && (node.parent.whenTrue === node || node.parent.whenFalse === node) &&
      ts.isJsxExpression(node.parent.parent) && !ts.isJsxAttribute(node.parent.parent.parent) && isProductCopy(node.text)) {
      report(node, node.text);
    } else if (ts.isTemplateExpression(node) && ts.isJsxExpression(node.parent)) {
      const owner = node.parent.parent;
      const visible = !ts.isJsxAttribute(owner) || translatableAttributes.has(owner.name.getText(source));
      const staticText = node.head.text + node.templateSpans.map((span) => span.literal.text).join(" ");
      if (visible && isProductCopy(staticText)) report(node, staticText);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return findings;
}

const errors = [];
const en = flatten(enCatalog);
const fr = flatten(frCatalog);
for (const key of en.keys()) if (!fr.has(key)) errors.push(`Missing French key: ${key}`);
for (const key of fr.keys()) if (!en.has(key)) errors.push(`Missing English key: ${key}`);
for (const [key, value] of en) {
  if (fr.has(key) && placeholders(value).join("|") !== placeholders(fr.get(key)).join("|")) {
    errors.push(`Placeholder mismatch: ${key}`);
  }
}
if ("legacy" in enCatalog || "legacy" in frCatalog) errors.push("Legacy catalog namespace is forbidden.");

const requestedFiles = process.argv.slice(2).map((file) => resolve(file));
const files = requestedFiles.length > 0 ? requestedFiles : sourceFiles(appRoot);
for (const file of files) {
  const sourceText = readFileSync(file, "utf8");
  if (/translateTextValue|useAppLocaleDomTranslation|LEGACY_KEY_BY_EN_TEXT/.test(sourceText)) {
    errors.push(`${relative(process.cwd(), file)}: legacy i18n compatibility API is forbidden.`);
  }
  errors.push(...findHardcodedCopy(file).map((finding) => `Hardcoded product copy: ${finding}`));

  const source = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function visitCalls(node) {
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(source);
      const keyArgument = callee === "translate" ? node.arguments[1] : ["t", "translateCurrent"].includes(callee) ? node.arguments[0] : undefined;
      if (keyArgument && ts.isStringLiteral(keyArgument) && !en.has(keyArgument.text)) {
        const { line } = source.getLineAndCharacterOfPosition(keyArgument.getStart(source));
        errors.push(`${relative(process.cwd(), file)}:${line + 1}: unknown i18n key ${keyArgument.text}`);
      }
    }
    ts.forEachChild(node, visitCalls);
  }
  visitCalls(source);
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`i18n contract valid: ${en.size} keys, ${files.length} source files checked.`);
