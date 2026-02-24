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
  WireEndpoint,
  Wire,
  WireId
} from "../core/entities";
import type { LayoutNodePosition, NetworkScopedState, SelectionState, ThemeMode } from "./types";

export type AppAction =
  | {
      type: "network/create";
      payload: {
        network: Network;
        setActive?: boolean;
      };
    }
  | { type: "network/select"; payload: { id: NetworkId } }
  | {
      type: "network/rename";
      payload: {
        id: NetworkId;
        name: string;
        description?: string;
        updatedAt: string;
      };
    }
  | {
      type: "network/update";
      payload: {
        id: NetworkId;
        name: string;
        technicalId: string;
        description?: string;
        updatedAt: string;
      };
    }
  | {
      type: "network/duplicate";
      payload: {
        sourceNetworkId: NetworkId;
        network: Network;
      };
    }
  | { type: "network/delete"; payload: { id: NetworkId } }
  | {
      type: "network/importMany";
      payload: {
        networks: Network[];
        networkStates: Record<NetworkId, NetworkScopedState>;
        activateFirst?: boolean;
      };
    }
  | { type: "connector/upsert"; payload: Connector }
  | { type: "connector/remove"; payload: { id: ConnectorId } }
  | {
      type: "connector/occupyCavity";
      payload: { connectorId: ConnectorId; cavityIndex: number; occupantRef: string };
    }
  | { type: "connector/releaseCavity"; payload: { connectorId: ConnectorId; cavityIndex: number } }
  | { type: "splice/upsert"; payload: Splice }
  | { type: "splice/remove"; payload: { id: SpliceId } }
  | {
      type: "splice/occupyPort";
      payload: { spliceId: SpliceId; portIndex: number; occupantRef: string };
    }
  | { type: "splice/releasePort"; payload: { spliceId: SpliceId; portIndex: number } }
  | { type: "node/upsert"; payload: NetworkNode }
  | { type: "node/rename"; payload: { fromId: NodeId; toId: NodeId } }
  | { type: "node/remove"; payload: { id: NodeId } }
  | { type: "segment/upsert"; payload: Segment }
  | { type: "segment/rename"; payload: { fromId: SegmentId; toId: SegmentId } }
  | { type: "segment/remove"; payload: { id: SegmentId } }
  | {
      type: "wire/save";
      payload: {
        id: WireId;
        name: string;
        technicalId: string;
        sectionMm2?: number;
        primaryColorId?: string | null;
        secondaryColorId?: string | null;
        endpointAConnectionReference?: string;
        endpointASealReference?: string;
        endpointBConnectionReference?: string;
        endpointBSealReference?: string;
        endpointA: WireEndpoint;
        endpointB: WireEndpoint;
      };
    }
  | { type: "wire/lockRoute"; payload: { id: WireId; segmentIds: SegmentId[] } }
  | { type: "wire/resetRoute"; payload: { id: WireId } }
  | { type: "wire/upsert"; payload: Wire }
  | { type: "wire/remove"; payload: { id: WireId } }
  | { type: "layout/setNodePosition"; payload: { nodeId: NodeId; position: LayoutNodePosition } }
  | { type: "layout/setNodePositions"; payload: { positions: Record<NodeId, LayoutNodePosition> } }
  | { type: "ui/select"; payload: SelectionState }
  | { type: "ui/setThemeMode"; payload: { mode: ThemeMode } }
  | { type: "ui/clearSelection" }
  | { type: "ui/clearError" };

export const appActions = {
  createNetwork: (network: Network, setActive = true): AppAction => ({
    type: "network/create",
    payload: { network, setActive }
  }),
  selectNetwork: (id: NetworkId): AppAction => ({ type: "network/select", payload: { id } }),
  renameNetwork: (id: NetworkId, name: string, updatedAt: string, description?: string): AppAction => ({
    type: "network/rename",
    payload: { id, name, updatedAt, description }
  }),
  updateNetwork: (
    id: NetworkId,
    name: string,
    technicalId: string,
    updatedAt: string,
    description?: string
  ): AppAction => ({
    type: "network/update",
    payload: { id, name, technicalId, updatedAt, description }
  }),
  duplicateNetwork: (sourceNetworkId: NetworkId, network: Network): AppAction => ({
    type: "network/duplicate",
    payload: { sourceNetworkId, network }
  }),
  deleteNetwork: (id: NetworkId): AppAction => ({ type: "network/delete", payload: { id } }),
  importNetworks: (
    networks: Network[],
    networkStates: Record<NetworkId, NetworkScopedState>,
    activateFirst = false
  ): AppAction => ({
    type: "network/importMany",
    payload: { networks, networkStates, activateFirst }
  }),

  upsertConnector: (payload: Connector): AppAction => ({ type: "connector/upsert", payload }),
  removeConnector: (id: ConnectorId): AppAction => ({ type: "connector/remove", payload: { id } }),
  occupyConnectorCavity: (connectorId: ConnectorId, cavityIndex: number, occupantRef: string): AppAction => ({
    type: "connector/occupyCavity",
    payload: { connectorId, cavityIndex, occupantRef }
  }),
  releaseConnectorCavity: (connectorId: ConnectorId, cavityIndex: number): AppAction => ({
    type: "connector/releaseCavity",
    payload: { connectorId, cavityIndex }
  }),

  upsertSplice: (payload: Splice): AppAction => ({ type: "splice/upsert", payload }),
  removeSplice: (id: SpliceId): AppAction => ({ type: "splice/remove", payload: { id } }),
  occupySplicePort: (spliceId: SpliceId, portIndex: number, occupantRef: string): AppAction => ({
    type: "splice/occupyPort",
    payload: { spliceId, portIndex, occupantRef }
  }),
  releaseSplicePort: (spliceId: SpliceId, portIndex: number): AppAction => ({
    type: "splice/releasePort",
    payload: { spliceId, portIndex }
  }),

  upsertNode: (payload: NetworkNode): AppAction => ({ type: "node/upsert", payload }),
  renameNode: (fromId: NodeId, toId: NodeId): AppAction => ({ type: "node/rename", payload: { fromId, toId } }),
  removeNode: (id: NodeId): AppAction => ({ type: "node/remove", payload: { id } }),

  upsertSegment: (payload: Segment): AppAction => ({ type: "segment/upsert", payload }),
  renameSegment: (fromId: SegmentId, toId: SegmentId): AppAction => ({ type: "segment/rename", payload: { fromId, toId } }),
  removeSegment: (id: SegmentId): AppAction => ({ type: "segment/remove", payload: { id } }),

  saveWire: (payload: {
    id: WireId;
    name: string;
    technicalId: string;
    sectionMm2?: number;
    primaryColorId?: string | null;
    secondaryColorId?: string | null;
    endpointAConnectionReference?: string;
    endpointASealReference?: string;
    endpointBConnectionReference?: string;
    endpointBSealReference?: string;
    endpointA: WireEndpoint;
    endpointB: WireEndpoint;
  }): AppAction => ({ type: "wire/save", payload }),
  lockWireRoute: (id: WireId, segmentIds: SegmentId[]): AppAction => ({
    type: "wire/lockRoute",
    payload: { id, segmentIds }
  }),
  resetWireRoute: (id: WireId): AppAction => ({ type: "wire/resetRoute", payload: { id } }),
  upsertWire: (payload: Wire): AppAction => ({ type: "wire/upsert", payload }),
  removeWire: (id: WireId): AppAction => ({ type: "wire/remove", payload: { id } }),
  setNodePosition: (nodeId: NodeId, position: LayoutNodePosition): AppAction => ({
    type: "layout/setNodePosition",
    payload: { nodeId, position }
  }),
  setNodePositions: (positions: Record<NodeId, LayoutNodePosition>): AppAction => ({
    type: "layout/setNodePositions",
    payload: { positions }
  }),

  select: (payload: SelectionState): AppAction => ({ type: "ui/select", payload }),
  setThemeMode: (mode: ThemeMode): AppAction => ({ type: "ui/setThemeMode", payload: { mode } }),
  clearSelection: (): AppAction => ({ type: "ui/clearSelection" }),
  clearError: (): AppAction => ({ type: "ui/clearError" })
};
