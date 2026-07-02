import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useWireEndpointDescriptions } from "../app/hooks/useWireEndpointDescriptions";
import type { CatalogItem, CatalogItemId, Connector, ConnectorId, Splice, SpliceId } from "../core/entities";

function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

describe("useWireEndpointDescriptions", () => {
  it("uses physical layout way labels for connector endpoints with C-prefixed fallback", () => {
    const catalogItem: CatalogItem = {
      id: asCatalogItemId("CAT-LABELED"),
      manufacturerReference: "LABELED-CONN",
      connectionCount: 2,
      connectorLayout: {
        version: 1,
        units: "grid",
        width: 2,
        height: 1,
        ways: [
          { cavityIndex: 1, x: 1, y: 1, shape: "round", label: "A10" },
          { cavityIndex: 2, x: 2, y: 1, shape: "round" }
        ]
      }
    };
    const connector: Connector = {
      id: asConnectorId("C1"),
      name: "Connector 1",
      technicalId: "C-1",
      cavityCount: 2,
      catalogItemId: catalogItem.id
    };

    const { result } = renderHook(() =>
      useWireEndpointDescriptions({
        connectorMap: new Map([[connector.id, connector]]),
        catalogItemMap: new Map([[catalogItem.id, catalogItem]]),
        spliceMap: new Map<SpliceId, Splice>()
      })
    );

    expect(result.current.describeWireEndpoint({ kind: "connectorCavity", connectorId: connector.id, cavityIndex: 1 })).toBe(
      "Connector 1 (C-1) / A10"
    );
    expect(result.current.describeWireEndpointId({ kind: "connectorCavity", connectorId: connector.id, cavityIndex: 1 })).toBe("C-1 / A10");
    expect(result.current.describeWireEndpointCsvParts({ kind: "connectorCavity", connectorId: connector.id, cavityIndex: 1 })).toEqual({
      endpointId: "C-1",
      pin: "A10"
    });
    expect(result.current.describeWireEndpoint({ kind: "connectorCavity", connectorId: connector.id, cavityIndex: 2 })).toBe(
      "Connector 1 (C-1) / C2"
    );
  });
});
