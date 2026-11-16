import { describe, expect, it } from "vitest";
import { nextPlanRevision, previousPlanRevision } from "../core/planRevision";

describe("plan revision sequence", () => {
  it("starts at OR/00 and advances the letter and two-digit number together", () => {
    let revision = nextPlanRevision("");
    expect(revision).toBe("OR/00");
    for (let index = 1; index <= 26; index += 1) {
      revision = nextPlanRevision(revision!);
      expect(revision).toBe(`${String.fromCharCode(64 + index)}/${String(index).padStart(2, "0")}`);
    }
    expect(nextPlanRevision(revision!)).toBeNull();
  });

  it("steps back through every index to OR/00", () => {
    let revision = "Z/26";
    for (let index = 25; index >= 1; index -= 1) {
      revision = previousPlanRevision(revision)!;
      expect(revision).toBe(`${String.fromCharCode(64 + index)}/${String(index).padStart(2, "0")}`);
    }
    expect(previousPlanRevision(revision)).toBe("OR/00");
    expect(previousPlanRevision("OR/00")).toBeNull();
    expect(previousPlanRevision("")).toBeNull();
    expect(previousPlanRevision("   ")).toBeNull();
  });

  it.each(["A", "B02", "03", "draft 7", "A/02", "B/01", "OR/01", "A/1", "AA/27", "a/01", "A/001"])(
    "leaves free text or inconsistent indices unchanged: %s", (value) => {
      expect(nextPlanRevision(value)).toBeNull();
      expect(previousPlanRevision(value)).toBeNull();
    }
  );

  it("ignores surrounding whitespace like saved metadata", () => {
    expect(nextPlanRevision("   ")).toBe("OR/00");
    expect(nextPlanRevision(" OR/00 ")).toBe("A/01");
    expect(nextPlanRevision(" I/09 ")).toBe("J/10");
    expect(previousPlanRevision(" I/09 ")).toBe("H/08");
    expect(previousPlanRevision(" A/01 ")).toBe("OR/00");
  });
});
