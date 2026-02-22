import type {
  Network,
  NetworkId,
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire,
  WireId
} from "../core/entities";
import { APP_SCHEMA_VERSION, type AppSchemaVersion } from "../core/schema";

export interface EntityState<T, Id extends string> {
  byId: Record<Id, T>;
  allIds: Id[];
}

export interface SelectionState {
  kind: "connector" | "splice" | "node" | "segment" | "wire";
  id: string;
}

export type ThemeMode =
  | "normal"
  | "dark"
  | "slateNeon"
  | "paperBlueprint"
  | "warmBrown"
  | "deepGreen"
  | "roseQuartz"
  | "burgundyNoir"
  | "lavenderHaze"
  | "amberNight";

export interface LayoutNodePosition {
  x: number;
  y: number;
}

export interface NetworkScopedState {
  connectors: EntityState<Connector, ConnectorId>;
  splices: EntityState<Splice, SpliceId>;
  nodes: EntityState<NetworkNode, NodeId>;
  segments: EntityState<Segment, SegmentId>;
  wires: EntityState<Wire, WireId>;
  nodePositions: Record<NodeId, LayoutNodePosition>;
  connectorCavityOccupancy: Record<ConnectorId, Record<number, string>>;
  splicePortOccupancy: Record<SpliceId, Record<number, string>>;
}

export interface AppState {
  schemaVersion: AppSchemaVersion;
  networks: EntityState<Network, NetworkId>;
  activeNetworkId: NetworkId | null;
  networkStates: Record<NetworkId, NetworkScopedState>;
  connectors: EntityState<Connector, ConnectorId>;
  splices: EntityState<Splice, SpliceId>;
  nodes: EntityState<NetworkNode, NodeId>;
  segments: EntityState<Segment, SegmentId>;
  wires: EntityState<Wire, WireId>;
  nodePositions: Record<NodeId, LayoutNodePosition>;
  connectorCavityOccupancy: Record<ConnectorId, Record<number, string>>;
  splicePortOccupancy: Record<SpliceId, Record<number, string>>;
  ui: {
    selected: SelectionState | null;
    lastError: string | null;
    themeMode: ThemeMode;
  };
  meta: {
    revision: number;
  };
}

export function createEmptyEntityState<T, Id extends string>(): EntityState<T, Id> {
  return {
    byId: {} as Record<Id, T>,
    allIds: []
  };
}

export const DEFAULT_NETWORK_ID = "network-main" as NetworkId;
export const DEFAULT_NETWORK_TECHNICAL_ID = "NET-MAIN-SAMPLE";
export const DEFAULT_NETWORK_CREATED_AT = "2026-01-01T00:00:00.000Z";

export function createEmptyNetworkScopedState(): NetworkScopedState {
  return {
    connectors: createEmptyEntityState<Connector, ConnectorId>(),
    splices: createEmptyEntityState<Splice, SpliceId>(),
    nodes: createEmptyEntityState<NetworkNode, NodeId>(),
    segments: createEmptyEntityState<Segment, SegmentId>(),
    wires: createEmptyEntityState<Wire, WireId>(),
    nodePositions: {} as Record<NodeId, LayoutNodePosition>,
    connectorCavityOccupancy: {} as Record<ConnectorId, Record<number, string>>,
    splicePortOccupancy: {} as Record<SpliceId, Record<number, string>>
  };
}

export function createInitialState(): AppState {
  const defaultScopedState = createEmptyNetworkScopedState();
  const defaultNetwork: Network = {
    id: DEFAULT_NETWORK_ID,
    name: "Main network sample",
    technicalId: DEFAULT_NETWORK_TECHNICAL_ID,
    createdAt: DEFAULT_NETWORK_CREATED_AT,
    updatedAt: DEFAULT_NETWORK_CREATED_AT
  };

  return {
    schemaVersion: APP_SCHEMA_VERSION,
    networks: {
      byId: {
        [defaultNetwork.id]: defaultNetwork
      } as Record<NetworkId, Network>,
      allIds: [defaultNetwork.id]
    },
    activeNetworkId: defaultNetwork.id,
    networkStates: {
      [defaultNetwork.id]: defaultScopedState
    } as Record<NetworkId, NetworkScopedState>,
    connectors: defaultScopedState.connectors,
    splices: defaultScopedState.splices,
    nodes: defaultScopedState.nodes,
    segments: defaultScopedState.segments,
    wires: defaultScopedState.wires,
    nodePositions: defaultScopedState.nodePositions,
    connectorCavityOccupancy: defaultScopedState.connectorCavityOccupancy,
    splicePortOccupancy: defaultScopedState.splicePortOccupancy,
    ui: {
      selected: null,
      lastError: null,
      themeMode: "normal"
    },
    meta: {
      revision: 0
    }
  };
}
