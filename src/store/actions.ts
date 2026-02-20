import type {
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
import type { SelectionState } from "./types";

export type AppAction =
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
  | { type: "node/remove"; payload: { id: NodeId } }
  | { type: "segment/upsert"; payload: Segment }
  | { type: "segment/remove"; payload: { id: SegmentId } }
  | {
      type: "wire/save";
      payload: {
        id: WireId;
        name: string;
        technicalId: string;
        endpointA: WireEndpoint;
        endpointB: WireEndpoint;
      };
    }
  | { type: "wire/lockRoute"; payload: { id: WireId; segmentIds: SegmentId[] } }
  | { type: "wire/resetRoute"; payload: { id: WireId } }
  | { type: "wire/upsert"; payload: Wire }
  | { type: "wire/remove"; payload: { id: WireId } }
  | { type: "ui/select"; payload: SelectionState }
  | { type: "ui/clearSelection" }
  | { type: "ui/clearError" };

export const appActions = {
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
  removeNode: (id: NodeId): AppAction => ({ type: "node/remove", payload: { id } }),

  upsertSegment: (payload: Segment): AppAction => ({ type: "segment/upsert", payload }),
  removeSegment: (id: SegmentId): AppAction => ({ type: "segment/remove", payload: { id } }),

  saveWire: (payload: {
    id: WireId;
    name: string;
    technicalId: string;
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

  select: (payload: SelectionState): AppAction => ({ type: "ui/select", payload }),
  clearSelection: (): AppAction => ({ type: "ui/clearSelection" }),
  clearError: (): AppAction => ({ type: "ui/clearError" })
};
