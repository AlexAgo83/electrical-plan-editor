import { CABLE_COLOR_BY_ID, getWireColorCode } from "../../../../core/cableColors";
import type {
  Connector,
  ConnectorId,
  CatalogItem,
  NetworkNode,
  NodeId,
  Splice,
  SpliceId,
  Wire
} from "../../../../core/entities";
import { resolveEditedConnectorLayout } from "../../../../core/connectorLayout";
import { portIndexToSpliceSide } from "../../../../core/directionalSplice";
import { resolveSplicePortMode } from "../../../../core/splicePortMode";
import type { NetworkCalloutContentMode, NodePosition } from "../../../types/app-controller";
import type { RenderedFloatingSpliceModel } from "../graph/networkSummaryGraphModel";
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

/**
 * Display formatter for entity IDs shown in callouts. Defaults to identity so
 * callers that do not care about the network entity prefix keep canonical IDs.
 * Only emitted display cells (title, Wire ID, End ID) are formatted; callout
 * keys, selection targets, drag-position persistence, and grouping continue to
 * use canonical IDs.
 */
type FormatEntityId = (id: string) => string;

const identityFormatEntityId: FormatEntityId = (id) => id;

/**
 * Port label shown in callouts for a splice endpoint. Directional splices have
 * exactly two opposite ports, so they read as the side (L / R) the wire leaves
 * on; bounded/unbounded splices keep their numbered port label (P1, P2, ...).
 */
function describeSplicePortLabel(splice: Splice | undefined, portIndex: number): string {
  if (splice !== undefined && resolveSplicePortMode(splice) === "directional") {
    return portIndexToSpliceSide(portIndex);
  }
  return `P${portIndex}`;
}

interface WireColorSwatches {
  primaryHex: string | null;
  secondaryHex: string | null;
}

function describeWireEndpointForCallout(
  endpoint: Wire["endpointA"],
  connectorMap: Map<ConnectorId, Connector>,
  spliceMap: Map<SpliceId, Splice>,
  formatEntityId: FormatEntityId
): CalloutTarget {
  if (endpoint.kind === "connectorCavity") {
    const connectorTechnicalId = connectorMap.get(endpoint.connectorId)?.technicalId ?? String(endpoint.connectorId);
    return {
      targetId: formatEntityId(connectorTechnicalId),
      targetPin: `C${endpoint.cavityIndex}`
    };
  }
  const splice = spliceMap.get(endpoint.spliceId);
  const spliceTechnicalId = splice?.technicalId ?? String(endpoint.spliceId);
  return {
    targetId: formatEntityId(spliceTechnicalId),
    targetPin: describeSplicePortLabel(splice, endpoint.portIndex)
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
  colorSwatches: WireColorSwatches,
  formatEntityId: FormatEntityId
): CalloutEntry {
  return {
    wireId: wire.id,
    name: wire.name,
    technicalId: formatEntityId(wire.technicalId),
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
  formatEntityId?: FormatEntityId;
}

export function buildConnectorCalloutGroupsById({
  connectorMap,
  spliceMap,
  wires,
  formatEntityId = identityFormatEntityId
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
      const target = describeWireEndpointForCallout(targetEndpoint, connectorMap, spliceMap, formatEntityId);
      const colorSwatches = resolveWireColorSwatches(wire);
      groups[groupIndex]?.entries.push(createCalloutEntry(wire, target, colorSwatches, formatEntityId));
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
  wires,
  formatEntityId = identityFormatEntityId
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
      const target = describeWireEndpointForCallout(targetEndpoint, connectorMap, spliceMap, formatEntityId);
      const colorSwatches = resolveWireColorSwatches(wire);
      currentEntries.push(createCalloutEntry(wire, target, colorSwatches, formatEntityId));
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
      label: describeSplicePortLabel(splice, portIndex),
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
  calloutContentMode: NetworkCalloutContentMode;
  showSelectedCalloutOnly: boolean;
  nodes: NetworkNode[];
  networkNodePositions: Record<NodeId, NodePosition>;
  connectorMap: Map<ConnectorId, Connector>;
  catalogItems: CatalogItem[];
  spliceMap: Map<SpliceId, Splice>;
  connectorCalloutGroupsById: Map<ConnectorId, CalloutGroup[]>;
  spliceCalloutGroupsById: Map<SpliceId, CalloutGroup[]>;
  renderedFloatingSplices: RenderedFloatingSpliceModel[];
  draftCalloutPositions: Record<string, NodePosition>;
  getDefaultCalloutPosition: (nodeId: NodeId, nodePosition: NodePosition) => NodePosition;
  isSubNetworkFilteringActive: boolean;
  nodeHasActiveSubNetworkConnection: Map<NodeId, boolean>;
  selectedConnectorId: ConnectorId | null;
  selectedSpliceId: SpliceId | null;
  selectedNodeId: NodeId | null;
  formatEntityId?: FormatEntityId;
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
  calloutContentMode,
  showSelectedCalloutOnly,
  nodes,
  networkNodePositions,
  connectorMap,
  catalogItems,
  spliceMap,
  connectorCalloutGroupsById,
  spliceCalloutGroupsById,
  renderedFloatingSplices,
  draftCalloutPositions,
  getDefaultCalloutPosition,
  isSubNetworkFilteringActive,
  nodeHasActiveSubNetworkConnection,
  selectedConnectorId,
  selectedSpliceId,
  selectedNodeId,
  formatEntityId = identityFormatEntityId
}: BuildCableCalloutViewModelsOptions): CableCalloutViewModel[] {
  if (!showCableCallouts) {
    return [];
  }

  const shouldShowConnectorDrawing = calloutContentMode === "connectorDrawing" || calloutContentMode === "both";
  const catalogItemById = new Map(catalogItems.map((item) => [item.id, item] as const));
  const floatingSpliceById = new Map(
    renderedFloatingSplices.map((splice) => [splice.splice.id, splice] as const),
  );
  const spliceNodeBySpliceId = new Map(
    nodes
      .filter((node) => node.kind === "splice")
      .map((node) => [node.spliceId, node] as const),
  );
  const models: CableCalloutViewModel[] = [];
  for (const node of nodes) {
    const nodePosition = networkNodePositions[node.id];
    if (
      nodePosition === undefined ||
      node.kind !== "connector"
    ) {
      continue;
    }

    const connector = connectorMap.get(node.connectorId);
    if (connector === undefined) {
      continue;
    }
    const key = `connector:${connector.id}` as const;
    const draftPosition = draftCalloutPositions[key];
    const persistedPosition = connector.cableCalloutPosition;
    const position = draftPosition ?? persistedPosition ?? getDefaultCalloutPosition(node.id, nodePosition);
    const groups = (connectorCalloutGroupsById.get(connector.id) ?? []).filter((group) => group.entries.length > 0);
    if (groups.length === 0 && !shouldShowConnectorDrawing) {
      continue;
    }
    const catalogItem = connector.catalogItemId === undefined ? undefined : catalogItemById.get(connector.catalogItemId);
    const header = buildCalloutHeaderDisplay(
      connector.name,
      formatEntityId(connector.technicalId),
      connector.technicalId,
    );
    const connectorReferenceValue = connector.manufacturerReference?.trim() ?? "";
    const connectorReference = connectorReferenceValue.length > 0 ? `ref : ${connectorReferenceValue}` : "";
    models.push({
      key,
      kind: "connector",
      entityId: connector.id,
      nodeId: node.id,
      nodePosition,
      position,
      title: header.title,
      subtitle: connectorReference.length > 0 ? connectorReference : header.subtitle,
      connectorLayout: shouldShowConnectorDrawing
        ? resolveEditedConnectorLayout(catalogItem?.connectorLayout, connector.cavityCount)
        : undefined,
      groups,
      isDeemphasized: isSubNetworkFilteringActive && !(nodeHasActiveSubNetworkConnection.get(node.id) ?? false),
      isSelected: selectedConnectorId === connector.id
    });
  }

  for (const splice of spliceMap.values()) {
    const floatingSplice = floatingSpliceById.get(splice.id);
    const spliceNode = spliceNodeBySpliceId.get(splice.id);
    const calloutAnchor =
      floatingSplice !== undefined
        ? {
            nodeId: floatingSplice.hostNodeId,
            nodePosition: floatingSplice.anchorPosition,
            isDeemphasized: floatingSplice.isSubNetworkDeemphasized,
          }
        : spliceNode !== undefined
          ? {
              nodeId: spliceNode.id,
              nodePosition: networkNodePositions[spliceNode.id],
              isDeemphasized:
                isSubNetworkFilteringActive &&
                !(nodeHasActiveSubNetworkConnection.get(spliceNode.id) ?? false),
            }
          : null;
    if (calloutAnchor === null || calloutAnchor.nodePosition === undefined) {
      continue;
    }

    const key = `splice:${splice.id}` as const;
    const draftPosition = draftCalloutPositions[key];
    const persistedPosition = splice.cableCalloutPosition;
    const position =
      draftPosition ??
      persistedPosition ??
      getDefaultCalloutPosition(
        calloutAnchor.nodeId,
        calloutAnchor.nodePosition,
      );
    const groups = (spliceCalloutGroupsById.get(splice.id) ?? []).filter(
      (group) => group.entries.length > 0,
    );
    if (groups.length === 0) {
      continue;
    }
    const header = buildCalloutHeaderDisplay(
      splice.name,
      formatEntityId(splice.technicalId),
      splice.technicalId,
    );
    const spliceReferenceValue = splice.manufacturerReference?.trim() ?? "";
    const spliceReference = spliceReferenceValue.length > 0 ? `ref : ${spliceReferenceValue}` : "";
    models.push({
      key,
      kind: "splice",
      entityId: splice.id,
      nodeId: calloutAnchor.nodeId,
      nodePosition: calloutAnchor.nodePosition,
      position,
      title: header.title,
      subtitle: spliceReference.length > 0 ? spliceReference : header.subtitle,
      groups,
      isDeemphasized: calloutAnchor.isDeemphasized,
      isSelected: selectedSpliceId === splice.id,
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
