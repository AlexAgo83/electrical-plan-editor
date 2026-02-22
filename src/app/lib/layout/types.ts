import type { NodeId } from "../../../core/entities";
import type { NodePosition } from "../../types/app-controller";

export interface NodePositionMapOptions {
  snapToGrid?: boolean;
  gridStep?: number;
}

export interface LocalLayout {
  positions: Record<NodeId, NodePosition>;
  width: number;
  height: number;
}

export type VisualConflictRank = readonly [
  nodeOverlaps: number,
  clearanceViolations: number,
  crossings: number,
  score: number
];
