import { describe, expect, it } from "vitest";
import type { Network } from "../core/entities";
import {
  DEFAULT_COPPER_AMPACITY_A_BY_SECTION_MM2,
  normalizeAmpacityOverrides,
  resolveAmpacityA,
  resolveCopperAmpacityA
} from "../core/wireAmpacity";

const aluminumRatio = 0.0175 / 0.0282;

function makeNetwork(overrides?: Record<number, number>): Pick<Network, "ampacityOverrides"> {
  return { ampacityOverrides: overrides };
}

describe("DEFAULT_COPPER_AMPACITY_A_BY_SECTION_MM2", () => {
  it("ships values for every standard section", () => {
    expect(DEFAULT_COPPER_AMPACITY_A_BY_SECTION_MM2[0.5]).toBe(11);
    expect(DEFAULT_COPPER_AMPACITY_A_BY_SECTION_MM2[1]).toBe(19);
    expect(DEFAULT_COPPER_AMPACITY_A_BY_SECTION_MM2[2.5]).toBe(32);
    expect(DEFAULT_COPPER_AMPACITY_A_BY_SECTION_MM2[120]).toBe(344);
  });
});

describe("resolveAmpacityA", () => {
  it("returns the shipped copper value when no override is set", () => {
    expect(resolveAmpacityA(0.5, "copper", undefined)).toBe(11);
    expect(resolveAmpacityA(2.5, "copper", makeNetwork())).toBe(32);
  });

  it("derives aluminum from copper via resistivity ratio rounded to one decimal", () => {
    const expected = Math.round(11 * aluminumRatio * 10) / 10;
    expect(resolveAmpacityA(0.5, "aluminum", undefined)).toBe(expected);
  });

  it("honors a positive override on copper", () => {
    expect(resolveAmpacityA(2.5, "copper", makeNetwork({ 2.5: 28 }))).toBe(28);
  });

  it("override is cleared when removed", () => {
    expect(resolveAmpacityA(2.5, "copper", makeNetwork({}))).toBe(32);
  });

  it("aluminum derivation re-runs on the resolved copper value (override applied)", () => {
    const expected = Math.round(28 * aluminumRatio * 10) / 10;
    expect(resolveAmpacityA(2.5, "aluminum", makeNetwork({ 2.5: 28 }))).toBe(expected);
  });

  it("returns undefined for a section outside the standard set", () => {
    expect(resolveAmpacityA(3, "copper", undefined)).toBeUndefined();
  });

  it("ignores a non-positive override", () => {
    expect(resolveCopperAmpacityA(2.5, makeNetwork({ 2.5: -1 }))).toBe(32);
    expect(resolveCopperAmpacityA(2.5, makeNetwork({ 2.5: 0 }))).toBe(32);
  });
});

describe("normalizeAmpacityOverrides", () => {
  it("drops non-standard sections and reports warnings", () => {
    const { value, warnings } = normalizeAmpacityOverrides({
      "2.5": 28,
      "3": 35,
      "abc": 12
    });
    expect(value).toEqual({ 2.5: 28 });
    expect(warnings.length).toBe(2);
  });

  it("drops negative and non-finite values", () => {
    const { value, warnings } = normalizeAmpacityOverrides({
      "2.5": -5,
      "4": Number.NaN,
      "6": 50
    });
    expect(value).toEqual({ 6: 50 });
    expect(warnings.length).toBe(2);
  });

  it("returns empty for non-object input", () => {
    expect(normalizeAmpacityOverrides(null).value).toEqual({});
    expect(normalizeAmpacityOverrides(undefined).value).toEqual({});
    expect(normalizeAmpacityOverrides("string").value).toEqual({});
  });
});
