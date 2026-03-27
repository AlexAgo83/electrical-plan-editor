import { describe, expect, it } from "vitest";
import {
  computeRecommendedWireSectionMm2,
  normalizeRecommendedWireSectionMm2,
  resolveWireMaterial
} from "../core/wireSizing";

describe("wire sizing helpers", () => {
  it("rounds calculated sections up to the next standard size", () => {
    expect(
      computeRecommendedWireSectionMm2({
        currentA: 10,
        material: "copper",
        voltageV: 12,
        lengthMm: 1_000
      })
    ).toBe(1);
  });

  it("returns null when required inputs are missing or invalid", () => {
    expect(
      computeRecommendedWireSectionMm2({
        currentA: undefined,
        material: "copper",
        voltageV: 12,
        lengthMm: 100
      })
    ).toBeNull();
    expect(
      computeRecommendedWireSectionMm2({
        currentA: 10,
        material: "copper",
        voltageV: 0,
        lengthMm: 100
      })
    ).toBeNull();
  });

  it("defaults missing material to copper and normalizes recommendations", () => {
    expect(resolveWireMaterial(undefined)).toBe("copper");
    expect(normalizeRecommendedWireSectionMm2(0.8)).toBe(1);
    expect(normalizeRecommendedWireSectionMm2(2.5)).toBe(2.5);
  });
});
