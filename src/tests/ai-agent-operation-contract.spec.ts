import { describe, expect, it } from "vitest";
import type { ConnectorId, NetworkId, NodeId, WireId } from "../core/entities";
import { appActions, appReducer, createSampleNetworkState } from "../store";
import { validateAiAgentOperations, type AiAgentOperationPermissions } from "../app/lib/aiAgentOperationContract";
import { createNodePositionMap } from "../app/lib/layout/generation";

const DEFAULT_PERMISSIONS: AiAgentOperationPermissions = {
  add: true,
  move: true,
  update: true,
  route: true,
  delete: false
};

describe("AI agent operation contract", () => {
  it("accepts valid V1 operations behind enabled permissions", () => {
    const state = createSampleNetworkState();
    const result = validateAiAgentOperations({
      state,
      scope: "activeNetwork",
      selection: null,
      permissions: DEFAULT_PERMISSIONS,
      payload: {
        schemaVersion: 1,
        operations: [
          {
            type: "add_node",
            label: "AI midpoint",
            position: { x: 120, y: 240 }
          },
          {
            type: "regenerate_route",
            wireIds: ["W-001" as WireId]
          }
        ]
      }
    });

    expect(result.accepted.map((operation) => operation.type)).toEqual(["add_node", "regenerate_route"]);
    expect(result.rejected).toHaveLength(0);
    expect(result.unsupported).toHaveLength(0);
  });

  it("rejects malformed operations and disabled permission groups", () => {
    const state = createSampleNetworkState();
    const result = validateAiAgentOperations({
      state,
      scope: "activeNetwork",
      selection: null,
      permissions: {
        ...DEFAULT_PERMISSIONS,
        move: false
      },
      payload: {
        schemaVersion: 1,
        operations: [
          {
            type: "move_entity",
            entityKind: "node",
            entityId: "N-MID-A",
            position: { x: 10, y: 20 }
          },
          {
            type: "add_segment",
            nodeA: "N-MID-A",
            nodeB: "missing-node",
            lengthMm: 42
          }
        ]
      }
    });

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toEqual([
      expect.objectContaining({ operationIndex: 0, message: "move permission is disabled." }),
      expect.objectContaining({ operationIndex: 1, message: "Operation references unknown modeling entities." })
    ]);
  });

  it("separates unsupported operations from rejected operations", () => {
    const state = createSampleNetworkState();
    const result = validateAiAgentOperations({
      state,
      scope: "activeNetwork",
      selection: null,
      permissions: DEFAULT_PERMISSIONS,
      payload: {
        schemaVersion: 1,
        operations: [
          {
            type: "delete_entity",
            entityKind: "wire",
            entityId: "W-001"
          },
          {
            type: "unknown_operation"
          }
        ]
      }
    });

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(0);
    expect(result.unsupported.map((issue) => issue.operationType)).toEqual(["delete_entity", "unknown_operation"]);
  });

  it("rejects operations outside the current selection scope", () => {
    const state = createSampleNetworkState();
    const result = validateAiAgentOperations({
      state,
      scope: "currentSelection",
      selection: {
        kind: "connector",
        id: "C-SRC" as ConnectorId
      },
      permissions: DEFAULT_PERMISSIONS,
      payload: {
        schemaVersion: 1,
        operations: [
          {
            type: "update_entity",
            entityKind: "connector",
            entityId: "C-DST-1",
            fields: {
              name: "Outside scope"
            }
          },
          {
            type: "move_entity",
            entityKind: "node",
            entityId: "N-MID-A" as NodeId,
            position: { x: 10, y: 20 }
          }
        ]
      }
    });

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toEqual([
      expect.objectContaining({ operationIndex: 0, message: "Operation is outside the current selection scope." }),
      expect.objectContaining({ operationIndex: 1, message: "Operation is outside the current selection scope." })
    ]);
  });

  it("accepts update operations that reference entities by technical ID", () => {
    const state = createSampleNetworkState();
    const result = validateAiAgentOperations({
      state,
      scope: "activeNetwork",
      selection: {
        kind: "connector",
        id: "C-SRC" as ConnectorId
      },
      permissions: DEFAULT_PERMISSIONS,
      payload: {
        schemaVersion: 1,
        operations: [
          {
            type: "update_entity",
            entityKind: "connector",
            entityId: "CONN-SRC-01",
            fields: {
              name: "test"
            }
          }
        ]
      }
    });

    expect(result.rejected).toHaveLength(0);
    expect(result.accepted).toEqual([
      expect.objectContaining({
        type: "update_entity",
        entityKind: "connector",
        entityId: "C-SRC",
        fields: {
          name: "test"
        }
      })
    ]);
  });

  it("accepts relative moves that reference connector technical IDs", () => {
    const baseState = createSampleNetworkState();
    const state = appReducer(baseState, appActions.select({ kind: "connector", id: "C-SRC" as ConnectorId }));
    const generatedPositions = createNodePositionMap(
      state.nodes.allIds.map((nodeId) => state.nodes.byId[nodeId]).filter((node) => node !== undefined),
      state.segments.allIds.map((segmentId) => state.segments.byId[segmentId]).filter((segment) => segment !== undefined)
    );
    const currentPosition = generatedPositions["N-C-SRC" as NodeId];
    if (currentPosition === undefined) {
      throw new Error("Expected generated position for N-C-SRC.");
    }
    const result = validateAiAgentOperations({
      state,
      scope: "activeNetwork",
      selection: state.ui.selected,
      permissions: DEFAULT_PERMISSIONS,
      payload: {
        schemaVersion: 1,
        operations: [
          {
            type: "move_entity",
            entityKind: "node",
            entityId: "CONN-SRC-01",
            direction: "left",
            distance: 40
          }
        ]
      }
    });

    expect(result.rejected).toHaveLength(0);
    expect(result.accepted).toEqual([
      expect.objectContaining({
        type: "move_entity",
        entityKind: "node",
        entityId: "N-C-SRC",
        position: {
          x: currentPosition.x - 40,
          y: currentPosition.y
        }
      })
    ]);
  });

  it("uses the selected entity and instruction direction when provider move payload is sparse", () => {
    const baseState = createSampleNetworkState();
    const state = appReducer(baseState, appActions.select({ kind: "connector", id: "C-SRC" as ConnectorId }));
    const generatedPositions = createNodePositionMap(
      state.nodes.allIds.map((nodeId) => state.nodes.byId[nodeId]).filter((node) => node !== undefined),
      state.segments.allIds.map((segmentId) => state.segments.byId[segmentId]).filter((segment) => segment !== undefined)
    );
    const currentPosition = generatedPositions["N-C-SRC" as NodeId];
    if (currentPosition === undefined) {
      throw new Error("Expected generated position for N-C-SRC.");
    }

    const result = validateAiAgentOperations({
      state,
      scope: "activeNetwork",
      selection: state.ui.selected,
      permissions: DEFAULT_PERMISSIONS,
      instruction: "move SVC connector on the left on the canva",
      payload: {
        schemaVersion: 1,
        operations: [
          {
            type: "move_entity"
          }
        ]
      }
    });

    expect(result.rejected).toHaveLength(0);
    expect(result.accepted).toEqual([
      expect.objectContaining({
        type: "move_entity",
        entityKind: "connector",
        entityId: "C-SRC",
        position: {
          x: currentPosition.x - 80,
          y: currentPosition.y
        }
      })
    ]);
  });

  it("resolves unique partial connector references from provider move payloads", () => {
    const baseState = createSampleNetworkState();
    const state = appReducer(baseState, appActions.select({ kind: "connector", id: "C-SRC" as ConnectorId }));
    const generatedPositions = createNodePositionMap(
      state.nodes.allIds.map((nodeId) => state.nodes.byId[nodeId]).filter((node) => node !== undefined),
      state.segments.allIds.map((segmentId) => state.segments.byId[segmentId]).filter((segment) => segment !== undefined)
    );
    const currentPosition = generatedPositions["N-C-SRC" as NodeId];
    if (currentPosition === undefined) {
      throw new Error("Expected generated position for N-C-SRC.");
    }

    const result = validateAiAgentOperations({
      state,
      scope: "activeNetwork",
      selection: state.ui.selected,
      permissions: DEFAULT_PERMISSIONS,
      instruction: "move source connector on the left",
      payload: {
        schemaVersion: 1,
        operations: [
          {
            type: "move_entity",
            entityKind: "connector",
            entityId: "SRC"
          }
        ]
      }
    });

    expect(result.rejected).toHaveLength(0);
    expect(result.accepted).toEqual([
      expect.objectContaining({
        type: "move_entity",
        entityKind: "connector",
        entityId: "C-SRC",
        position: {
          x: currentPosition.x - 80,
          y: currentPosition.y
        }
      })
    ]);
  });

  it("resolves generic connector aliases on the charging demo network", () => {
    const sampleState = createSampleNetworkState();
    const chargingState = appReducer(sampleState, appActions.selectNetwork("network-charging-service-demo" as NetworkId));
    const state = appReducer(chargingState, appActions.select({ kind: "connector", id: "H-C-SERVICE" as ConnectorId }));
    const generatedPositions = createNodePositionMap(
      state.nodes.allIds.map((nodeId) => state.nodes.byId[nodeId]).filter((node) => node !== undefined),
      state.segments.allIds.map((segmentId) => state.segments.byId[segmentId]).filter((segment) => segment !== undefined)
    );
    const currentPosition = generatedPositions["H-N-SERVICE" as NodeId];
    if (currentPosition === undefined) {
      throw new Error("Expected generated position for H-N-SERVICE.");
    }

    const result = validateAiAgentOperations({
      state,
      scope: "activeNetwork",
      selection: state.ui.selected,
      permissions: DEFAULT_PERMISSIONS,
      instruction: "déplaces le SVC à gauche du OBC",
      payload: {
        schemaVersion: 1,
        operations: [
          {
            type: "move_entity",
            entityKind: "connector",
            entityId: "SVC connector"
          }
        ]
      }
    });

    expect(result.rejected).toHaveLength(0);
    expect(result.accepted).toEqual([
      expect.objectContaining({
        type: "move_entity",
        entityKind: "connector",
        entityId: "H-C-SERVICE",
        position: {
          x: currentPosition.x - 80,
          y: currentPosition.y
        }
      })
    ]);
  });

  it("accepts explicit relative placement between charging demo connectors", () => {
    const sampleState = createSampleNetworkState();
    const chargingState = appReducer(sampleState, appActions.selectNetwork("network-charging-service-demo" as NetworkId));
    const state = appReducer(chargingState, appActions.select({ kind: "connector", id: "H-C-SERVICE" as ConnectorId }));
    const generatedPositions = createNodePositionMap(
      state.nodes.allIds.map((nodeId) => state.nodes.byId[nodeId]).filter((node) => node !== undefined),
      state.segments.allIds.map((segmentId) => state.segments.byId[segmentId]).filter((segment) => segment !== undefined)
    );
    const obcPosition = generatedPositions["H-N-OBC" as NodeId];
    if (obcPosition === undefined) {
      throw new Error("Expected generated position for H-N-OBC.");
    }

    const result = validateAiAgentOperations({
      state,
      scope: "activeNetwork",
      selection: state.ui.selected,
      permissions: DEFAULT_PERMISSIONS,
      instruction: "déplaces le SVC à gauche du OBC",
      payload: {
        schemaVersion: 1,
        operations: [
          {
            type: "place_entity_relative_to_entity",
            entityKind: "connector",
            entityId: "SVC connector",
            referenceEntityKind: "connector",
            referenceEntityId: "OBC",
            placement: "leftOf",
            gap: 96
          }
        ]
      }
    });

    expect(result.rejected).toHaveLength(0);
    expect(result.accepted).toEqual([
      expect.objectContaining({
        type: "place_entity_relative_to_entity",
        entityKind: "connector",
        entityId: "H-C-SERVICE",
        referenceEntityKind: "connector",
        referenceEntityId: "H-C-OBC",
        position: {
          x: obcPosition.x - 96,
          y: obcPosition.y
        }
      })
    ]);
  });

  it("reports unknown relative placement anchors explicitly", () => {
    const state = createSampleNetworkState();
    const result = validateAiAgentOperations({
      state,
      scope: "activeNetwork",
      selection: null,
      permissions: DEFAULT_PERMISSIONS,
      payload: {
        schemaVersion: 1,
        operations: [
          {
            type: "place_entity_relative_to_entity",
            entityKind: "connector",
            entityId: "C-SRC",
            referenceEntityKind: "connector",
            referenceEntityId: "missing-anchor",
            placement: "leftOf"
          }
        ]
      }
    });

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toEqual([
      expect.objectContaining({
        operationIndex: 0,
        operationType: "place_entity_relative_to_entity",
        message: "Relative placement references an unknown anchor entity."
      })
    ]);
  });
});
