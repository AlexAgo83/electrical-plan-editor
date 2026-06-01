import type {
  Network,
  HarnessAssembly,
  HarnessAssemblyId,
  NetworkId,
  CatalogItem,
  CatalogItemId,
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
  kind: "catalog" | "connector" | "splice" | "node" | "segment" | "wire";
  id: string;
}

export interface AppError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}

function sanitizeAppErrorCodeSegment(value: string): string {
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized.length > 0 ? normalized : "UNKNOWN_ERROR";
}

export function inferAppErrorCode(message: string): string {
  return sanitizeAppErrorCodeSegment(message);
}

export function createAppError(code: string, message: string, context?: Record<string, unknown>): AppError {
  return {
    code: sanitizeAppErrorCodeSegment(code),
    message,
    ...(context === undefined ? {} : { context })
  };
}

export function normalizeAppError(error: string | AppError): AppError {
  if (typeof error === "string") {
    return createAppError(inferAppErrorCode(error), error);
  }

  return createAppError(error.code, error.message, error.context);
}

export function getAppErrorMessage(error: AppError | null | undefined): string | null {
  return error?.message ?? null;
}

export function isSameAppError(left: AppError | null, right: AppError | null): boolean {
  if (left === right) {
    return true;
  }
  if (left === null || right === null) {
    return false;
  }

  return left.code === right.code && left.message === right.message;
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
  | "amberNight"
  | "cyberpunk"
  | "olive"
  | "mistGray"
  | "sagePaper"
  | "sandSlate"
  | "iceBlue"
  | "softTeal"
  | "dustyRose"
  | "paleOlive"
  | "cloudLavender"
  | "steelBlue"
  | "forestGraphite"
  | "petrolSlate"
  | "copperNight"
  | "mossTaupe"
  | "navyAsh"
  | "charcoalPlum"
  | "smokedTeal"
  | "circleMobilityLight"
  | "circleMobilityDark";

export interface LayoutNodePosition {
  x: number;
  y: number;
}

export interface NetworkSummaryViewState {
  scale: number;
  offset: LayoutNodePosition;
  showNetworkInfoPanels: boolean;
  showSegmentNames: boolean;
  showSegmentLengths: boolean;
  showCableCallouts: boolean;
  calloutContentMode?: "wireDetails" | "connectorDrawing" | "both";
  showNetworkGrid: boolean;
  snapNodesToGrid: boolean;
  lockEntityMovement: boolean;
}

export interface NetworkScopedState {
  catalogItems: EntityState<CatalogItem, CatalogItemId>;
  connectors: EntityState<Connector, ConnectorId>;
  splices: EntityState<Splice, SpliceId>;
  nodes: EntityState<NetworkNode, NodeId>;
  segments: EntityState<Segment, SegmentId>;
  wires: EntityState<Wire, WireId>;
  nodePositions: Record<NodeId, LayoutNodePosition>;
  connectorCavityOccupancy: Record<ConnectorId, Record<number, string>>;
  splicePortOccupancy: Record<SpliceId, Record<number, string>>;
  networkSummaryViewState?: NetworkSummaryViewState;
}

export interface AppState {
  schemaVersion: AppSchemaVersion;
  networks: EntityState<Network, NetworkId>;
  harnessAssemblies: EntityState<HarnessAssembly, HarnessAssemblyId>;
  activeNetworkId: NetworkId | null;
  networkStates: Record<NetworkId, NetworkScopedState>;
  catalogItems: EntityState<CatalogItem, CatalogItemId>;
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
    lastError: AppError | null;
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
    catalogItems: createEmptyEntityState<CatalogItem, CatalogItemId>(),
    connectors: createEmptyEntityState<Connector, ConnectorId>(),
    splices: createEmptyEntityState<Splice, SpliceId>(),
    nodes: createEmptyEntityState<NetworkNode, NodeId>(),
    segments: createEmptyEntityState<Segment, SegmentId>(),
    wires: createEmptyEntityState<Wire, WireId>(),
    nodePositions: {},
    connectorCavityOccupancy: {},
    splicePortOccupancy: {}
  };
}

export function cloneNetworkSummaryViewState(
  viewState: NetworkSummaryViewState | undefined
): NetworkSummaryViewState | undefined {
  if (viewState === undefined) {
    return undefined;
  }

  return {
    ...viewState,
    offset: { ...viewState.offset }
  };
}

export function createEmptyWorkspaceState(themeMode: ThemeMode = "warmBrown"): AppState {
  return {
    schemaVersion: APP_SCHEMA_VERSION,
    networks: createEmptyEntityState<Network, NetworkId>(),
    harnessAssemblies: createEmptyEntityState<HarnessAssembly, HarnessAssemblyId>(),
    activeNetworkId: null,
    networkStates: {},
    catalogItems: createEmptyEntityState<CatalogItem, CatalogItemId>(),
    connectors: createEmptyEntityState<Connector, ConnectorId>(),
    splices: createEmptyEntityState<Splice, SpliceId>(),
    nodes: createEmptyEntityState<NetworkNode, NodeId>(),
    segments: createEmptyEntityState<Segment, SegmentId>(),
    wires: createEmptyEntityState<Wire, WireId>(),
    nodePositions: {},
    connectorCavityOccupancy: {},
    splicePortOccupancy: {},
    ui: {
      selected: null,
      lastError: null,
      themeMode
    },
    meta: {
      revision: 0
    }
  };
}

export function createInitialState(): AppState {
  const defaultScopedState = createEmptyNetworkScopedState();
  const defaultNetwork: Network = {
    id: DEFAULT_NETWORK_ID,
    name: "Main network (Sample)",
    technicalId: DEFAULT_NETWORK_TECHNICAL_ID,
    createdAt: DEFAULT_NETWORK_CREATED_AT,
    updatedAt: DEFAULT_NETWORK_CREATED_AT
  };

  return {
    schemaVersion: APP_SCHEMA_VERSION,
    networks: {
      byId: {
        [defaultNetwork.id]: defaultNetwork
      },
      allIds: [defaultNetwork.id]
    },
    harnessAssemblies: createEmptyEntityState<HarnessAssembly, HarnessAssemblyId>(),
    activeNetworkId: defaultNetwork.id,
    networkStates: {
      [defaultNetwork.id]: defaultScopedState
    },
    catalogItems: defaultScopedState.catalogItems,
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
      themeMode: "warmBrown"
    },
    meta: {
      revision: 0
    }
  };
}
