import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useNodeDescriptions } from "../app/hooks/useNodeDescriptions";
import type { ConnectorId, NetworkNode, NodeId, SpliceId } from "../core/entities";

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asNodeId(value: string): NodeId {
  return value as NodeId;
}

function asSpliceId(value: string): SpliceId {
  return value as SpliceId;
}

describe("useNodeDescriptions", () => {
  it("uses backshell helper node business references in descriptive labels", () => {
    const node: NetworkNode = {
      id: asNodeId("AR-N21"),
      kind: "connectorBackshellHelper",
      connectorId: asConnectorId("C-BS"),
      label: "AR-N21"
    };
    const connectorMap = new Map([
      [
        asConnectorId("C-BS"),
        {
          id: asConnectorId("C-BS"),
          name: "Connector rear",
          technicalId: "AR-CT2G",
          cavityCount: 2
        }
      ]
    ]);

    const { result } = renderHook(() => useNodeDescriptions([node], connectorMap, new Map<SpliceId, never>()));

    expect(result.current.describeNode(node)).toBe("Backshell helper (AR-N21)");
    expect(result.current.nodeLabelById.get(node.id)).toBe("Backshell helper (AR-N21)");
  });

  it("keeps connector and splice descriptions unchanged", () => {
    const connectorNode: NetworkNode = {
      id: asNodeId("N-C"),
      kind: "connector",
      connectorId: asConnectorId("C-1")
    };
    const spliceNode: NetworkNode = {
      id: asNodeId("N-S"),
      kind: "splice",
      spliceId: asSpliceId("S-1")
    };
    const connectorMap = new Map([
      [
        asConnectorId("C-1"),
        {
          id: asConnectorId("C-1"),
          name: "Connector 1",
          technicalId: "C-1",
          cavityCount: 2
        }
      ]
    ]);
    const spliceMap = new Map([
      [
        asSpliceId("S-1"),
        {
          id: asSpliceId("S-1"),
          name: "Splice 1",
          technicalId: "S-1",
          portCount: 2
        }
      ]
    ]);

    const { result } = renderHook(() => useNodeDescriptions([connectorNode, spliceNode], connectorMap, spliceMap));

    expect(result.current.describeNode(connectorNode)).toBe("Connector 1 (C-1)");
    expect(result.current.describeNode(spliceNode)).toBe("Splice 1 (S-1)");
  });
});
