import { describe, expect, it } from "vitest";
import type { CatalogItemId, ConnectorId, NetworkId, NodeId, SegmentId, WireId } from "../core/entities";
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
    const state = appReducer(chargingState, appActions.select({ kind: "connector", id: "H-C-SERVICE" }));
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

  it("derives safe catalog item update operations from a modified editable plan", () => {
    const state = createSampleNetworkState();
    const beforePlan = buildAiAgentEditablePlan(buildAiAgentContext(state, "activeNetwork"));
    const modifiedPlan = {
      ...beforePlan,
      catalogItems: beforePlan.catalogItems.map((item) =>
        item.id === ("CAT-SAMPLE-SRC-12W" as CatalogItemId) ? { ...item, connectionCount: item.connectionCount * 2 } : item
      )
    };

    expect(buildAiAgentOperationsFromPlanDiff(beforePlan, modifiedPlan)).toContainEqual({
      type: "update_entity",
      entityKind: "catalog",
      entityId: "CAT-SAMPLE-SRC-12W",
      fields: {
        connectionCount: 24
      }
    });
  });

  it("derives add_wire operations from new wires in a modified editable plan", () => {
    const baseState = createSampleNetworkState();
    const state = appReducer(baseState, appActions.selectNetwork("network-charging-service-demo" as NetworkId));
    const beforePlan = buildAiAgentEditablePlan(buildAiAgentContext(state, "activeNetwork"));
    const modifiedPlan = {
      ...beforePlan,
      wires: [
        ...beforePlan.wires,
        {
          id: "AI-WIRE-INLET-OBC" as WireId,
          name: "Inlet to OBC pin bridge",
          technicalId: "H-WIRE-INLET-OBC-P7-P12",
          endpointA: { kind: "connectorCavity" as const, connectorId: "H-C-INLET" as ConnectorId, cavityIndex: 7 },
          endpointB: { kind: "connectorCavity" as const, connectorId: "H-C-OBC" as ConnectorId, cavityIndex: 12 },
          sectionMm2: 0.5,
          primaryColorId: null,
          secondaryColorId: null,
          routeSegmentIds: [],
          lengthMm: 0
        }
      ]
    };

    expect(buildAiAgentOperationsFromPlanDiff(beforePlan, modifiedPlan)).toContainEqual({
      type: "add_wire",
      name: "Inlet to OBC pin bridge",
      technicalId: "H-WIRE-INLET-OBC-P7-P12",
      endpointA: { kind: "connectorCavity", connectorId: "H-C-INLET", cavityIndex: 7 },
      endpointB: { kind: "connectorCavity", connectorId: "H-C-OBC", cavityIndex: 12 },
      sectionMm2: 0.5
    });
  });

  it("derives wire updates and wire deletions from modified editable plans", () => {
    const state = createSampleNetworkState();
    const beforePlan = buildAiAgentEditablePlan(buildAiAgentContext(state, "activeNetwork"));
    const modifiedPlan = {
      ...beforePlan,
      wires: beforePlan.wires
        .filter((wire) => wire.id !== ("W-002" as WireId))
        .map((wire) =>
          wire.id === ("W-001" as WireId)
            ? {
                ...wire,
                name: "Renamed feed",
                sectionMm2: 1.5,
                endpointA: { kind: "connectorCavity" as const, connectorId: "C-SRC" as ConnectorId, cavityIndex: 11 }
              }
            : wire
        )
    };

    expect(buildAiAgentOperationsFromPlanDiff(beforePlan, modifiedPlan)).toEqual(
      expect.arrayContaining([
        {
          type: "update_entity",
          entityKind: "wire",
          entityId: "W-001",
          fields: {
            name: "Renamed feed",
            sectionMm2: 1.5,
            endpointA: { kind: "connectorCavity", connectorId: "C-SRC", cavityIndex: 11 }
          }
        },
        {
          type: "delete_entity",
          entityKind: "wire",
          entityId: "W-002"
        }
      ])
    );
  });

  it("derives intermediate node and segment additions from modified editable plans", () => {
    const state = createSampleNetworkState();
    const beforePlan = buildAiAgentEditablePlan(buildAiAgentContext(state, "activeNetwork"));
    const modifiedPlan = {
      ...beforePlan,
      nodes: [
        ...beforePlan.nodes,
        {
          id: "AI-NODE-900" as NodeId,
          kind: "intermediate" as const,
          label: "AI route point",
          position: { x: 320, y: 180 }
        }
      ],
      segments: [
        ...beforePlan.segments,
        {
          id: "AI-SEG-900" as SegmentId,
          nodeA: "N-C-SRC" as NodeId,
          nodeB: "AI-NODE-900" as NodeId,
          lengthMm: 40
        }
      ]
    };

    expect(buildAiAgentOperationsFromPlanDiff(beforePlan, modifiedPlan)).toEqual(
      expect.arrayContaining([
        {
          type: "add_node",
          id: "AI-NODE-900",
          label: "AI route point",
          position: { x: 320, y: 180 }
        },
        {
          type: "add_segment",
          nodeA: "N-C-SRC",
          nodeB: "AI-NODE-900",
          lengthMm: 40
        }
      ])
    );
  });

  it("derives connector additions before dependent segment and wire additions", () => {
    const state = appReducer(createSampleNetworkState(), appActions.selectNetwork("network-charging-service-demo" as NetworkId));
    const beforePlan = buildAiAgentEditablePlan(buildAiAgentContext(state, "activeNetwork"));
    const modifiedPlan = {
      ...beforePlan,
      connectors: [
        ...beforePlan.connectors,
        {
          id: "H-C-AI-SERVICE" as ConnectorId,
          name: "AI Service Connector",
          technicalId: "H-CONN-AI-SERVICE",
          cavityCount: 2
        }
      ],
      nodes: [
        ...beforePlan.nodes,
        {
          id: "H-N-AI-SERVICE" as NodeId,
          kind: "connector" as const,
          connectorId: "H-C-AI-SERVICE" as ConnectorId,
          position: { x: 80, y: 240 }
        }
      ],
      segments: [
        ...beforePlan.segments,
        {
          id: "H-SEG-AI-SERVICE" as SegmentId,
          nodeA: "H-N-AI-SERVICE" as NodeId,
          nodeB: "H-N-HVIL" as NodeId,
          lengthMm: 25
        }
      ],
      wires: [
        ...beforePlan.wires,
        {
          id: "H-WIRE-AI-SERVICE-OBC" as WireId,
          name: "AI service to OBC",
          technicalId: "H-WIRE-AI-SERVICE-OBC",
          endpointA: { kind: "connectorCavity" as const, connectorId: "H-C-AI-SERVICE" as ConnectorId, cavityIndex: 1 },
          endpointB: { kind: "connectorCavity" as const, connectorId: "H-C-OBC" as ConnectorId, cavityIndex: 12 },
          sectionMm2: 0.5,
          primaryColorId: null,
          secondaryColorId: null,
          routeSegmentIds: [],
          lengthMm: 0
        }
      ]
    };

    const operations = buildAiAgentOperationsFromPlanDiff(beforePlan, modifiedPlan);

    expect(operations.slice(-2)).toEqual([
      {
        type: "add_segment",
        nodeA: "H-N-AI-SERVICE",
        nodeB: "H-N-HVIL",
        lengthMm: 25
      },
      {
        type: "add_wire",
        name: "AI service to OBC",
        technicalId: "H-WIRE-AI-SERVICE-OBC",
        endpointA: { kind: "connectorCavity", connectorId: "H-C-AI-SERVICE", cavityIndex: 1 },
        endpointB: { kind: "connectorCavity", connectorId: "H-C-OBC", cavityIndex: 12 },
        sectionMm2: 0.5
      }
    ]);
    expect(operations[0]).toEqual({
      type: "add_connector",
      id: "H-C-AI-SERVICE",
      nodeId: "H-N-AI-SERVICE",
      name: "AI Service Connector",
      technicalId: "H-CONN-AI-SERVICE",
      cavityCount: 2,
      position: { x: 80, y: 240 }
    });
  });

  it("emits a rejectable connector add operation when the modified plan omits the linked node", () => {
    const state = appReducer(createSampleNetworkState(), appActions.selectNetwork("network-charging-service-demo" as NetworkId));
    const beforePlan = buildAiAgentEditablePlan(buildAiAgentContext(state, "activeNetwork"));
    const modifiedPlan = {
      ...beforePlan,
      connectors: [
        ...beforePlan.connectors,
        {
          id: "H-C-AI-ORPHAN" as ConnectorId,
          name: "AI Orphan Connector",
          technicalId: "H-CONN-AI-ORPHAN",
          cavityCount: 2
        }
      ]
    };

    expect(buildAiAgentOperationsFromPlanDiff(beforePlan, modifiedPlan)).toContainEqual({
      type: "add_connector",
      id: "H-C-AI-ORPHAN",
      name: "AI Orphan Connector",
      technicalId: "H-CONN-AI-ORPHAN",
      cavityCount: 2
    });
  });
});
