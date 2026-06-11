import type {
  ConnectorId,
  HarnessAssemblyId,
  InterHarnessConnectorLinkId,
  NetworkId,
  NodeId,
  SegmentId,
  SpliceId,
  WireId
} from "../core/entities";
import { appActions, type AppAction } from "./actions";
import { buildAdvancedSampleNetworkDemoActions } from "./sampleNetworkAdvancedDemos";
import {
  buildLightingDemoCatalogActions,
  buildSensorDemoCatalogActions,
  lightingDemoCatalogIds,
  sensorDemoCatalogIds
} from "./sampleNetworkCatalog";

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

function asHarnessAssemblyId(value: string): HarnessAssemblyId {
  return value as HarnessAssemblyId;
}

function asInterHarnessConnectorLinkId(value: string): InterHarnessConnectorLinkId {
  return value as InterHarnessConnectorLinkId;
}

export function buildAdditionalSampleNetworkDemoActions(): AppAction[] {
  return [
    appActions.createNetwork(
      {
        id: asNetworkId("network-lighting-demo"),
        name: "Lighting branch (Sample)",
        technicalId: "NET-LIGHTING-DEMO",
        createdAt: "2026-02-24T09:00:00.000Z",
        updatedAt: "2026-02-24T09:00:00.000Z",
        description: "Compact lighting split example with one source, one split splice, and two lamp branches."
      },
      false
    ),
    appActions.selectNetwork(asNetworkId("network-lighting-demo")),
    ...buildLightingDemoCatalogActions(),
    appActions.upsertConnector({
      id: asConnectorId("L-C-SRC"),
      name: "Lighting Source Connector",
      technicalId: "L-CONN-SRC",
      cavityCount: 6,
      isMainHarnessConnector: true,
      catalogItemId: lightingDemoCatalogIds.source6Way
    }),
    appActions.upsertConnector({
      id: asConnectorId("L-C-FRONT"),
      name: "Front Lamp Connector",
      technicalId: "L-CONN-FRONT",
      cavityCount: 4,
      catalogItemId: lightingDemoCatalogIds.lamp4Way
    }),
    appActions.upsertConnector({
      id: asConnectorId("L-C-REAR"),
      name: "Rear Lamp Connector",
      technicalId: "L-CONN-REAR",
      cavityCount: 4,
      catalogItemId: lightingDemoCatalogIds.lamp4Way
    }),
    appActions.upsertSplice({
      id: asSpliceId("L-S-SPLIT"),
      name: "Lighting Split Splice",
      technicalId: "L-SPL-SPLIT",
      portCount: 4,
      catalogItemId: lightingDemoCatalogIds.split4Port
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
      primaryColorId: "YE",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("L-C-SRC"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("L-S-SPLIT"), portIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("L-W-002"),
      name: "Front Lamp Feed",
      technicalId: "L-WIRE-FRONT",
      primaryColorId: "WH",
      secondaryColorId: "YE",
      endpointA: { kind: "splicePort", spliceId: asSpliceId("L-S-SPLIT"), portIndex: 2 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("L-C-FRONT"), cavityIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("L-W-003"),
      name: "Rear Lamp Feed",
      technicalId: "L-WIRE-REAR",
      primaryColorId: "OG",
      secondaryColorId: "WH",
      endpointA: { kind: "splicePort", spliceId: asSpliceId("L-S-SPLIT"), portIndex: 3 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("L-C-REAR"), cavityIndex: 1 }
    }),
    appActions.lockWireRoute(asWireId("L-W-003"), [asSegmentId("L-SEG-004")]),
    appActions.createNetwork(
      {
        id: asNetworkId("network-sensor-backbone-demo"),
        name: "Sensor backbone (Sample)",
        technicalId: "NET-SENSOR-BB-DEMO",
        createdAt: "2026-02-24T09:05:00.000Z",
        updatedAt: "2026-02-24T09:05:00.000Z",
        description: "Sensor backbone example with ECU fan-out and shared return splice."
      },
      false
    ),
    appActions.selectNetwork(asNetworkId("network-sensor-backbone-demo")),
    ...buildSensorDemoCatalogActions(),
    appActions.upsertConnector({
      id: asConnectorId("S-C-ECU"),
      name: "ECU Connector",
      technicalId: "S-CONN-ECU",
      cavityCount: 12,
      isMainHarnessConnector: true,
      catalogItemId: sensorDemoCatalogIds.ecu12Way
    }),
    appActions.upsertConnector({
      id: asConnectorId("S-C-A"),
      name: "Sensor A Connector",
      technicalId: "S-CONN-A",
      cavityCount: 4,
      catalogItemId: sensorDemoCatalogIds.sensor4Way
    }),
    appActions.upsertConnector({
      id: asConnectorId("S-C-B"),
      name: "Sensor B Connector",
      technicalId: "S-CONN-B",
      cavityCount: 4,
      catalogItemId: sensorDemoCatalogIds.sensor4Way
    }),
    appActions.upsertConnector({
      id: asConnectorId("S-C-C"),
      name: "Sensor C Connector",
      technicalId: "S-CONN-C",
      cavityCount: 4,
      catalogItemId: sensorDemoCatalogIds.sensor4Way
    }),
    appActions.upsertSplice({
      id: asSpliceId("S-S-GND"),
      name: "Sensor Ground Splice",
      technicalId: "S-SPL-GND",
      portCount: 6,
      catalogItemId: sensorDemoCatalogIds.groundSplice6Port
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
      primaryColorId: "BU",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("S-C-ECU"), cavityIndex: 1 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("S-C-A"), cavityIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("S-W-002"),
      name: "Sensor B Signal",
      technicalId: "S-WIRE-B-SIG",
      primaryColorId: "GN",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("S-C-ECU"), cavityIndex: 2 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("S-C-B"), cavityIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("S-W-003"),
      name: "Sensor C Signal",
      technicalId: "S-WIRE-C-SIG",
      primaryColorId: "VT",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("S-C-ECU"), cavityIndex: 3 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("S-C-C"), cavityIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("S-W-004"),
      name: "Sensor A Ground",
      technicalId: "S-WIRE-A-GND",
      primaryColorId: "BK",
      secondaryColorId: "BU",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("S-C-A"), cavityIndex: 2 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-S-GND"), portIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("S-W-005"),
      name: "Sensor B Ground",
      technicalId: "S-WIRE-B-GND",
      primaryColorId: "BK",
      secondaryColorId: "GN",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("S-C-B"), cavityIndex: 2 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-S-GND"), portIndex: 2 }
    }),
    appActions.saveWire({
      id: asWireId("S-W-006"),
      name: "Sensor C Ground",
      technicalId: "S-WIRE-C-GND",
      primaryColorId: "BK",
      secondaryColorId: "VT",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("S-C-C"), cavityIndex: 2 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-S-GND"), portIndex: 3 }
    }),
    ...buildAdvancedSampleNetworkDemoActions(),
    appActions.upsertHarnessAssembly({
      id: asHarnessAssemblyId("assembly-sample-vehicle-platform"),
      name: "Vehicle platform assembly (Sample)",
      technicalId: "ASM-SAMPLE-VEHICLE",
      members: [
        { networkId: asNetworkId("network-main"), color: "#2563eb" },
        { networkId: asNetworkId("network-lighting-demo"), color: "#f59e0b" },
        { networkId: asNetworkId("network-sensor-backbone-demo"), color: "#16a34a" },
        { networkId: asNetworkId("network-door-module-demo"), color: "#c2185b" },
        { networkId: asNetworkId("network-charging-service-demo"), color: "#dc2626" }
      ],
      masterConnectorRefs: [
        { networkId: asNetworkId("network-main"), connectorId: asConnectorId("C-SRC") },
        { networkId: asNetworkId("network-lighting-demo"), connectorId: asConnectorId("L-C-SRC") },
        { networkId: asNetworkId("network-sensor-backbone-demo"), connectorId: asConnectorId("S-C-ECU") },
        { networkId: asNetworkId("network-door-module-demo"), connectorId: asConnectorId("D-C-BODY") },
        { networkId: asNetworkId("network-charging-service-demo"), connectorId: asConnectorId("H-C-INLET") }
      ],
      connectorLinks: [
        {
          id: asInterHarnessConnectorLinkId("sample-link-main-lighting"),
          name: "Main to lighting feed",
          sourceNetworkId: asNetworkId("network-main"),
          sourceConnectorId: asConnectorId("C-DST-2"),
          targetNetworkId: asNetworkId("network-lighting-demo"),
          targetConnectorId: asConnectorId("L-C-SRC")
        },
        {
          id: asInterHarnessConnectorLinkId("sample-link-lighting-sensor"),
          name: "Lighting to sensor handoff",
          sourceNetworkId: asNetworkId("network-lighting-demo"),
          sourceConnectorId: asConnectorId("L-C-REAR"),
          targetNetworkId: asNetworkId("network-sensor-backbone-demo"),
          targetConnectorId: asConnectorId("S-C-ECU")
        },
        {
          id: asInterHarnessConnectorLinkId("sample-link-main-door"),
          name: "Main to door pass-through",
          sourceNetworkId: asNetworkId("network-main"),
          sourceConnectorId: asConnectorId("C-DST-1"),
          targetNetworkId: asNetworkId("network-door-module-demo"),
          targetConnectorId: asConnectorId("D-C-BODY")
        },
        {
          id: asInterHarnessConnectorLinkId("sample-link-main-charging"),
          name: "Main to charging service",
          sourceNetworkId: asNetworkId("network-main"),
          sourceConnectorId: asConnectorId("C-SRC"),
          targetNetworkId: asNetworkId("network-charging-service-demo"),
          targetConnectorId: asConnectorId("H-C-INLET")
        }
      ],
      createdAt: "2026-02-24T09:10:00.000Z",
      updatedAt: "2026-02-24T09:10:00.000Z"
    }),
    appActions.selectNetwork(asNetworkId("network-main"))
  ];
}
