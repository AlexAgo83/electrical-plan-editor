import type { NetworkNode, NodeId, Segment } from "../../../core/entities";
import type { NodePosition } from "../../types/app-controller";
import {
  NETWORK_GRID_STEP,
  NETWORK_VIEW_HEIGHT,
  NETWORK_VIEW_WIDTH,
  clamp,
  snapToGrid
} from "../app-utils-shared";
import { resolveVisualOverlaps } from "./postprocess";
import type { LocalLayout, NodePositionMapOptions } from "./types";

function buildAdjacency(nodes: NetworkNode[], segments: Segment[]): Map<NodeId, Set<NodeId>> {
  const adjacency = new Map<NodeId, Set<NodeId>>();
  const nodeIds = new Set(nodes.map((node) => node.id));
  for (const node of nodes) {
    adjacency.set(node.id, new Set<NodeId>());
  }

  for (const segment of segments) {
    if (!nodeIds.has(segment.nodeA) || !nodeIds.has(segment.nodeB) || segment.nodeA === segment.nodeB) {
      continue;
    }

    adjacency.get(segment.nodeA)?.add(segment.nodeB);
    adjacency.get(segment.nodeB)?.add(segment.nodeA);
  }

  return adjacency;
}

function getConnectedComponents(adjacency: Map<NodeId, Set<NodeId>>): NodeId[][] {
  const unvisited = new Set([...adjacency.keys()].sort((left, right) => left.localeCompare(right)));
  const components: NodeId[][] = [];

  while (unvisited.size > 0) {
    const root = unvisited.values().next().value;
    if (root === undefined) {
      break;
    }

    const stack = [root];
    unvisited.delete(root);
    const component: NodeId[] = [];
    while (stack.length > 0) {
      const nodeId = stack.pop();
      if (nodeId === undefined) {
        continue;
      }

      component.push(nodeId);
      const neighbors = adjacency.get(nodeId);
      if (neighbors === undefined) {
        continue;
      }

      for (const neighbor of [...neighbors].sort((left, right) => left.localeCompare(right))) {
        if (!unvisited.has(neighbor)) {
          continue;
        }

        unvisited.delete(neighbor);
        stack.push(neighbor);
      }
    }

    components.push(component.sort((left, right) => left.localeCompare(right)));
  }

  return components;
}

function createComponentLayout(componentNodeIds: NodeId[], adjacency: Map<NodeId, Set<NodeId>>): LocalLayout {
  const horizontalSpacing = 120;
  const verticalSpacing = 96;
  const nodePadding = 24;

  if (componentNodeIds.length === 0) {
    return {
      positions: {} as Record<NodeId, NodePosition>,
      width: 0,
      height: 0
    };
  }

  if (componentNodeIds.length === 1) {
    const nodeId = componentNodeIds[0] as NodeId;
    return {
      positions: {
        [nodeId]: { x: nodePadding, y: nodePadding }
      } as Record<NodeId, NodePosition>,
      width: nodePadding * 2,
      height: nodePadding * 2
    };
  }

  const root = [...componentNodeIds].sort((left, right) => {
    const leftDegree = adjacency.get(left)?.size ?? 0;
    const rightDegree = adjacency.get(right)?.size ?? 0;
    if (leftDegree !== rightDegree) {
      return rightDegree - leftDegree;
    }

    return left.localeCompare(right);
  })[0];
  if (root === undefined) {
    return {
      positions: {} as Record<NodeId, NodePosition>,
      width: 0,
      height: 0
    };
  }

  const nodeLayer = new Map<NodeId, number>();
  const layered = [] as NodeId[][];
  const queue: NodeId[] = [root];
  nodeLayer.set(root, 0);
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      continue;
    }

    const layerIndex = nodeLayer.get(current) ?? 0;
    if (layered[layerIndex] === undefined) {
      layered[layerIndex] = [];
    }
    layered[layerIndex]?.push(current);

    for (const neighbor of [...(adjacency.get(current) ?? [])].sort((left, right) => left.localeCompare(right))) {
      if (nodeLayer.has(neighbor)) {
        continue;
      }

      nodeLayer.set(neighbor, layerIndex + 1);
      queue.push(neighbor);
    }
  }

  for (const nodeId of componentNodeIds) {
    if (nodeLayer.has(nodeId)) {
      continue;
    }

    const fallbackLayer = layered.length;
    nodeLayer.set(nodeId, fallbackLayer);
    if (layered[fallbackLayer] === undefined) {
      layered[fallbackLayer] = [];
    }
    layered[fallbackLayer]?.push(nodeId);
  }

  const layers = layered
    .map((layer) => (layer === undefined ? [] : [...layer].sort((left, right) => left.localeCompare(right))))
    .filter((layer) => layer.length > 0);

  for (let iteration = 0; iteration < 4; iteration += 1) {
    for (let layerIndex = 1; layerIndex < layers.length; layerIndex += 1) {
      const previousLayer = layers[layerIndex - 1];
      const currentLayer = layers[layerIndex];
      if (previousLayer === undefined || currentLayer === undefined) {
        continue;
      }

      const previousIndex = new Map(previousLayer.map((nodeId, index) => [nodeId, index]));
      currentLayer.sort((left, right) => {
        const leftNeighbors = [...(adjacency.get(left) ?? [])].filter((nodeId) => previousIndex.has(nodeId));
        const rightNeighbors = [...(adjacency.get(right) ?? [])].filter((nodeId) => previousIndex.has(nodeId));
        const leftBarycenter =
          leftNeighbors.length === 0
            ? Number.POSITIVE_INFINITY
            : leftNeighbors.reduce((sum, nodeId) => sum + (previousIndex.get(nodeId) ?? 0), 0) / leftNeighbors.length;
        const rightBarycenter =
          rightNeighbors.length === 0
            ? Number.POSITIVE_INFINITY
            : rightNeighbors.reduce((sum, nodeId) => sum + (previousIndex.get(nodeId) ?? 0), 0) / rightNeighbors.length;
        if (leftBarycenter !== rightBarycenter) {
          return leftBarycenter - rightBarycenter;
        }

        return left.localeCompare(right);
      });
    }

    for (let layerIndex = layers.length - 2; layerIndex >= 0; layerIndex -= 1) {
      const nextLayer = layers[layerIndex + 1];
      const currentLayer = layers[layerIndex];
      if (nextLayer === undefined || currentLayer === undefined) {
        continue;
      }

      const nextIndex = new Map(nextLayer.map((nodeId, index) => [nodeId, index]));
      currentLayer.sort((left, right) => {
        const leftNeighbors = [...(adjacency.get(left) ?? [])].filter((nodeId) => nextIndex.has(nodeId));
        const rightNeighbors = [...(adjacency.get(right) ?? [])].filter((nodeId) => nextIndex.has(nodeId));
        const leftBarycenter =
          leftNeighbors.length === 0
            ? Number.POSITIVE_INFINITY
            : leftNeighbors.reduce((sum, nodeId) => sum + (nextIndex.get(nodeId) ?? 0), 0) / leftNeighbors.length;
        const rightBarycenter =
          rightNeighbors.length === 0
            ? Number.POSITIVE_INFINITY
            : rightNeighbors.reduce((sum, nodeId) => sum + (nextIndex.get(nodeId) ?? 0), 0) / rightNeighbors.length;
        if (leftBarycenter !== rightBarycenter) {
          return leftBarycenter - rightBarycenter;
        }

        return left.localeCompare(right);
      });
    }
  }

  const maxLayerSize = layers.reduce((max, layer) => Math.max(max, layer.length), 1);
  const positions = {} as Record<NodeId, NodePosition>;
  for (let layerIndex = 0; layerIndex < layers.length; layerIndex += 1) {
    const layer = layers[layerIndex] ?? [];
    const layerHeight = (layer.length - 1) * verticalSpacing;
    for (let index = 0; index < layer.length; index += 1) {
      const nodeId = layer[index];
      if (nodeId === undefined) {
        continue;
      }

      positions[nodeId] = {
        x: nodePadding + layerIndex * horizontalSpacing,
        y: nodePadding + index * verticalSpacing - layerHeight / 2 + ((maxLayerSize - 1) * verticalSpacing) / 2
      };
    }
  }

  return {
    positions,
    width: nodePadding * 2 + Math.max(0, (layers.length - 1) * horizontalSpacing),
    height: nodePadding * 2 + Math.max(0, (maxLayerSize - 1) * verticalSpacing)
  };
}

export function createNodePositionMap(
  nodes: NetworkNode[],
  segments: Segment[] = [],
  options: NodePositionMapOptions = {}
): Record<NodeId, NodePosition> {
  const shouldSnapToGrid = options.snapToGrid ?? false;
  const gridStep = options.gridStep ?? NETWORK_GRID_STEP;
  const positions = {} as Record<NodeId, NodePosition>;
  if (nodes.length === 0) {
    return positions;
  }

  const adjacency = buildAdjacency(nodes, segments);
  const components = getConnectedComponents(adjacency).sort((left, right) => {
    const leftFirst = left[0] ?? "";
    const rightFirst = right[0] ?? "";
    return leftFirst.localeCompare(rightFirst);
  });
  const componentGapX = 72;
  const componentGapY = 72;
  const outerPadding = 32;
  let cursorX = outerPadding;
  let cursorY = outerPadding;
  let rowHeight = 0;

  for (const componentNodeIds of components) {
    const localLayout = createComponentLayout(componentNodeIds, adjacency);
    const layoutWidth = Math.max(localLayout.width, 1);
    const layoutHeight = Math.max(localLayout.height, 1);
    if (cursorX > outerPadding && cursorX + layoutWidth > NETWORK_VIEW_WIDTH - outerPadding) {
      cursorX = outerPadding;
      cursorY += rowHeight + componentGapY;
      rowHeight = 0;
    }

    for (const nodeId of componentNodeIds) {
      const localPosition = localLayout.positions[nodeId];
      if (localPosition === undefined) {
        continue;
      }

      positions[nodeId] = {
        x: cursorX + localPosition.x,
        y: cursorY + localPosition.y
      };
    }

    cursorX += layoutWidth + componentGapX;
    rowHeight = Math.max(rowHeight, layoutHeight);
  }

  const allNodeIds = nodes.map((node) => node.id);
  const availablePositions = allNodeIds
    .map((nodeId) => positions[nodeId])
    .filter((position): position is NodePosition => position !== undefined);
  if (availablePositions.length === 0) {
    return positions;
  }

  const first = availablePositions[0];
  if (first === undefined) {
    return positions;
  }

  let minX = first.x;
  let maxX = first.x;
  let minY = first.y;
  let maxY = first.y;
  for (const position of availablePositions.slice(1)) {
    minX = Math.min(minX, position.x);
    maxX = Math.max(maxX, position.x);
    minY = Math.min(minY, position.y);
    maxY = Math.max(maxY, position.y);
  }

  const contentWidth = Math.max(1, maxX - minX);
  const contentHeight = Math.max(1, maxY - minY);
  const targetPadding = 24;
  const maxWidth = Math.max(1, NETWORK_VIEW_WIDTH - targetPadding * 2);
  const maxHeight = Math.max(1, NETWORK_VIEW_HEIGHT - targetPadding * 2);
  const fitScale = Math.min(1, maxWidth / contentWidth, maxHeight / contentHeight);
  const fittedWidth = contentWidth * fitScale;
  const fittedHeight = contentHeight * fitScale;
  const offsetX = (NETWORK_VIEW_WIDTH - fittedWidth) / 2;
  const offsetY = (NETWORK_VIEW_HEIGHT - fittedHeight) / 2;

  for (const nodeId of allNodeIds) {
    const position = positions[nodeId];
    if (position === undefined) {
      continue;
    }

    const rawX = offsetX + (position.x - minX) * fitScale;
    const rawY = offsetY + (position.y - minY) * fitScale;
    const maybeSnappedX = shouldSnapToGrid ? snapToGrid(rawX, gridStep) : rawX;
    const maybeSnappedY = shouldSnapToGrid ? snapToGrid(rawY, gridStep) : rawY;
    positions[nodeId] = {
      x: clamp(maybeSnappedX, 20, NETWORK_VIEW_WIDTH - 20),
      y: clamp(maybeSnappedY, 20, NETWORK_VIEW_HEIGHT - 20)
    };
  }

  return resolveVisualOverlaps(positions, segments, options);
}
