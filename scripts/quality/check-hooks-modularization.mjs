import {
  evaluateHooksModularizationQualityGate,
  HOOKS_MODULARIZATION_MAX_LINES
} from "./hooks-modularization-gate-core.mjs";

const result = evaluateHooksModularizationQualityGate();

if (result.unauthorizedOversize.length > 0 || result.staleAllowlistEntries.length > 0) {
  console.error("Hooks modularization quality gate failed.");

  if (result.unauthorizedOversize.length > 0) {
    console.error(`Hooks above ${HOOKS_MODULARIZATION_MAX_LINES} lines without documented exception:`);
    for (const file of result.unauthorizedOversize) {
      console.error(`- ${file.relativePath}: ${file.lines} lines`);
    }
  }

  if (result.staleAllowlistEntries.length > 0) {
    console.error(
      "Stale oversize exception entries (hooks now under budget or moved/deleted, remove them from ALLOWED_HOOKS_OVERSIZE):"
    );
    for (const relativePath of result.staleAllowlistEntries) {
      console.error(`- ${relativePath}`);
    }
  }

  process.exit(1);
}

console.log("Hooks modularization quality gate passed.");
console.log(
  `Checked ${result.targetFiles.length} hook files under src/app/hooks (max ${HOOKS_MODULARIZATION_MAX_LINES} lines, documented exceptions allowed).`
);
if (result.oversizeEntries.length > 0) {
  console.log("Documented oversize exceptions:");
  for (const file of result.oversizeEntries) {
    const reason = result.allowedOversize[file.relativePath] ?? "No reason provided";
    console.log(`- ${file.relativePath}: ${file.lines} lines`);
    console.log(`  ${reason}`);
  }
}
