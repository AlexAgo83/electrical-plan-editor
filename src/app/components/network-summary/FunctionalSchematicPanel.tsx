import { useMemo, useRef, useState, type ReactElement } from "react";
import type { CatalogItem, Connector, ConnectorId, Network, Segment, Splice, SpliceId, Wire } from "../../../core/entities";
import {
  buildFunctionalSchematicGraph,
  type FunctionalSchematicEdge,
  type FunctionalDomainFilter,
  type FunctionalSchematicGraph,
  type FunctionalSchematicNode,
  type FunctionalTraceSeed
} from "../../../core/functionalSchematic";
import { CABLE_COLOR_BY_ID, getWireColorCode, getWireColorLabel } from "../../../core/cableColors";
import type { CanvasExportFormat } from "../../types/app-controller";
import { useNetworkSummaryExportActions } from "./export/useNetworkSummaryExportActions";

interface FunctionalSchematicPanelProps {
  network: Pick<Network, "name" | "voltageV" | "createdAt" | "author" | "projectCode" | "logoUrl" | "exportNotes"> | null;
  wires: Wire[];
  segments: Segment[];
  catalogItems: CatalogItem[];
  connectorMap: ReadonlyMap<ConnectorId, Connector>;
  spliceMap: ReadonlyMap<SpliceId, Splice>;
  rootConnectorIds?: readonly ConnectorId[];
  assemblyGraph?: FunctionalSchematicGraph;
  assemblyGraphFactory?: (activeFilter: FunctionalDomainFilter) => FunctionalSchematicGraph;
  title?: string;
  titleSuffix?: string;
  subtitle?: string;
  selectedWireId: Wire["id"] | null;
  selectedConnectorId: ConnectorId | null;
  selectedSpliceId: SpliceId | null;
  canvasExportFormat: CanvasExportFormat;
  pngExportIncludeBackground: boolean;
  exportIncludeFrame: boolean;
  exportIncludeCartouche: boolean;
  exportCartoucheName?: string;
  exportCartoucheAuthor?: string;
  exportCartoucheProjectCode?: string;
  exportCartoucheCreatedAt?: string;
  exportCartoucheLogoUrl?: string;
  exportCartoucheNotes?: string;
  onOpenActiveNetworkInModeling?: () => void;
  onOpenOnboardingHelp?: () => void;
  onboardingPanelKey?: string;
}

interface FunctionalNodePosition {
  x: number;
  y: number;
}

interface FunctionalSchematicLayout {
  positions: Map<string, FunctionalNodePosition>;
  width: number;
  height: number;
}

interface FunctionalEdgeLabelCandidate {
  labelX: number;
  labelY: number;
  distanceFromNominal: number;
}

interface FunctionalLabelCollisionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

type WireColorPresentationInput = Parameters<typeof getWireColorCode>[0];

interface FunctionalEdgeRenderModel {
  id: string;
  path: string;
  midX: number;
  midY: number;
  labelX: number;
  labelY: number;
  labelCandidates: FunctionalEdgeLabelCandidate[];
  labelCurveFrom: FunctionalNodePosition;
  labelCurveTo: FunctionalNodePosition;
  labelBoxWidth: number;
  labelBoxHeight: number;
  wireName: string;
  wireTechnicalId: string;
  title: string;
  traceColor: string | null;
  wireColorStyle: {
    primary: string | null;
    secondary: string | null;
  };
}

const FUNCTIONAL_LAYOUT_MARGIN_X = 92;
const FUNCTIONAL_LAYOUT_MARGIN_TOP = 74;
const FUNCTIONAL_LAYOUT_COLUMN_GAP = 165;
const FUNCTIONAL_LAYOUT_ROW_GAP = 124;
const FUNCTIONAL_LAYOUT_SPLICE_FANOUT_ROW_GAP = 172;
const FUNCTIONAL_LAYOUT_LEAF_COLUMN_WIDTH = 0.62;
const FUNCTIONAL_LAYOUT_INTERCONNECTOR_COLUMN_WIDTH = 1.12;
const FUNCTIONAL_LAYOUT_MIN_SIBLING_COLUMN_GAP = 0.06;
const FUNCTIONAL_LAYOUT_MAX_PARENT_GROUP_COLUMN_GAP = 0.42;
const FUNCTIONAL_NODE_HALF_HEIGHT = 26;
const FUNCTIONAL_EDGE_LABEL_GAP = 12;
const FUNCTIONAL_EDGE_LABEL_BOX_MIN_WIDTH = 72;
const FUNCTIONAL_EDGE_LABEL_BOX_HEIGHT = 28;
const FUNCTIONAL_EDGE_LABEL_BOX_GAP = 6;
const FUNCTIONAL_EDGE_LABEL_BOX_TOP_OFFSET = 15;
const FUNCTIONAL_EDGE_LABEL_MAX_ACCEPTABLE_OVERLAP_RATIO = 0.04;
const FUNCTIONAL_EDGE_LABEL_CANDIDATE_STEPS = [0.5, 0.44, 0.56, 0.38, 0.62, 0.32, 0.68] as const;

function resolveSeed({
  selectedWireId,
  selectedConnectorId,
  selectedSpliceId
}: Pick<FunctionalSchematicPanelProps, "selectedWireId" | "selectedConnectorId" | "selectedSpliceId">): FunctionalTraceSeed {
  if (selectedWireId !== null) {
    return { kind: "wire", wireId: selectedWireId };
  }
  if (selectedConnectorId !== null) {
    return { kind: "connector", connectorId: selectedConnectorId };
  }
  return { kind: "splice", spliceId: selectedSpliceId };
}

function getSeedLabel(seed: FunctionalTraceSeed, rootConnectors: readonly Connector[]): string {
  if (rootConnectors.length === 1) {
    return `main connector ${rootConnectors[0]!.technicalId}`;
  }
  if (rootConnectors.length > 1) {
    return `${rootConnectors.length} main connectors`;
  }
  if (seed.kind === "wire") {
    return seed.wireId === null ? "No wire selected" : `Wire ${seed.wireId}`;
  }
  if (seed.kind === "connector") {
    return seed.connectorId === null ? "No connector selected" : `Connector ${seed.connectorId}`;
  }
  return seed.spliceId === null ? "No splice selected" : `Splice ${seed.spliceId}`;
}

function getNodeSortIndex(graph: FunctionalSchematicGraph, nodeId: string): number {
  const edgeIndex = graph.edges.findIndex((edge) => edge.fromNodeId === nodeId || edge.toNodeId === nodeId);
  return edgeIndex === -1 ? Number.MAX_SAFE_INTEGER : edgeIndex;
}

function sortFunctionalNodes(graph: FunctionalSchematicGraph, nodes: FunctionalSchematicNode[]): FunctionalSchematicNode[] {
  return [...nodes].sort((left, right) => {
    return getNodeSortIndex(graph, left.id) - getNodeSortIndex(graph, right.id) || left.label.localeCompare(right.label);
  });
}

function nodeMatchesSeed(node: FunctionalSchematicNode, seed: FunctionalTraceSeed): boolean {
  if (seed.kind === "connector") {
    return seed.connectorId !== null && node.kind === "connector" && node.sourceIds.includes(String(seed.connectorId));
  }
  if (seed.kind === "splice") {
    return seed.spliceId !== null && node.kind === "splice" && node.sourceIds.includes(String(seed.spliceId));
  }
  return false;
}

function getFunctionalLayoutGapBetweenWidths(leftWidth: number, rightWidth: number): number {
  const subtreeExtraWidth =
    Math.max(0, leftWidth - FUNCTIONAL_LAYOUT_LEAF_COLUMN_WIDTH) +
    Math.max(0, rightWidth - FUNCTIONAL_LAYOUT_LEAF_COLUMN_WIDTH);
  return Math.min(
    FUNCTIONAL_LAYOUT_MAX_PARENT_GROUP_COLUMN_GAP,
    FUNCTIONAL_LAYOUT_MIN_SIBLING_COLUMN_GAP + subtreeExtraWidth * 0.04
  );
}

function getFunctionalNodeLayoutWidth(node: FunctionalSchematicNode): number {
  return node.kind === "interconnector" ? FUNCTIONAL_LAYOUT_INTERCONNECTOR_COLUMN_WIDTH : FUNCTIONAL_LAYOUT_LEAF_COLUMN_WIDTH;
}

function sumFunctionalLayoutWidths(widths: number[]): number {
  if (widths.length === 0) {
    return 0;
  }
  return widths.reduce((total, width, index) => {
    const nextWidth = widths[index + 1];
    return total + width + (nextWidth === undefined ? 0 : getFunctionalLayoutGapBetweenWidths(width, nextWidth));
  }, 0);
}

function buildFunctionalSchematicLayout(graph: FunctionalSchematicGraph): FunctionalSchematicLayout {
  const orderedNodes = [...graph.nodes].sort((left, right) => {
    return getNodeSortIndex(graph, left.id) - getNodeSortIndex(graph, right.id) || left.label.localeCompare(right.label);
  });
  const nodeIds = new Set(orderedNodes.map((node) => node.id));
  const nodeById = new Map(orderedNodes.map((node) => [node.id, node]));
  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  orderedNodes.forEach((node) => {
    adjacency.set(node.id, []);
    indegree.set(node.id, 0);
  });

  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.fromNodeId) || !nodeIds.has(edge.toNodeId)) {
      continue;
    }
    adjacency.get(edge.fromNodeId)?.push(edge.toNodeId);
    indegree.set(edge.toNodeId, (indegree.get(edge.toNodeId) ?? 0) + 1);
  }

  let roots = graph.rootNodeIds.flatMap((nodeId) => {
    const node = nodeById.get(nodeId);
    return node === undefined ? [] : [node];
  });
  if (roots.length === 0) {
    roots = orderedNodes.filter((node) => (indegree.get(node.id) ?? 0) === 0);
  }
  if (roots.length === 0) {
    roots = orderedNodes.filter((node) => nodeMatchesSeed(node, graph.seed));
  }
  if (roots.length === 0 && graph.edges.length > 0) {
    const firstEdgeRoot = nodeById.get(graph.edges[0]!.fromNodeId);
    roots = firstEdgeRoot === undefined ? [] : [firstEdgeRoot];
  }
  if (roots.length === 0 && orderedNodes.length > 0) {
    roots = [orderedNodes[0]!];
  }

  const rankByNodeId = new Map<string, number>();
  const queue = sortFunctionalNodes(graph, roots).map((node) => {
    rankByNodeId.set(node.id, 0);
    return node.id;
  });
  const maxTraversalRank = Math.max(0, orderedNodes.length - 1);
  for (let index = 0; index < queue.length; index += 1) {
    const nodeId = queue[index]!;
    const currentRank = rankByNodeId.get(nodeId) ?? 0;
    for (const nextNodeId of adjacency.get(nodeId) ?? []) {
      const nextRank = currentRank + 1;
      if (nextRank > maxTraversalRank) {
        continue;
      }
      if ((rankByNodeId.get(nextNodeId) ?? -1) < nextRank) {
        rankByNodeId.set(nextNodeId, nextRank);
        queue.push(nextNodeId);
      }
    }
  }

  for (const node of orderedNodes) {
    if (!rankByNodeId.has(node.id)) {
      rankByNodeId.set(node.id, Math.max(0, ...rankByNodeId.values()) + 1);
    }
  }

  const rows = new Map<number, FunctionalSchematicNode[]>();
  for (const node of orderedNodes) {
    const rank = rankByNodeId.get(node.id) ?? 0;
    rows.set(rank, [...(rows.get(rank) ?? []), node]);
  }

  const sortedRanks = [...rows.keys()].sort((left, right) => left - right);
  const incomingEdgesByNodeId = new Map<string, FunctionalSchematicEdge[]>();
  const outgoingEdgesByNodeId = new Map<string, FunctionalSchematicEdge[]>();
  for (const edge of graph.edges) {
    incomingEdgesByNodeId.set(edge.toNodeId, [...(incomingEdgesByNodeId.get(edge.toNodeId) ?? []), edge]);
    outgoingEdgesByNodeId.set(edge.fromNodeId, [...(outgoingEdgesByNodeId.get(edge.fromNodeId) ?? []), edge]);
  }
  for (const rank of sortedRanks) {
    const nodes = rows.get(rank) ?? [];
    nodes.sort((left, right) => {
      const parentSortIndex = (nodeId: string) => {
        const parentIndexes = (incomingEdgesByNodeId.get(nodeId) ?? [])
          .map((edge) => getNodeSortIndex(graph, edge.fromNodeId))
          .filter((value) => Number.isFinite(value));
        if (parentIndexes.length === 0) {
          return getNodeSortIndex(graph, nodeId);
        }
        return Math.min(...parentIndexes);
      };
      return parentSortIndex(left.id) - parentSortIndex(right.id) || getNodeSortIndex(graph, left.id) - getNodeSortIndex(graph, right.id) || left.label.localeCompare(right.label);
    });
    rows.set(rank, nodes);
  }

  const columnByNodeId = new Map<string, number>();
  const layoutChildrenByNodeId = new Map<string, FunctionalSchematicNode[]>();
  for (const node of orderedNodes) {
    const nodeRank = rankByNodeId.get(node.id) ?? 0;
    const children = (outgoingEdgesByNodeId.get(node.id) ?? [])
      .filter((edge) => (rankByNodeId.get(edge.toNodeId) ?? 0) > nodeRank)
      .sort((left, right) => getNodeSortIndex(graph, left.toNodeId) - getNodeSortIndex(graph, right.toNodeId))
      .flatMap((edge) => {
        const childNode = nodeById.get(edge.toNodeId);
        return childNode === undefined ? [] : [childNode];
      });
    layoutChildrenByNodeId.set(node.id, children);
  }

  const layoutWidthByNodeId = new Map<string, number>();
  for (const rank of [...sortedRanks].reverse()) {
    const row = rows.get(rank) ?? [];
    for (const node of row) {
      const children = layoutChildrenByNodeId.get(node.id) ?? [];
      const childWidths = children.map((child) => layoutWidthByNodeId.get(child.id) ?? getFunctionalNodeLayoutWidth(child));
      layoutWidthByNodeId.set(node.id, Math.max(getFunctionalNodeLayoutWidth(node), sumFunctionalLayoutWidths(childWidths)));
    }
  }

  const assignChildrenColumns = (parentNodeId: string): void => {
    const parentColumn = columnByNodeId.get(parentNodeId);
    if (parentColumn === undefined) {
      return;
    }
    const children = layoutChildrenByNodeId.get(parentNodeId) ?? [];
    const childWidths = children.map((child) => layoutWidthByNodeId.get(child.id) ?? getFunctionalNodeLayoutWidth(child));
    const totalChildWidth = sumFunctionalLayoutWidths(childWidths);
    let nextColumn = parentColumn - totalChildWidth / 2;
    children.forEach((child, index) => {
      const childWidth = childWidths[index] ?? FUNCTIONAL_LAYOUT_LEAF_COLUMN_WIDTH;
      if (!columnByNodeId.has(child.id)) {
        columnByNodeId.set(child.id, nextColumn + childWidth / 2);
      }
      const nextChildWidth = childWidths[index + 1];
      nextColumn += childWidth + (nextChildWidth === undefined ? 0 : getFunctionalLayoutGapBetweenWidths(childWidth, nextChildWidth));
    });
  };

  const rootIds = new Set(roots.map((root) => root.id));
  const assignRootColumns = (rootNodes: FunctionalSchematicNode[], startColumn: number): number => {
    const rootWidths = rootNodes.map((root) => layoutWidthByNodeId.get(root.id) ?? getFunctionalNodeLayoutWidth(root));
    let nextColumn = startColumn;
    rootNodes.forEach((root, index) => {
      const rootWidth = rootWidths[index] ?? FUNCTIONAL_LAYOUT_LEAF_COLUMN_WIDTH;
      columnByNodeId.set(root.id, nextColumn + rootWidth / 2);
      const nextRootWidth = rootWidths[index + 1];
      nextColumn += rootWidth + (nextRootWidth === undefined ? 0 : getFunctionalLayoutGapBetweenWidths(rootWidth, nextRootWidth));
    });
    return nextColumn;
  };

  let nextDisconnectedColumn = assignRootColumns(sortFunctionalNodes(graph, roots), 0);
  for (const rank of sortedRanks) {
    const row = rows.get(rank) ?? [];
    for (const node of row) {
      if (!columnByNodeId.has(node.id)) {
        nextDisconnectedColumn = assignRootColumns([node], nextDisconnectedColumn);
      }
      assignChildrenColumns(node.id);
    }
    const disconnectedNodes = row.filter((node) => !rootIds.has(node.id) && (incomingEdgesByNodeId.get(node.id) ?? []).length === 0);
    if (disconnectedNodes.length > 0) {
      const lastDisconnectedNode = disconnectedNodes.at(-1)!;
      const lastDisconnectedWidth =
        layoutWidthByNodeId.get(lastDisconnectedNode.id) ?? getFunctionalNodeLayoutWidth(lastDisconnectedNode);
      nextDisconnectedColumn += getFunctionalLayoutGapBetweenWidths(lastDisconnectedWidth, getFunctionalNodeLayoutWidth(lastDisconnectedNode));
    }
  }

  const minColumn = Math.min(0, ...columnByNodeId.values());
  const maxColumn = Math.max(0, ...columnByNodeId.values());
  const width = Math.max(760, FUNCTIONAL_LAYOUT_MARGIN_X * 2 + (maxColumn - minColumn) * FUNCTIONAL_LAYOUT_COLUMN_GAP);
  const yByRank = new Map<number, number>();
  let nextRankY = FUNCTIONAL_LAYOUT_MARGIN_TOP;
  for (const rank of sortedRanks) {
    yByRank.set(rank, nextRankY);
    const row = rows.get(rank) ?? [];
    const hasHighFanoutParent = row.some((node) => {
      return (outgoingEdgesByNodeId.get(node.id)?.length ?? 0) >= 3;
    });
    nextRankY += hasHighFanoutParent ? FUNCTIONAL_LAYOUT_SPLICE_FANOUT_ROW_GAP : FUNCTIONAL_LAYOUT_ROW_GAP;
  }
  const height = Math.max(320, nextRankY + FUNCTIONAL_LAYOUT_MARGIN_TOP - FUNCTIONAL_LAYOUT_ROW_GAP);
  const positions = new Map<string, FunctionalNodePosition>();
  for (const rank of sortedRanks) {
    const row = rows.get(rank) ?? [];
    row.forEach((node) => {
      const column = columnByNodeId.get(node.id) ?? 0;
      positions.set(node.id, {
        x: FUNCTIONAL_LAYOUT_MARGIN_X + (column - minColumn) * FUNCTIONAL_LAYOUT_COLUMN_GAP,
        y: yByRank.get(rank) ?? FUNCTIONAL_LAYOUT_MARGIN_TOP
      });
    });
  }

  return { positions, width, height };
}

function buildFunctionalEdgePath(from: FunctionalNodePosition, to: FunctionalNodePosition): string {
  const startX = from.x;
  const startY = from.y + FUNCTIONAL_NODE_HALF_HEIGHT;
  const endX = to.x;
  const endY = to.y - FUNCTIONAL_NODE_HALF_HEIGHT;
  const controlOffset = Math.max(36, Math.abs(endY - startY) * 0.46);
  return `M ${startX} ${startY} C ${startX} ${startY + controlOffset} ${endX} ${endY - controlOffset} ${endX} ${endY}`;
}

function getFunctionalEdgePointAt(from: FunctionalNodePosition, to: FunctionalNodePosition, t: number): FunctionalNodePosition {
  const startX = from.x;
  const startY = from.y + FUNCTIONAL_NODE_HALF_HEIGHT;
  const endX = to.x;
  const endY = to.y - FUNCTIONAL_NODE_HALF_HEIGHT;
  const controlOffset = Math.max(36, Math.abs(endY - startY) * 0.46);
  const controlPointA = { x: startX, y: startY + controlOffset };
  const controlPointB = { x: endX, y: endY - controlOffset };
  const oneMinusT = 1 - t;
  return {
    x:
      oneMinusT ** 3 * startX +
      3 * oneMinusT ** 2 * t * controlPointA.x +
      3 * oneMinusT * t ** 2 * controlPointB.x +
      t ** 3 * endX,
    y:
      oneMinusT ** 3 * startY +
      3 * oneMinusT ** 2 * t * controlPointA.y +
      3 * oneMinusT * t ** 2 * controlPointB.y +
      t ** 3 * endY
  };
}

function getFunctionalEdgePointAtY(
  from: FunctionalNodePosition,
  to: FunctionalNodePosition,
  targetY: number
): FunctionalNodePosition {
  const startY = from.y + FUNCTIONAL_NODE_HALF_HEIGHT;
  const endY = to.y - FUNCTIONAL_NODE_HALF_HEIGHT;
  if (targetY <= startY) {
    return getFunctionalEdgePointAt(from, to, 0);
  }
  if (targetY >= endY) {
    return getFunctionalEdgePointAt(from, to, 1);
  }

  let minT = 0;
  let maxT = 1;
  for (let index = 0; index < 16; index += 1) {
    const midT = (minT + maxT) / 2;
    const midPoint = getFunctionalEdgePointAt(from, to, midT);
    if (midPoint.y < targetY) {
      minT = midT;
    } else {
      maxT = midT;
    }
  }
  return getFunctionalEdgePointAt(from, to, (minT + maxT) / 2);
}

function getFunctionalEdgeLabelCandidates(from: FunctionalNodePosition, to: FunctionalNodePosition): FunctionalEdgeLabelCandidate[] {
  const nominalPoint = getFunctionalEdgePointAt(from, to, 0.5);
  return FUNCTIONAL_EDGE_LABEL_CANDIDATE_STEPS.map((step) => {
    const point = getFunctionalEdgePointAt(from, to, step);
    return {
      labelX: point.x,
      labelY: point.y,
      distanceFromNominal: Math.hypot(point.x - nominalPoint.x, point.y - nominalPoint.y)
    };
  });
}

function getFunctionalEdgeWire(edge: FunctionalSchematicEdge, wireMap: ReadonlyMap<Wire["id"], Wire>): Wire | null {
  for (const wireId of edge.sourceWireIds) {
    const wire = wireMap.get(wireId);
    if (wire !== undefined) {
      return wire;
    }
  }
  return null;
}

function getFunctionalEdgeColorStyle(wireColor: WireColorPresentationInput | null): { primary: string | null; secondary: string | null } {
  const primaryColorId = wireColor?.primaryColorId ?? null;
  const secondaryColorId = wireColor?.secondaryColorId ?? null;
  if (wireColor === null || wireColor.colorMode === "free" || primaryColorId === null) {
    return { primary: null, secondary: null };
  }
  const primary = CABLE_COLOR_BY_ID[primaryColorId]?.hex ?? null;
  const secondary = secondaryColorId === null ? null : CABLE_COLOR_BY_ID[secondaryColorId]?.hex ?? null;
  return { primary, secondary };
}

function getFunctionalEdgeWireColorInput(edge: FunctionalSchematicEdge, wire: Wire | null): WireColorPresentationInput | null {
  if (wire !== null) {
    return wire;
  }
  if (edge.wirePrimaryColorId === undefined && edge.wireSecondaryColorId === undefined && edge.wireFreeColorLabel === undefined) {
    return null;
  }
  return {
    colorMode: edge.wireColorMode,
    primaryColorId: edge.wirePrimaryColorId ?? null,
    secondaryColorId: edge.wireSecondaryColorId ?? null,
    freeColorLabel: edge.wireFreeColorLabel
  };
}

function estimateFunctionalEdgeLabelBoxWidth(wireName: string, wireTechnicalId: string): number {
  const longestLabelLength = Math.max(wireName.length, wireTechnicalId.length);
  return Math.max(FUNCTIONAL_EDGE_LABEL_BOX_MIN_WIDTH, longestLabelLength * 5.4 + 18);
}

function getFunctionalEdgeLabelCollisionBox(
  edge: Pick<FunctionalEdgeRenderModel, "labelX" | "labelY" | "labelBoxWidth" | "labelBoxHeight">
): FunctionalLabelCollisionBox {
  return {
    x: edge.labelX,
    y: edge.labelY - FUNCTIONAL_EDGE_LABEL_BOX_TOP_OFFSET + edge.labelBoxHeight / 2,
    width: edge.labelBoxWidth,
    height: edge.labelBoxHeight
  };
}

function getFunctionalLabelActualOverlapRatio(left: FunctionalLabelCollisionBox, right: FunctionalLabelCollisionBox): number {
  const overlapWidth = Math.max(0, Math.min(left.x + left.width / 2, right.x + right.width / 2) - Math.max(left.x - left.width / 2, right.x - right.width / 2));
  const overlapHeight = Math.max(0, Math.min(left.y + left.height / 2, right.y + right.height / 2) - Math.max(left.y - left.height / 2, right.y - right.height / 2));
  const overlapArea = overlapWidth * overlapHeight;
  if (overlapArea === 0) {
    return 0;
  }
  return overlapArea / Math.min(left.width * left.height, right.width * right.height);
}

function getFunctionalNodeCollisionBox(node: FunctionalSchematicNode, position: FunctionalNodePosition): FunctionalLabelCollisionBox {
  if (node.kind === "splice") {
    return { x: position.x, y: position.y, width: 58, height: 58 };
  }
  if (node.kind === "fuse") {
    return { x: position.x, y: position.y, width: 76, height: 46 };
  }
  if (node.kind === "interconnector") {
    return { x: position.x, y: position.y, width: 168, height: 78 };
  }
  if (node.kind === "connector" && node.detailTop !== undefined) {
    return { x: position.x, y: position.y, width: 124, height: 62 };
  }
  return { x: position.x, y: position.y, width: 100, height: 48 };
}

function getFunctionalEdgeLabelPlacementCandidates(edge: FunctionalEdgeRenderModel): FunctionalEdgeRenderModel[] {
  const curveStartY = edge.labelCurveFrom.y + FUNCTIONAL_NODE_HALF_HEIGHT;
  const curveEndY = edge.labelCurveTo.y - FUNCTIONAL_NODE_HALF_HEIGHT;
  const minLabelY = Math.min(curveStartY, curveEndY) + 8;
  const maxLabelY = Math.max(curveStartY, curveEndY) - 8;
  const candidates = edge.labelCandidates.map((candidate) => ({
    ...edge,
    labelX: candidate.labelX,
    labelY: candidate.labelY
  }));

  let nextLabelY = Math.max(edge.midY + edge.labelBoxHeight + FUNCTIONAL_EDGE_LABEL_BOX_GAP, minLabelY);
  while (nextLabelY <= maxLabelY) {
    const pointOnNominalWire = getFunctionalEdgePointAtY(edge.labelCurveFrom, edge.labelCurveTo, nextLabelY);
    candidates.push({
      ...edge,
      labelX: pointOnNominalWire.x,
      labelY: nextLabelY
    });
    nextLabelY += edge.labelBoxHeight + FUNCTIONAL_EDGE_LABEL_BOX_GAP;
  }

  return candidates.filter((candidate) => candidate.labelY >= minLabelY && candidate.labelY <= maxLabelY);
}

function scoreFunctionalEdgeLabelCandidate(
  edge: FunctionalEdgeRenderModel,
  candidate: FunctionalEdgeRenderModel,
  obstacleBoxes: readonly FunctionalLabelCollisionBox[]
): {
  candidate: FunctionalEdgeRenderModel;
  maxOverlapRatio: number;
  totalOverlapRatio: number;
  distanceFromNominal: number;
} {
  const candidateBox = getFunctionalEdgeLabelCollisionBox(candidate);
  const overlapRatios = obstacleBoxes.map((box) => getFunctionalLabelActualOverlapRatio(candidateBox, box));
  const maxOverlapRatio = Math.max(0, ...overlapRatios);
  const totalOverlapRatio = overlapRatios.reduce((total, ratio) => total + ratio, 0);
  return {
    candidate,
    maxOverlapRatio,
    totalOverlapRatio,
    distanceFromNominal: Math.hypot(candidate.labelX - edge.midX, candidate.labelY - edge.midY)
  };
}

function resolveFunctionalEdgeLabelPositions(
  edgeRenderModels: FunctionalEdgeRenderModel[],
  nodeCollisionBoxes: readonly FunctionalLabelCollisionBox[]
): FunctionalEdgeRenderModel[] {
  const placedLabels: FunctionalEdgeRenderModel[] = [];
  return [...edgeRenderModels]
    .sort((left, right) => left.midY - right.midY || left.midX - right.midX)
    .map((edge) => {
      const obstacleBoxes = [
        ...placedLabels.map((placed) => getFunctionalEdgeLabelCollisionBox(placed)),
        ...nodeCollisionBoxes
      ];
      const scoredCandidates = getFunctionalEdgeLabelPlacementCandidates(edge)
        .map((candidate) => scoreFunctionalEdgeLabelCandidate(edge, candidate, obstacleBoxes))
        .sort((left, right) => {
          const leftIsAcceptable = left.maxOverlapRatio <= FUNCTIONAL_EDGE_LABEL_MAX_ACCEPTABLE_OVERLAP_RATIO;
          const rightIsAcceptable = right.maxOverlapRatio <= FUNCTIONAL_EDGE_LABEL_MAX_ACCEPTABLE_OVERLAP_RATIO;
          if (leftIsAcceptable !== rightIsAcceptable) {
            return leftIsAcceptable ? -1 : 1;
          }
          return (
            left.maxOverlapRatio - right.maxOverlapRatio ||
            left.totalOverlapRatio - right.totalOverlapRatio ||
            left.distanceFromNominal - right.distanceFromNominal
          );
        });
      const nextEdge = scoredCandidates[0]?.candidate ?? edge;
      placedLabels.push(nextEdge);
      return nextEdge;
    });
}

function getNodeClassName(node: FunctionalSchematicNode): string {
  return `functional-node functional-node--${node.kind} functional-node--${node.role}`;
}

function renderNodeShape(node: FunctionalSchematicNode, position: FunctionalNodePosition): ReactElement {
  if (node.kind === "splice") {
    return (
      <rect
        className="functional-node-shape"
        x={position.x - 22}
        y={position.y - 22}
        width={44}
        height={44}
        rx={7}
        transform={`rotate(45 ${position.x} ${position.y})`}
      />
    );
  }
  if (node.kind === "fuse") {
    return <rect className="functional-node-shape" x={position.x - 32} y={position.y - 18} width={64} height={36} rx={6} />;
  }
  if (node.kind === "interconnector") {
    return <rect className="functional-node-shape" x={position.x - 78} y={position.y - 33} width={156} height={66} rx={6} />;
  }
  if (node.kind === "connector" && node.detailTop !== undefined) {
    return <rect className="functional-node-shape" x={position.x - 55} y={position.y - 27} width={110} height={54} rx={7} />;
  }
  return <rect className="functional-node-shape" x={position.x - 46} y={position.y - 20} width={92} height={40} rx={7} />;
}

function renderNodeText(node: FunctionalSchematicNode, position: FunctionalNodePosition): ReactElement {
  if (node.kind === "interconnector") {
    return (
      <>
        <text className="functional-node-detail functional-node-detail--top" x={position.x} y={position.y - 16} textAnchor="middle">
          {node.detailTop ?? node.detail}
        </text>
        <text className="functional-node-label functional-node-label--interconnector" x={position.x} y={position.y + 3} textAnchor="middle">
          {node.label}
        </text>
        <text className="functional-node-detail functional-node-detail--bottom" x={position.x} y={position.y + 20} textAnchor="middle">
          {node.detailBottom ?? node.detail}
        </text>
      </>
    );
  }

  if (node.kind === "connector" && node.detailTop !== undefined) {
    return (
      <>
        <text className="functional-node-network-label" x={position.x - 48} y={position.y - 14} textAnchor="start">
          {node.detailTop}
        </text>
        <text className="functional-node-label" x={position.x} y={position.y + 2} textAnchor="middle">
          {node.label}
        </text>
        <text className="functional-node-detail" x={position.x} y={position.y + 17} textAnchor="middle">
          {node.detail}
        </text>
      </>
    );
  }

  return (
    <>
      <text className="functional-node-label" x={position.x} y={position.y - 2} textAnchor="middle">
        {node.label}
      </text>
      <text className="functional-node-detail" x={position.x} y={position.y + 13} textAnchor="middle">
        {node.detail}
      </text>
    </>
  );
}

export function FunctionalSchematicPanel({
  network,
  wires,
  segments,
  catalogItems,
  connectorMap,
  spliceMap,
  rootConnectorIds = [],
  assemblyGraph,
  assemblyGraphFactory,
  title = "Functional schematic",
  titleSuffix,
  subtitle,
  selectedWireId,
  selectedConnectorId,
  selectedSpliceId,
  canvasExportFormat,
  pngExportIncludeBackground,
  exportIncludeFrame,
  exportIncludeCartouche,
  exportCartoucheName,
  exportCartoucheAuthor,
  exportCartoucheProjectCode,
  exportCartoucheCreatedAt,
  exportCartoucheLogoUrl,
  exportCartoucheNotes,
  onOpenActiveNetworkInModeling,
  onOpenOnboardingHelp,
  onboardingPanelKey
}: FunctionalSchematicPanelProps): ReactElement {
  const [activeFilter, setActiveFilter] = useState<FunctionalDomainFilter>("all");
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const seed = useMemo(
    () => resolveSeed({ selectedWireId, selectedConnectorId, selectedSpliceId }),
    [selectedConnectorId, selectedSpliceId, selectedWireId]
  );
  const catalogItemMap = useMemo(
    () => new Map(catalogItems.map((catalogItem) => [catalogItem.id, catalogItem])),
    [catalogItems]
  );
  const rootConnectors = useMemo(
    () =>
      rootConnectorIds
        .map((connectorId) => connectorMap.get(connectorId))
        .filter((connector): connector is Connector => connector !== undefined),
    [connectorMap, rootConnectorIds]
  );
  const wireMap = useMemo(() => new Map(wires.map((wire) => [wire.id, wire])), [wires]);
  const graph = useMemo(
    () =>
      assemblyGraph ??
      assemblyGraphFactory?.(activeFilter) ??
      buildFunctionalSchematicGraph({
        network,
        seed,
        activeFilter,
        wires,
        segments,
        connectorMap,
        spliceMap,
        catalogItemMap,
        rootConnectorIds
      }),
    [activeFilter, assemblyGraph, assemblyGraphFactory, catalogItemMap, connectorMap, network, rootConnectorIds, seed, segments, spliceMap, wires]
  );
  const schematicLayout = useMemo(() => buildFunctionalSchematicLayout(graph), [graph]);
  const nodePositions = schematicLayout.positions;
  const svgWidth = schematicLayout.width;
  const baseSvgHeight = schematicLayout.height;
  const nodeCollisionBoxes = useMemo(
    () =>
      graph.nodes.flatMap((node) => {
        const position = nodePositions.get(node.id);
        return position === undefined ? [] : [getFunctionalNodeCollisionBox(node, position)];
      }),
    [graph.nodes, nodePositions]
  );
  const edgeRenderModels = useMemo<FunctionalEdgeRenderModel[]>(() => {
    const baseEdgeRenderModels = graph.edges.flatMap((edge) => {
      const from = nodePositions.get(edge.fromNodeId);
      const to = nodePositions.get(edge.toNodeId);
      if (from === undefined || to === undefined) {
        return [];
      }
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      const wire = getFunctionalEdgeWire(edge, wireMap);
      const wireName = wire?.name.trim() || edge.wireName?.trim() || edge.label;
      const wireTechnicalId = wire?.technicalId.trim() || edge.wireTechnicalId?.trim() || edge.label;
      const wireColorInput = getFunctionalEdgeWireColorInput(edge, wire);
      const wireColorCode = wireColorInput === null ? "" : getWireColorCode(wireColorInput);
      const wireColorLabel = wireColorInput === null ? "No color" : getWireColorLabel(wireColorInput);
      return [
        {
          id: edge.id,
          path: buildFunctionalEdgePath(from, to),
          midX,
          midY,
          labelX: midX,
          labelY: midY,
          labelCandidates: getFunctionalEdgeLabelCandidates(from, to),
          labelCurveFrom: from,
          labelCurveTo: to,
          labelBoxWidth: estimateFunctionalEdgeLabelBoxWidth(wireName, wireTechnicalId),
          labelBoxHeight: FUNCTIONAL_EDGE_LABEL_BOX_HEIGHT,
          wireName,
          wireTechnicalId,
          title: `${wireName} ${wireTechnicalId}${wireColorCode.length > 0 ? ` ${wireColorCode}` : ""} - ${wireColorLabel}`,
          traceColor: edge.harnessColor ?? null,
          wireColorStyle: getFunctionalEdgeColorStyle(wireColorInput)
        }
      ];
    });
    return resolveFunctionalEdgeLabelPositions(baseEdgeRenderModels, nodeCollisionBoxes);
  }, [graph.edges, nodeCollisionBoxes, nodePositions, wireMap]);
  const svgHeight = Math.max(
    baseSvgHeight,
    ...edgeRenderModels.map((edge) => edge.labelY + edge.labelBoxHeight / 2 + FUNCTIONAL_LAYOUT_MARGIN_TOP)
  );
  const { handleExportPlan } = useNetworkSummaryExportActions({
    networkSvgRef: svgRef,
    networkCanvasShellRef: shellRef,
    canvasExportFormat,
    networkOffset: { x: 0, y: 0 },
    networkScale: 1,
    renderedNetworkScale: 1,
    pngExportIncludeBackground,
    exportIncludeFrame,
    exportIncludeCartouche,
    exportCartoucheNetworkName: exportCartoucheName ?? `${network?.name ?? "Network"} functional schematic`,
    exportCartoucheAuthor: exportCartoucheAuthor ?? network?.author,
    exportCartoucheProjectCode: exportCartoucheProjectCode ?? network?.projectCode,
    exportCartoucheCreatedAt: exportCartoucheCreatedAt ?? network?.createdAt ?? new Date().toISOString(),
    exportCartoucheLogoUrl: exportCartoucheLogoUrl ?? network?.logoUrl,
    exportCartoucheNotes: exportCartoucheNotes ?? network?.exportNotes
  });
  const canExport = graph.nodes.length > 0;
  return (
    <section
      className="panel functional-schematic-panel"
      aria-labelledby="functional-schematic-title"
      data-onboarding-panel={onboardingPanelKey}
    >
      <header className="network-summary-header">
        <div>
          <div className="network-summary-title">
            <h2 id="functional-schematic-title">{title}</h2>
            {titleSuffix !== undefined && titleSuffix.length > 0 ? (
              <span className="network-summary-active-network" aria-hidden="true">
                {titleSuffix}
              </span>
            ) : null}
          </div>
          <p className="functional-schematic-subtitle">
            {subtitle ?? `Read-only trace from ${getSeedLabel(seed, rootConnectors)}.`} {graph.includedWireIds.length} wire
            {graph.includedWireIds.length === 1 ? "" : "s"} included.
          </p>
        </div>
        <div className="network-summary-header-actions" role="group" aria-label="Functional schematic actions">
          <button
            type="button"
            className={showGrid ? "workspace-tab is-active" : "workspace-tab"}
            onClick={() => setShowGrid((current) => !current)}
          >
            <span className="network-summary-grid-icon" aria-hidden="true" />
            Grid
          </button>
          {onOpenActiveNetworkInModeling === undefined ? null : (
            <button
              type="button"
              className="workspace-tab"
              onClick={onOpenActiveNetworkInModeling}
            >
              <span className="action-button-icon is-network-scope" aria-hidden="true" />
              Active network
            </button>
          )}
          <button
            type="button"
            className="workspace-tab network-summary-export-button"
            onClick={handleExportPlan}
            disabled={!canExport}
          >
            <span className="network-summary-export-icon" aria-hidden="true" />
            Export {canvasExportFormat.toUpperCase()}
          </button>
          {onOpenOnboardingHelp === undefined ? null : (
            <button type="button" className="workspace-tab onboarding-help-button" onClick={onOpenOnboardingHelp}>
              <span className="action-button-icon is-help" aria-hidden="true" />
              Help
            </button>
          )}
        </div>
      </header>

      <div className="functional-schematic-filters" aria-label="Functional schematic filters">
        {graph.availableFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={filter === activeFilter ? "workspace-tab is-active" : "workspace-tab"}
            aria-pressed={filter === activeFilter}
            onClick={() => setActiveFilter(filter)}
          >
            {filter === "all" ? "All" : filter}
          </button>
        ))}
      </div>

      <div ref={shellRef} className="network-canvas-shell functional-schematic-canvas-shell">
        {graph.nodes.length === 0 ? (
          <p className="empty-copy">
            {rootConnectors.length > 0
              ? "No functional trace is connected to the configured main harness connector selection."
              : "Select a wire, connector, or splice to generate a functional trace."}
          </p>
        ) : (
          <svg
            ref={svgRef}
            className={showGrid ? "functional-schematic-svg" : "functional-schematic-svg is-grid-hidden"}
            aria-label="Read-only functional schematic"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ height: `${svgHeight}px` }}
          >
            <g className="functional-edge-layer">
              {edgeRenderModels.map((edge) => {
                return (
                  <g key={edge.id} className={hoveredEdgeId === edge.id ? "functional-edge is-hovered" : "functional-edge"}>
                    <title>{edge.title}</title>
                    <path d={edge.path} style={edge.traceColor === null ? undefined : { stroke: edge.traceColor }} />
                    {edge.wireColorStyle.primary !== null ? (
                      <line
                        className="functional-edge-color-swatch"
                        x1={edge.labelX - 35}
                        y1={edge.labelY + FUNCTIONAL_EDGE_LABEL_GAP + 7}
                        x2={edge.wireColorStyle.secondary === null ? edge.labelX + 35 : edge.labelX}
                        y2={edge.labelY + FUNCTIONAL_EDGE_LABEL_GAP + 7}
                        style={{ stroke: edge.wireColorStyle.primary }}
                      />
                    ) : null}
                    {edge.wireColorStyle.secondary !== null ? (
                      <line
                        className="functional-edge-color-swatch"
                        x1={edge.labelX}
                        y1={edge.labelY + FUNCTIONAL_EDGE_LABEL_GAP + 7}
                        x2={edge.labelX + 35}
                        y2={edge.labelY + FUNCTIONAL_EDGE_LABEL_GAP + 7}
                        style={{ stroke: edge.wireColorStyle.secondary }}
                      />
                    ) : null}
                  </g>
                );
              })}
            </g>
            <g className="functional-node-layer">
              {graph.nodes.map((node) => {
                const position = nodePositions.get(node.id);
                if (position === undefined) {
                  return null;
                }
                return (
                  <g
                    key={node.id}
                    className={getNodeClassName(node)}
                  >
                    <title>{`${node.label} ${node.detail}`}</title>
                    {renderNodeShape(node, position)}
                    {renderNodeText(node, position)}
                  </g>
                );
              })}
            </g>
            <g className="functional-edge-label-layer">
              {edgeRenderModels.map((edge) => (
                <g
                  key={`${edge.id}-label`}
                  className={hoveredEdgeId === edge.id ? "functional-edge-label is-hovered" : "functional-edge-label"}
                  tabIndex={0}
                  role="img"
                  aria-label={edge.title}
                  onMouseEnter={() => setHoveredEdgeId(edge.id)}
                  onMouseLeave={() => setHoveredEdgeId((current) => (current === edge.id ? null : current))}
                  onFocus={() => setHoveredEdgeId(edge.id)}
                  onBlur={() => setHoveredEdgeId((current) => (current === edge.id ? null : current))}
                >
                  <rect
                    className="functional-edge-label-hitbox"
                    x={edge.labelX - edge.labelBoxWidth / 2}
                    y={edge.labelY - FUNCTIONAL_EDGE_LABEL_BOX_TOP_OFFSET}
                    width={edge.labelBoxWidth}
                    height={edge.labelBoxHeight}
                    rx={4}
                  />
                  <text className="functional-edge-name" x={edge.labelX} y={edge.labelY - 4} textAnchor="middle">
                    {edge.wireName}
                  </text>
                  <text className="functional-edge-tech-label" x={edge.labelX} y={edge.labelY + FUNCTIONAL_EDGE_LABEL_GAP} textAnchor="middle">
                    {edge.wireTechnicalId}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        )}
      </div>

      {graph.warnings.length > 0 ? (
        <div className="functional-schematic-warnings" role="status" aria-label="Functional schematic warnings">
          {graph.warnings.slice(0, 6).map((warning, index) => (
            <p key={`${warning.kind}-${warning.sourceId ?? "global"}-${index}`}>{warning.message}</p>
          ))}
          {graph.warnings.length > 6 ? <p>{graph.warnings.length - 6} additional warnings hidden.</p> : null}
        </div>
      ) : null}
    </section>
  );
}
