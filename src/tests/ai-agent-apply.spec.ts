import { describe, expect, it } from "vitest";
import type { ConnectorId, NodeId, WireId } from "../core/entities";
import { createSampleNetworkState } from "../store";
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
});
