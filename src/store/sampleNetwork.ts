import type {
  ConnectorId,
  NetworkId,
  NodeId,
  SegmentId,
  SpliceId,
  WireId
} from "../core/entities";
import { appActions } from "./actions";
import { appReducer } from "./reducer";
import { createInitialState, type AppState } from "./types";

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asSpliceId(value: string): SpliceId {
  return value as SpliceId;
}

function asNodeId(value: string): NodeId {
  return value as NodeId;
}

function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

function asWireId(value: string): WireId {
  return value as WireId;
}

function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
}

const SAMPLE_CONNECTOR_IDS = [
  asConnectorId("C-SRC"),
  asConnectorId("C-DST-1"),
  asConnectorId("C-DST-2")
] as const;

const SAMPLE_SPLICE_IDS = [
  asSpliceId("S-J1"),
  asSpliceId("S-J2")
] as const;

const SAMPLE_NODE_IDS = [
  asNodeId("N-C-SRC"),
  asNodeId("N-C-D1"),
  asNodeId("N-C-D2"),
  asNodeId("N-S-J1"),
  asNodeId("N-S-J2"),
  asNodeId("N-MID-A"),
  asNodeId("N-MID-B"),
  asNodeId("N-MID-C")
] as const;

const SAMPLE_SEGMENT_IDS = [
  asSegmentId("SEG-001"),
  asSegmentId("SEG-002"),
  asSegmentId("SEG-003"),
  asSegmentId("SEG-004"),
  asSegmentId("SEG-005"),
  asSegmentId("SEG-006"),
  asSegmentId("SEG-007"),
  asSegmentId("SEG-008"),
  asSegmentId("SEG-009")
] as const;

const SAMPLE_WIRE_IDS = [
  asWireId("W-001"),
  asWireId("W-002"),
  asWireId("W-003"),
  asWireId("W-004"),
  asWireId("W-005")
] as const;

export const SAMPLE_NETWORK_SIGNATURE = {
  connectors: SAMPLE_CONNECTOR_IDS,
  splices: SAMPLE_SPLICE_IDS,
  nodes: SAMPLE_NODE_IDS,
  segments: SAMPLE_SEGMENT_IDS,
  wires: SAMPLE_WIRE_IDS
} as const;

export function isWorkspaceEmpty(state: AppState): boolean {
  return state.networks.allIds.every((networkId) => {
    const scoped = state.networkStates[networkId];
    if (scoped === undefined) {
      return true;
    }

    return (
      scoped.connectors.allIds.length === 0 &&
      scoped.splices.allIds.length === 0 &&
      scoped.nodes.allIds.length === 0 &&
      scoped.segments.allIds.length === 0 &&
      scoped.wires.allIds.length === 0
    );
  });
}

export function hasSampleNetworkSignature(state: AppState): boolean {
  return state.networks.allIds.some((networkId) => {
    const scoped = state.networkStates[networkId];
    if (scoped === undefined) {
      return false;
    }

    return (
      SAMPLE_CONNECTOR_IDS.every((id) => scoped.connectors.byId[id] !== undefined) &&
      SAMPLE_SPLICE_IDS.every((id) => scoped.splices.byId[id] !== undefined) &&
      SAMPLE_NODE_IDS.every((id) => scoped.nodes.byId[id] !== undefined) &&
      SAMPLE_SEGMENT_IDS.every((id) => scoped.segments.byId[id] !== undefined) &&
      SAMPLE_WIRE_IDS.every((id) => scoped.wires.byId[id] !== undefined)
    );
  });
}

export function createSampleNetworkState(): AppState {
  return [
    appActions.upsertConnector({
      id: asConnectorId("C-SRC"),
      name: "Power Source Connector",
      technicalId: "CONN-SRC-01",
      cavityCount: 12
    }),
    appActions.upsertConnector({
      id: asConnectorId("C-DST-1"),
      name: "Actuator Connector A",
      technicalId: "CONN-DST-A",
      cavityCount: 8
    }),
    appActions.upsertConnector({
      id: asConnectorId("C-DST-2"),
      name: "Actuator Connector B",
      technicalId: "CONN-DST-B",
      cavityCount: 8
    }),
    appActions.upsertSplice({
      id: asSpliceId("S-J1"),
      name: "Main Junction",
      technicalId: "SPL-J1",
      portCount: 10
    }),
    appActions.upsertSplice({
      id: asSpliceId("S-J2"),
      name: "Branch Junction",
      technicalId: "SPL-J2",
      portCount: 8
    }),
    appActions.upsertNode({
      id: asNodeId("N-C-SRC"),
      kind: "connector",
      connectorId: asConnectorId("C-SRC")
    }),
    appActions.upsertNode({
      id: asNodeId("N-C-D1"),
      kind: "connector",
      connectorId: asConnectorId("C-DST-1")
    }),
    appActions.upsertNode({
      id: asNodeId("N-C-D2"),
      kind: "connector",
      connectorId: asConnectorId("C-DST-2")
    }),
    appActions.upsertNode({
      id: asNodeId("N-S-J1"),
      kind: "splice",
      spliceId: asSpliceId("S-J1")
    }),
    appActions.upsertNode({
      id: asNodeId("N-S-J2"),
      kind: "splice",
      spliceId: asSpliceId("S-J2")
    }),
    appActions.upsertNode({
      id: asNodeId("N-MID-A"),
      kind: "intermediate",
      label: "Midpoint A"
    }),
    appActions.upsertNode({
      id: asNodeId("N-MID-B"),
      kind: "intermediate",
      label: "Midpoint B"
    }),
    appActions.upsertNode({
      id: asNodeId("N-MID-C"),
      kind: "intermediate",
      label: "Midpoint C"
    }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-001"),
      nodeA: asNodeId("N-C-SRC"),
      nodeB: asNodeId("N-MID-A"),
      lengthMm: 40,
      subNetworkTag: "POWER_MAIN"
    }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-002"),
      nodeA: asNodeId("N-MID-A"),
      nodeB: asNodeId("N-S-J1"),
      lengthMm: 30,
      subNetworkTag: "POWER_MAIN"
    }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-003"),
      nodeA: asNodeId("N-S-J1"),
      nodeB: asNodeId("N-MID-B"),
      lengthMm: 25,
      subNetworkTag: "ACT_A"
    }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-004"),
      nodeA: asNodeId("N-MID-B"),
      nodeB: asNodeId("N-C-D1"),
      lengthMm: 35,
      subNetworkTag: "ACT_A"
    }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-005"),
      nodeA: asNodeId("N-S-J1"),
      nodeB: asNodeId("N-MID-C"),
      lengthMm: 20,
      subNetworkTag: "ACT_B"
    }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-006"),
      nodeA: asNodeId("N-MID-C"),
      nodeB: asNodeId("N-C-D2"),
      lengthMm: 30,
      subNetworkTag: "ACT_B"
    }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-007"),
      nodeA: asNodeId("N-S-J1"),
      nodeB: asNodeId("N-S-J2"),
      lengthMm: 15,
      subNetworkTag: "BRANCH"
    }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-008"),
      nodeA: asNodeId("N-S-J2"),
      nodeB: asNodeId("N-MID-B"),
      lengthMm: 10,
      subNetworkTag: "BRANCH"
    }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-009"),
      nodeA: asNodeId("N-S-J2"),
      nodeB: asNodeId("N-C-D2"),
      lengthMm: 22,
      subNetworkTag: "BRANCH"
    }),
    appActions.saveWire({
      id: asWireId("W-001"),
      name: "Feed Main Junction",
      technicalId: "WIRE-FEED-J1",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-SRC"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-J1"), portIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("W-002"),
      name: "Supply Actuator A",
      technicalId: "WIRE-ACT-A",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-SRC"), cavityIndex: 2 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-DST-1"), cavityIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("W-003"),
      name: "Supply Actuator B",
      technicalId: "WIRE-ACT-B",
      endpointA: { kind: "splicePort", spliceId: asSpliceId("S-J1"), portIndex: 2 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-DST-2"), cavityIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("W-004"),
      name: "Secondary Feed B",
      technicalId: "WIRE-B-SECONDARY",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-SRC"), cavityIndex: 3 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-DST-2"), cavityIndex: 2 }
    }),
    appActions.lockWireRoute(asWireId("W-004"), [
      asSegmentId("SEG-001"),
      asSegmentId("SEG-002"),
      asSegmentId("SEG-005"),
      asSegmentId("SEG-006")
    ]),
    appActions.saveWire({
      id: asWireId("W-005"),
      name: "Branch Junction Feed",
      technicalId: "WIRE-BRANCH-J2",
      endpointA: { kind: "splicePort", spliceId: asSpliceId("S-J2"), portIndex: 1 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-DST-1"), cavityIndex: 2 }
    }),
    appActions.saveWire({
      id: asWireId("W-006"),
      name: "Aux Feed Junction 1",
      technicalId: "WIRE-AUX-J1-1",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-SRC"), cavityIndex: 7 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-J1"), portIndex: 7 }
    }),
    appActions.saveWire({
      id: asWireId("W-007"),
      name: "Aux Feed Junction 2",
      technicalId: "WIRE-AUX-J1-2",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-SRC"), cavityIndex: 8 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-J1"), portIndex: 8 }
    }),
    appActions.saveWire({
      id: asWireId("W-008"),
      name: "Aux Supply Actuator A-1",
      technicalId: "WIRE-AUX-A-1",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-SRC"), cavityIndex: 9 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-DST-1"), cavityIndex: 5 }
    }),
    appActions.saveWire({
      id: asWireId("W-009"),
      name: "Aux Supply Actuator B-1",
      technicalId: "WIRE-AUX-B-1",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-SRC"), cavityIndex: 10 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-DST-2"), cavityIndex: 5 }
    }),
    appActions.saveWire({
      id: asWireId("W-010"),
      name: "Branch Return A-1",
      technicalId: "WIRE-BR-RET-A-1",
      endpointA: { kind: "splicePort", spliceId: asSpliceId("S-J2"), portIndex: 5 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-DST-1"), cavityIndex: 6 }
    }),
    appActions.saveWire({
      id: asWireId("W-011"),
      name: "Branch Return A-2",
      technicalId: "WIRE-BR-RET-A-2",
      endpointA: { kind: "splicePort", spliceId: asSpliceId("S-J2"), portIndex: 6 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-DST-1"), cavityIndex: 7 }
    }),
    appActions.saveWire({
      id: asWireId("W-012"),
      name: "Branch Return B-1",
      technicalId: "WIRE-BR-RET-B-1",
      endpointA: { kind: "splicePort", spliceId: asSpliceId("S-J2"), portIndex: 7 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-DST-2"), cavityIndex: 6 }
    }),
    appActions.saveWire({
      id: asWireId("W-013"),
      name: "Branch Return B-2",
      technicalId: "WIRE-BR-RET-B-2",
      endpointA: { kind: "splicePort", spliceId: asSpliceId("S-J2"), portIndex: 8 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-DST-2"), cavityIndex: 7 }
    }),
    appActions.saveWire({
      id: asWireId("W-014"),
      name: "J1 Service Link A",
      technicalId: "WIRE-J1-SVC-A",
      endpointA: { kind: "splicePort", spliceId: asSpliceId("S-J1"), portIndex: 9 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-DST-1"), cavityIndex: 8 }
    }),
    appActions.saveWire({
      id: asWireId("W-015"),
      name: "J1 Service Link B",
      technicalId: "WIRE-J1-SVC-B",
      endpointA: { kind: "splicePort", spliceId: asSpliceId("S-J1"), portIndex: 10 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-DST-2"), cavityIndex: 8 }
    }),

    appActions.createNetwork(
      {
        id: asNetworkId("network-lighting-demo"),
        name: "Lighting branch demo",
        technicalId: "NET-LIGHTING-DEMO",
        createdAt: "2026-02-24T09:00:00.000Z",
        updatedAt: "2026-02-24T09:00:00.000Z",
        description: "Compact lighting split example with one source, one split splice, and two lamp branches."
      },
      false
    ),
    appActions.selectNetwork(asNetworkId("network-lighting-demo")),
    appActions.upsertConnector({
      id: asConnectorId("L-C-SRC"),
      name: "Lighting Source Connector",
      technicalId: "L-CONN-SRC",
      cavityCount: 6
    }),
    appActions.upsertConnector({
      id: asConnectorId("L-C-FRONT"),
      name: "Front Lamp Connector",
      technicalId: "L-CONN-FRONT",
      cavityCount: 4
    }),
    appActions.upsertConnector({
      id: asConnectorId("L-C-REAR"),
      name: "Rear Lamp Connector",
      technicalId: "L-CONN-REAR",
      cavityCount: 4
    }),
    appActions.upsertSplice({
      id: asSpliceId("L-S-SPLIT"),
      name: "Lighting Split Splice",
      technicalId: "L-SPL-SPLIT",
      portCount: 4
    }),
    appActions.upsertNode({ id: asNodeId("L-N-SRC"), kind: "connector", connectorId: asConnectorId("L-C-SRC") }),
    appActions.upsertNode({ id: asNodeId("L-N-FRONT"), kind: "connector", connectorId: asConnectorId("L-C-FRONT") }),
    appActions.upsertNode({ id: asNodeId("L-N-REAR"), kind: "connector", connectorId: asConnectorId("L-C-REAR") }),
    appActions.upsertNode({ id: asNodeId("L-N-SPLIT"), kind: "splice", spliceId: asSpliceId("L-S-SPLIT") }),
    appActions.upsertNode({ id: asNodeId("L-N-MID"), kind: "intermediate", label: "L-Harness Mid" }),
    appActions.upsertSegment({
      id: asSegmentId("L-SEG-001"),
      nodeA: asNodeId("L-N-SRC"),
      nodeB: asNodeId("L-N-MID"),
      lengthMm: 55,
      subNetworkTag: "LIGHT_FEED"
    }),
    appActions.upsertSegment({
      id: asSegmentId("L-SEG-002"),
      nodeA: asNodeId("L-N-MID"),
      nodeB: asNodeId("L-N-SPLIT"),
      lengthMm: 30,
      subNetworkTag: "LIGHT_FEED"
    }),
    appActions.upsertSegment({
      id: asSegmentId("L-SEG-003"),
      nodeA: asNodeId("L-N-SPLIT"),
      nodeB: asNodeId("L-N-FRONT"),
      lengthMm: 28,
      subNetworkTag: "LIGHT_FRONT"
    }),
    appActions.upsertSegment({
      id: asSegmentId("L-SEG-004"),
      nodeA: asNodeId("L-N-SPLIT"),
      nodeB: asNodeId("L-N-REAR"),
      lengthMm: 42,
      subNetworkTag: "LIGHT_REAR"
    }),
    appActions.saveWire({
      id: asWireId("L-W-001"),
      name: "Lighting Feed",
      technicalId: "L-WIRE-FEED",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("L-C-SRC"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("L-S-SPLIT"), portIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("L-W-002"),
      name: "Front Lamp Feed",
      technicalId: "L-WIRE-FRONT",
      endpointA: { kind: "splicePort", spliceId: asSpliceId("L-S-SPLIT"), portIndex: 2 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("L-C-FRONT"), cavityIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("L-W-003"),
      name: "Rear Lamp Feed",
      technicalId: "L-WIRE-REAR",
      endpointA: { kind: "splicePort", spliceId: asSpliceId("L-S-SPLIT"), portIndex: 3 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("L-C-REAR"), cavityIndex: 1 }
    }),
    appActions.lockWireRoute(asWireId("L-W-003"), [asSegmentId("L-SEG-004")]),

    appActions.createNetwork(
      {
        id: asNetworkId("network-sensor-backbone-demo"),
        name: "Sensor backbone demo",
        technicalId: "NET-SENSOR-BB-DEMO",
        createdAt: "2026-02-24T09:05:00.000Z",
        updatedAt: "2026-02-24T09:05:00.000Z",
        description: "Sensor backbone example with ECU fan-out and shared return splice."
      },
      false
    ),
    appActions.selectNetwork(asNetworkId("network-sensor-backbone-demo")),
    appActions.upsertConnector({
      id: asConnectorId("S-C-ECU"),
      name: "ECU Connector",
      technicalId: "S-CONN-ECU",
      cavityCount: 12
    }),
    appActions.upsertConnector({
      id: asConnectorId("S-C-A"),
      name: "Sensor A Connector",
      technicalId: "S-CONN-A",
      cavityCount: 4
    }),
    appActions.upsertConnector({
      id: asConnectorId("S-C-B"),
      name: "Sensor B Connector",
      technicalId: "S-CONN-B",
      cavityCount: 4
    }),
    appActions.upsertConnector({
      id: asConnectorId("S-C-C"),
      name: "Sensor C Connector",
      technicalId: "S-CONN-C",
      cavityCount: 4
    }),
    appActions.upsertSplice({
      id: asSpliceId("S-S-GND"),
      name: "Sensor Ground Splice",
      technicalId: "S-SPL-GND",
      portCount: 6
    }),
    appActions.upsertNode({ id: asNodeId("S-N-ECU"), kind: "connector", connectorId: asConnectorId("S-C-ECU") }),
    appActions.upsertNode({ id: asNodeId("S-N-A"), kind: "connector", connectorId: asConnectorId("S-C-A") }),
    appActions.upsertNode({ id: asNodeId("S-N-B"), kind: "connector", connectorId: asConnectorId("S-C-B") }),
    appActions.upsertNode({ id: asNodeId("S-N-C"), kind: "connector", connectorId: asConnectorId("S-C-C") }),
    appActions.upsertNode({ id: asNodeId("S-N-GND"), kind: "splice", spliceId: asSpliceId("S-S-GND") }),
    appActions.upsertNode({ id: asNodeId("S-N-TRUNK"), kind: "intermediate", label: "Sensor Trunk" }),
    appActions.upsertSegment({
      id: asSegmentId("S-SEG-001"),
      nodeA: asNodeId("S-N-ECU"),
      nodeB: asNodeId("S-N-TRUNK"),
      lengthMm: 35,
      subNetworkTag: "SENSOR_BUS"
    }),
    appActions.upsertSegment({
      id: asSegmentId("S-SEG-002"),
      nodeA: asNodeId("S-N-TRUNK"),
      nodeB: asNodeId("S-N-A"),
      lengthMm: 18,
      subNetworkTag: "SENSOR_A"
    }),
    appActions.upsertSegment({
      id: asSegmentId("S-SEG-003"),
      nodeA: asNodeId("S-N-TRUNK"),
      nodeB: asNodeId("S-N-B"),
      lengthMm: 22,
      subNetworkTag: "SENSOR_B"
    }),
    appActions.upsertSegment({
      id: asSegmentId("S-SEG-004"),
      nodeA: asNodeId("S-N-TRUNK"),
      nodeB: asNodeId("S-N-C"),
      lengthMm: 26,
      subNetworkTag: "SENSOR_C"
    }),
    appActions.upsertSegment({
      id: asSegmentId("S-SEG-005"),
      nodeA: asNodeId("S-N-TRUNK"),
      nodeB: asNodeId("S-N-GND"),
      lengthMm: 14,
      subNetworkTag: "SENSOR_GND"
    }),
    appActions.saveWire({
      id: asWireId("S-W-001"),
      name: "Sensor A Signal",
      technicalId: "S-WIRE-A-SIG",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("S-C-ECU"), cavityIndex: 1 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("S-C-A"), cavityIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("S-W-002"),
      name: "Sensor B Signal",
      technicalId: "S-WIRE-B-SIG",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("S-C-ECU"), cavityIndex: 2 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("S-C-B"), cavityIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("S-W-003"),
      name: "Sensor C Signal",
      technicalId: "S-WIRE-C-SIG",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("S-C-ECU"), cavityIndex: 3 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("S-C-C"), cavityIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("S-W-004"),
      name: "Sensor A Ground",
      technicalId: "S-WIRE-A-GND",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("S-C-A"), cavityIndex: 2 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-S-GND"), portIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("S-W-005"),
      name: "Sensor B Ground",
      technicalId: "S-WIRE-B-GND",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("S-C-B"), cavityIndex: 2 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-S-GND"), portIndex: 2 }
    }),
    appActions.saveWire({
      id: asWireId("S-W-006"),
      name: "Sensor C Ground",
      technicalId: "S-WIRE-C-GND",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("S-C-C"), cavityIndex: 2 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-S-GND"), portIndex: 3 }
    }),

    appActions.selectNetwork(asNetworkId("network-main"))
  ].reduce(appReducer, createInitialState());
}

export function createValidationIssuesSampleNetworkState(): AppState {
  const base = createSampleNetworkState();
  const activeNetworkId = base.activeNetworkId as NetworkId;

  return [
    appActions.updateNetwork(
      activeNetworkId,
      "Validation issues sample",
      "NET-VALIDATION-SAMPLE",
      "2026-02-22T00:00:00.000Z"
    ),
    appActions.saveWire({
      id: asWireId("W-VAL-EX-001"),
      name: "Validation Extra Feed 1",
      technicalId: "WIRE-VAL-EX-001",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-SRC"), cavityIndex: 4 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-J1"), portIndex: 3 }
    }),
    appActions.saveWire({
      id: asWireId("W-VAL-EX-002"),
      name: "Validation Extra Feed 2",
      technicalId: "WIRE-VAL-EX-002",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-SRC"), cavityIndex: 5 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-J1"), portIndex: 4 }
    }),
    appActions.saveWire({
      id: asWireId("W-VAL-EX-003"),
      name: "Validation Extra Actuator A-1",
      technicalId: "WIRE-VAL-EX-003",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-DST-1"), cavityIndex: 3 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-J1"), portIndex: 5 }
    }),
    appActions.saveWire({
      id: asWireId("W-VAL-EX-004"),
      name: "Validation Extra Actuator A-2",
      technicalId: "WIRE-VAL-EX-004",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-DST-1"), cavityIndex: 4 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-J1"), portIndex: 6 }
    }),
    appActions.saveWire({
      id: asWireId("W-VAL-EX-005"),
      name: "Validation Extra Branch B-1",
      technicalId: "WIRE-VAL-EX-005",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-DST-2"), cavityIndex: 3 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-J2"), portIndex: 2 }
    }),
    appActions.saveWire({
      id: asWireId("W-VAL-EX-006"),
      name: "Validation Extra Branch B-2",
      technicalId: "WIRE-VAL-EX-006",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-DST-2"), cavityIndex: 4 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-J2"), portIndex: 3 }
    }),
    appActions.occupyConnectorCavity(asConnectorId("C-SRC"), 6, "wire:ghost-wire:A"),
    appActions.occupySplicePort(asSpliceId("S-J2"), 4, "manual-validation-check"),
    appActions.upsertWire({
      id: asWireId("W-VAL-ERR-001"),
      name: "",
      technicalId: "WIRE-VAL-BROKEN",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-GHOST"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-J2"), portIndex: 4 },
      routeSegmentIds: [],
      lengthMm: 0,
      isRouteLocked: true
    })
  ].reduce(appReducer, base);
}
