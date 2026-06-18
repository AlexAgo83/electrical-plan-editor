import { describe, expect, it } from "vitest";
import {
  buildGroupedFileNameBase,
  GROUPED_FILE_NAME_MAX_NAME_LENGTH,
  normalizeFileNamePart
} from "../app/lib/exportFileName";

describe("normalizeFileNamePart", () => {
  it("lowercases, replaces unsafe characters and trims hyphens", () => {
    expect(normalizeFileNamePart("Harness A/B #1")).toBe("harness-a-b-1");
    expect(normalizeFileNamePart("  --Power Net--  ")).toBe("power-net");
  });

  it("returns null for empty or non-string input", () => {
    expect(normalizeFileNamePart("   ")).toBeNull();
    expect(normalizeFileNamePart(undefined)).toBeNull();
    expect(normalizeFileNamePart(null)).toBeNull();
  });
});

describe("buildGroupedFileNameBase", () => {
  it("includes a single sanitized network name", () => {
    expect(buildGroupedFileNameBase("bom", ["Power Net"])).toBe("bom-power-net");
  });

  it("includes every selected name in selection order", () => {
    expect(buildGroupedFileNameBase("wire-list", ["Alpha", "Beta", "Gamma"])).toBe(
      "wire-list-alpha-beta-gamma"
    );
  });

  it("skips blank/undefined names without breaking ordering", () => {
    expect(buildGroupedFileNameBase("bom", ["Alpha", "  ", undefined, "Beta"])).toBe("bom-alpha-beta");
  });

  it("falls back to the prefix when no names resolve", () => {
    expect(buildGroupedFileNameBase("bom", [null, "  "])).toBe("bom");
    expect(buildGroupedFileNameBase("bom", [])).toBe("bom");
  });

  it("truncates deterministically with a documented suffix when names are too long", () => {
    const names = Array.from({ length: 30 }, (_, index) => `network-${index}`);
    const result = buildGroupedFileNameBase("bom", names, GROUPED_FILE_NAME_MAX_NAME_LENGTH);
    expect(result.startsWith("bom-network-0-network-1-")).toBe(true);
    expect(result).toMatch(/-plus-\d+-more$/);
    // The joined name segment respects the configured cap (suffix excluded).
    const nameSegment = result.replace(/^bom-/, "").replace(/-plus-\d+-more$/, "");
    expect(nameSegment.length).toBeLessThanOrEqual(GROUPED_FILE_NAME_MAX_NAME_LENGTH);
    // Deterministic across calls.
    expect(buildGroupedFileNameBase("bom", names)).toBe(buildGroupedFileNameBase("bom", names));
  });
});
