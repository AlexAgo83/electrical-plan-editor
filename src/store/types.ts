import type {
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

export interface AppState {
  schemaVersion: AppSchemaVersion;
  connectors: EntityState<Connector, ConnectorId>;
  splices: EntityState<Splice, SpliceId>;
  nodes: EntityState<NetworkNode, NodeId>;
  segments: EntityState<Segment, SegmentId>;
  wires: EntityState<Wire, WireId>;
  connectorCavityOccupancy: Record<ConnectorId, Record<number, string>>;
  ui: {
    selected: SelectionState | null;
    lastError: string | null;
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

export function createInitialState(): AppState {
  return {
    schemaVersion: APP_SCHEMA_VERSION,
    connectors: createEmptyEntityState<Connector, ConnectorId>(),
    splices: createEmptyEntityState<Splice, SpliceId>(),
    nodes: createEmptyEntityState<NetworkNode, NodeId>(),
    segments: createEmptyEntityState<Segment, SegmentId>(),
    wires: createEmptyEntityState<Wire, WireId>(),
    connectorCavityOccupancy: {} as Record<ConnectorId, Record<number, string>>,
    ui: {
      selected: null,
      lastError: null
    },
    meta: {
      revision: 0
    }
  };
}
