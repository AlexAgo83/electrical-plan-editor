import type {
  CatalogItem,
  Connector,
  Network,
  NetworkNode,
  Segment,
  Splice,
  Wire
} from "../../core/entities";
import type { AppState, LayoutNodePosition, SelectionState } from "../../store/types";
import { selectActiveNetwork, selectConnectors, selectNodes, selectSegments, selectSplices, selectWires } from "../../store";
import type { AiAgentScope } from "./aiAgentOperationContract";

export interface AiAgentContextSummary {
  scope: AiAgentScope;
  scopeLabel: string;
  isAvailable: boolean;
  unavailableReason: string | null;
  networkName: string | null;
  selectionLabel: string | null;
  counts: {
    connectors: number;
    splices: number;
    nodes: number;
    segments: number;
    wires: number;
  };
}

export interface AiAgentContext {
  schemaVersion: 1;
  scope: AiAgentScope;
  activeNetwork: Pick<Network, "id" | "name" | "technicalId"> | null;
  selection: SelectionState | null;
  summary: AiAgentContextSummary;
  entities: {
    connectors: Array<Pick<Connector, "id" | "name" | "technicalId" | "cavityCount">>;
    splices: Array<Pick<Splice, "id" | "name" | "technicalId" | "portCount" | "portMode">>;
    nodes: NetworkNode[];
    segments: Array<Pick<Segment, "id" | "nodeA" | "nodeB" | "lengthMm" | "subNetworkTag">>;
    wires: Array<Pick<Wire, "id" | "name" | "technicalId" | "endpointA" | "endpointB" | "routeSegmentIds" | "lengthMm">>;
    nodePositions: Record<string, LayoutNodePosition>;
  };
}

function buildEmptySummary(scope: AiAgentScope, unavailableReason: string): AiAgentContextSummary {
  return {
    scope,
    scopeLabel: scope === "activeNetwork" ? "Active network" : "Current selection",
    isAvailable: false,
    unavailableReason,
    networkName: null,
    selectionLabel: null,
    counts: {
      connectors: 0,
      splices: 0,
      nodes: 0,
      segments: 0,
      wires: 0
    }
  };
}

function buildSelectionLabel(state: AppState, selection: SelectionState | null): string | null {
  if (selection === null) {
    return null;
  }
  if (selection.kind === "connector") {
    const connector = state.connectors.byId[selection.id as Connector["id"]];
    return connector === undefined ? null : `Connector ${connector.technicalId}`;
  }
  if (selection.kind === "splice") {
    const splice = state.splices.byId[selection.id as Splice["id"]];
    return splice === undefined ? null : `Splice ${splice.technicalId}`;
  }
  if (selection.kind === "node") {
    const node = state.nodes.byId[selection.id as NetworkNode["id"]];
    return node === undefined ? null : `Node ${selection.id}`;
  }
  if (selection.kind === "segment") {
    const segment = state.segments.byId[selection.id as Segment["id"]];
    return segment === undefined ? null : `Segment ${segment.id}`;
  }
  if (selection.kind === "wire") {
    const wire = state.wires.byId[selection.id as Wire["id"]];
    return wire === undefined ? null : `Wire ${wire.technicalId}`;
  }
  if (selection.kind === "catalog") {
    const catalogItem = state.catalogItems.byId[selection.id as CatalogItem["id"]];
    return catalogItem === undefined ? null : `Catalog ${catalogItem.manufacturerReference}`;
  }
  return null;
}

function filterSelectionEntities(state: AppState, selection: SelectionState): AiAgentContext["entities"] {
  const selectedConnector = selection.kind === "connector" ? state.connectors.byId[selection.id as Connector["id"]] : undefined;
  const selectedSplice = selection.kind === "splice" ? state.splices.byId[selection.id as Splice["id"]] : undefined;
  const selectedNode = selection.kind === "node" ? state.nodes.byId[selection.id as NetworkNode["id"]] : undefined;
  const selectedSegment = selection.kind === "segment" ? state.segments.byId[selection.id as Segment["id"]] : undefined;
  const selectedWire = selection.kind === "wire" ? state.wires.byId[selection.id as Wire["id"]] : undefined;
  return {
    connectors: selectedConnector === undefined ? [] : [selectedConnector],
    splices: selectedSplice === undefined ? [] : [selectedSplice],
    nodes: selectedNode === undefined ? [] : [selectedNode],
    segments: selectedSegment === undefined ? [] : [selectedSegment],
    wires: selectedWire === undefined ? [] : [selectedWire],
    nodePositions: state.nodePositions
  };
}

function summarizeEntities(
  scope: AiAgentScope,
  activeNetwork: Network,
  selectionLabel: string | null,
  entities: AiAgentContext["entities"]
): AiAgentContextSummary {
  return {
    scope,
    scopeLabel: scope === "activeNetwork" ? "Active network" : "Current selection",
    isAvailable: true,
    unavailableReason: null,
    networkName: activeNetwork.name,
    selectionLabel,
    counts: {
      connectors: entities.connectors.length,
      splices: entities.splices.length,
      nodes: entities.nodes.length,
      segments: entities.segments.length,
      wires: entities.wires.length
    }
  };
}

export function buildAiAgentContext(state: AppState, scope: AiAgentScope): AiAgentContext {
  const activeNetwork = selectActiveNetwork(state);
  if (activeNetwork === null) {
    const summary = buildEmptySummary(scope, "No active network is available.");
    return {
      schemaVersion: 1,
      scope,
      activeNetwork: null,
      selection: null,
      summary,
      entities: {
        connectors: [],
        splices: [],
        nodes: [],
        segments: [],
        wires: [],
        nodePositions: {}
      }
    };
  }

  const activeNetworkIdentity = {
    id: activeNetwork.id,
    name: activeNetwork.name,
    technicalId: activeNetwork.technicalId
  };

  if (scope === "currentSelection") {
    const selection = state.ui.selected;
    const selectionLabel = buildSelectionLabel(state, selection);
    if (selection === null || selectionLabel === null) {
      const summary = buildEmptySummary(scope, "Select a Modeling entity before using current selection scope.");
      return {
        schemaVersion: 1,
        scope,
        activeNetwork: activeNetworkIdentity,
        selection,
        summary: {
          ...summary,
          networkName: activeNetwork.name
        },
        entities: {
          connectors: [],
          splices: [],
          nodes: [],
          segments: [],
          wires: [],
          nodePositions: state.nodePositions
        }
      };
    }
    const entities = filterSelectionEntities(state, selection);
    return {
      schemaVersion: 1,
      scope,
      activeNetwork: activeNetworkIdentity,
      selection,
      summary: summarizeEntities(scope, activeNetwork, selectionLabel, entities),
      entities
    };
  }

  const entities = {
    connectors: selectConnectors(state),
    splices: selectSplices(state),
    nodes: selectNodes(state),
    segments: selectSegments(state),
    wires: selectWires(state),
    nodePositions: state.nodePositions
  };
  return {
    schemaVersion: 1,
    scope,
    activeNetwork: activeNetworkIdentity,
    selection: state.ui.selected,
    summary: summarizeEntities(scope, activeNetwork, buildSelectionLabel(state, state.ui.selected), entities),
    entities
  };
}
