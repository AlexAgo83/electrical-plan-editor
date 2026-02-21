import type { ConnectorId, NodeId, SegmentId, SpliceId, WireId } from "../../core/entities";
import { appReducer, createInitialState, type AppState } from "../../store";

export function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

export function asSpliceId(value: string): SpliceId {
  return value as SpliceId;
}

export function asNodeId(value: string): NodeId {
  return value as NodeId;
}

export function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

export function asWireId(value: string): WireId {
  return value as WireId;
}

export function reduceAll(actions: Parameters<typeof appReducer>[1][]): AppState {
  return actions.reduce(appReducer, createInitialState());
}

