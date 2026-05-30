import { describe, expect, it } from "vitest";
import type { ConnectorId, NodeId, WireId } from "../core/entities";
import { createSampleNetworkState } from "../store";
import { validateAiAgentOperations, type AiAgentOperationPermissions } from "../app/lib/aiAgentOperationContract";

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
});
