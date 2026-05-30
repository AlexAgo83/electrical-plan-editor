import { describe, expect, it } from "vitest";
import type { CatalogItemId, ConnectorId, NetworkId, NodeId, SegmentId, WireId } from "../core/entities";
import { appActions, appReducer, createSampleNetworkState } from "../store";
import { applyAiAgentAcceptedOperations } from "../app/lib/aiAgentApply";
import type { AiAgentOperationValidationResult } from "../app/lib/aiAgentOperationContract";

describe("AI agent apply", () => {
  it("applies accepted add_node operations without mutating the input state", () => {
    const state = createSampleNetworkState();
    const validation: AiAgentOperationValidationResult = {
      accepted: [
        {
          type: "add_node",
          label: "AI proposed routing node",
          position: { x: 80, y: 90 }
        }
      ],
      rejected: [],
      unsupported: [],
      warnings: []
    };

    const result = applyAiAgentAcceptedOperations(state, validation);

    expect(result.appliedCount).toBe(1);
    expect(result.skippedCount).toBe(0);
    expect(state.nodes.byId["AI-NODE-001" as NodeId]).toBeUndefined();
    expect(result.nextState.nodes.byId["AI-NODE-001" as NodeId]).toEqual({
      id: "AI-NODE-001",
      kind: "intermediate",
      label: "AI proposed routing node"
    });
    expect(result.nextState.nodePositions["AI-NODE-001" as NodeId]).toEqual({ x: 80, y: 90 });
  });

  it("skips accepted operations that are not mapped to an app mutation yet", () => {
    const state = createSampleNetworkState();
    const validation: AiAgentOperationValidationResult = {
      accepted: [
        {
          type: "regenerate_route",
          wireIds: ["W-001" as WireId]
        }
      ],
      rejected: [],
      unsupported: [],
      warnings: []
    };

    const result = applyAiAgentAcceptedOperations(state, validation);

    expect(result.nextState).toBe(state);
    expect(result.appliedCount).toBe(0);
    expect(result.skippedCount).toBe(1);
  });

  it("applies move_entity operations to the selected canvas node position", () => {
    const state = createSampleNetworkState();
    const validation: AiAgentOperationValidationResult = {
      accepted: [
        {
          type: "move_entity",
          entityKind: "connector",
          entityId: "C-SRC",
          position: { x: 160, y: 220 }
        }
      ],
      rejected: [],
      unsupported: [],
      warnings: []
    };

    const result = applyAiAgentAcceptedOperations(state, validation);

    expect(result.appliedCount).toBe(1);
    expect(result.nextState.nodePositions["N-C-SRC" as NodeId]).toEqual({ x: 160, y: 220 });
  });

  it("applies relative placement operations to the target canvas node position", () => {
    const state = createSampleNetworkState();
    const validation: AiAgentOperationValidationResult = {
      accepted: [
        {
          type: "place_entity_relative_to_entity",
          entityKind: "connector",
          entityId: "C-SRC",
          referenceEntityKind: "connector",
          referenceEntityId: "C-DST-1",
          placement: "leftOf",
          gap: 80,
          position: { x: 120, y: 180 }
        }
      ],
      rejected: [],
      unsupported: [],
      warnings: []
    };

    const result = applyAiAgentAcceptedOperations(state, validation);

    expect(result.appliedCount).toBe(1);
    expect(result.nextState.nodePositions["N-C-SRC" as NodeId]).toEqual({ x: 120, y: 180 });
  });

  it("applies update_entity operations to safe scalar fields", () => {
    const state = createSampleNetworkState();
    const validation: AiAgentOperationValidationResult = {
      accepted: [
        {
          type: "update_entity",
          entityKind: "connector",
          entityId: "C-SRC",
          fields: {
            name: "test"
          }
        }
      ],
      rejected: [],
      unsupported: [],
      warnings: []
    };

    const result = applyAiAgentAcceptedOperations(state, validation);

    expect(result.appliedCount).toBe(1);
    expect(result.skippedCount).toBe(0);
    expect(state.connectors.byId["C-SRC" as ConnectorId]?.name).toBe("Power Source Connector");
    expect(result.nextState.connectors.byId["C-SRC" as ConnectorId]?.name).toBe("test");
  });

  it("applies catalog update operations and propagates linked connector capacity", () => {
    const state = createSampleNetworkState();
    const validation: AiAgentOperationValidationResult = {
      accepted: [
        {
          type: "update_entity",
          entityKind: "catalog",
          entityId: "CAT-SAMPLE-SRC-12W",
          fields: {
            connectionCount: 24
          }
        }
      ],
      rejected: [],
      unsupported: [],
      warnings: []
    };

    const result = applyAiAgentAcceptedOperations(state, validation);

    expect(result.appliedCount).toBe(1);
    expect(result.skippedCount).toBe(0);
    expect(result.nextState.catalogItems.byId["CAT-SAMPLE-SRC-12W" as CatalogItemId]?.connectionCount).toBe(24);
    expect(result.nextState.connectors.byId["C-SRC" as ConnectorId]?.cavityCount).toBe(24);
  });

  it("applies add_wire operations through the normal wire save path", () => {
    const state = appReducer(createSampleNetworkState(), appActions.selectNetwork("network-charging-service-demo" as NetworkId));
    const validation: AiAgentOperationValidationResult = {
      accepted: [
        {
          type: "add_wire",
          name: "Inlet to OBC pin bridge",
          technicalId: "H-WIRE-INLET-OBC-P7-P12",
          endpointA: { kind: "connectorCavity", connectorId: "H-C-INLET" as ConnectorId, cavityIndex: 7 },
          endpointB: { kind: "connectorCavity", connectorId: "H-C-OBC" as ConnectorId, cavityIndex: 12 },
          sectionMm2: 0.5
        }
      ],
      rejected: [],
      unsupported: [],
      warnings: []
    };

    const result = applyAiAgentAcceptedOperations(state, validation);

    expect(result.appliedCount).toBe(1);
    expect(result.skippedCount).toBe(0);
    expect(result.nextState.wires.byId["AI-WIRE-001" as WireId]).toEqual(
      expect.objectContaining({
        name: "Inlet to OBC pin bridge",
        technicalId: "H-WIRE-INLET-OBC-P7-P12",
        endpointA: { kind: "connectorCavity", connectorId: "H-C-INLET", cavityIndex: 7 },
        endpointB: { kind: "connectorCavity", connectorId: "H-C-OBC", cavityIndex: 12 },
        routeSegmentIds: ["H-SEG-001", "H-SEG-002"]
      })
    );
  });

  it("applies wire update operations through the normal wire save path", () => {
    const state = createSampleNetworkState();
    const validation: AiAgentOperationValidationResult = {
      accepted: [
        {
          type: "update_entity",
          entityKind: "wire",
          entityId: "W-001",
          fields: {
            name: "Renamed feed",
            sectionMm2: 1.5,
            endpointA: { kind: "connectorCavity", connectorId: "C-SRC", cavityIndex: 11 }
          }
        }
      ],
      rejected: [],
      unsupported: [],
      warnings: []
    };

    const result = applyAiAgentAcceptedOperations(state, validation);

    expect(result.appliedCount).toBe(1);
    expect(result.nextState.wires.byId["W-001" as WireId]).toEqual(
      expect.objectContaining({
        name: "Renamed feed",
        sectionMm2: 1.5,
        endpointA: { kind: "connectorCavity", connectorId: "C-SRC", cavityIndex: 11 }
      })
    );
  });

  it("applies accepted wire deletions", () => {
    const state = createSampleNetworkState();
    const validation: AiAgentOperationValidationResult = {
      accepted: [
        {
          type: "delete_entity",
          entityKind: "wire",
          entityId: "W-001"
        }
      ],
      rejected: [],
      unsupported: [],
      warnings: []
    };

    const result = applyAiAgentAcceptedOperations(state, validation);

    expect(result.appliedCount).toBe(1);
    expect(result.nextState.wires.byId["W-001" as WireId]).toBeUndefined();
  });

  it("applies AI node IDs and segment additions in order", () => {
    const state = createSampleNetworkState();
    const validation: AiAgentOperationValidationResult = {
      accepted: [
        {
          type: "add_node",
          id: "AI-NODE-900" as NodeId,
          label: "AI route point",
          position: { x: 320, y: 180 }
        },
        {
          type: "add_segment",
          nodeA: "N-C-SRC" as NodeId,
          nodeB: "AI-NODE-900" as NodeId,
          lengthMm: 40
        }
      ],
      rejected: [],
      unsupported: [],
      warnings: []
    };

    const result = applyAiAgentAcceptedOperations(state, validation);

    expect(result.appliedCount).toBe(2);
    expect(result.nextState.nodes.byId["AI-NODE-900" as NodeId]).toEqual({
      id: "AI-NODE-900",
      kind: "intermediate",
      label: "AI route point"
    });
    expect(result.nextState.segments.byId["AI-SEG-001" as SegmentId]).toEqual({
      id: "AI-SEG-001",
      nodeA: "N-C-SRC",
      nodeB: "AI-NODE-900",
      lengthMm: 40
    });
  });
});
