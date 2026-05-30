import type { CatalogItem, Connector, NetworkNode, Segment, Splice, Wire, WireEndpoint } from "../../core/entities";
import type { LayoutNodePosition } from "../../store/types";
import type { AiAgentContext } from "./aiAgentContext";
import { AI_AGENT_OPERATION_SCHEMA_VERSION } from "./aiAgentOperationContract";
import type { AiAgentSupportedOperation } from "./aiAgentOperationContract";
import { createNodePositionMap } from "./layout/generation";

type AiAgentPlanDiffOperation = AiAgentSupportedOperation | Record<string, unknown>;

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

function hasDeepChanged(left: unknown, right: unknown): boolean {
  return JSON.stringify(left ?? null) !== JSON.stringify(right ?? null);
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
  operations: AiAgentPlanDiffOperation[],
  before: Pick<
    Connector,
    | "id"
    | "name"
    | "technicalId"
    | "cavityCount"
    | "manufacturerReference"
    | "catalogItemId"
    | "applyCatalogPlugs"
    | "applyCatalogSeals"
    | "terminalOverrides"
  >,
  after: Pick<
    Connector,
    | "id"
    | "name"
    | "technicalId"
    | "cavityCount"
    | "manufacturerReference"
    | "catalogItemId"
    | "applyCatalogPlugs"
    | "applyCatalogSeals"
    | "terminalOverrides"
  >
) {
  const fields: Record<string, unknown> = {};
  (
    [
      "name",
      "technicalId",
      "cavityCount",
      "manufacturerReference",
      "catalogItemId",
      "applyCatalogPlugs",
      "applyCatalogSeals"
    ] as const
  ).forEach((field) => {
    if (hasChanged(before[field], after[field])) {
      fields[field] = after[field];
    }
  });
  if (hasDeepChanged(before.terminalOverrides, after.terminalOverrides)) {
    fields.terminalOverrides = after.terminalOverrides;
  }
  if (Object.keys(fields).length > 0) {
    operations.push({ type: "update_entity", entityKind: "connector", entityId: before.id, fields });
  }
}

function pushAddedConnector(
  operations: AiAgentPlanDiffOperation[],
  connector: AiAgentEditablePlan["connectors"][number],
  node: AiAgentEditableNode | undefined
) {
  if (node?.kind !== "connector" || node.position === undefined) {
    operations.push({
      type: "add_connector",
      id: connector.id,
      name: connector.name,
      technicalId: connector.technicalId,
      cavityCount: connector.cavityCount
    });
    return;
  }
  operations.push({
    type: "add_connector",
    id: connector.id,
    nodeId: node.id,
    name: connector.name,
    technicalId: connector.technicalId,
    cavityCount: connector.cavityCount,
    position: node.position
  });
}

function pushCatalogItemUpdate(
  operations: AiAgentPlanDiffOperation[],
  before: Pick<
    CatalogItem,
    | "id"
    | "manufacturerReference"
    | "connectionCount"
    | "name"
    | "unitPriceExclTax"
    | "url"
    | "additionalAccessories"
    | "connectorDefaults"
    | "connectorLayout"
  >,
  after: Pick<
    CatalogItem,
    | "id"
    | "manufacturerReference"
    | "connectionCount"
    | "name"
    | "unitPriceExclTax"
    | "url"
    | "additionalAccessories"
    | "connectorDefaults"
    | "connectorLayout"
  >
) {
  const fields: Record<string, unknown> = {};
  (["manufacturerReference", "connectionCount", "name", "unitPriceExclTax", "url"] as const).forEach((field) => {
    if (hasChanged(before[field], after[field])) {
      fields[field] = after[field];
    }
  });
  (["additionalAccessories", "connectorDefaults", "connectorLayout"] as const).forEach((field) => {
    if (hasDeepChanged(before[field], after[field])) {
      fields[field] = after[field];
    }
  });
  if (Object.keys(fields).length > 0) {
    operations.push({ type: "update_entity", entityKind: "catalog", entityId: before.id, fields });
  }
}

function pushSpliceUpdate(
  operations: AiAgentPlanDiffOperation[],
  before: Pick<Splice, "id" | "name" | "technicalId" | "portCount" | "manufacturerReference" | "catalogItemId">,
  after: Pick<Splice, "id" | "name" | "technicalId" | "portCount" | "manufacturerReference" | "catalogItemId">
) {
  const fields: Record<string, unknown> = {};
  (["name", "technicalId", "portCount", "manufacturerReference", "catalogItemId"] as const).forEach((field) => {
    if (hasChanged(before[field], after[field])) {
      fields[field] = after[field];
    }
  });
  if (Object.keys(fields).length > 0) {
    operations.push({ type: "update_entity", entityKind: "splice", entityId: before.id, fields });
  }
}

function pushAddedSplice(
  operations: AiAgentPlanDiffOperation[],
  splice: AiAgentEditablePlan["splices"][number],
  node: AiAgentEditableNode | undefined
) {
  if (node?.kind !== "splice" || node.position === undefined) {
    operations.push({
      type: "add_splice",
      id: splice.id,
      name: splice.name,
      technicalId: splice.technicalId,
      portCount: splice.portCount
    });
    return;
  }
  operations.push({
    type: "add_splice",
    id: splice.id,
    nodeId: node.id,
    name: splice.name,
    technicalId: splice.technicalId,
    portCount: splice.portCount,
    position: node.position
  });
}

function pushWireUpdate(
  operations: AiAgentPlanDiffOperation[],
  before: Pick<
    Wire,
    | "id"
    | "name"
    | "technicalId"
    | "twistGroupLabel"
    | "functionalDomainTag"
    | "sectionMm2"
    | "currentA"
    | "material"
    | "colorMode"
    | "primaryColorId"
    | "secondaryColorId"
    | "freeColorLabel"
    | "endpointA"
    | "endpointB"
  >,
  after: Pick<
    Wire,
    | "id"
    | "name"
    | "technicalId"
    | "twistGroupLabel"
    | "functionalDomainTag"
    | "sectionMm2"
    | "currentA"
    | "material"
    | "colorMode"
    | "primaryColorId"
    | "secondaryColorId"
    | "freeColorLabel"
    | "endpointA"
    | "endpointB"
  >
) {
  const fields: Record<string, unknown> = {};
  (
    [
      "name",
      "technicalId",
      "twistGroupLabel",
      "functionalDomainTag",
      "sectionMm2",
      "currentA",
      "material",
      "colorMode",
      "primaryColorId",
      "secondaryColorId",
      "freeColorLabel"
    ] as const
  ).forEach((field) => {
    if (hasChanged(before[field], after[field])) {
      fields[field] = after[field];
    }
  });
  if (hasDeepChanged(before.endpointA, after.endpointA)) {
    fields.endpointA = after.endpointA;
  }
  if (hasDeepChanged(before.endpointB, after.endpointB)) {
    fields.endpointB = after.endpointB;
  }
  if (Object.keys(fields).length > 0) {
    operations.push({ type: "update_entity", entityKind: "wire", entityId: before.id, fields });
  }
}

function pushAddedWire(operations: AiAgentPlanDiffOperation[], wire: Partial<Wire> & { id: string }) {
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
  operations: AiAgentPlanDiffOperation[],
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
): AiAgentPlanDiffOperation[] {
  const operations: AiAgentPlanDiffOperation[] = [];
  const beforeConnectors = indexById(beforePlan.connectors);
  const beforeSplices = indexById(beforePlan.splices);
  const beforeCatalogItems = indexById(beforePlan.catalogItems);
  const beforeNodes = indexById(beforePlan.nodes);
  const beforeSegments = indexById(beforePlan.segments);
  const beforeWires = indexById(beforePlan.wires);
  const addedConnectorNodeIds = new Set<string>();
  const addedSpliceNodeIds = new Set<string>();

  for (const connector of modifiedPlan.connectors) {
    const before = beforeConnectors.get(connector.id);
    if (before === undefined) {
      const node = modifiedPlan.nodes.find((candidate) => candidate.kind === "connector" && candidate.connectorId === connector.id);
      pushAddedConnector(operations, connector, node);
      if (node !== undefined) {
        addedConnectorNodeIds.add(node.id);
      }
      continue;
    }
    pushConnectorUpdate(operations, before, connector);
  }

  for (const splice of modifiedPlan.splices) {
    const before = beforeSplices.get(splice.id);
    if (before === undefined) {
      const node = modifiedPlan.nodes.find((candidate) => candidate.kind === "splice" && candidate.spliceId === splice.id);
      pushAddedSplice(operations, splice, node);
      if (node !== undefined) {
        addedSpliceNodeIds.add(node.id);
      }
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
      if (addedConnectorNodeIds.has(node.id) || addedSpliceNodeIds.has(node.id)) {
        continue;
      }
      if (node.kind === "intermediate" && node.position !== undefined) {
        operations.push({ type: "add_node", id: node.id, label: node.label, position: node.position });
      }
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
      operations.push({
        type: "add_segment",
        nodeA: segment.nodeA,
        nodeB: segment.nodeB,
        lengthMm: segment.lengthMm
      });
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
  const modifiedWireIds = new Set(modifiedPlan.wires.map((wire) => wire.id));
  for (const wire of beforePlan.wires) {
    if (!modifiedWireIds.has(wire.id)) {
      operations.push({ type: "delete_entity", entityKind: "wire", entityId: wire.id });
    }
  }

  return operations;
}
