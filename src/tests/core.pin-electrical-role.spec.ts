import { describe, expect, it } from "vitest";
import type { CatalogItem, Connector } from "../core/entities";
import {
  PIN_ELECTRICAL_ROLE_KINDS,
  getDefaultPinElectricalRole,
  normalizePinElectricalRole,
  normalizePinElectricalRolesMap,
  resolvePinElectricalRole,
  resolvePinElectricalRoleDescriptor
} from "../core/pinElectricalRole";

describe("normalizePinElectricalRole", () => {
  it("rejects null / undefined / non-object values", () => {
    expect(normalizePinElectricalRole(null)).toBeUndefined();
    expect(normalizePinElectricalRole(undefined)).toBeUndefined();
    expect(normalizePinElectricalRole(42)).toBeUndefined();
    expect(normalizePinElectricalRole("source")).toBeUndefined();
  });

  it("rejects unknown role values", () => {
    expect(normalizePinElectricalRole({ role: "ground" })).toBeUndefined();
    expect(normalizePinElectricalRole({})).toBeUndefined();
  });

  it("accepts every valid role kind", () => {
    for (const kind of PIN_ELECTRICAL_ROLE_KINDS) {
      expect(normalizePinElectricalRole({ role: kind })).toEqual({ role: kind });
    }
  });

  it("drops negative or non-finite currentA but keeps the rest", () => {
    expect(normalizePinElectricalRole({ role: "source", currentA: -5 })).toEqual({ role: "source" });
    expect(normalizePinElectricalRole({ role: "source", currentA: Number.NaN })).toEqual({ role: "source" });
    expect(normalizePinElectricalRole({ role: "source", currentA: Infinity })).toEqual({ role: "source" });
  });

  it("keeps a positive currentA, trimmed label and notes", () => {
    expect(
      normalizePinElectricalRole({ role: "consumer", currentA: 12.5, label: "  BAT+ ", notes: "supply" })
    ).toEqual({ role: "consumer", currentA: 12.5, label: "BAT+", notes: "supply" });
  });

  it("drops empty strings", () => {
    expect(normalizePinElectricalRole({ role: "source", label: "   ", notes: "" })).toEqual({
      role: "source"
    });
  });
});

describe("normalizePinElectricalRolesMap", () => {
  it("returns empty result for non-object input", () => {
    expect(normalizePinElectricalRolesMap(undefined).value).toEqual({});
    expect(normalizePinElectricalRolesMap(null).value).toEqual({});
  });

  it("drops out-of-range cavities and reports warnings", () => {
    const { value, warnings } = normalizePinElectricalRolesMap(
      {
        "1": { role: "source", currentA: 2.5 },
        "0": { role: "source" },
        "-3": { role: "source" },
        "abc": { role: "source" },
        "99": { role: "source" }
      },
      { cavityCount: 4, context: "connector C1" }
    );
    expect(value).toEqual({ 1: { role: "source", currentA: 2.5 } });
    expect(warnings.length).toBeGreaterThanOrEqual(3);
    expect(warnings.every((w) => w.startsWith("connector C1: "))).toBe(true);
  });

  it("drops entries whose payload is invalid but keeps the rest", () => {
    const { value, warnings } = normalizePinElectricalRolesMap({
      "1": { role: "source" },
      "2": { role: "invalid" }
    });
    expect(value).toEqual({ 1: { role: "source" } });
    expect(warnings.length).toBe(1);
  });
});

describe("resolvePinElectricalRole", () => {
  const connector: Connector = {
    id: "C1" as Connector["id"],
    name: "C1",
    technicalId: "C-1",
    cavityCount: 4,
    pinElectricalRoles: {
      1: { role: "consumer", currentA: 40, label: "BAT+" },
      3: { role: "source" }
    }
  };
  const catalogItem: CatalogItem = {
    id: "cat-1" as CatalogItem["id"],
    manufacturerReference: "ECU-XYZ",
    connectionCount: 4,
    connectorDefaults: {
      pinElectricalRoles: {
        1: { role: "consumer", currentA: 10, label: "DEFAULT" },
        2: { role: "passive" },
        3: { role: "source", currentA: 2.5, label: "LS_OUT" }
      }
    }
  };

  it("returns the override merged with field-level fallback to the catalog", () => {
    const resolved = resolvePinElectricalRole(connector, catalogItem, 3);
    expect(resolved).toEqual({ role: "source", currentA: 2.5, label: "LS_OUT" });
  });

  it("override wins for declared fields", () => {
    const resolved = resolvePinElectricalRole(connector, catalogItem, 1);
    expect(resolved).toEqual({ role: "consumer", currentA: 40, label: "BAT+" });
  });

  it("falls back to the catalog default when the connector has no override", () => {
    const resolved = resolvePinElectricalRole(connector, catalogItem, 2);
    expect(resolved).toEqual({ role: "passive" });
  });

  it("falls back to passive when both are absent", () => {
    const resolved = resolvePinElectricalRole(connector, catalogItem, 4);
    expect(resolved).toEqual(getDefaultPinElectricalRole());
  });

  it("descriptor exposes the source of the resolved value", () => {
    expect(resolvePinElectricalRoleDescriptor(connector, catalogItem, 1).source).toBe("override");
    expect(resolvePinElectricalRoleDescriptor(connector, catalogItem, 2).source).toBe("catalog");
    expect(resolvePinElectricalRoleDescriptor(connector, catalogItem, 4).source).toBe("default");
  });
});
