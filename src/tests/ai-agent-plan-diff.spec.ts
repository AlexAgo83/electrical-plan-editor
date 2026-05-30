import { describe, expect, it } from "vitest";
import type { ConnectorId, NetworkId, NodeId } from "../core/entities";
import { appActions, appReducer, createSampleNetworkState } from "../store";
import { buildAiAgentContext } from "../app/lib/aiAgentContext";
import {
  buildAiAgentEditablePlan,
  buildAiAgentOperationsFromPlanDiff,
  extractAiAgentModifiedPlan
} from "../app/lib/aiAgentPlanDiff";

describe("AI agent plan diff", () => {
  it("derives safe update and move operations from a modified editable plan", () => {
    const baseState = createSampleNetworkState();
    const chargingState = appReducer(baseState, appActions.selectNetwork("network-charging-service-demo" as NetworkId));
    const state = appReducer(chargingState, appActions.select({ kind: "connector", id: "H-C-SERVICE" as ConnectorId }));
    const beforePlan = buildAiAgentEditablePlan(buildAiAgentContext(state, "activeNetwork"));
    const serviceNode = beforePlan.nodes.find((node) => node.id === ("H-N-SERVICE" as NodeId));
    if (serviceNode?.position === undefined) {
      throw new Error("Expected editable position for H-N-SERVICE.");
    }
    const servicePosition = serviceNode.position;

    const modifiedPlan = {
      ...beforePlan,
      connectors: beforePlan.connectors.map((connector) =>
        connector.id === ("H-C-SERVICE" as ConnectorId) ? { ...connector, name: "test" } : connector
      ),
      nodes: beforePlan.nodes.map((node) =>
        node.id === ("H-N-SERVICE" as NodeId)
          ? { ...node, position: { x: servicePosition.x - 80, y: servicePosition.y } }
          : node
      )
    };

    expect(buildAiAgentOperationsFromPlanDiff(beforePlan, modifiedPlan)).toEqual([
      {
        type: "update_entity",
        entityKind: "connector",
        entityId: "H-C-SERVICE",
        fields: {
          name: "test"
        }
      },
      {
        type: "move_entity",
        entityKind: "connector",
        entityId: "H-C-SERVICE",
        position: {
          x: servicePosition.x - 80,
          y: servicePosition.y
        }
      }
    ]);
  });

  it("extracts modifiedPlan envelopes and ignores legacy operation envelopes", () => {
    const context = buildAiAgentContext(createSampleNetworkState(), "activeNetwork");
    const plan = buildAiAgentEditablePlan(context);

    expect(
      extractAiAgentModifiedPlan({
        schemaVersion: 1,
        modifiedPlan: plan
      })
    ).toEqual(plan);
    expect(
      extractAiAgentModifiedPlan({
        schemaVersion: 1,
        operations: []
      })
    ).toBeNull();
  });
});
