import type { NodePosition } from "../../types/app-controller";
import {
  NETWORK_GRID_STEP,
  NETWORK_VIEW_HEIGHT,
  NETWORK_VIEW_WIDTH,
  clamp,
  snapToGrid
} from "../app-utils-shared";
import type { NodePositionMapOptions } from "./types";

export function listNudgeCandidates(source: NodePosition, options: NodePositionMapOptions): NodePosition[] {
  const shouldSnapToGrid = options.snapToGrid ?? false;
  const gridStep = options.gridStep ?? NETWORK_GRID_STEP;
  const nudgeStep = shouldSnapToGrid ? gridStep : 12;
  const offsets = [1, -1, 2, -2, 3, -3];
  const rawCandidates = [] as NodePosition[];
  for (const offset of offsets) {
    rawCandidates.push({ x: source.x + nudgeStep * offset, y: source.y });
    rawCandidates.push({ x: source.x, y: source.y + nudgeStep * offset });
  }
  for (const xOffset of offsets.slice(0, 4)) {
    for (const yOffset of offsets.slice(0, 4)) {
      if (Math.abs(xOffset) !== Math.abs(yOffset)) {
        continue;
      }

      rawCandidates.push({
        x: source.x + nudgeStep * xOffset,
        y: source.y + nudgeStep * yOffset
      });
    }
  }

  return rawCandidates
    .map((candidate) => {
      const rawX = shouldSnapToGrid ? snapToGrid(candidate.x, gridStep) : candidate.x;
      const rawY = shouldSnapToGrid ? snapToGrid(candidate.y, gridStep) : candidate.y;
      return {
        x: clamp(rawX, 20, NETWORK_VIEW_WIDTH - 20),
        y: clamp(rawY, 20, NETWORK_VIEW_HEIGHT - 20)
      };
    })
    .filter((candidate, index, all) => {
      if (candidate.x === source.x && candidate.y === source.y) {
        return false;
      }

      return all.findIndex((entry) => entry.x === candidate.x && entry.y === candidate.y) === index;
    });
}
