import { describe, expect, it } from "vitest";
import type { CatalogItemId, ConnectorId, NetworkId, NodeId, SegmentId, WireId } from "../core/entities";
import { appActions, appReducer, createSampleNetworkState } from "../store";
import {
  applyAiAgentAcceptedOperations,
  buildAiAgentImpactPreview,
  createAiAgentSessionSnapshot,
  rollbackAiAgentSession
} from "../app/lib/aiAgentApply";
import type { AiAgentOperationValidationResult } from "../app/lib/aiAgentOperationContract";

describe("AI agent apply", () => {
  it("builds an impact preview from validated operations before apply", () => {
    const validation: AiAgentOperationValidationResult = {
      accepted: [
        {
          type: "add_node",
          label: "AI proposed routing node",
          position: { x: 80, y: 90 }
        },
        {
          type: "batch_move_entities",
          moves: [
            {
              entityKind: "node",
              entityId: "N-MID-A",
              position: { x: 260, y: 180 }
            }
          ]
        },
        {
          type: "delete_entity",
          entityKind: "wire",
          entityId: "W-001",
          mode: "direct"
        }
      ],
      rejected: [{ status: "rejected", operationIndex: 3, operationType: "add_wire", message: "bad endpoint" }],
      unsupported: [{ status: "unsupported", operationIndex: 4, operationType: "assign_endpoint", message: "unsupported" }],
      warnings: []
    };

    expect(buildAiAgentImpactPreview(validation)).toEqual({
      acceptedCount: 3,
      rejectedCount: 1,
      unsupportedCount: 1,
      warningsCount: 0,
      addCount: 1,
      updateCount: 0,
      moveCount: 1,
      routeCount: 0,
      deleteCount: 1,
      byOperationType: {
        add_node: 1,
        batch_move_entities: 1,
        delete_entity: 1
      }
    });
  });

  it("creates and rolls back an explicit AI session snapshot", () => {
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
    const snapshot = createAiAgentSessionSnapshot(state, validation, "proposal 1", new Date("2026-05-30T08:00:00.000Z"));
    const applied = applyAiAgentAcceptedOperations(state, validation);

    expect(applied.nextState.nodes.byId["AI-NODE-001" as NodeId]).toBeDefined();
    expect(snapshot.id).toBe("ai-session-2026-05-30T08:00:00.000Z");
    expect(snapshot.createdAtIso).toBe("2026-05-30T08:00:00.000Z");
    expect(snapshot.label).toBe("proposal 1");
    expect(snapshot.impactPreview.acceptedCount).toBe(1);
    expect(snapshot.impactPreview.addCount).toBe(1);
    expect(rollbackAiAgentSession(snapshot)).toEqual(state);
    expect(rollbackAiAgentSession(snapshot)).not.toBe(snapshot.state);
  });

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

  it("applies route regeneration operations through reset route", () => {
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

    expect(result.nextState).not.toBe(state);
    expect(result.appliedCount).toBe(1);
    expect(result.skippedCount).toBe(0);
    expect(result.nextState.wires.byId["W-001" as WireId]?.routeSegmentIds.length).toBeGreaterThan(0);
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

  it("applies batch canvas moves in a single layout update", () => {
    const state = createSampleNetworkState();
    const validation: AiAgentOperationValidationResult = {
      accepted: [
        {
          type: "batch_move_entities",
          moves: [
            {
              entityKind: "connector",
              entityId: "C-SRC",
              position: { x: 160, y: 220 }
            },
            {
              entityKind: "node",
              entityId: "N-MID-A",
              position: { x: 260, y: 180 }
            }
          ]
        }
      ],
      rejected: [],
      unsupported: [],
      warnings: []
    };

    const result = applyAiAgentAcceptedOperations(state, validation);

    expect(result.appliedCount).toBe(1);
    expect(result.nextState.nodePositions["N-C-SRC" as NodeId]).toEqual({ x: 160, y: 220 });
    expect(result.nextState.nodePositions["N-MID-A" as NodeId]).toEqual({ x: 260, y: 180 });
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

  it("applies connector additions with linked nodes before dependent segments and wires", () => {
    const state = appReducer(createSampleNetworkState(), appActions.selectNetwork("network-charging-service-demo" as NetworkId));
    const validation: AiAgentOperationValidationResult = {
      accepted: [
        {
          type: "add_connector",
          id: "H-C-AI-SERVICE" as ConnectorId,
          nodeId: "H-N-AI-SERVICE" as NodeId,
          name: "AI Service Connector",
          technicalId: "H-CONN-AI-SERVICE",
          cavityCount: 2,
          position: { x: 80, y: 240 }
        },
        {
          type: "add_segment",
          nodeA: "H-N-AI-SERVICE" as NodeId,
          nodeB: "H-N-HVIL" as NodeId,
          lengthMm: 25
        },
        {
          type: "add_wire",
          name: "AI service to OBC",
          technicalId: "H-WIRE-AI-SERVICE-OBC",
          endpointA: { kind: "connectorCavity", connectorId: "H-C-AI-SERVICE" as ConnectorId, cavityIndex: 1 },
          endpointB: { kind: "connectorCavity", connectorId: "H-C-OBC" as ConnectorId, cavityIndex: 12 },
          sectionMm2: 0.5
        }
      ],
      rejected: [],
      unsupported: [],
      warnings: []
    };

    const result = applyAiAgentAcceptedOperations(state, validation);

    expect(result.appliedCount).toBe(3);
    expect(result.nextState.connectors.byId["H-C-AI-SERVICE" as ConnectorId]).toEqual(
      expect.objectContaining({
        name: "AI Service Connector",
        technicalId: "H-CONN-AI-SERVICE",
        cavityCount: 2
      })
    );
    expect(result.nextState.nodes.byId["H-N-AI-SERVICE" as NodeId]).toEqual({
      id: "H-N-AI-SERVICE",
      kind: "connector",
      connectorId: "H-C-AI-SERVICE"
    });
    expect(result.nextState.segments.byId["AI-SEG-001" as SegmentId]).toEqual({
      id: "AI-SEG-001",
      nodeA: "H-N-AI-SERVICE",
      nodeB: "H-N-HVIL",
      lengthMm: 25
    });
    expect(result.nextState.wires.byId["AI-WIRE-001" as WireId]).toEqual(
      expect.objectContaining({
        endpointA: { kind: "connectorCavity", connectorId: "H-C-AI-SERVICE", cavityIndex: 1 },
        endpointB: { kind: "connectorCavity", connectorId: "H-C-OBC", cavityIndex: 12 }
      })
    );
  });

  it("applies dedicated catalog material and route lock operations", () => {
    const state = createSampleNetworkState();
    const validation: AiAgentOperationValidationResult = {
      accepted: [
        {
          type: "create_catalog_item",
          id: "CAT-AI-FUSE" as CatalogItemId,
          manufacturerReference: "AI-FUSE-10A",
          name: "AI fuse 10A",
          connectionCount: 12
        },
        {
          type: "assign_catalog_item",
          entityKind: "connector",
          entityId: "C-SRC",
          catalogItemId: "CAT-AI-FUSE"
        },
        {
          type: "set_connector_terminal_material",
          connectorId: "C-SRC",
          cavityIndex: 4,
          material: {
            terminalReference: "TERM-AI",
            sealReference: "SEAL-AI"
          }
        },
        {
          type: "lock_wire_route",
          wireId: "W-001" as WireId,
          segmentIds: ["SEG-001" as SegmentId, "SEG-002" as SegmentId]
        }
      ],
      rejected: [],
      unsupported: [],
      warnings: []
    };

    const result = applyAiAgentAcceptedOperations(state, validation);

    expect(result.appliedCount).toBe(4);
    expect(result.nextState.catalogItems.byId["CAT-AI-FUSE" as CatalogItemId]).toEqual(
      expect.objectContaining({
        manufacturerReference: "AI-FUSE-10A",
        connectionCount: 12
      })
    );
    expect(result.nextState.connectors.byId["C-SRC" as ConnectorId]?.catalogItemId).toBe("CAT-AI-FUSE");
    expect(result.nextState.connectors.byId["C-SRC" as ConnectorId]?.terminalOverrides?.[4]).toEqual({
      terminalReference: "TERM-AI",
      sealReference: "SEAL-AI"
    });
    expect(result.nextState.wires.byId["W-001" as WireId]?.isRouteLocked).toBe(true);
    expect(result.nextState.wires.byId["W-001" as WireId]?.routeSegmentIds).toEqual(["SEG-001", "SEG-002"]);
  });

  it("applies dedicated connector layout updates to catalog items", () => {
    const state = createSampleNetworkState();
    const validation: AiAgentOperationValidationResult = {
      accepted: [
        {
          type: "update_catalog_connector_layout",
          catalogItemId: "CAT-SAMPLE-SRC-12W",
          connectorLayout: {
            version: 1,
            units: "grid",
            width: 6,
            height: 2,
            ways: Array.from({ length: 12 }, (_, index) => ({
              cavityIndex: index + 1,
              x: (index % 6) + 1,
              y: Math.floor(index / 6) + 1,
              shape: index === 1 ? "square" : "round"
            }))
          }
        }
      ],
      rejected: [],
      unsupported: [],
      warnings: []
    };

    const result = applyAiAgentAcceptedOperations(state, validation);

    expect(result.appliedCount).toBe(1);
    const connectorLayout = result.nextState.catalogItems.byId["CAT-SAMPLE-SRC-12W" as CatalogItemId]?.connectorLayout;
    expect(connectorLayout?.width).toBe(6);
    expect(connectorLayout?.height).toBe(2);
    expect(connectorLayout?.ways).toContainEqual(expect.objectContaining({ cavityIndex: 2, shape: "square" }));
  });
});
