import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const TEST_ROOT = path.join(ROOT, "src", "tests");

/**
 * Temporary explicit timeout exceptions.
 * Keep this list empty by default. If a short-term exception is needed, add
 * an entry with technical rationale and retirement plan in the linked Logics docs.
 */
const ALLOWED_TIMEOUT_OVERRIDES = [];

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

function toPosixRelative(absolutePath) {
  return path.relative(ROOT, absolutePath).split(path.sep).join(path.posix.sep);
}

function getRootIdentifierName(expression) {
  if (ts.isIdentifier(expression)) {
    return expression.text;
  }

  if (ts.isPropertyAccessExpression(expression)) {
    return getRootIdentifierName(expression.expression);
  }

  if (ts.isCallExpression(expression)) {
    return getRootIdentifierName(expression.expression);
  }

  return null;
}

function getTestTitle(argument) {
  if (ts.isStringLiteralLike(argument)) {
    return argument.text;
  }

  if (ts.isNoSubstitutionTemplateLiteral(argument)) {
    return argument.text;
  }

  return "<dynamic title>";
}

function normalizeTimeoutValue(argument) {
  if (ts.isNumericLiteral(argument)) {
    return argument.text;
  }

  if (ts.isPrefixUnaryExpression(argument) && ts.isNumericLiteral(argument.operand)) {
    return `${argument.operator === ts.SyntaxKind.MinusToken ? "-" : ""}${argument.operand.text}`;
  }

  if (ts.isIdentifier(argument)) {
    return argument.text;
  }

  return argument.getText();
}

function findTimeoutOverrides(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  const content = readFileSync(absolutePath, "utf8");
  const sourceFile = ts.createSourceFile(absolutePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const violations = [];

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const rootIdentifier = getRootIdentifierName(node.expression);
      if ((rootIdentifier === "it" || rootIdentifier === "test") && node.arguments.length >= 3) {
        const titleArg = node.arguments[0];
        const timeoutArg = node.arguments[2];
        const title = titleArg === undefined ? "<unknown title>" : getTestTitle(titleArg);
        const timeout = normalizeTimeoutValue(timeoutArg);
        const key = `${relativePath}::${title}`;
        const allowlisted = ALLOWED_TIMEOUT_OVERRIDES.some((entry) => entry.key === key);

        if (!allowlisted) {
          const position = sourceFile.getLineAndCharacterOfPosition(timeoutArg.getStart(sourceFile));
          violations.push({
            file: relativePath,
            title,
            timeout,
            line: position.line + 1,
            column: position.character + 1
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

const uiSpecFiles = walk(TEST_ROOT, (absolutePath) => /app\.ui\..+\.spec\.tsx$/.test(absolutePath))
  .map(toPosixRelative)
  .sort((left, right) => left.localeCompare(right));

if (uiSpecFiles.length === 0) {
  console.error("[quality:ui-timeout-governance] no app.ui spec files found.");
  process.exit(1);
}

const violations = uiSpecFiles.flatMap((relativePath) => findTimeoutOverrides(relativePath));

if (violations.length > 0) {
  console.error("[quality:ui-timeout-governance] explicit per-test timeout overrides detected:");
  for (const violation of violations) {
    console.error(`- ${violation.file}:${violation.line}:${violation.column}`);
    console.error(`  test: ${violation.title}`);
    console.error(`  timeout: ${violation.timeout}`);
  }
  console.error(
    "[quality:ui-timeout-governance] add a temporary allowlist entry with rationale only if strictly required."
  );
  process.exit(1);
}

console.log("UI timeout governance quality gate passed.");
console.log(`Checked ${uiSpecFiles.length} app.ui spec files.`);
console.log(`Allowlisted timeout overrides: ${ALLOWED_TIMEOUT_OVERRIDES.length}`);
