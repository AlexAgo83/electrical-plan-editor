import type { ConnectorId, NetworkId, NodeId, SegmentId, SpliceId, WireId } from "../core/entities";
import { appActions, type AppAction } from "./actions";
import {
  buildChargingDemoCatalogActions,
  buildDoorDemoCatalogActions,
  chargingDemoCatalogIds,
  doorDemoCatalogIds
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

export function buildAdvancedSampleNetworkDemoActions(): AppAction[] {
  return [
    appActions.createNetwork(
      {
        id: asNetworkId("network-door-module-demo"),
        name: "Door module (Sample)",
        technicalId: "NET-DOOR-MODULE-SAMPLE",
        createdAt: "2026-02-24T09:12:00.000Z",
        updatedAt: "2026-02-24T09:12:00.000Z",
        description: "Door harness with body pass-through, door module, motor, mirror, speaker, and shared ground splice."
      },
      false
    ),
    appActions.selectNetwork(asNetworkId("network-door-module-demo")),
    ...buildDoorDemoCatalogActions(),
    appActions.upsertConnector({
      id: asConnectorId("D-C-BODY"),
      name: "Body Pass-through Connector",
      technicalId: "D-CONN-BODY",
      cavityCount: 12,
      isMainHarnessConnector: true,
      catalogItemId: doorDemoCatalogIds.bodyPassThrough12Way
    }),
    appActions.upsertConnector({
      id: asConnectorId("D-C-MOD"),
      name: "Door Control Module",
      technicalId: "D-CONN-MOD",
      cavityCount: 16,
      catalogItemId: doorDemoCatalogIds.doorModule16Way
    }),
    appActions.upsertConnector({
      id: asConnectorId("D-C-MOTOR"),
      name: "Window Motor Connector",
      technicalId: "D-CONN-MOTOR",
      cavityCount: 6,
      catalogItemId: doorDemoCatalogIds.motor6Way
    }),
    appActions.upsertConnector({
      id: asConnectorId("D-C-MIRROR"),
      name: "Mirror Connector",
      technicalId: "D-CONN-MIRROR",
      cavityCount: 8,
      catalogItemId: doorDemoCatalogIds.mirror8Way
    }),
    appActions.upsertConnector({
      id: asConnectorId("D-C-SPEAKER"),
      name: "Speaker Connector",
      technicalId: "D-CONN-SPK",
      cavityCount: 2,
      catalogItemId: doorDemoCatalogIds.speaker2Way
    }),
    appActions.upsertSplice({
      id: asSpliceId("D-S-GND"),
      name: "Door Ground Splice",
      technicalId: "D-SPL-GND",
      portCount: 6,
      catalogItemId: doorDemoCatalogIds.doorSplice6Port
    }),
    appActions.upsertNode({ id: asNodeId("D-N-BODY"), kind: "connector", connectorId: asConnectorId("D-C-BODY") }),
    appActions.upsertNode({ id: asNodeId("D-N-MOD"), kind: "connector", connectorId: asConnectorId("D-C-MOD") }),
    appActions.upsertNode({ id: asNodeId("D-N-MOTOR"), kind: "connector", connectorId: asConnectorId("D-C-MOTOR") }),
    appActions.upsertNode({ id: asNodeId("D-N-MIRROR"), kind: "connector", connectorId: asConnectorId("D-C-MIRROR") }),
    appActions.upsertNode({ id: asNodeId("D-N-SPEAKER"), kind: "connector", connectorId: asConnectorId("D-C-SPEAKER") }),
    appActions.upsertNode({ id: asNodeId("D-N-GND"), kind: "splice", spliceId: asSpliceId("D-S-GND") }),
    appActions.upsertNode({ id: asNodeId("D-N-HINGE"), kind: "intermediate", label: "Door hinge boot" }),
    appActions.upsertNode({ id: asNodeId("D-N-MIRROR-J"), kind: "intermediate", label: "Mirror branch" }),
    appActions.upsertSegment({ id: asSegmentId("D-SEG-001"), nodeA: asNodeId("D-N-BODY"), nodeB: asNodeId("D-N-HINGE"), lengthMm: 45, subNetworkTag: "DOOR_FEED" }),
    appActions.upsertSegment({ id: asSegmentId("D-SEG-002"), nodeA: asNodeId("D-N-HINGE"), nodeB: asNodeId("D-N-MOD"), lengthMm: 35, subNetworkTag: "DOOR_FEED" }),
    appActions.upsertSegment({ id: asSegmentId("D-SEG-003"), nodeA: asNodeId("D-N-MOD"), nodeB: asNodeId("D-N-MOTOR"), lengthMm: 28, subNetworkTag: "WINDOW" }),
    appActions.upsertSegment({ id: asSegmentId("D-SEG-004"), nodeA: asNodeId("D-N-MOD"), nodeB: asNodeId("D-N-MIRROR-J"), lengthMm: 18, subNetworkTag: "MIRROR" }),
    appActions.upsertSegment({ id: asSegmentId("D-SEG-005"), nodeA: asNodeId("D-N-MIRROR-J"), nodeB: asNodeId("D-N-MIRROR"), lengthMm: 24, subNetworkTag: "MIRROR" }),
    appActions.upsertSegment({ id: asSegmentId("D-SEG-006"), nodeA: asNodeId("D-N-MOD"), nodeB: asNodeId("D-N-GND"), lengthMm: 12, subNetworkTag: "GROUND" }),
    appActions.upsertSegment({ id: asSegmentId("D-SEG-007"), nodeA: asNodeId("D-N-MOD"), nodeB: asNodeId("D-N-SPEAKER"), lengthMm: 32, subNetworkTag: "AUDIO" }),
    appActions.saveWire({
      id: asWireId("D-W-001"),
      name: "Door Module Feed",
      technicalId: "D-WIRE-MOD-FEED",
      primaryColorId: "RD",
      secondaryColorId: "WH",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("D-C-BODY"), cavityIndex: 1 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("D-C-MOD"), cavityIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("D-W-002"),
      name: "Window Motor Up",
      technicalId: "D-WIRE-WIN-UP",
      primaryColorId: "BU",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("D-C-MOD"), cavityIndex: 3 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("D-C-MOTOR"), cavityIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("D-W-003"),
      name: "Mirror Fold Signal",
      technicalId: "D-WIRE-MIR-FOLD",
      primaryColorId: "VT",
      secondaryColorId: "WH",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("D-C-MOD"), cavityIndex: 5 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("D-C-MIRROR"), cavityIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("D-W-004"),
      name: "Speaker Positive",
      technicalId: "D-WIRE-SPK-P",
      primaryColorId: "BN",
      secondaryColorId: "WH",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("D-C-MOD"), cavityIndex: 7 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("D-C-SPEAKER"), cavityIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("D-W-005"),
      name: "Door Ground Return",
      technicalId: "D-WIRE-GND",
      primaryColorId: "BK",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("D-C-MOD"), cavityIndex: 10 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("D-S-GND"), portIndex: 1 }
    }),
    appActions.lockWireRoute(asWireId("D-W-003"), [asSegmentId("D-SEG-004"), asSegmentId("D-SEG-005")]),
    appActions.createNetwork(
      {
        id: asNetworkId("network-charging-service-demo"),
        name: "Charging service (Sample)",
        technicalId: "NET-CHARGING-SERVICE-SAMPLE",
        createdAt: "2026-02-24T09:16:00.000Z",
        updatedAt: "2026-02-24T09:16:00.000Z",
        description: "Charging and service interlock harness with charge inlet, OBC, DC/DC branch, and service disconnect."
      },
      false
    ),
    appActions.selectNetwork(asNetworkId("network-charging-service-demo")),
    ...buildChargingDemoCatalogActions(),
    appActions.upsertConnector({
      id: asConnectorId("H-C-INLET"),
      name: "Charge Inlet Connector",
      technicalId: "H-CONN-INLET",
      cavityCount: 8,
      isMainHarnessConnector: true,
      catalogItemId: chargingDemoCatalogIds.chargeInlet8Way
    }),
    appActions.upsertConnector({
      id: asConnectorId("H-C-OBC"),
      name: "On-board Charger Connector",
      technicalId: "H-CONN-OBC",
      cavityCount: 12,
      catalogItemId: chargingDemoCatalogIds.onboardCharger12Way
    }),
    appActions.upsertConnector({
      id: asConnectorId("H-C-DCDC"),
      name: "DC/DC Converter Connector",
      technicalId: "H-CONN-DCDC",
      cavityCount: 6,
      catalogItemId: chargingDemoCatalogIds.dcDc6Way
    }),
    appActions.upsertConnector({
      id: asConnectorId("H-C-SERVICE"),
      name: "Service Disconnect Connector",
      technicalId: "H-CONN-SVC",
      cavityCount: 4,
      catalogItemId: chargingDemoCatalogIds.serviceDisconnect4Way
    }),
    appActions.upsertSplice({
      id: asSpliceId("H-S-HVIL"),
      name: "HVIL Splice",
      technicalId: "H-SPL-HVIL",
      portCount: 4,
      portMode: "directional",
      catalogItemId: chargingDemoCatalogIds.hvInterlockSplice4Port
    }),
    appActions.upsertNode({ id: asNodeId("H-N-INLET"), kind: "connector", connectorId: asConnectorId("H-C-INLET") }),
    appActions.upsertNode({ id: asNodeId("H-N-OBC"), kind: "connector", connectorId: asConnectorId("H-C-OBC") }),
    appActions.upsertNode({ id: asNodeId("H-N-DCDC"), kind: "connector", connectorId: asConnectorId("H-C-DCDC") }),
    appActions.upsertNode({ id: asNodeId("H-N-SERVICE"), kind: "connector", connectorId: asConnectorId("H-C-SERVICE") }),
    appActions.upsertNode({ id: asNodeId("H-N-HVIL"), kind: "splice", spliceId: asSpliceId("H-S-HVIL") }),
    appActions.upsertNode({ id: asNodeId("H-N-TRUNK"), kind: "intermediate", label: "Charge trunk" }),
    appActions.upsertSegment({ id: asSegmentId("H-SEG-001"), nodeA: asNodeId("H-N-INLET"), nodeB: asNodeId("H-N-TRUNK"), lengthMm: 60, subNetworkTag: "AC_INPUT" }),
    appActions.upsertSegment({ id: asSegmentId("H-SEG-002"), nodeA: asNodeId("H-N-TRUNK"), nodeB: asNodeId("H-N-OBC"), lengthMm: 36, subNetworkTag: "AC_INPUT" }),
    appActions.upsertSegment({ id: asSegmentId("H-SEG-003"), nodeA: asNodeId("H-N-OBC"), nodeB: asNodeId("H-N-DCDC"), lengthMm: 42, subNetworkTag: "LV_SUPPLY" }),
    appActions.upsertSegment({ id: asSegmentId("H-SEG-004"), nodeA: asNodeId("H-N-OBC"), nodeB: asNodeId("H-N-HVIL"), lengthMm: 20, subNetworkTag: "HVIL" }),
    appActions.upsertSegment({ id: asSegmentId("H-SEG-005"), nodeA: asNodeId("H-N-HVIL"), nodeB: asNodeId("H-N-SERVICE"), lengthMm: 26, subNetworkTag: "HVIL" }),
    appActions.saveWire({
      id: asWireId("H-W-001"),
      name: "AC Pilot",
      technicalId: "H-WIRE-AC-PILOT",
      primaryColorId: "OG",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("H-C-INLET"), cavityIndex: 1 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("H-C-OBC"), cavityIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("H-W-002"),
      name: "Proximity Detect",
      technicalId: "H-WIRE-PROX",
      primaryColorId: "CY",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("H-C-INLET"), cavityIndex: 2 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("H-C-OBC"), cavityIndex: 2 }
    }),
    appActions.saveWire({
      id: asWireId("H-W-003"),
      name: "DC/DC Enable",
      technicalId: "H-WIRE-DCDC-EN",
      primaryColorId: "GN",
      secondaryColorId: "WH",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("H-C-OBC"), cavityIndex: 4 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("H-C-DCDC"), cavityIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("H-W-004"),
      name: "HVIL Loop",
      technicalId: "H-WIRE-HVIL",
      primaryColorId: "BD",
      secondaryColorId: "WH",
      endpointA: { kind: "splicePort", spliceId: asSpliceId("H-S-HVIL"), portIndex: 1 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("H-C-SERVICE"), cavityIndex: 1 }
    }),
    appActions.lockWireRoute(asWireId("H-W-004"), [asSegmentId("H-SEG-005")])
  ];
}
