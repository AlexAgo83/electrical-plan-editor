import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useEntityListModel } from "../app/hooks/useEntityListModel";
import type { AppState } from "../store";
import type { CatalogItem, CatalogItemId, Connector, ConnectorId, Splice, SpliceId, Wire, WireId } from "../core/entities";

function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asWireId(value: string): WireId {
  return value as WireId;
}

describe("useEntityListModel connector synthesis local way labels", () => {
  it("resolves physical layout labels for the selected connector local way with C-prefixed fallback", () => {
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
    const makeWire = (id: string, cavityIndex: number): Wire => ({
      id: asWireId(id),
      name: id,
      technicalId: id,
      endpointA: { kind: "connectorCavity", connectorId: connector.id, cavityIndex },
      endpointB: { kind: "splicePort", spliceId: "S1" as SpliceId, portIndex: 1 },
      primaryColorId: null,
      secondaryColorId: null,
      routeSegmentIds: [],
      lengthMm: 100,
      sectionMm2: 0.5,
      isRouteLocked: false
    });

    const { result } = renderHook(() =>
      useEntityListModel({
        state: {} as AppState,
        connectors: [],
        splices: [],
        nodes: [],
        segments: [],
        wires: [makeWire("W1", 1), makeWire("W2", 2)],
        connectorMap: new Map([[connector.id, connector]]),
        catalogItemMap: new Map([[catalogItem.id, catalogItem]]),
        spliceMap: new Map<SpliceId, Splice>(),
        selectedConnector: connector,
        selectedSplice: null,
        describeWireEndpoint: () => "remote"
      })
    );

    const localLabels = result.current.sortedConnectorSynthesisRows.map((row) => row.localEndpointLabel);
    expect(localLabels).toEqual(["A10", "C2"]);
  });
});
