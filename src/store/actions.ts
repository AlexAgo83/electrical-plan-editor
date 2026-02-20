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
import type { SelectionState } from "./types";

export type AppAction =
  | { type: "connector/upsert"; payload: Connector }
  | { type: "connector/remove"; payload: { id: ConnectorId } }
  | { type: "splice/upsert"; payload: Splice }
  | { type: "splice/remove"; payload: { id: SpliceId } }
  | { type: "node/upsert"; payload: NetworkNode }
  | { type: "node/remove"; payload: { id: NodeId } }
  | { type: "segment/upsert"; payload: Segment }
  | { type: "segment/remove"; payload: { id: SegmentId } }
  | { type: "wire/upsert"; payload: Wire }
  | { type: "wire/remove"; payload: { id: WireId } }
  | { type: "ui/select"; payload: SelectionState }
  | { type: "ui/clearSelection" };

export const appActions = {
  upsertConnector: (payload: Connector): AppAction => ({ type: "connector/upsert", payload }),
  removeConnector: (id: ConnectorId): AppAction => ({ type: "connector/remove", payload: { id } }),

  upsertSplice: (payload: Splice): AppAction => ({ type: "splice/upsert", payload }),
  removeSplice: (id: SpliceId): AppAction => ({ type: "splice/remove", payload: { id } }),

  upsertNode: (payload: NetworkNode): AppAction => ({ type: "node/upsert", payload }),
  removeNode: (id: NodeId): AppAction => ({ type: "node/remove", payload: { id } }),

  upsertSegment: (payload: Segment): AppAction => ({ type: "segment/upsert", payload }),
  removeSegment: (id: SegmentId): AppAction => ({ type: "segment/remove", payload: { id } }),

  upsertWire: (payload: Wire): AppAction => ({ type: "wire/upsert", payload }),
  removeWire: (id: WireId): AppAction => ({ type: "wire/remove", payload: { id } }),

  select: (payload: SelectionState): AppAction => ({ type: "ui/select", payload }),
  clearSelection: (): AppAction => ({ type: "ui/clearSelection" })
};
