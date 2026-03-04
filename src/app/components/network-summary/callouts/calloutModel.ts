import { CABLE_COLOR_BY_ID, getWireColorCode } from "../../../../core/cableColors";
import type {
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Splice,
  SpliceId,
  Wire
} from "../../../../core/entities";
import { resolveSplicePortMode } from "../../../../core/splicePortMode";
import type { NodePosition } from "../../../types/app-controller";
import {
  buildCalloutHeaderDisplay,
  type CableCalloutViewModel,
  type CalloutEntry,
  type CalloutGroup
} from "./calloutLayout";

interface CalloutTarget {
  targetId: string;
  targetPin: string;
}

interface WireColorSwatches {
  primaryHex: string | null;
  secondaryHex: string | null;
}

function describeWireEndpointForCallout(
  endpoint: Wire["endpointA"],
  connectorMap: Map<ConnectorId, Connector>,
  spliceMap: Map<SpliceId, Splice>
): CalloutTarget {
  if (endpoint.kind === "connectorCavity") {
    const connectorTechnicalId = connectorMap.get(endpoint.connectorId)?.technicalId ?? String(endpoint.connectorId);
    return {
      targetId: connectorTechnicalId,
      targetPin: `C${endpoint.cavityIndex}`
    };
  }
  const spliceTechnicalId = spliceMap.get(endpoint.spliceId)?.technicalId ?? String(endpoint.spliceId);
  return {
    targetId: spliceTechnicalId,
    targetPin: `P${endpoint.portIndex}`
  };
}

function resolveWireColorSwatches(wire: Wire): WireColorSwatches {
  const primaryId = wire.primaryColorId;
  if (primaryId === null) {
    return { primaryHex: null, secondaryHex: null };
  }
  const primaryHex = CABLE_COLOR_BY_ID[primaryId]?.hex ?? null;
  if (primaryHex === null) {
    return { primaryHex: null, secondaryHex: null };
  }
  const secondaryId = wire.secondaryColorId;
  return {
    primaryHex,
    secondaryHex: secondaryId === null ? null : CABLE_COLOR_BY_ID[secondaryId]?.hex ?? null
  };
}

function createCalloutEntry(
  wire: Wire,
  target: CalloutTarget,
  colorSwatches: WireColorSwatches
): CalloutEntry {
  return {
    wireId: wire.id,
    name: wire.name,
    technicalId: wire.technicalId,
    color: getWireColorCode(wire),
    colorPrimaryHex: colorSwatches.primaryHex,
    colorSecondaryHex: colorSwatches.secondaryHex,
    targetId: target.targetId,
    targetPin: target.targetPin,
    lengthMm: wire.lengthMm,
    sectionMm2: wire.sectionMm2
  };
}

function sortCalloutEntries(entries: CalloutEntry[]): void {
  entries.sort(
    (left, right) => left.name.localeCompare(right.name) || left.technicalId.localeCompare(right.technicalId)
  );
}

interface BuildCalloutGroupsOptions {
  connectorMap: Map<ConnectorId, Connector>;
  spliceMap: Map<SpliceId, Splice>;
  wires: Wire[];
}

export function buildConnectorCalloutGroupsById({
  connectorMap,
  spliceMap,
  wires
}: BuildCalloutGroupsOptions): Map<ConnectorId, CalloutGroup[]> {
  const map = new Map<ConnectorId, CalloutGroup[]>();
  for (const connector of connectorMap.values()) {
    const groups = Array.from({ length: Math.max(0, connector.cavityCount) }, (_, index) => ({
      key: `connector:${connector.id}:C${index + 1}`,
      label: `C${index + 1}`,
      entries: [] as CalloutEntry[]
    }));
    map.set(connector.id, groups);
  }

  for (const wire of wires) {
    const endpointPairs = [
      { localEndpoint: wire.endpointA, targetEndpoint: wire.endpointB },
      { localEndpoint: wire.endpointB, targetEndpoint: wire.endpointA }
    ] as const;
    for (const { localEndpoint, targetEndpoint } of endpointPairs) {
      if (localEndpoint.kind !== "connectorCavity") {
        continue;
      }
      const groups = map.get(localEndpoint.connectorId);
      if (groups === undefined || localEndpoint.cavityIndex < 1) {
        continue;
      }
      const groupIndex = localEndpoint.cavityIndex - 1;
      if (groupIndex >= groups.length) {
        continue;
      }
      const target = describeWireEndpointForCallout(targetEndpoint, connectorMap, spliceMap);
      const colorSwatches = resolveWireColorSwatches(wire);
      groups[groupIndex]?.entries.push(createCalloutEntry(wire, target, colorSwatches));
    }
  }

  for (const groups of map.values()) {
    for (const group of groups) {
      sortCalloutEntries(group.entries);
    }
  }

  return map;
}

export function buildSpliceCalloutGroupsById({
  connectorMap,
  spliceMap,
  wires
}: BuildCalloutGroupsOptions): Map<SpliceId, CalloutGroup[]> {
  const map = new Map<SpliceId, CalloutGroup[]>();
  const entriesBySpliceAndPort = new Map<SpliceId, Map<number, CalloutEntry[]>>();

  for (const wire of wires) {
    const endpointPairs = [
      { localEndpoint: wire.endpointA, targetEndpoint: wire.endpointB },
      { localEndpoint: wire.endpointB, targetEndpoint: wire.endpointA }
    ] as const;
    for (const { localEndpoint, targetEndpoint } of endpointPairs) {
      if (localEndpoint.kind !== "splicePort") {
        continue;
      }
      if (localEndpoint.portIndex < 1) {
        continue;
      }
      const splice = spliceMap.get(localEndpoint.spliceId);
      if (splice === undefined) {
        continue;
      }
      if (resolveSplicePortMode(splice) === "bounded" && localEndpoint.portIndex > splice.portCount) {
        continue;
      }
      let entriesByPort = entriesBySpliceAndPort.get(localEndpoint.spliceId);
      if (entriesByPort === undefined) {
        entriesByPort = new Map<number, CalloutEntry[]>();
        entriesBySpliceAndPort.set(localEndpoint.spliceId, entriesByPort);
      }
      const currentEntries = entriesByPort.get(localEndpoint.portIndex) ?? [];
      const target = describeWireEndpointForCallout(targetEndpoint, connectorMap, spliceMap);
      const colorSwatches = resolveWireColorSwatches(wire);
      currentEntries.push(createCalloutEntry(wire, target, colorSwatches));
      entriesByPort.set(localEndpoint.portIndex, currentEntries);
    }
  }

  for (const splice of spliceMap.values()) {
    const entriesByPort = entriesBySpliceAndPort.get(splice.id) ?? new Map<number, CalloutEntry[]>();
    const portIndexes =
      resolveSplicePortMode(splice) === "bounded"
        ? Array.from({ length: Math.max(0, splice.portCount) }, (_, index) => index + 1)
        : [...entriesByPort.keys()].sort((left, right) => left - right);
    const groups = portIndexes.map((portIndex) => ({
      key: `splice:${splice.id}:P${portIndex}`,
      label: `P${portIndex}`,
      entries: entriesByPort.get(portIndex) ?? []
    }));
    for (const group of groups) {
      sortCalloutEntries(group.entries);
    }
    map.set(splice.id, groups);
  }

  return map;
}

interface BuildCableCalloutViewModelsOptions {
  showCableCallouts: boolean;
  showSelectedCalloutOnly: boolean;
  nodes: NetworkNode[];
  networkNodePositions: Record<NodeId, NodePosition>;
  connectorMap: Map<ConnectorId, Connector>;
  spliceMap: Map<SpliceId, Splice>;
  connectorCalloutGroupsById: Map<ConnectorId, CalloutGroup[]>;
  spliceCalloutGroupsById: Map<SpliceId, CalloutGroup[]>;
  draftCalloutPositions: Record<string, NodePosition>;
  getDefaultCalloutPosition: (nodeId: NodeId, nodePosition: NodePosition) => NodePosition;
  isSubNetworkFilteringActive: boolean;
  nodeHasActiveSubNetworkConnection: Map<NodeId, boolean>;
  selectedConnectorId: ConnectorId | null;
  selectedSpliceId: SpliceId | null;
  selectedNodeId: NodeId | null;
}

function resolveSelectedCalloutKey({
  selectedConnectorId,
  selectedSpliceId,
  selectedNodeId,
  nodes
}: Pick<
  BuildCableCalloutViewModelsOptions,
  "selectedConnectorId" | "selectedSpliceId" | "selectedNodeId" | "nodes"
>): CableCalloutViewModel["key"] | null {
  let selectedCalloutKey =
    selectedConnectorId !== null
      ? (`connector:${selectedConnectorId}` as const)
      : selectedSpliceId !== null
        ? (`splice:${selectedSpliceId}` as const)
        : null;
  if (selectedCalloutKey === null && selectedNodeId !== null) {
    const selectedNode = nodes.find((entry) => entry.id === selectedNodeId);
    if (selectedNode?.kind === "connector") {
      selectedCalloutKey = `connector:${selectedNode.connectorId}` as const;
    } else if (selectedNode?.kind === "splice") {
      selectedCalloutKey = `splice:${selectedNode.spliceId}` as const;
    }
  }
  return selectedCalloutKey;
}

export function buildCableCalloutViewModels({
  showCableCallouts,
  showSelectedCalloutOnly,
  nodes,
  networkNodePositions,
  connectorMap,
  spliceMap,
  connectorCalloutGroupsById,
  spliceCalloutGroupsById,
  draftCalloutPositions,
  getDefaultCalloutPosition,
  isSubNetworkFilteringActive,
  nodeHasActiveSubNetworkConnection,
  selectedConnectorId,
  selectedSpliceId,
  selectedNodeId
}: BuildCableCalloutViewModelsOptions): CableCalloutViewModel[] {
  if (!showCableCallouts) {
    return [];
  }

  const models: CableCalloutViewModel[] = [];
  for (const node of nodes) {
    const nodePosition = networkNodePositions[node.id];
    if (nodePosition === undefined || (node.kind !== "connector" && node.kind !== "splice")) {
      continue;
    }

    if (node.kind === "connector") {
      const connector = connectorMap.get(node.connectorId);
      if (connector === undefined) {
        continue;
      }
      const key = `connector:${connector.id}` as const;
      const draftPosition = draftCalloutPositions[key];
      const persistedPosition = connector.cableCalloutPosition;
      const position = draftPosition ?? persistedPosition ?? getDefaultCalloutPosition(node.id, nodePosition);
      const groups = (connectorCalloutGroupsById.get(connector.id) ?? []).filter((group) => group.entries.length > 0);
      if (groups.length === 0) {
        continue;
      }
      const header = buildCalloutHeaderDisplay(connector.name, connector.technicalId);
      models.push({
        key,
        kind: "connector",
        entityId: connector.id,
        nodeId: node.id,
        nodePosition,
        position,
        title: header.title,
        subtitle: header.subtitle,
        groups,
        isDeemphasized: isSubNetworkFilteringActive && !(nodeHasActiveSubNetworkConnection.get(node.id) ?? false),
        isSelected: selectedConnectorId === connector.id
      });
      continue;
    }

    const splice = spliceMap.get(node.spliceId);
    if (splice === undefined) {
      continue;
    }
    const key = `splice:${splice.id}` as const;
    const draftPosition = draftCalloutPositions[key];
    const persistedPosition = splice.cableCalloutPosition;
    const position = draftPosition ?? persistedPosition ?? getDefaultCalloutPosition(node.id, nodePosition);
    const groups = (spliceCalloutGroupsById.get(splice.id) ?? []).filter((group) => group.entries.length > 0);
    if (groups.length === 0) {
      continue;
    }
    const header = buildCalloutHeaderDisplay(splice.name, splice.technicalId);
    models.push({
      key,
      kind: "splice",
      entityId: splice.id,
      nodeId: node.id,
      nodePosition,
      position,
      title: header.title,
      subtitle: header.subtitle,
      groups,
      isDeemphasized: isSubNetworkFilteringActive && !(nodeHasActiveSubNetworkConnection.get(node.id) ?? false),
      isSelected: selectedSpliceId === splice.id
    });
  }

  const sortedModels = models.sort(
    (left, right) => left.title.localeCompare(right.title) || left.subtitle.localeCompare(right.subtitle)
  );
  if (!showSelectedCalloutOnly) {
    return sortedModels;
  }

  const selectedCalloutKey = resolveSelectedCalloutKey({
    selectedConnectorId,
    selectedSpliceId,
    selectedNodeId,
    nodes
  });
  if (selectedCalloutKey === null) {
    return [];
  }

  const selectedCallout = sortedModels.find((entry) => entry.key === selectedCalloutKey);
  return selectedCallout === undefined ? [] : [selectedCallout];
}
