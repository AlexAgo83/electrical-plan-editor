import {
  evaluateUiModularizationQualityGate,
  UI_MODULARIZATION_MAX_LINES
} from "./ui-modularization-gate-core.mjs";

const result = evaluateUiModularizationQualityGate();

if (
  result.missingModules.length > 0 ||
  result.presentLegacyFiles.length > 0 ||
  result.unauthorizedOversize.length > 0 ||
  result.lockedBudgetViolations.length > 0
) {
  console.error("UI modularization quality gate failed.");

  if (result.missingModules.length > 0) {
    console.error("Missing required UI modules:");
    for (const relativePath of result.missingModules) {
      console.error(`- ${relativePath}`);
    }
  }

  if (result.presentLegacyFiles.length > 0) {
    console.error("Forbidden legacy UI files still present:");
    for (const relativePath of result.presentLegacyFiles) {
      console.error(`- ${relativePath}`);
    }
  }

  if (result.unauthorizedOversize.length > 0) {
    console.error(`Files above ${UI_MODULARIZATION_MAX_LINES} lines without approved exception:`);
    for (const file of result.unauthorizedOversize) {
      console.error(`- ${file.relativePath}: ${file.lines} lines`);
    }
  }

  if (result.lockedBudgetViolations.length > 0) {
    console.error("Locked UI file budgets violated:");
    for (const violation of result.lockedBudgetViolations) {
      if (violation.reason === "missing") {
        console.error(`- ${violation.relativePath}: file missing (expected max ${violation.maxLines} lines).`);
        continue;
      }
      console.error(`- ${violation.relativePath}: ${violation.lines} lines (max ${violation.maxLines}).`);
    }
  }

  process.exit(1);
}

console.log("UI modularization quality gate passed.");
console.log(
  `Checked ${result.targetFiles.length} scoped UI files (max ${UI_MODULARIZATION_MAX_LINES} lines, documented exceptions allowed).`
);
if (result.oversizeEntries.length > 0) {
  console.log("Documented oversize exceptions:");
  for (const file of result.oversizeEntries) {
    const reason = result.allowedOversize[file.relativePath] ?? "No reason provided";
    console.log(`- ${file.relativePath}: ${file.lines} lines`);
    console.log(`  ${reason}`);
  }
}
