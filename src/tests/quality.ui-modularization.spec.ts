import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

interface EvaluateUiModularizationOptions {
  root: string;
  requiredUiModules: string[];
  forbiddenLegacyFiles: string[];
  lockedLineBudgets: Record<string, number>;
  allowedOversize: Record<string, string>;
}

interface LockedBudgetViolation {
  relativePath: string;
  maxLines: number;
  lines: number | null;
  reason: "missing" | "exceeded";
}

interface UiModularizationGateResult {
  lockedBudgetViolations: LockedBudgetViolation[];
}

async function evaluateUiModularizationQualityGate(options: EvaluateUiModularizationOptions): Promise<UiModularizationGateResult> {
  const moduleUrl = pathToFileURL(path.resolve(process.cwd(), "scripts/quality/ui-modularization-gate-core.mjs")).href;
  const module = (await import(moduleUrl)) as {
    evaluateUiModularizationQualityGate: (value: EvaluateUiModularizationOptions) => UiModularizationGateResult;
  };
  return module.evaluateUiModularizationQualityGate(options);
}

function writeLines(filePath: string, lines: number): void {
  const content = Array.from({ length: lines }, (_, index) => `line ${index + 1}`).join("\n");
  writeFileSync(filePath, content, "utf8");
}

describe("quality gate - ui modularization locked line budgets", () => {
  const tempRoots: string[] = [];

  afterEach(() => {
    for (const tempRoot of tempRoots) {
      rmSync(tempRoot, { recursive: true, force: true });
    }
    tempRoots.length = 0;
  });

  it("fails when a locked budget file exceeds its max lines", async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "ui-modularization-"));
    tempRoots.push(root);

    mkdirSync(path.join(root, "src", "app"), { recursive: true });
    mkdirSync(path.join(root, "src", "app", "components"), { recursive: true });
    mkdirSync(path.join(root, "src", "app", "styles"), { recursive: true });
    mkdirSync(path.join(root, "src", "tests"), { recursive: true });

    writeLines(path.join(root, "src", "app", "AppController.tsx"), 1101);
    writeLines(path.join(root, "src", "app", "components", "NetworkSummaryPanel.tsx"), 1000);
    writeLines(path.join(root, "src", "app", "App.tsx"), 10);
    writeLines(path.join(root, "src", "app", "styles.css"), 10);

    const result = await evaluateUiModularizationQualityGate({
      root,
      requiredUiModules: [],
      forbiddenLegacyFiles: [],
      lockedLineBudgets: {
        "src/app/AppController.tsx": 1100,
        "src/app/components/NetworkSummaryPanel.tsx": 1000
      },
      allowedOversize: {}
    });

    expect(result.lockedBudgetViolations).toEqual([
      {
        relativePath: "src/app/AppController.tsx",
        maxLines: 1100,
        lines: 1101,
        reason: "exceeded"
      }
    ]);
  });

  it("passes when locked budget files stay within limits", async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "ui-modularization-"));
    tempRoots.push(root);

    mkdirSync(path.join(root, "src", "app"), { recursive: true });
    mkdirSync(path.join(root, "src", "app", "components"), { recursive: true });
    mkdirSync(path.join(root, "src", "app", "styles"), { recursive: true });
    mkdirSync(path.join(root, "src", "tests"), { recursive: true });

    writeLines(path.join(root, "src", "app", "AppController.tsx"), 1100);
    writeLines(path.join(root, "src", "app", "components", "NetworkSummaryPanel.tsx"), 980);
    writeLines(path.join(root, "src", "app", "App.tsx"), 10);
    writeLines(path.join(root, "src", "app", "styles.css"), 10);

    const result = await evaluateUiModularizationQualityGate({
      root,
      requiredUiModules: [],
      forbiddenLegacyFiles: [],
      lockedLineBudgets: {
        "src/app/AppController.tsx": 1100,
        "src/app/components/NetworkSummaryPanel.tsx": 1000
      },
      allowedOversize: {}
    });

    expect(result.lockedBudgetViolations).toEqual([]);
  });
});
