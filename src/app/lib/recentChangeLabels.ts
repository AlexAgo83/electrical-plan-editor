import type {
  CatalogItemId,
  ConnectorId,
  HarnessAssemblyId,
  NetworkId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  SpliceId,
  WireEndpoint,
  WireId
} from "../../core/entities";
import type { AppAction } from "../../store/actions";
import type { AppState } from "../../store/types";
import type { ScreenId, SubScreenId, UndoHistoryEntry, UndoHistoryTargetKind } from "../types/app-controller";

interface RecentChangeNavigationTarget {
  navigationScreen: ScreenId;
  navigationSubScreen?: SubScreenId;
  navigationSelectionKind?: UndoHistoryEntry["navigationSelectionKind"];
  navigationSelectionId?: string;
}

function targetKindLabel(kind: UndoHistoryTargetKind): string {
  switch (kind) {
    case "network":
      return "Network";
    case "catalog":
      return "Catalog item";
    case "connector":
      return "Connector";
    case "splice":
      return "Splice";
    case "node":
      return "Node";
    case "segment":
      return "Segment";
    case "wire":
      return "Wire";
    case "layout":
      return "Layout";
    case "workspace":
      return "Workspace";
  }
}

function normalizeDisplayText(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function preferDisplayText(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const normalized = normalizeDisplayText(value);
    if (normalized !== null) {
      return normalized;
    }
  }

  return null;
}

function isLikelyOpaqueSystemId(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 16) {
    return false;
  }

  const hexish = /^[0-9a-f-]+$/i.test(trimmed);
  const hyphenCount = trimmed.split("-").length - 1;
  return hexish && hyphenCount >= 2;
}

function toTargetKind(actionType: AppAction["type"] | "history/replaceState"): UndoHistoryTargetKind {
  const prefix = actionType.split("/")[0];
  switch (prefix) {
    case "network":
    case "catalog":
    case "connector":
    case "splice":
    case "node":
    case "segment":
    case "wire":
    case "layout":
      return prefix;
    default:
      return "workspace";
  }
}

function resolveNetworkDisplayRef(state: AppState, networkId: NetworkId | null): string | null {
  if (networkId === null) {
    return null;
  }

  const network = state.networks.byId[networkId];
  return preferDisplayText(network?.technicalId, network?.name);
}

function resolveHarnessAssemblyDisplayRef(state: AppState, assemblyId: string | null): string | null {
  if (assemblyId === null) {
    return null;
  }

  const assembly = state.harnessAssemblies.byId[assemblyId as HarnessAssemblyId];
  return preferDisplayText(assembly?.technicalId, assembly?.name);
}

function resolveCatalogDisplayRef(state: AppState, catalogItemId: CatalogItemId | null): string | null {
  if (catalogItemId === null) {
    return null;
  }

  const item = state.catalogItems.byId[catalogItemId];
  return preferDisplayText(item?.manufacturerReference, item?.name);
}

function resolveConnectorDisplayRef(state: AppState, connectorId: ConnectorId | null): string | null {
  if (connectorId === null) {
    return null;
  }

  const connector = state.connectors.byId[connectorId];
  return preferDisplayText(connector?.technicalId, connector?.name);
}

function resolveSpliceDisplayRef(state: AppState, spliceId: SpliceId | null): string | null {
  if (spliceId === null) {
    return null;
  }

  const splice = state.splices.byId[spliceId];
  return preferDisplayText(splice?.technicalId, splice?.name);
}

function resolveWireDisplayRef(state: AppState, wireId: WireId | null): string | null {
  if (wireId === null) {
    return null;
  }

  const wire = state.wires.byId[wireId];
  return preferDisplayText(wire?.technicalId, wire?.name);
}

function resolveNodeDisplayRefFromNode(state: AppState, node: NetworkNode | undefined): string | null {
  if (node === undefined) {
    return null;
  }

  switch (node.kind) {
    case "connector":
      return resolveConnectorDisplayRef(state, node.connectorId);
    case "splice":
      return resolveSpliceDisplayRef(state, node.spliceId);
    case "intermediate":
      return normalizeDisplayText(node.label);
  }
}

function resolveNodeDisplayRef(state: AppState, nodeId: NodeId | null): string | null {
  if (nodeId === null) {
    return null;
  }

  return resolveNodeDisplayRefFromNode(state, state.nodes.byId[nodeId]);
}

function resolveEndpointDisplayRef(state: AppState, endpoint: WireEndpoint): string | null {
  switch (endpoint.kind) {
    case "connectorCavity": {
      const connectorRef = resolveConnectorDisplayRef(state, endpoint.connectorId);
      return connectorRef === null ? null : `${connectorRef}:${endpoint.cavityIndex + 1}`;
    }
    case "splicePort": {
      const spliceRef = resolveSpliceDisplayRef(state, endpoint.spliceId);
      return spliceRef === null ? null : `${spliceRef}:${endpoint.portIndex + 1}`;
    }
  }
}

function resolveSegmentDisplayRefFromSegment(state: AppState, segment: Segment | undefined): string | null {
  if (segment === undefined) {
    return null;
  }

  const explicitId = normalizeDisplayText(segment.id);
  if (explicitId !== null && !isLikelyOpaqueSystemId(explicitId)) {
    return explicitId;
  }

  const endpointA = resolveNodeDisplayRef(state, segment.nodeA);
  const endpointB = resolveNodeDisplayRef(state, segment.nodeB);
  if (endpointA !== null && endpointB !== null) {
    return `${endpointA} -> ${endpointB}`;
  }

  return preferDisplayText(endpointA, endpointB);
}

function resolveSegmentDisplayRef(state: AppState, segmentId: SegmentId | null): string | null {
  if (segmentId === null) {
    return null;
  }

  return resolveSegmentDisplayRefFromSegment(state, state.segments.byId[segmentId]);
}

function actionVerb(action: AppAction, previousState: AppState): string {
  switch (action.type) {
    case "network/create":
      return "created";
    case "network/select":
      return "activated";
    case "network/setSummaryViewState":
      return "view updated";
    case "network/rename":
      return "renamed";
    case "network/update":
      return "updated";
    case "network/duplicate":
      return "duplicated";
    case "network/delete":
      return "deleted";
    case "network/importMany":
      return "imported";
    case "harnessAssembly/upsert":
      return previousState.harnessAssemblies.byId[action.payload.id] === undefined ? "created" : "updated";
    case "harnessAssembly/remove":
      return "deleted";
    case "catalog/upsert":
      return previousState.catalogItems.byId[action.payload.id] === undefined ? "created" : "updated";
    case "catalog/remove":
      return "deleted";
    case "connector/upsert":
      return previousState.connectors.byId[action.payload.id] === undefined ? "created" : "updated";
    case "connector/remove":
    case "connector/removeCascade":
      return "deleted";
    case "connector/occupyCavity":
      return "cavity occupied";
    case "connector/releaseCavity":
      return "cavity released";
    case "splice/upsert":
      return previousState.splices.byId[action.payload.id] === undefined ? "created" : "updated";
    case "splice/convertToDirectional":
      return "converted";
    case "splice/rerouteConnectedWires":
      return "rerouted";
    case "splice/applyOptimizedPlacement":
      return "lengths optimized";
    case "splice/remove":
    case "splice/removeCascade":
      return "deleted";
    case "splice/occupyPort":
      return "port occupied";
    case "splice/releasePort":
      return "port released";
    case "node/upsert":
      return previousState.nodes.byId[action.payload.id] === undefined ? "created" : "updated";
    case "node/rename":
      return "renamed";
    case "node/remove":
      return "deleted";
    case "segment/upsert":
      return previousState.segments.byId[action.payload.id] === undefined ? "created" : "updated";
    case "segment/rename":
      return "renamed";
    case "segment/remove":
      return "deleted";
    case "wire/save":
      return previousState.wires.byId[action.payload.id] === undefined ? "created" : "updated";
    case "wire/lockRoute":
      return "route locked";
    case "wire/resetRoute":
      return "route reset";
    case "wire/upsert":
      return previousState.wires.byId[action.payload.id] === undefined ? "created" : "updated";
    case "wire/remove":
      return "deleted";
    case "layout/setNodePosition":
    case "layout/setNodePositions":
      return "updated";
    case "ui/select":
    case "ui/setError":
    case "ui/setThemeMode":
    case "ui/clearSelection":
    case "ui/clearError":
      return "updated";
  }
}

function resolveEntryNetworkId(action: AppAction, previousState: AppState, nextState: AppState) {
  switch (action.type) {
    case "network/create":
      return action.payload.network.id;
    case "network/select":
    case "network/setSummaryViewState":
    case "network/rename":
    case "network/update":
    case "network/delete":
      return action.payload.id;
    case "network/duplicate":
      return action.payload.network.id;
    case "network/importMany":
      return nextState.activeNetworkId ?? previousState.activeNetworkId;
    case "harnessAssembly/upsert":
    case "harnessAssembly/remove":
      return previousState.activeNetworkId;
    default:
      return previousState.activeNetworkId;
  }
}

function resolveDisplayRef(action: AppAction, previousState: AppState, nextState: AppState): string | null {
  switch (action.type) {
    case "network/create":
      return preferDisplayText(action.payload.network.technicalId, action.payload.network.name);
    case "network/select":
    case "network/setSummaryViewState":
    case "network/rename":
    case "network/update":
    case "network/delete":
      return preferDisplayText(
        resolveNetworkDisplayRef(nextState, action.payload.id),
        resolveNetworkDisplayRef(previousState, action.payload.id)
      );
    case "network/duplicate":
      return preferDisplayText(action.payload.network.technicalId, action.payload.network.name);
    case "network/importMany":
      return `${action.payload.networks.length} network(s)`;
    case "harnessAssembly/upsert":
      return preferDisplayText(
        resolveHarnessAssemblyDisplayRef(nextState, action.payload.id),
        action.payload.technicalId,
        action.payload.name,
        resolveHarnessAssemblyDisplayRef(previousState, action.payload.id)
      );
    case "harnessAssembly/remove":
      return resolveHarnessAssemblyDisplayRef(previousState, action.payload.id);
    case "catalog/upsert":
      return preferDisplayText(
        resolveCatalogDisplayRef(nextState, action.payload.id),
        action.payload.manufacturerReference,
        action.payload.name,
        resolveCatalogDisplayRef(previousState, action.payload.id)
      );
    case "catalog/remove":
      return resolveCatalogDisplayRef(previousState, action.payload.id);
    case "connector/upsert":
      return preferDisplayText(
        resolveConnectorDisplayRef(nextState, action.payload.id),
        action.payload.technicalId,
        action.payload.name,
        resolveConnectorDisplayRef(previousState, action.payload.id)
      );
    case "connector/remove":
    case "connector/removeCascade":
      return resolveConnectorDisplayRef(previousState, action.payload.id);
    case "connector/occupyCavity":
    case "connector/releaseCavity": {
      const connectorRef = preferDisplayText(
        resolveConnectorDisplayRef(nextState, action.payload.connectorId),
        resolveConnectorDisplayRef(previousState, action.payload.connectorId)
      );
      return connectorRef === null ? null : `${connectorRef}:${action.payload.cavityIndex + 1}`;
    }
    case "splice/upsert":
      return preferDisplayText(
        resolveSpliceDisplayRef(nextState, action.payload.id),
        action.payload.technicalId,
        action.payload.name,
        resolveSpliceDisplayRef(previousState, action.payload.id)
      );
    case "splice/convertToDirectional":
    case "splice/rerouteConnectedWires":
    case "splice/applyOptimizedPlacement":
      return preferDisplayText(
        resolveSpliceDisplayRef(nextState, action.payload.id),
        resolveSpliceDisplayRef(previousState, action.payload.id)
      );
    case "splice/remove":
    case "splice/removeCascade":
      return resolveSpliceDisplayRef(previousState, action.payload.id);
    case "splice/occupyPort":
    case "splice/releasePort": {
      const spliceRef = preferDisplayText(
        resolveSpliceDisplayRef(nextState, action.payload.spliceId),
        resolveSpliceDisplayRef(previousState, action.payload.spliceId)
      );
      return spliceRef === null ? null : `${spliceRef}:${action.payload.portIndex + 1}`;
    }
    case "node/upsert":
      return preferDisplayText(
        resolveNodeDisplayRef(nextState, action.payload.id),
        resolveNodeDisplayRef(previousState, action.payload.id)
      );
    case "node/rename":
      return preferDisplayText(
        resolveNodeDisplayRef(nextState, action.payload.toId),
        resolveNodeDisplayRef(previousState, action.payload.fromId)
      );
    case "node/remove":
      return resolveNodeDisplayRef(previousState, action.payload.id);
    case "segment/upsert":
      return preferDisplayText(
        resolveSegmentDisplayRef(nextState, action.payload.id),
        resolveSegmentDisplayRef(previousState, action.payload.id)
      );
    case "segment/rename":
      return preferDisplayText(
        resolveSegmentDisplayRef(nextState, action.payload.toId),
        resolveSegmentDisplayRef(previousState, action.payload.fromId)
      );
    case "segment/remove":
      return resolveSegmentDisplayRef(previousState, action.payload.id);
    case "wire/save":
      return preferDisplayText(
        resolveWireDisplayRef(nextState, action.payload.id),
        action.payload.technicalId,
        action.payload.name,
        resolveWireDisplayRef(previousState, action.payload.id)
      );
    case "wire/lockRoute":
    case "wire/resetRoute":
      return preferDisplayText(
        resolveWireDisplayRef(nextState, action.payload.id),
        resolveWireDisplayRef(previousState, action.payload.id)
      );
    case "wire/upsert":
      return preferDisplayText(
        resolveWireDisplayRef(nextState, action.payload.id),
        action.payload.technicalId,
        action.payload.name,
        resolveWireDisplayRef(previousState, action.payload.id)
      );
    case "wire/remove":
      return resolveWireDisplayRef(previousState, action.payload.id);
    case "layout/setNodePosition":
      return preferDisplayText(
        resolveNodeDisplayRef(nextState, action.payload.nodeId),
        resolveNodeDisplayRef(previousState, action.payload.nodeId)
      );
    case "layout/setNodePositions":
      return `${Object.keys(action.payload.positions).length} node(s)`;
    case "ui/select":
    case "ui/setError":
    case "ui/setThemeMode":
    case "ui/clearSelection":
    case "ui/clearError":
      return null;
  }
}

function buildLabelRoot(targetKind: UndoHistoryTargetKind, displayRef: string | null): string {
  if (displayRef === null) {
    return targetKindLabel(targetKind);
  }

  return `${targetKindLabel(targetKind)} '${displayRef}'`;
}

function stableSerialize(value: unknown): string {
  return JSON.stringify(value ?? null);
}

function valuesDiffer(left: unknown, right: unknown): boolean {
  return stableSerialize(left) !== stableSerialize(right);
}

function joinChangeDetails(details: string[]): string | null {
  if (details.length === 0) {
    return null;
  }

  return details.slice(0, 3).join(" / ");
}

function describeCatalogChange(action: Extract<AppAction, { type: "catalog/upsert" }>, previousState: AppState): string | null {
  const previousItem = previousState.catalogItems.byId[action.payload.id];
  if (previousItem === undefined) {
    return `${action.payload.connectionCount}-connection item`;
  }

  const details: string[] = [];
  if (previousItem.manufacturerReference !== action.payload.manufacturerReference || previousItem.name !== action.payload.name) {
    details.push("Identity");
  }
  if (previousItem.connectionCount !== action.payload.connectionCount) {
    details.push("Connection count");
  }
  if (previousItem.unitPriceExclTax !== action.payload.unitPriceExclTax) {
    details.push("Pricing");
  }
  if (previousItem.url !== action.payload.url) {
    details.push("Supplier link");
  }
  if (valuesDiffer(previousItem.additionalAccessories, action.payload.additionalAccessories)) {
    details.push("Accessories");
  }
  if (valuesDiffer(previousItem.connectorDefaults, action.payload.connectorDefaults)) {
    details.push("Terminal defaults");
  }
  if (valuesDiffer(previousItem.connectorLayout, action.payload.connectorLayout)) {
    details.push("Physical layout");
  }

  return joinChangeDetails(details) ?? "No field delta";
}

function describeNetworkChange(action: Extract<AppAction, { type: "network/update" }>, previousState: AppState): string | null {
  const previousNetwork = previousState.networks.byId[action.payload.id];
  if (previousNetwork === undefined) {
    return null;
  }

  const details: string[] = [];
  if (previousNetwork.technicalId !== action.payload.technicalId || previousNetwork.name !== action.payload.name) {
    details.push("Identity");
  }
  if (previousNetwork.description !== action.payload.description || previousNetwork.author !== action.payload.author) {
    details.push("Metadata");
  }
  if (previousNetwork.projectCode !== action.payload.projectCode || previousNetwork.exportNotes !== action.payload.exportNotes) {
    details.push("Export cartouche");
  }
  if (previousNetwork.logoUrl !== action.payload.logoUrl) {
    details.push("Logo");
  }
  if (previousNetwork.voltageV !== action.payload.voltageV) {
    details.push("Voltage");
  }

  return joinChangeDetails(details) ?? "No field delta";
}

function describeHarnessAssemblyChange(action: Extract<AppAction, { type: "harnessAssembly/upsert" }>, previousState: AppState): string | null {
  const previousAssembly = previousState.harnessAssemblies.byId[action.payload.id];
  if (previousAssembly === undefined) {
    return `${action.payload.members.length} member network(s)`;
  }

  const details: string[] = [];
  if (previousAssembly.technicalId !== action.payload.technicalId || previousAssembly.name !== action.payload.name) {
    details.push("Identity");
  }
  if (valuesDiffer(previousAssembly.members, action.payload.members)) {
    details.push("Members");
  }
  if (valuesDiffer(previousAssembly.masterConnectorRefs, action.payload.masterConnectorRefs)) {
    details.push("Master connectors");
  }
  if (valuesDiffer(previousAssembly.connectorLinks, action.payload.connectorLinks)) {
    details.push("Connector links");
  }

  return joinChangeDetails(details) ?? "No field delta";
}

function describeConnectorChange(action: Extract<AppAction, { type: "connector/upsert" }>, previousState: AppState): string | null {
  const previousConnector = previousState.connectors.byId[action.payload.id];
  if (previousConnector === undefined) {
    return `${action.payload.cavityCount}-cavity connector`;
  }

  const details: string[] = [];
  if (previousConnector.technicalId !== action.payload.technicalId || previousConnector.name !== action.payload.name) {
    details.push("Identity");
  }
  if (previousConnector.cavityCount !== action.payload.cavityCount) {
    details.push("Cavity count");
  }
  if (
    previousConnector.catalogItemId !== action.payload.catalogItemId ||
    previousConnector.manufacturerReference !== action.payload.manufacturerReference
  ) {
    details.push("Catalog link");
  }
  if (
    previousConnector.isMainHarnessConnector !== action.payload.isMainHarnessConnector ||
    previousConnector.isTerminalConnector !== action.payload.isTerminalConnector
  ) {
    details.push("Harness role");
  }
  if (
    previousConnector.applyCatalogPlugs !== action.payload.applyCatalogPlugs ||
    previousConnector.applyCatalogSeals !== action.payload.applyCatalogSeals ||
    valuesDiffer(previousConnector.terminalOverrides, action.payload.terminalOverrides)
  ) {
    details.push("Terminal defaults");
  }
  if (valuesDiffer(previousConnector.cableCalloutPosition, action.payload.cableCalloutPosition)) {
    details.push("Callout position");
  }

  return joinChangeDetails(details) ?? "No field delta";
}

function describeSpliceChange(action: Extract<AppAction, { type: "splice/upsert" }>, previousState: AppState): string | null {
  const previousSplice = previousState.splices.byId[action.payload.id];
  if (previousSplice === undefined) {
    return `${action.payload.portCount}-port splice`;
  }

  const details: string[] = [];
  if (previousSplice.technicalId !== action.payload.technicalId || previousSplice.name !== action.payload.name) {
    details.push("Identity");
  }
  if (previousSplice.portCount !== action.payload.portCount) {
    details.push("Port count");
  }
  if (previousSplice.portMode !== action.payload.portMode || previousSplice.sideInverted !== action.payload.sideInverted) {
    details.push("Port mode");
  }
  if (
    previousSplice.catalogItemId !== action.payload.catalogItemId ||
    previousSplice.manufacturerReference !== action.payload.manufacturerReference
  ) {
    details.push("Catalog link");
  }
  if (valuesDiffer(previousSplice.cableCalloutPosition, action.payload.cableCalloutPosition)) {
    details.push("Callout position");
  }

  return joinChangeDetails(details) ?? "No field delta";
}

function describeWireChange(
  action: Extract<AppAction, { type: "wire/save" }> | Extract<AppAction, { type: "wire/upsert" }>,
  previousState: AppState
): string | null {
  const previousWire = previousState.wires.byId[action.payload.id];
  if (previousWire === undefined) {
    const endpointA = resolveEndpointDisplayRef(previousState, action.payload.endpointA);
    const endpointB = resolveEndpointDisplayRef(previousState, action.payload.endpointB);
    return endpointA !== null && endpointB !== null ? `${endpointA} -> ${endpointB}` : "New wire";
  }

  const details: string[] = [];
  if (previousWire.technicalId !== action.payload.technicalId || previousWire.name !== action.payload.name) {
    details.push("Identity");
  }
  if (valuesDiffer(previousWire.endpointA, action.payload.endpointA) || valuesDiffer(previousWire.endpointB, action.payload.endpointB)) {
    details.push("Endpoints");
  }
  if (
    previousWire.sectionMm2 !== action.payload.sectionMm2 ||
    previousWire.currentA !== action.payload.currentA ||
    previousWire.material !== action.payload.material
  ) {
    details.push("Electrical spec");
  }
  if (
    previousWire.colorMode !== action.payload.colorMode ||
    previousWire.primaryColorId !== action.payload.primaryColorId ||
    previousWire.secondaryColorId !== action.payload.secondaryColorId ||
    previousWire.freeColorLabel !== action.payload.freeColorLabel
  ) {
    details.push("Color");
  }
  if (
    previousWire.endpointAConnectionReference !== action.payload.endpointAConnectionReference ||
    previousWire.endpointAConnectionName !== action.payload.endpointAConnectionName ||
    previousWire.endpointASealReference !== action.payload.endpointASealReference ||
    previousWire.endpointASealName !== action.payload.endpointASealName ||
    previousWire.endpointBConnectionReference !== action.payload.endpointBConnectionReference ||
    previousWire.endpointBConnectionName !== action.payload.endpointBConnectionName ||
    previousWire.endpointBSealReference !== action.payload.endpointBSealReference ||
    previousWire.endpointBSealName !== action.payload.endpointBSealName
  ) {
    details.push("Terminations");
  }
  if (previousWire.twistGroupLabel !== action.payload.twistGroupLabel || previousWire.functionalDomainTag !== action.payload.functionalDomainTag) {
    details.push("Tags");
  }
  if (valuesDiffer(previousWire.protection, action.payload.protection)) {
    details.push("Protection");
  }
  if ("routeSegmentIds" in action.payload && valuesDiffer(previousWire.routeSegmentIds, action.payload.routeSegmentIds)) {
    details.push("Route");
  }

  return joinChangeDetails(details) ?? "No field delta";
}

function describeRecentChangeDetail(action: AppAction, previousState: AppState): string | null {
  switch (action.type) {
    case "network/update":
      return describeNetworkChange(action, previousState);
    case "harnessAssembly/upsert":
      return describeHarnessAssemblyChange(action, previousState);
    case "catalog/upsert":
      return describeCatalogChange(action, previousState);
    case "connector/upsert":
      return describeConnectorChange(action, previousState);
    case "splice/upsert":
      return describeSpliceChange(action, previousState);
    case "wire/save":
    case "wire/upsert":
      return describeWireChange(action, previousState);
    case "network/importMany":
      return action.payload.overwriteNetworkIds !== undefined && action.payload.overwriteNetworkIds.length > 0
        ? "Import with overwrite"
        : "Import new networks";
    case "connector/removeCascade":
    case "splice/removeCascade":
      return "Cascade delete";
    case "splice/applyOptimizedPlacement":
      return `${Object.keys(action.payload.segmentLengths).length} segment length(s)`;
    case "layout/setNodePositions":
      return `${Object.keys(action.payload.positions).length} node position(s)`;
    case "wire/lockRoute":
      return `${action.payload.segmentIds.length} segment route`;
    default:
      return null;
  }
}

function buildRecentChangeLabel(targetKind: UndoHistoryTargetKind, displayRef: string | null, verb: string, detailLabel: string | null): string {
  const root = buildLabelRoot(targetKind, displayRef);
  if (verb === "updated" && detailLabel !== null && detailLabel !== "No field delta") {
    return `${root} ${detailLabel.toLowerCase()} updated`;
  }

  return `${root} ${verb}`;
}

function buildSelectionNavigationTarget(
  navigationSubScreen: SubScreenId,
  navigationSelectionKind: NonNullable<UndoHistoryEntry["navigationSelectionKind"]>,
  navigationSelectionId: string
): RecentChangeNavigationTarget {
  return {
    navigationScreen: "modeling",
    navigationSubScreen,
    navigationSelectionKind,
    navigationSelectionId
  };
}

function resolveNavigationTarget(action: AppAction): RecentChangeNavigationTarget | null {
  switch (action.type) {
    case "network/create":
      return { navigationScreen: "networkScope", navigationSelectionId: action.payload.network.id };
    case "network/select":
    case "network/setSummaryViewState":
    case "network/rename":
    case "network/update":
      return { navigationScreen: "networkScope", navigationSelectionId: action.payload.id };
    case "network/duplicate":
      return { navigationScreen: "networkScope", navigationSelectionId: action.payload.network.id };
    case "harnessAssembly/upsert":
      return { navigationScreen: "harnessAssembly", navigationSelectionId: action.payload.id };
    case "catalog/upsert":
      return buildSelectionNavigationTarget("catalog", "catalog", action.payload.id);
    case "connector/upsert":
      return buildSelectionNavigationTarget("connector", "connector", action.payload.id);
    case "connector/occupyCavity":
    case "connector/releaseCavity":
      return buildSelectionNavigationTarget("connector", "connector", action.payload.connectorId);
    case "splice/upsert":
    case "splice/convertToDirectional":
    case "splice/rerouteConnectedWires":
    case "splice/applyOptimizedPlacement":
      return buildSelectionNavigationTarget("splice", "splice", action.payload.id);
    case "splice/occupyPort":
    case "splice/releasePort":
      return buildSelectionNavigationTarget("splice", "splice", action.payload.spliceId);
    case "node/upsert":
      return buildSelectionNavigationTarget("node", "node", action.payload.id);
    case "node/rename":
      return buildSelectionNavigationTarget("node", "node", action.payload.toId);
    case "segment/upsert":
      return buildSelectionNavigationTarget("segment", "segment", action.payload.id);
    case "segment/rename":
      return buildSelectionNavigationTarget("segment", "segment", action.payload.toId);
    case "wire/save":
    case "wire/upsert":
    case "wire/lockRoute":
    case "wire/resetRoute":
      return buildSelectionNavigationTarget("wire", "wire", action.payload.id);
    case "layout/setNodePosition":
      return buildSelectionNavigationTarget("node", "node", action.payload.nodeId);
    case "network/delete":
    case "network/importMany":
    case "harnessAssembly/remove":
    case "catalog/remove":
    case "connector/remove":
    case "connector/removeCascade":
    case "splice/remove":
    case "splice/removeCascade":
    case "node/remove":
    case "segment/remove":
    case "wire/remove":
    case "layout/setNodePositions":
    case "ui/select":
    case "ui/setError":
    case "ui/setThemeMode":
    case "ui/clearSelection":
    case "ui/clearError":
      return null;
  }
}

export function buildUndoHistoryEntry(
  action: AppAction,
  previousState: AppState,
  nextState: AppState,
  sequence: number,
  nowIso: string
): UndoHistoryEntry {
  const targetKind = toTargetKind(action.type);
  const displayRef = resolveDisplayRef(action, previousState, nextState);
  const navigationTarget = resolveNavigationTarget(action);
  const detailLabel = describeRecentChangeDetail(action, previousState);
  return {
    sequence,
    actionType: action.type,
    targetKind,
    targetId: displayRef,
    networkId: resolveEntryNetworkId(action, previousState, nextState),
    ...(navigationTarget ?? {}),
    label: buildRecentChangeLabel(targetKind, displayRef, actionVerb(action, previousState), detailLabel),
    ...(detailLabel === null ? {} : { detailLabel }),
    timestampIso: nowIso
  };
}

export function buildReplaceStateHistoryEntry(
  sequence: number,
  previousState: AppState,
  nextState: AppState,
  nowIso: string
): UndoHistoryEntry {
  const activeNetworkId = nextState.activeNetworkId ?? previousState.activeNetworkId;
  const displayRef = preferDisplayText(
    resolveNetworkDisplayRef(nextState, activeNetworkId),
    resolveNetworkDisplayRef(previousState, activeNetworkId)
  );

  return {
    sequence,
    actionType: "history/replaceState",
    targetKind: "workspace",
    targetId: displayRef,
    networkId: activeNetworkId,
    label: "Workspace state replaced",
    timestampIso: nowIso
  };
}

export function resolveSegmentDisplayRefForTest(state: AppState, segmentId: SegmentId): string | null {
  return resolveSegmentDisplayRef(state, segmentId);
}

export function resolveNodeDisplayRefForTest(state: AppState, nodeId: NodeId): string | null {
  return resolveNodeDisplayRef(state, nodeId);
}

export function resolveEndpointDisplayRefForTest(state: AppState, endpoint: WireEndpoint): string | null {
  return resolveEndpointDisplayRef(state, endpoint);
}
