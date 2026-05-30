import type { CatalogItem, Connector, NetworkNode, Segment, Splice, Wire, WireEndpoint } from "../../core/entities";
import type { LayoutNodePosition } from "../../store/types";
import type { AiAgentContext } from "./aiAgentContext";
import { AI_AGENT_OPERATION_SCHEMA_VERSION } from "./aiAgentOperationContract";
import type { AiAgentSupportedOperation } from "./aiAgentOperationContract";
import { createNodePositionMap } from "./layout/generation";

export type AiAgentEditableNode = NetworkNode & {
  position?: LayoutNodePosition;
};

export interface AiAgentEditablePlan {
  schemaVersion: 1;
  connectors: AiAgentContext["entities"]["connectors"];
  splices: AiAgentContext["entities"]["splices"];
  catalogItems: AiAgentContext["entities"]["catalogItems"];
  nodes: AiAgentEditableNode[];
  segments: AiAgentContext["entities"]["segments"];
  wires: AiAgentContext["entities"]["wires"];
}

export interface AiAgentModifiedPlanEnvelope {
  schemaVersion: 1;
  modifiedPlan: AiAgentEditablePlan;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function samePosition(left: LayoutNodePosition | undefined, right: LayoutNodePosition | undefined): boolean {
  return left?.x === right?.x && left?.y === right?.y;
}

function hasChanged(left: unknown, right: unknown): boolean {
  return left !== right;
}

function isWireEndpoint(value: unknown): value is WireEndpoint {
  if (!isRecord(value)) {
    return false;
  }
  if (value.kind === "connectorCavity") {
    return typeof value.connectorId === "string" && typeof value.cavityIndex === "number" && Number.isFinite(value.cavityIndex);
  }
  if (value.kind === "splicePort") {
    return typeof value.spliceId === "string" && typeof value.portIndex === "number" && Number.isFinite(value.portIndex);
  }
  return false;
}

function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function buildNodePositions(context: AiAgentContext): Record<string, LayoutNodePosition> {
  const generatedPositions = createNodePositionMap(context.entities.nodes, context.entities.segments);
  return context.entities.nodes.reduce<Record<string, LayoutNodePosition>>((positions, node) => {
    const position = context.entities.nodePositions[node.id] ?? generatedPositions[node.id];
    return position === undefined ? positions : { ...positions, [node.id]: position };
  }, {});
}

export function buildAiAgentEditablePlan(context: AiAgentContext): AiAgentEditablePlan {
  const nodePositions = buildNodePositions(context);
  return {
    schemaVersion: AI_AGENT_OPERATION_SCHEMA_VERSION,
    connectors: context.entities.connectors,
    splices: context.entities.splices,
    catalogItems: context.entities.catalogItems,
    nodes: context.entities.nodes.map((node) => ({
      ...node,
      ...(nodePositions[node.id] === undefined ? {} : { position: nodePositions[node.id] })
    })),
    segments: context.entities.segments,
    wires: context.entities.wires
  };
}

export function extractAiAgentModifiedPlan(payload: unknown): AiAgentEditablePlan | null {
  if (!isRecord(payload) || payload.schemaVersion !== AI_AGENT_OPERATION_SCHEMA_VERSION) {
    return null;
  }
  const planCandidate = payload.modifiedPlan ?? payload.plan;
  if (!isRecord(planCandidate) || planCandidate.schemaVersion !== AI_AGENT_OPERATION_SCHEMA_VERSION) {
    return null;
  }
  return {
    schemaVersion: AI_AGENT_OPERATION_SCHEMA_VERSION,
    connectors: readArray(planCandidate.connectors) as AiAgentEditablePlan["connectors"],
    splices: readArray(planCandidate.splices) as AiAgentEditablePlan["splices"],
    catalogItems: readArray(planCandidate.catalogItems) as AiAgentEditablePlan["catalogItems"],
    nodes: readArray(planCandidate.nodes) as AiAgentEditableNode[],
    segments: readArray(planCandidate.segments) as AiAgentEditablePlan["segments"],
    wires: readArray(planCandidate.wires) as AiAgentEditablePlan["wires"]
  };
}

function indexById<T extends { id: string }>(entries: T[]): Map<string, T> {
  return new Map(entries.map((entry) => [entry.id, entry]));
}

function nodeEntityReference(node: AiAgentEditableNode): {
  entityKind: "connector" | "splice" | "node";
  entityId: string;
} {
  if (node.kind === "connector") {
    return { entityKind: "connector", entityId: node.connectorId };
  }
  if (node.kind === "splice") {
    return { entityKind: "splice", entityId: node.spliceId };
  }
  return { entityKind: "node", entityId: node.id };
}

function pushConnectorUpdate(
  operations: AiAgentSupportedOperation[],
  before: Pick<Connector, "id" | "name" | "technicalId">,
  after: Pick<Connector, "id" | "name" | "technicalId">
) {
  const fields: Record<string, unknown> = {};
  if (hasChanged(before.name, after.name)) {
    fields.name = after.name;
  }
  if (hasChanged(before.technicalId, after.technicalId)) {
    fields.technicalId = after.technicalId;
  }
  if (Object.keys(fields).length > 0) {
    operations.push({ type: "update_entity", entityKind: "connector", entityId: before.id, fields });
  }
}

function pushCatalogItemUpdate(
  operations: AiAgentSupportedOperation[],
  before: Pick<CatalogItem, "id" | "manufacturerReference" | "connectionCount" | "name">,
  after: Pick<CatalogItem, "id" | "manufacturerReference" | "connectionCount" | "name">
) {
  const fields: Record<string, unknown> = {};
  if (hasChanged(before.manufacturerReference, after.manufacturerReference)) {
    fields.manufacturerReference = after.manufacturerReference;
  }
  if (hasChanged(before.connectionCount, after.connectionCount)) {
    fields.connectionCount = after.connectionCount;
  }
  if (hasChanged(before.name, after.name)) {
    fields.name = after.name;
  }
  if (Object.keys(fields).length > 0) {
    operations.push({ type: "update_entity", entityKind: "catalog", entityId: before.id, fields });
  }
}

function pushSpliceUpdate(
  operations: AiAgentSupportedOperation[],
  before: Pick<Splice, "id" | "name" | "technicalId">,
  after: Pick<Splice, "id" | "name" | "technicalId">
) {
  const fields: Record<string, unknown> = {};
  if (hasChanged(before.name, after.name)) {
    fields.name = after.name;
  }
  if (hasChanged(before.technicalId, after.technicalId)) {
    fields.technicalId = after.technicalId;
  }
  if (Object.keys(fields).length > 0) {
    operations.push({ type: "update_entity", entityKind: "splice", entityId: before.id, fields });
  }
}

function pushWireUpdate(
  operations: AiAgentSupportedOperation[],
  before: Pick<Wire, "id" | "name" | "technicalId">,
  after: Pick<Wire, "id" | "name" | "technicalId">
) {
  const fields: Record<string, unknown> = {};
  if (hasChanged(before.name, after.name)) {
    fields.name = after.name;
  }
  if (hasChanged(before.technicalId, after.technicalId)) {
    fields.technicalId = after.technicalId;
  }
  if (Object.keys(fields).length > 0) {
    operations.push({ type: "update_entity", entityKind: "wire", entityId: before.id, fields });
  }
}

function pushAddedWire(operations: AiAgentSupportedOperation[], wire: Partial<Wire> & { id: string }) {
  const name = typeof wire.name === "string" && wire.name.trim().length > 0 ? wire.name.trim() : null;
  const technicalId =
    typeof wire.technicalId === "string" && wire.technicalId.trim().length > 0 ? wire.technicalId.trim() : null;
  const sectionMm2 =
    typeof wire.sectionMm2 === "number" && Number.isFinite(wire.sectionMm2) && wire.sectionMm2 > 0 ? wire.sectionMm2 : 0.5;
  if (name === null || technicalId === null || !isWireEndpoint(wire.endpointA) || !isWireEndpoint(wire.endpointB)) {
    return;
  }
  operations.push({
    type: "add_wire",
    name,
    technicalId,
    endpointA: wire.endpointA,
    endpointB: wire.endpointB,
    sectionMm2
  });
}

function pushSegmentUpdate(
  operations: AiAgentSupportedOperation[],
  before: Pick<Segment, "id" | "lengthMm" | "subNetworkTag">,
  after: Pick<Segment, "id" | "lengthMm" | "subNetworkTag">
) {
  const fields: Record<string, unknown> = {};
  if (hasChanged(before.lengthMm, after.lengthMm)) {
    fields.lengthMm = after.lengthMm;
  }
  if (hasChanged(before.subNetworkTag, after.subNetworkTag)) {
    fields.subNetworkTag = after.subNetworkTag;
  }
  if (Object.keys(fields).length > 0) {
    operations.push({ type: "update_entity", entityKind: "segment", entityId: before.id, fields });
  }
}

export function buildAiAgentOperationsFromPlanDiff(
  beforePlan: AiAgentEditablePlan,
  modifiedPlan: AiAgentEditablePlan
): AiAgentSupportedOperation[] {
  const operations: AiAgentSupportedOperation[] = [];
  const beforeConnectors = indexById(beforePlan.connectors);
  const beforeSplices = indexById(beforePlan.splices);
  const beforeCatalogItems = indexById(beforePlan.catalogItems);
  const beforeNodes = indexById(beforePlan.nodes);
  const beforeSegments = indexById(beforePlan.segments);
  const beforeWires = indexById(beforePlan.wires);

  for (const connector of modifiedPlan.connectors) {
    const before = beforeConnectors.get(connector.id);
    if (before === undefined) {
      continue;
    }
    pushConnectorUpdate(operations, before, connector);
  }

  for (const splice of modifiedPlan.splices) {
    const before = beforeSplices.get(splice.id);
    if (before === undefined) {
      continue;
    }
    pushSpliceUpdate(operations, before, splice);
  }

  for (const catalogItem of modifiedPlan.catalogItems) {
    const before = beforeCatalogItems.get(catalogItem.id);
    if (before === undefined) {
      continue;
    }
    pushCatalogItemUpdate(operations, before, catalogItem);
  }

  for (const node of modifiedPlan.nodes) {
    const before = beforeNodes.get(node.id);
    if (before === undefined) {
      continue;
    }
    if (before.kind === "intermediate" && node.kind === "intermediate" && hasChanged(before.label, node.label)) {
      operations.push({ type: "update_entity", entityKind: "node", entityId: before.id, fields: { label: node.label } });
    }
    if (!samePosition(before.position, node.position) && node.position !== undefined) {
      operations.push({ type: "move_entity", ...nodeEntityReference(before), position: node.position });
    }
  }

  for (const segment of modifiedPlan.segments) {
    const before = beforeSegments.get(segment.id);
    if (before === undefined) {
      continue;
    }
    pushSegmentUpdate(operations, before, segment);
  }

  for (const wire of modifiedPlan.wires) {
    const before = beforeWires.get(wire.id);
    if (before === undefined) {
      pushAddedWire(operations, wire);
      continue;
    }
    pushWireUpdate(operations, before, wire);
  }

  return operations;
}
