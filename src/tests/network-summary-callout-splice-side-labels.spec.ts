import { describe, expect, it } from "vitest";
import type { Connector, ConnectorId, Splice, SpliceId, Wire } from "../core/entities";
import { appActions } from "../store";
import { buildSpliceCalloutGroupsById } from "../app/components/network-summary/callouts/calloutModel";
import {
  asConnectorId,
  asNodeId,
  asSegmentId,
  asSpliceId,
  asWireId,
  reduceAll
} from "./helpers/store-reducer-test-utils";

function mapsFromState(state: ReturnType<typeof reduceAll>): {
  connectorMap: Map<ConnectorId, Connector>;
  spliceMap: Map<SpliceId, Splice>;
  wires: Wire[];
} {
  const connectorMap = new Map<ConnectorId, Connector>();
  for (const id of state.connectors.allIds) {
    const connector = state.connectors.byId[id];
    if (connector !== undefined) {
      connectorMap.set(id, connector);
    }
  }
  const spliceMap = new Map<SpliceId, Splice>();
  for (const id of state.splices.allIds) {
    const splice = state.splices.byId[id];
    if (splice !== undefined) {
      spliceMap.set(id, splice);
    }
  }
  const wires = state.wires.allIds
    .map((id) => state.wires.byId[id])
    .filter((wire): wire is Wire => wire !== undefined);
  return { connectorMap, spliceMap, wires };
}

describe("network summary splice callout port labels", () => {
  it("labels directional splice callout groups as L / R instead of P1 / P2", () => {
    const state = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C-TOP"), name: "Top", technicalId: "C-TOP", cavityCount: 1 }),
      appActions.upsertConnector({ id: asConnectorId("C-BOT"), name: "Bottom", technicalId: "C-BOT", cavityCount: 1 }),
      appActions.upsertNode({ id: asNodeId("N-TOP"), kind: "connector", connectorId: asConnectorId("C-TOP") }),
      appActions.upsertNode({ id: asNodeId("N-BOT"), kind: "connector", connectorId: asConnectorId("C-BOT") }),
      appActions.upsertSegment({ id: asSegmentId("SEG-VERT"), nodeA: asNodeId("N-TOP"), nodeB: asNodeId("N-BOT"), lengthMm: 200 }),
      appActions.upsertSplice({
        id: asSpliceId("S-VERT"),
        name: "Vertical splice",
        technicalId: "S-VERT",
        portCount: 2,
        portMode: "directional",
        placement: { kind: "segmentOffset", segmentId: asSegmentId("SEG-VERT"), fromNodeId: asNodeId("N-TOP"), offsetMm: 100 }
      }),
      appActions.setNodePositions({
        [asNodeId("N-TOP")]: { x: 100, y: 0 },
        [asNodeId("N-BOT")]: { x: 100, y: 200 }
      }),
      appActions.saveWire({
        id: asWireId("W-UP"),
        name: "Up wire",
        technicalId: "W-UP",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-TOP"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-VERT"), portIndex: 1 }
      }),
      appActions.saveWire({
        id: asWireId("W-DOWN"),
        name: "Down wire",
        technicalId: "W-DOWN",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-BOT"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-VERT"), portIndex: 1 }
      })
    ]);

    const groups = buildSpliceCalloutGroupsById(mapsFromState(state)).get(asSpliceId("S-VERT")) ?? [];
    const labels = groups.map((group) => group.label);
    expect(labels).toContain("L");
    expect(labels).toContain("R");
    expect(labels).not.toContain("P1");
    expect(labels).not.toContain("P2");
  });

  it("keeps numbered P labels for bounded splices", () => {
    const state = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C-A"), name: "A", technicalId: "C-A", cavityCount: 1 }),
      appActions.upsertSplice({ id: asSpliceId("S-BND"), name: "Bounded", technicalId: "S-BND", portCount: 3 }),
      appActions.upsertNode({ id: asNodeId("N-A"), kind: "connector", connectorId: asConnectorId("C-A") }),
      appActions.upsertNode({ id: asNodeId("N-SB"), kind: "splice", spliceId: asSpliceId("S-BND") }),
      appActions.upsertSegment({ id: asSegmentId("SEG-AB"), nodeA: asNodeId("N-A"), nodeB: asNodeId("N-SB"), lengthMm: 50 }),
      appActions.saveWire({
        id: asWireId("W-B"),
        name: "Bounded wire",
        technicalId: "W-B",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-A"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-BND"), portIndex: 1 }
      })
    ]);

    const labels = (buildSpliceCalloutGroupsById(mapsFromState(state)).get(asSpliceId("S-BND")) ?? []).map(
      (group) => group.label
    );
    expect(labels).toContain("P1");
    expect(labels).not.toContain("L");
    expect(labels).not.toContain("R");
  });
});
