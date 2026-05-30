import type { AppState, LayoutNodePosition, SelectionState } from "../../store/types";
import type { ConnectorId, NodeId, SegmentId, SpliceId, WireEndpoint, WireId } from "../../core/entities";

export const AI_AGENT_OPERATION_SCHEMA_VERSION = 1;

export type AiAgentScope = "activeNetwork" | "currentSelection";

export interface AiAgentOperationPermissions {
  add: boolean;
  move: boolean;
  update: boolean;
  route: boolean;
  delete: boolean;
}

export type AiAgentOperationStatus = "accepted" | "rejected" | "unsupported" | "warning";

export interface AiAgentOperationValidationIssue {
  status: AiAgentOperationStatus;
  operationIndex: number;
  operationType: string;
  message: string;
}

export interface AiAgentOperationValidationResult {
  accepted: AiAgentSupportedOperation[];
  rejected: AiAgentOperationValidationIssue[];
  unsupported: AiAgentOperationValidationIssue[];
  warnings: AiAgentOperationValidationIssue[];
}

interface AiAgentOperationEnvelope {
  schemaVersion: 1;
  operations: unknown[];
}

export type AiAgentSupportedOperation =
  | AiAgentAddConnectorOperation
  | AiAgentAddSpliceOperation
  | AiAgentAddNodeOperation
  | AiAgentAddSegmentOperation
  | AiAgentAddWireOperation
  | AiAgentMoveEntityOperation
  | AiAgentUpdateEntityOperation
  | AiAgentRegenerateRouteOperation;

export interface AiAgentAddConnectorOperation {
  type: "add_connector";
  name: string;
  technicalId: string;
  cavityCount: number;
  position: LayoutNodePosition;
}

export interface AiAgentAddSpliceOperation {
  type: "add_splice";
  name: string;
  technicalId: string;
  portCount: number;
  position: LayoutNodePosition;
}

export interface AiAgentAddNodeOperation {
  type: "add_node";
  label: string;
  position: LayoutNodePosition;
}

export interface AiAgentAddSegmentOperation {
  type: "add_segment";
  nodeA: NodeId;
  nodeB: NodeId;
  lengthMm: number;
}

export interface AiAgentAddWireOperation {
  type: "add_wire";
  name: string;
  technicalId: string;
  endpointA: WireEndpoint;
  endpointB: WireEndpoint;
  sectionMm2: number;
}

export interface AiAgentMoveEntityOperation {
  type: "move_entity";
  entityKind: "connector" | "splice" | "node";
  entityId: string;
  position: LayoutNodePosition;
}

export interface AiAgentUpdateEntityOperation {
  type: "update_entity";
  entityKind: "connector" | "splice" | "node" | "segment" | "wire";
  entityId: string;
  fields: Record<string, unknown>;
}

export interface AiAgentRegenerateRouteOperation {
  type: "regenerate_route";
  wireIds: WireId[];
}

interface ValidateAiAgentOperationsParams {
  state: AppState;
  payload: unknown;
  scope: AiAgentScope;
  selection: SelectionState | null;
  permissions: AiAgentOperationPermissions;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function readPositiveNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function readPosition(value: unknown): LayoutNodePosition | null {
  if (!isRecord(value)) {
    return null;
  }
  return typeof value.x === "number" &&
    Number.isFinite(value.x) &&
    typeof value.y === "number" &&
    Number.isFinite(value.y)
    ? { x: value.x, y: value.y }
    : null;
}

function readStringArray(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string") ? value : null;
}

function reject(operationIndex: number, operationType: string, message: string): AiAgentOperationValidationIssue {
  return {
    status: "rejected",
    operationIndex,
    operationType,
    message
  };
}

function unsupported(operationIndex: number, operationType: string, message: string): AiAgentOperationValidationIssue {
  return {
    status: "unsupported",
    operationIndex,
    operationType,
    message
  };
}

function parseEnvelope(payload: unknown): AiAgentOperationEnvelope | AiAgentOperationValidationIssue {
  if (!isRecord(payload)) {
    return reject(-1, "payload", "AI response must be an object.");
  }
  if (payload.schemaVersion !== AI_AGENT_OPERATION_SCHEMA_VERSION) {
    return reject(-1, "payload", "AI response uses an unsupported operation schema version.");
  }
  if (!Array.isArray(payload.operations)) {
    return reject(-1, "payload", "AI response must include an operations array.");
  }
  return {
    schemaVersion: AI_AGENT_OPERATION_SCHEMA_VERSION,
    operations: payload.operations
  };
}

function parseEndpoint(value: unknown): WireEndpoint | null {
  if (!isRecord(value)) {
    return null;
  }
  if (value.kind === "connectorCavity") {
    const connectorId = readString(value.connectorId);
    const cavityIndex = readPositiveNumber(value.cavityIndex);
    return connectorId !== null && cavityIndex !== null
      ? {
          kind: "connectorCavity",
          connectorId: connectorId as ConnectorId,
          cavityIndex
        }
      : null;
  }
  if (value.kind === "splicePort") {
    const spliceId = readString(value.spliceId);
    const portIndex = readPositiveNumber(value.portIndex);
    return spliceId !== null && portIndex !== null
      ? {
          kind: "splicePort",
          spliceId: spliceId as SpliceId,
          portIndex
        }
      : null;
  }
  return null;
}

function parseOperation(operation: unknown, operationIndex: number): AiAgentSupportedOperation | AiAgentOperationValidationIssue {
  if (!isRecord(operation)) {
    return reject(operationIndex, "unknown", "Operation must be an object.");
  }
  const type = readString(operation.type);
  if (type === null) {
    return reject(operationIndex, "unknown", "Operation type is required.");
  }

  if (type === "delete_entity" || type === "assign_endpoint" || type === "assign_catalog_reference") {
    return unsupported(operationIndex, type, `${type} is not supported in the V1 AI operation contract.`);
  }

  if (type === "add_connector") {
    const name = readString(operation.name);
    const technicalId = readString(operation.technicalId);
    const cavityCount = readPositiveNumber(operation.cavityCount);
    const position = readPosition(operation.position);
    return name !== null && technicalId !== null && cavityCount !== null && position !== null
      ? { type, name, technicalId, cavityCount, position }
      : reject(operationIndex, type, "Connector creation requires name, technicalId, cavityCount, and position.");
  }

  if (type === "add_splice") {
    const name = readString(operation.name);
    const technicalId = readString(operation.technicalId);
    const portCount = readPositiveNumber(operation.portCount);
    const position = readPosition(operation.position);
    return name !== null && technicalId !== null && portCount !== null && position !== null
      ? { type, name, technicalId, portCount, position }
      : reject(operationIndex, type, "Splice creation requires name, technicalId, portCount, and position.");
  }

  if (type === "add_node") {
    const label = readString(operation.label);
    const position = readPosition(operation.position);
    return label !== null && position !== null
      ? { type, label, position }
      : reject(operationIndex, type, "Node creation requires label and position.");
  }

  if (type === "add_segment") {
    const nodeA = readString(operation.nodeA);
    const nodeB = readString(operation.nodeB);
    const lengthMm = readPositiveNumber(operation.lengthMm);
    return nodeA !== null && nodeB !== null && lengthMm !== null
      ? { type, nodeA: nodeA as NodeId, nodeB: nodeB as NodeId, lengthMm }
      : reject(operationIndex, type, "Segment creation requires nodeA, nodeB, and lengthMm.");
  }

  if (type === "add_wire") {
    const name = readString(operation.name);
    const technicalId = readString(operation.technicalId);
    const endpointA = parseEndpoint(operation.endpointA);
    const endpointB = parseEndpoint(operation.endpointB);
    const sectionMm2 = readPositiveNumber(operation.sectionMm2);
    return name !== null && technicalId !== null && endpointA !== null && endpointB !== null && sectionMm2 !== null
      ? { type, name, technicalId, endpointA, endpointB, sectionMm2 }
      : reject(operationIndex, type, "Wire creation requires name, technicalId, valid endpoints, and sectionMm2.");
  }

  if (type === "move_entity") {
    const entityKind = readString(operation.entityKind);
    const entityId = readString(operation.entityId);
    const position = readPosition(operation.position);
    return (entityKind === "connector" || entityKind === "splice" || entityKind === "node") &&
      entityId !== null &&
      position !== null
      ? { type, entityKind, entityId, position }
      : reject(operationIndex, type, "Move operation requires supported entityKind, entityId, and position.");
  }

  if (type === "update_entity") {
    const entityKind = readString(operation.entityKind);
    const entityId = readString(operation.entityId);
    return (entityKind === "connector" ||
      entityKind === "splice" ||
      entityKind === "node" ||
      entityKind === "segment" ||
      entityKind === "wire") &&
      entityId !== null &&
      isRecord(operation.fields)
      ? { type, entityKind, entityId, fields: operation.fields }
      : reject(operationIndex, type, "Update operation requires supported entityKind, entityId, and fields.");
  }

  if (type === "regenerate_route") {
    const wireIds = readStringArray(operation.wireIds);
    return wireIds !== null
      ? { type, wireIds: wireIds as WireId[] }
      : reject(operationIndex, type, "Route regeneration requires wireIds.");
  }

  return unsupported(operationIndex, type, `${type} is not supported in the V1 AI operation contract.`);
}

function permissionForOperation(operation: AiAgentSupportedOperation): keyof AiAgentOperationPermissions {
  if (
    operation.type === "add_connector" ||
    operation.type === "add_splice" ||
    operation.type === "add_node" ||
    operation.type === "add_segment" ||
    operation.type === "add_wire"
  ) {
    return "add";
  }
  if (operation.type === "move_entity") {
    return "move";
  }
  if (operation.type === "update_entity") {
    return "update";
  }
  return "route";
}

function entityExists(state: AppState, operation: AiAgentSupportedOperation): boolean {
  if (operation.type === "add_segment") {
    return state.nodes.byId[operation.nodeA] !== undefined && state.nodes.byId[operation.nodeB] !== undefined;
  }
  if (operation.type === "regenerate_route") {
    return operation.wireIds.every((wireId) => state.wires.byId[wireId] !== undefined);
  }
  if (operation.type === "move_entity" || operation.type === "update_entity") {
    if (operation.entityKind === "connector") {
      return state.connectors.byId[operation.entityId as ConnectorId] !== undefined;
    }
    if (operation.entityKind === "splice") {
      return state.splices.byId[operation.entityId as SpliceId] !== undefined;
    }
    if (operation.entityKind === "node") {
      return state.nodes.byId[operation.entityId as NodeId] !== undefined;
    }
    if (operation.entityKind === "segment") {
      return state.segments.byId[operation.entityId as SegmentId] !== undefined;
    }
    return state.wires.byId[operation.entityId as WireId] !== undefined;
  }
  return true;
}

function isWithinSelectionScope(operation: AiAgentSupportedOperation, selection: SelectionState | null): boolean {
  if (selection === null) {
    return false;
  }
  if (operation.type === "move_entity" || operation.type === "update_entity") {
    return operation.entityKind === selection.kind && operation.entityId === selection.id;
  }
  if (operation.type === "regenerate_route") {
    return selection.kind === "wire" && operation.wireIds.includes(selection.id as WireId);
  }
  return true;
}

export function validateAiAgentOperations({
  state,
  payload,
  scope,
  selection,
  permissions
}: ValidateAiAgentOperationsParams): AiAgentOperationValidationResult {
  const result: AiAgentOperationValidationResult = {
    accepted: [],
    rejected: [],
    unsupported: [],
    warnings: []
  };
  const envelope = parseEnvelope(payload);
  if ("status" in envelope) {
    result.rejected.push(envelope);
    return result;
  }

  envelope.operations.forEach((operation, operationIndex) => {
    const parsed = parseOperation(operation, operationIndex);
    if ("status" in parsed) {
      if (parsed.status === "unsupported") {
        result.unsupported.push(parsed);
      } else {
        result.rejected.push(parsed);
      }
      return;
    }

    const permission = permissionForOperation(parsed);
    if (!permissions[permission]) {
      result.rejected.push(reject(operationIndex, parsed.type, `${permission} permission is disabled.`));
      return;
    }
    if (!entityExists(state, parsed)) {
      result.rejected.push(reject(operationIndex, parsed.type, "Operation references unknown modeling entities."));
      return;
    }
    if (scope === "currentSelection" && !isWithinSelectionScope(parsed, selection)) {
      result.rejected.push(reject(operationIndex, parsed.type, "Operation is outside the current selection scope."));
      return;
    }

    result.accepted.push(parsed);
  });

  return result;
}
