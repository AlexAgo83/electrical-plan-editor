import { spawnSync } from "node:child_process";
import path from "node:path";

const vitestEntrypoint = path.resolve(process.cwd(), "node_modules/vitest/vitest.mjs");
const releaseGateSpecs = [
  "src/tests/pin-role-release-gate.spec.ts",
  "src/tests/app.validation.electrical-dimensioning.spec.ts",
  "src/tests/portability.network-file.spec.ts",
  "src/tests/app.ui.navigation-canvas.spec.tsx",
  "src/tests/ai-agent-context.spec.ts",
  "src/tests/app.ui.onboarding.spec.tsx",
  "src/tests/app.ui.mass-edit-pin-roles.spec.tsx",
  "src/tests/app.ui.multi-network-functional-analysis.spec.tsx"
];

const result = spawnSync(process.execPath, [vitestEntrypoint, "run", ...releaseGateSpecs], {
  stdio: "inherit"
});

if (result.error) {
  console.error("[quality:pin-role-release-gate] failed to execute Vitest:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
