import { describe, expect, it } from "vitest";

import {
  detectNetworkEntityPrefix,
  findHiddenPrefixCollisions,
  formatEntityIdForDisplay,
  hasEntityPrefix,
  normalizeNetworkEntityPrefix,
  stripEntityPrefix,
} from "../core/networkEntityPrefix";

describe("normalizeNetworkEntityPrefix", () => {
  it("trims and keeps valid prefixes", () => {
    expect(normalizeNetworkEntityPrefix("  LAT-  ")).toBe("LAT-");
    expect(normalizeNetworkEntityPrefix("PRI_")).toBe("PRI_");
  });

  it("drops empty values", () => {
    expect(normalizeNetworkEntityPrefix("   ")).toBeUndefined();
    expect(normalizeNetworkEntityPrefix("")).toBeUndefined();
    expect(normalizeNetworkEntityPrefix(42)).toBeUndefined();
  });

  it("rejects unsupported characters", () => {
    expect(normalizeNetworkEntityPrefix("LAT /")).toBeUndefined();
    expect(normalizeNetworkEntityPrefix("a.b")).toBeUndefined();
  });
});

describe("detectNetworkEntityPrefix", () => {
  it("detects an obvious shared prefix", () => {
    expect(detectNetworkEntityPrefix(["LAT-N-01", "LAT-N-02", "LAT-C1"])).toBe("LAT-");
    expect(detectNetworkEntityPrefix(["PRI-W-001", "PRI-S-002"])).toBe("PRI-");
  });

  it("leaves generic type-token IDs blank", () => {
    expect(detectNetworkEntityPrefix(["N-01", "N-02"])).toBeUndefined();
    expect(detectNetworkEntityPrefix(["C-1", "C-2", "C-3"])).toBeUndefined();
    expect(detectNetworkEntityPrefix(["SEG-1", "SEG-2"])).toBeUndefined();
  });

  it("returns undefined for ambiguous or single-id sets", () => {
    expect(detectNetworkEntityPrefix(["LAT-N-01"])).toBeUndefined();
    expect(detectNetworkEntityPrefix(["LAT-N-01", "PRI-N-02"])).toBeUndefined();
    expect(detectNetworkEntityPrefix(["N01", "N02"])).toBeUndefined();
  });
});

describe("prefix display helpers", () => {
  it("detects and strips prefixes case-insensitively", () => {
    expect(hasEntityPrefix("LAT-N-01", "lat-")).toBe(true);
    expect(stripEntityPrefix("LAT-N-01", "LAT-")).toBe("N-01");
    expect(stripEntityPrefix("N-01", "LAT-")).toBe("N-01");
  });

  it("formats IDs honoring the show/hide setting", () => {
    expect(formatEntityIdForDisplay("LAT-N-01", "LAT-", true)).toBe("LAT-N-01");
    expect(formatEntityIdForDisplay("LAT-N-01", "LAT-", false)).toBe("N-01");
    expect(formatEntityIdForDisplay("N-01", undefined, false)).toBe("N-01");
  });
});

describe("findHiddenPrefixCollisions", () => {
  it("flags bare IDs that collide across networks when prefixes hide", () => {
    const collisions = findHiddenPrefixCollisions([
      { prefix: "LAT-", ids: ["LAT-N-01", "LAT-C1"] },
      { prefix: "PRI-", ids: ["PRI-N-01"] },
    ]);
    expect(collisions.has("N-01")).toBe(true);
    expect(collisions.get("N-01")).toEqual(["LAT-", "PRI-"]);
    expect(collisions.has("C1")).toBe(false);
  });

  it("stays silent for a single network", () => {
    const collisions = findHiddenPrefixCollisions([{ prefix: "LAT-", ids: ["LAT-N-01"] }]);
    expect(collisions.size).toBe(0);
  });
});
