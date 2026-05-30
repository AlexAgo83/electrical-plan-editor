import type { AppState, LayoutNodePosition, SelectionState } from "../../store/types";
import type { CatalogItemId, ConnectorId, NodeId, SegmentId, SpliceId, WireEndpoint, WireId } from "../../core/entities";
import { createNodePositionMap } from "./layout/generation";

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
  | AiAgentPlaceEntityRelativeToEntityOperation
  | AiAgentUpdateEntityOperation
  | AiAgentRegenerateRouteOperation
  | AiAgentDeleteEntityOperation;

export interface AiAgentAddConnectorOperation {
  type: "add_connector";
  id?: ConnectorId;
  nodeId?: NodeId;
  name: string;
  technicalId: string;
  cavityCount: number;
  position: LayoutNodePosition;
}

export interface AiAgentAddSpliceOperation {
  type: "add_splice";
  id?: SpliceId;
  nodeId?: NodeId;
  name: string;
  technicalId: string;
  portCount: number;
  position: LayoutNodePosition;
}

export interface AiAgentAddNodeOperation {
  type: "add_node";
  id?: NodeId;
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
  position?: LayoutNodePosition;
  relativeMove?: {
    dx: number;
    dy: number;
  };
}

export interface AiAgentPlaceEntityRelativeToEntityOperation {
  type: "place_entity_relative_to_entity";
  entityKind: "connector" | "splice" | "node";
  entityId: string;
  referenceEntityKind: "connector" | "splice" | "node";
  referenceEntityId: string;
  placement: "leftOf" | "rightOf" | "above" | "below";
  gap: number;
  position?: LayoutNodePosition;
}

export interface AiAgentUpdateEntityOperation {
  type: "update_entity";
  entityKind: "catalog" | "connector" | "splice" | "node" | "segment" | "wire";
  entityId: string;
  fields: Record<string, unknown>;
}

export interface AiAgentDeleteEntityOperation {
  type: "delete_entity";
  entityKind: "wire";
  entityId: string;
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
  instruction?: string;
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

function readOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return typeof value === "string" ? value.trim() : undefined;
}

function readOptionalBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function readOptionalPositiveNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

function readOptionalRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function readOptionalArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function normalizeEntityReference(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const GENERIC_ENTITY_REFERENCE_TOKENS = new Set([
  "connector",
  "connecteur",
  "splice",
  "node",
  "noeud",
  "wire",
  "segment",
  "the",
  "le",
  "la",
  "les",
  "du",
  "de",
  "des",
  "à",
  "a"
]);

function tokenizeEntityReference(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9à]+/i)
    .map((token) => normalizeEntityReference(token))
    .filter((token) => token.length > 0 && !GENERIC_ENTITY_REFERENCE_TOKENS.has(token));
}

function resolveUniqueEntityReference<Id extends string>(
  ids: Id[],
  entityId: string,
  getReferences: (id: Id) => string[]
): Id | null {
  const normalizedEntityId = normalizeEntityReference(entityId);
  const entityTokens = tokenizeEntityReference(entityId);
  const exactMatch = ids.find((candidateId) =>
    getReferences(candidateId).some((reference) => normalizeEntityReference(reference) === normalizedEntityId)
  );
  if (exactMatch !== undefined) {
    return exactMatch;
  }

  const partialMatches = ids.filter((candidateId) =>
    getReferences(candidateId).some((reference) => normalizeEntityReference(reference).includes(normalizedEntityId))
  );
  if (partialMatches.length === 1) {
    return partialMatches[0] ?? null;
  }

  if (entityTokens.length === 0) {
    return null;
  }
  const tokenMatches = ids.filter((candidateId) => {
    const referenceTokens = getReferences(candidateId).flatMap(tokenizeEntityReference);
    return entityTokens.every((token) => referenceTokens.some((referenceToken) => referenceToken.includes(token)));
  });
  return tokenMatches.length === 1 ? tokenMatches[0] ?? null : null;
}

function readRelativeMove(operation: Record<string, unknown>): AiAgentMoveEntityOperation["relativeMove"] | null {
  const directDx = typeof operation.deltaX === "number" && Number.isFinite(operation.deltaX) ? operation.deltaX : null;
  const directDy = typeof operation.deltaY === "number" && Number.isFinite(operation.deltaY) ? operation.deltaY : null;
  if (directDx !== null || directDy !== null) {
    return {
      dx: directDx ?? 0,
      dy: directDy ?? 0
    };
  }

  const offsetDx = typeof operation.offsetX === "number" && Number.isFinite(operation.offsetX) ? operation.offsetX : null;
  const offsetDy = typeof operation.offsetY === "number" && Number.isFinite(operation.offsetY) ? operation.offsetY : null;
  if (offsetDx !== null || offsetDy !== null) {
    return {
      dx: offsetDx ?? 0,
      dy: offsetDy ?? 0
    };
  }

  const positionDirection = isRecord(operation.position) ? readString(operation.position.direction) : null;
  const direction = readString(operation.direction) ?? positionDirection;
  const distance =
    typeof operation.distance === "number" && Number.isFinite(operation.distance) && operation.distance > 0
      ? operation.distance
      : 80;

  if (direction === "left") {
    return { dx: -distance, dy: 0 };
  }
  if (direction === "right") {
    return { dx: distance, dy: 0 };
  }
  if (direction === "up") {
    return { dx: 0, dy: -distance };
  }
  if (direction === "down") {
    return { dx: 0, dy: distance };
  }

  return null;
}

function readRelativeMoveFromInstruction(instruction: string | undefined): AiAgentMoveEntityOperation["relativeMove"] | null {
  if (instruction === undefined) {
    return null;
  }
  const normalized = instruction.toLowerCase();
  if (/\bleft\b/.test(normalized) || /\bà gauche\b/.test(normalized) || /\bgauche\b/.test(normalized)) {
    return { dx: -80, dy: 0 };
  }
  if (/\bright\b/.test(normalized) || /\bà droite\b/.test(normalized) || /\bdroite\b/.test(normalized)) {
    return { dx: 80, dy: 0 };
  }
  if (/\bup\b/.test(normalized) || /\bhaut\b/.test(normalized)) {
    return { dx: 0, dy: -80 };
  }
  if (/\bdown\b/.test(normalized) || /\bbas\b/.test(normalized)) {
    return { dx: 0, dy: 80 };
  }
  return null;
}

function readPlacement(value: unknown): AiAgentPlaceEntityRelativeToEntityOperation["placement"] | null {
  if (value === "leftOf" || value === "left") {
    return "leftOf";
  }
  if (value === "rightOf" || value === "right") {
    return "rightOf";
  }
  if (value === "above" || value === "up") {
    return "above";
  }
  if (value === "below" || value === "down") {
    return "below";
  }
  return null;
}

function readGap(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 80;
}

function readSafeUpdateFields(entityKind: AiAgentUpdateEntityOperation["entityKind"], value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) {
    return null;
  }

  const fields: Record<string, unknown> = {};
  if (
    (entityKind === "catalog" || entityKind === "connector" || entityKind === "splice" || entityKind === "wire") &&
    typeof value.name === "string" &&
    value.name.trim().length > 0
  ) {
    fields.name = value.name.trim();
  }
  if (entityKind === "catalog" && typeof value.manufacturerReference === "string" && value.manufacturerReference.trim().length > 0) {
    fields.manufacturerReference = value.manufacturerReference.trim();
  }
  if (
    entityKind === "catalog" &&
    typeof value.connectionCount === "number" &&
    Number.isInteger(value.connectionCount) &&
    value.connectionCount > 0
  ) {
    fields.connectionCount = value.connectionCount;
  }
  if (entityKind === "catalog") {
    const unitPriceExclTax = readOptionalPositiveNumber(value.unitPriceExclTax);
    const url = readOptionalString(value.url);
    const additionalAccessories = readOptionalArray(value.additionalAccessories);
    const connectorDefaults = readOptionalRecord(value.connectorDefaults);
    const connectorLayout = readOptionalRecord(value.connectorLayout);
    if (unitPriceExclTax !== undefined) {
      fields.unitPriceExclTax = unitPriceExclTax;
    }
    if (url !== undefined) {
      fields.url = url.length > 0 ? url : undefined;
    }
    if (additionalAccessories !== undefined) {
      fields.additionalAccessories = additionalAccessories;
    }
    if (connectorDefaults !== undefined) {
      fields.connectorDefaults = connectorDefaults;
    }
    if (connectorLayout !== undefined) {
      fields.connectorLayout = connectorLayout;
    }
  }
  if (
    (entityKind === "connector" || entityKind === "splice" || entityKind === "wire") &&
    typeof value.technicalId === "string" &&
    value.technicalId.trim().length > 0
  ) {
    fields.technicalId = value.technicalId.trim();
  }
  if (entityKind === "connector") {
    const cavityCount = readOptionalPositiveNumber(value.cavityCount);
    const manufacturerReference = readOptionalString(value.manufacturerReference);
    const catalogItemId = readOptionalString(value.catalogItemId);
    const applyCatalogPlugs = readOptionalBoolean(value.applyCatalogPlugs);
    const applyCatalogSeals = readOptionalBoolean(value.applyCatalogSeals);
    const terminalOverrides = readOptionalRecord(value.terminalOverrides);
    if (cavityCount !== undefined && Number.isInteger(cavityCount)) {
      fields.cavityCount = cavityCount;
    }
    if (manufacturerReference !== undefined) {
      fields.manufacturerReference = manufacturerReference.length > 0 ? manufacturerReference : undefined;
    }
    if (catalogItemId !== undefined) {
      fields.catalogItemId = catalogItemId.length > 0 ? catalogItemId : undefined;
    }
    if (applyCatalogPlugs !== undefined) {
      fields.applyCatalogPlugs = applyCatalogPlugs;
    }
    if (applyCatalogSeals !== undefined) {
      fields.applyCatalogSeals = applyCatalogSeals;
    }
    if (terminalOverrides !== undefined) {
      fields.terminalOverrides = terminalOverrides;
    }
  }
  if (entityKind === "splice") {
    const portCount = readOptionalPositiveNumber(value.portCount);
    const manufacturerReference = readOptionalString(value.manufacturerReference);
    const catalogItemId = readOptionalString(value.catalogItemId);
    if (portCount !== undefined && Number.isInteger(portCount)) {
      fields.portCount = portCount;
    }
    if (manufacturerReference !== undefined) {
      fields.manufacturerReference = manufacturerReference.length > 0 ? manufacturerReference : undefined;
    }
    if (catalogItemId !== undefined) {
      fields.catalogItemId = catalogItemId.length > 0 ? catalogItemId : undefined;
    }
  }
  if (entityKind === "wire") {
    const sectionMm2 = readOptionalPositiveNumber(value.sectionMm2);
    const currentA = readOptionalPositiveNumber(value.currentA);
    const twistGroupLabel = readOptionalString(value.twistGroupLabel);
    const functionalDomainTag = readOptionalString(value.functionalDomainTag);
    const colorMode = readOptionalString(value.colorMode);
    const primaryColorId = readOptionalString(value.primaryColorId);
    const secondaryColorId = readOptionalString(value.secondaryColorId);
    const freeColorLabel = readOptionalString(value.freeColorLabel);
    const material = readOptionalString(value.material);
    const endpointA = parseEndpoint(value.endpointA);
    const endpointB = parseEndpoint(value.endpointB);
    if (sectionMm2 !== undefined) {
      fields.sectionMm2 = sectionMm2;
    }
    if (currentA !== undefined) {
      fields.currentA = currentA;
    }
    if (twistGroupLabel !== undefined) {
      fields.twistGroupLabel = twistGroupLabel.length > 0 ? twistGroupLabel : undefined;
    }
    if (functionalDomainTag !== undefined) {
      fields.functionalDomainTag = functionalDomainTag.length > 0 ? functionalDomainTag : undefined;
    }
    if (colorMode === "none" || colorMode === "catalog" || colorMode === "free") {
      fields.colorMode = colorMode;
    }
    if (primaryColorId !== undefined) {
      fields.primaryColorId = primaryColorId.length > 0 ? primaryColorId : null;
    }
    if (secondaryColorId !== undefined) {
      fields.secondaryColorId = secondaryColorId.length > 0 ? secondaryColorId : null;
    }
    if (freeColorLabel !== undefined) {
      fields.freeColorLabel = freeColorLabel.length > 0 ? freeColorLabel : null;
    }
    if (material === "copper" || material === "aluminum") {
      fields.material = material;
    }
    if (endpointA !== null) {
      fields.endpointA = endpointA;
    }
    if (endpointB !== null) {
      fields.endpointB = endpointB;
    }
  }
  if (entityKind === "node" && typeof value.label === "string" && value.label.trim().length > 0) {
    fields.label = value.label.trim();
  }
  if (entityKind === "segment" && typeof value.lengthMm === "number" && Number.isFinite(value.lengthMm) && value.lengthMm > 0) {
    fields.lengthMm = value.lengthMm;
  }
  if (entityKind === "segment" && typeof value.subNetworkTag === "string") {
    const subNetworkTag = value.subNetworkTag.trim();
    fields.subNetworkTag = subNetworkTag.length > 0 ? subNetworkTag : undefined;
  }

  return Object.keys(fields).length > 0 ? fields : null;
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

function getMoveSelectionFallback(
  selection: SelectionState | null
): { entityKind: AiAgentMoveEntityOperation["entityKind"]; entityId: string } | null {
  return selection !== null && (selection.kind === "connector" || selection.kind === "splice" || selection.kind === "node")
    ? {
        entityKind: selection.kind,
        entityId: selection.id
      }
    : null;
}

function parseOperation(
  operation: unknown,
  operationIndex: number,
  selection: SelectionState | null,
  instruction?: string
): AiAgentSupportedOperation | AiAgentOperationValidationIssue {
  if (!isRecord(operation)) {
    return reject(operationIndex, "unknown", "Operation must be an object.");
  }
  const type = readString(operation.type);
  if (type === null) {
    return reject(operationIndex, "unknown", "Operation type is required.");
  }

  if (type === "assign_endpoint" || type === "assign_catalog_reference") {
    return unsupported(operationIndex, type, `${type} is not supported in the V1 AI operation contract.`);
  }
  if (type === "delete_entity") {
    const entityKind = readString(operation.entityKind);
    const entityId = readString(operation.entityId);
    return entityKind === "wire" && entityId !== null
      ? { type, entityKind, entityId }
      : unsupported(operationIndex, type, "Only wire delete_entity operations are supported in the V1 AI operation contract.");
  }

  if (type === "add_connector") {
    const id = readString(operation.id);
    const nodeId = readString(operation.nodeId);
    const name = readString(operation.name);
    const technicalId = readString(operation.technicalId);
    const cavityCount = readPositiveNumber(operation.cavityCount);
    const position = readPosition(operation.position);
    return name !== null && technicalId !== null && cavityCount !== null && position !== null
      ? {
          type,
          ...(id === null ? {} : { id: id as ConnectorId }),
          ...(nodeId === null ? {} : { nodeId: nodeId as NodeId }),
          name,
          technicalId,
          cavityCount,
          position
        }
      : reject(operationIndex, type, "Connector creation requires name, technicalId, cavityCount, and position.");
  }

  if (type === "add_splice") {
    const id = readString(operation.id);
    const nodeId = readString(operation.nodeId);
    const name = readString(operation.name);
    const technicalId = readString(operation.technicalId);
    const portCount = readPositiveNumber(operation.portCount);
    const position = readPosition(operation.position);
    return name !== null && technicalId !== null && portCount !== null && position !== null
      ? {
          type,
          ...(id === null ? {} : { id: id as SpliceId }),
          ...(nodeId === null ? {} : { nodeId: nodeId as NodeId }),
          name,
          technicalId,
          portCount,
          position
        }
      : reject(operationIndex, type, "Splice creation requires name, technicalId, portCount, and position.");
  }

  if (type === "add_node") {
    const id = readString(operation.id);
    const label = readString(operation.label);
    const position = readPosition(operation.position);
    return label !== null && position !== null
      ? { type, ...(id === null ? {} : { id: id as NodeId }), label, position }
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
    const selectionFallback = getMoveSelectionFallback(selection);
    const entityKind = readString(operation.entityKind) ?? selectionFallback?.entityKind ?? null;
    const entityId = readString(operation.entityId) ?? selectionFallback?.entityId ?? null;
    const position = readPosition(operation.position);
    const relativeMove = readRelativeMove(operation) ?? readRelativeMoveFromInstruction(instruction);
    return (entityKind === "connector" || entityKind === "splice" || entityKind === "node") &&
      entityId !== null &&
      (position !== null || relativeMove !== null)
      ? { type, entityKind, entityId, ...(position === null ? {} : { position }), ...(relativeMove === null ? {} : { relativeMove }) }
      : reject(operationIndex, type, "Move operation requires supported entityKind, entityId, and position or relative direction.");
  }

  if (type === "place_entity_relative_to_entity") {
    const selectionFallback = getMoveSelectionFallback(selection);
    const entityKind = readString(operation.entityKind) ?? selectionFallback?.entityKind ?? null;
    const entityId = readString(operation.entityId) ?? selectionFallback?.entityId ?? null;
    const referenceEntityKind = readString(operation.referenceEntityKind);
    const referenceEntityId = readString(operation.referenceEntityId);
    const placement = readPlacement(operation.placement);
    const gap = readGap(operation.gap);
    return (entityKind === "connector" || entityKind === "splice" || entityKind === "node") &&
      (referenceEntityKind === "connector" || referenceEntityKind === "splice" || referenceEntityKind === "node") &&
      entityId !== null &&
      referenceEntityId !== null &&
      placement !== null
      ? { type, entityKind, entityId, referenceEntityKind, referenceEntityId, placement, gap }
      : reject(
          operationIndex,
          type,
          "Relative placement requires supported entityKind, entityId, referenceEntityKind, referenceEntityId, and placement."
        );
  }

  if (type === "update_entity") {
    const entityKind = readString(operation.entityKind);
    const entityId = readString(operation.entityId);
    const supportedEntityKind =
      entityKind === "connector" ||
      entityKind === "catalog" ||
      entityKind === "splice" ||
      entityKind === "node" ||
      entityKind === "segment" ||
      entityKind === "wire";
    const fields = supportedEntityKind ? readSafeUpdateFields(entityKind, operation.fields) : null;
    return supportedEntityKind && entityId !== null && fields !== null
      ? { type, entityKind, entityId, fields }
      : reject(operationIndex, type, "Update operation requires supported entityKind, entityId, and safe scalar fields.");
  }

  if (type === "regenerate_route") {
    const wireIds = readStringArray(operation.wireIds);
    return wireIds !== null
      ? { type, wireIds: wireIds as WireId[] }
      : reject(operationIndex, type, "Route regeneration requires wireIds.");
  }

  return unsupported(operationIndex, type, `${type} is not supported in the V1 AI operation contract.`);
}

function resolveEntityId(
  state: AppState,
  entityKind: AiAgentUpdateEntityOperation["entityKind"] | AiAgentPlaceEntityRelativeToEntityOperation["referenceEntityKind"],
  entityId: string
): string {
  if (entityKind === "catalog") {
    return (
      resolveUniqueEntityReference(state.catalogItems.allIds, entityId, (candidateId) => {
        const catalogItem = state.catalogItems.byId[candidateId];
        return catalogItem === undefined ? [] : [catalogItem.id, catalogItem.manufacturerReference, catalogItem.name ?? ""];
      }) ?? entityId
    );
  }
  if (entityKind === "connector") {
    return (
      resolveUniqueEntityReference(state.connectors.allIds, entityId, (candidateId) => {
        const connector = state.connectors.byId[candidateId];
        return connector === undefined ? [] : [connector.id, connector.technicalId, connector.name];
      }) ?? entityId
    );
  }
  if (entityKind === "splice") {
    return (
      resolveUniqueEntityReference(state.splices.allIds, entityId, (candidateId) => {
        const splice = state.splices.byId[candidateId];
        return splice === undefined ? [] : [splice.id, splice.technicalId, splice.name];
      }) ?? entityId
    );
  }
  if (entityKind === "node") {
    return (
      resolveUniqueEntityReference(state.nodes.allIds, entityId, (candidateId) => {
        const node = state.nodes.byId[candidateId];
        const connector = node?.kind === "connector" ? state.connectors.byId[node.connectorId] : undefined;
        const splice = node?.kind === "splice" ? state.splices.byId[node.spliceId] : undefined;
        return [
          node?.id,
          node?.kind === "intermediate" ? node.label : undefined,
          connector?.id,
          connector?.technicalId,
          connector?.name,
          splice?.id,
          splice?.technicalId,
          splice?.name
        ].filter((reference): reference is string => reference !== undefined);
      }) ?? entityId
    );
  }
  if (entityKind === "segment") {
    return entityId;
  }
  return (
    resolveUniqueEntityReference(state.wires.allIds, entityId, (candidateId) => {
      const wire = state.wires.byId[candidateId];
      return wire === undefined ? [] : [wire.id, wire.technicalId, wire.name];
    }) ?? entityId
  );
}

function getEntityNodeId(
  state: AppState,
  entityKind: AiAgentMoveEntityOperation["entityKind"],
  entityId: string
): NodeId | undefined {
  return entityKind === "node"
    ? (entityId as NodeId)
    : state.nodes.allIds.find((candidateNodeId) => {
        const node = state.nodes.byId[candidateNodeId];
        if (entityKind === "connector") {
          return node?.kind === "connector" && node.connectorId === entityId;
        }
        return node?.kind === "splice" && node.spliceId === entityId;
      });
}

function getEntityPosition(
  state: AppState,
  entityKind: AiAgentMoveEntityOperation["entityKind"],
  entityId: string
): LayoutNodePosition | null {
  const nodeId = getEntityNodeId(state, entityKind, entityId);

  if (nodeId === undefined) {
    return null;
  }
  const generatedPositions = createNodePositionMap(
    state.nodes.allIds.map((candidateNodeId) => state.nodes.byId[candidateNodeId]).filter((node) => node !== undefined),
    state.segments.allIds.map((segmentId) => state.segments.byId[segmentId]).filter((segment) => segment !== undefined)
  );
  return state.nodePositions[nodeId] ?? generatedPositions[nodeId] ?? null;
}

function buildRelativePlacementPosition(
  referencePosition: LayoutNodePosition,
  placement: AiAgentPlaceEntityRelativeToEntityOperation["placement"],
  gap: number
): LayoutNodePosition {
  if (placement === "leftOf") {
    return { x: referencePosition.x - gap, y: referencePosition.y };
  }
  if (placement === "rightOf") {
    return { x: referencePosition.x + gap, y: referencePosition.y };
  }
  if (placement === "above") {
    return { x: referencePosition.x, y: referencePosition.y - gap };
  }
  return { x: referencePosition.x, y: referencePosition.y + gap };
}

function normalizeOperationEntityReferences(state: AppState, operation: AiAgentSupportedOperation): AiAgentSupportedOperation {
  if (operation.type === "move_entity") {
    const entityId = resolveEntityId(state, operation.entityKind, operation.entityId);
    const normalizedOperation = {
      ...operation,
      entityId
    };
    if (operation.position !== undefined || operation.relativeMove === undefined) {
      return normalizedOperation;
    }
    const currentPosition = getEntityPosition(state, normalizedOperation.entityKind, normalizedOperation.entityId);
    if (currentPosition === null) {
      return normalizedOperation;
    }
    return {
      ...normalizedOperation,
      position: {
        x: currentPosition.x + operation.relativeMove.dx,
        y: currentPosition.y + operation.relativeMove.dy
      }
    };
  }
  if (operation.type === "place_entity_relative_to_entity") {
    const entityId = resolveEntityId(state, operation.entityKind, operation.entityId);
    const referenceEntityId = resolveEntityId(state, operation.referenceEntityKind, operation.referenceEntityId);
    const normalizedOperation = {
      ...operation,
      entityId,
      referenceEntityId
    };
    const referencePosition = getEntityPosition(state, normalizedOperation.referenceEntityKind, referenceEntityId);
    return referencePosition === null
      ? normalizedOperation
      : {
          ...normalizedOperation,
          position: buildRelativePlacementPosition(referencePosition, normalizedOperation.placement, normalizedOperation.gap)
        };
  }
  if (operation.type === "update_entity") {
    return {
      ...operation,
      entityId: resolveEntityId(state, operation.entityKind, operation.entityId)
    };
  }
  if (operation.type === "regenerate_route") {
    return {
      ...operation,
      wireIds: operation.wireIds.map((wireId) => resolveEntityId(state, "wire", wireId) as WireId)
    };
  }
  if (operation.type === "delete_entity") {
    return {
      ...operation,
      entityId: resolveEntityId(state, operation.entityKind, operation.entityId)
    };
  }
  return operation;
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
  if (operation.type === "place_entity_relative_to_entity") {
    return "move";
  }
  if (operation.type === "update_entity") {
    return "update";
  }
  if (operation.type === "delete_entity") {
    return "delete";
  }
  return "route";
}

function entityExists(
  state: AppState,
  operation: AiAgentSupportedOperation,
  prospectiveNodeIds: Set<string>,
  prospectiveConnectors: Map<string, number>,
  prospectiveSplices: Map<string, number>
): boolean {
  const endpointExists = (endpoint: WireEndpoint): boolean => {
    if (endpoint.kind === "connectorCavity") {
      const connector = state.connectors.byId[endpoint.connectorId];
      const cavityCount = connector?.cavityCount ?? prospectiveConnectors.get(endpoint.connectorId);
      return cavityCount !== undefined && Number.isInteger(endpoint.cavityIndex) && endpoint.cavityIndex >= 1 && endpoint.cavityIndex <= cavityCount;
    }
    const splice = state.splices.byId[endpoint.spliceId];
    const portCount = splice?.portCount ?? prospectiveSplices.get(endpoint.spliceId);
    return portCount !== undefined && Number.isInteger(endpoint.portIndex) && endpoint.portIndex >= 1 && endpoint.portIndex <= portCount;
  };
  if (operation.type === "add_connector") {
    return (
      (operation.id === undefined || state.connectors.byId[operation.id] === undefined) &&
      (operation.nodeId === undefined || state.nodes.byId[operation.nodeId] === undefined)
    );
  }
  if (operation.type === "add_splice") {
    return (
      (operation.id === undefined || state.splices.byId[operation.id] === undefined) &&
      (operation.nodeId === undefined || state.nodes.byId[operation.nodeId] === undefined)
    );
  }
  if (operation.type === "add_node") {
    return operation.id === undefined || state.nodes.byId[operation.id] === undefined;
  }
  if (operation.type === "add_segment") {
    return prospectiveNodeIds.has(operation.nodeA) && prospectiveNodeIds.has(operation.nodeB);
  }
  if (operation.type === "add_wire") {
    return endpointExists(operation.endpointA) && endpointExists(operation.endpointB);
  }
  if (operation.type === "regenerate_route") {
    return operation.wireIds.every((wireId) => state.wires.byId[wireId] !== undefined);
  }
  if (operation.type === "delete_entity") {
    return state.wires.byId[operation.entityId as WireId] !== undefined;
  }
  if (operation.type === "move_entity" || operation.type === "place_entity_relative_to_entity" || operation.type === "update_entity") {
    if (operation.entityKind === "catalog") {
      return state.catalogItems.byId[operation.entityId as CatalogItemId] !== undefined;
    }
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
    if (operation.type !== "update_entity") {
      return false;
    }
    if (state.wires.byId[operation.entityId as WireId] === undefined) {
      return false;
    }
    const endpointA = operation.fields.endpointA as WireEndpoint | undefined;
    const endpointB = operation.fields.endpointB as WireEndpoint | undefined;
    return (endpointA === undefined || endpointExists(endpointA)) && (endpointB === undefined || endpointExists(endpointB));
  }
  return true;
}

function endpointOccupancyConflict(state: AppState, endpoint: WireEndpoint, wireId?: WireId): boolean {
  const occupant =
    endpoint.kind === "connectorCavity"
      ? state.connectorCavityOccupancy[endpoint.connectorId]?.[endpoint.cavityIndex]
      : state.splicePortOccupancy[endpoint.spliceId]?.[endpoint.portIndex];
  if (occupant === undefined) {
    return false;
  }
  return wireId === undefined ? true : occupant !== `wire:${wireId}:A` && occupant !== `wire:${wireId}:B`;
}

function wireEndpointKey(endpoint: WireEndpoint): string {
  return endpoint.kind === "connectorCavity"
    ? `connector:${endpoint.connectorId}:${endpoint.cavityIndex}`
    : `splice:${endpoint.spliceId}:${endpoint.portIndex}`;
}

function wireEndpointConflictMessage(state: AppState, operation: AiAgentSupportedOperation): string | null {
  if (operation.type === "add_wire") {
    return endpointOccupancyConflict(state, operation.endpointA) || endpointOccupancyConflict(state, operation.endpointB)
      ? "Wire endpoint is already occupied."
      : null;
  }
  if (operation.type !== "update_entity" || operation.entityKind !== "wire") {
    return null;
  }
  const wire = state.wires.byId[operation.entityId as WireId];
  if (wire === undefined) {
    return null;
  }
  const endpointA = (operation.fields.endpointA as WireEndpoint | undefined) ?? wire.endpointA;
  const endpointB = (operation.fields.endpointB as WireEndpoint | undefined) ?? wire.endpointB;
  if (wireEndpointKey(endpointA) === wireEndpointKey(endpointB)) {
    return "Wire endpoints must be different.";
  }
  return endpointOccupancyConflict(state, endpointA, wire.id) || endpointOccupancyConflict(state, endpointB, wire.id)
    ? "Wire endpoint is already occupied."
    : null;
}

function entityReferenceExists(
  state: AppState,
  entityKind: AiAgentPlaceEntityRelativeToEntityOperation["referenceEntityKind"],
  entityId: string
): boolean {
  if (entityKind === "connector") {
    return state.connectors.byId[entityId as ConnectorId] !== undefined;
  }
  if (entityKind === "splice") {
    return state.splices.byId[entityId as SpliceId] !== undefined;
  }
  return state.nodes.byId[entityId as NodeId] !== undefined;
}

function isWithinSelectionScope(operation: AiAgentSupportedOperation, selection: SelectionState | null): boolean {
  if (selection === null) {
    return false;
  }
  if (operation.type === "move_entity" || operation.type === "place_entity_relative_to_entity" || operation.type === "update_entity") {
    return operation.entityKind === selection.kind && operation.entityId === selection.id;
  }
  if (operation.type === "regenerate_route") {
    return selection.kind === "wire" && operation.wireIds.includes(selection.id as WireId);
  }
  if (operation.type === "delete_entity") {
    return selection.kind === "wire" && operation.entityId === selection.id;
  }
  return true;
}

export function validateAiAgentOperations({
  state,
  payload,
  scope,
  selection,
  permissions,
  instruction
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

  const prospectiveNodeIds = new Set<string>(state.nodes.allIds);
  const prospectiveConnectors = new Map<string, number>();
  const prospectiveSplices = new Map<string, number>();

  envelope.operations.forEach((operation, operationIndex) => {
    const parsed = parseOperation(operation, operationIndex, selection, instruction);
    if ("status" in parsed) {
      if (parsed.status === "unsupported") {
        result.unsupported.push(parsed);
      } else {
        result.rejected.push(parsed);
      }
      return;
    }

    const normalized = normalizeOperationEntityReferences(state, parsed);
    const permission = permissionForOperation(normalized);
    if (!permissions[permission]) {
      result.rejected.push(reject(operationIndex, normalized.type, `${permission} permission is disabled.`));
      return;
    }
    if (!entityExists(state, normalized, prospectiveNodeIds, prospectiveConnectors, prospectiveSplices)) {
      result.rejected.push(reject(operationIndex, normalized.type, "Operation references unknown modeling entities."));
      return;
    }
    if (
      normalized.type === "place_entity_relative_to_entity" &&
      !entityReferenceExists(state, normalized.referenceEntityKind, normalized.referenceEntityId)
    ) {
      result.rejected.push(reject(operationIndex, normalized.type, "Relative placement references an unknown anchor entity."));
      return;
    }
    if (
      (normalized.type === "move_entity" || normalized.type === "place_entity_relative_to_entity") &&
      normalized.position === undefined
    ) {
      result.rejected.push(reject(operationIndex, normalized.type, "Move operation could not resolve a canvas position."));
      return;
    }
    const endpointConflictMessage = wireEndpointConflictMessage(state, normalized);
    if (endpointConflictMessage !== null) {
      result.rejected.push(reject(operationIndex, normalized.type, endpointConflictMessage));
      return;
    }
    if (scope === "currentSelection" && !isWithinSelectionScope(normalized, selection)) {
      result.rejected.push(reject(operationIndex, normalized.type, "Operation is outside the current selection scope."));
      return;
    }

    result.accepted.push(normalized);
    if (normalized.type === "add_connector" && normalized.id !== undefined) {
      prospectiveConnectors.set(normalized.id, normalized.cavityCount);
      if (normalized.nodeId !== undefined) {
        prospectiveNodeIds.add(normalized.nodeId);
      }
    }
    if (normalized.type === "add_splice" && normalized.id !== undefined) {
      prospectiveSplices.set(normalized.id, normalized.portCount);
      if (normalized.nodeId !== undefined) {
        prospectiveNodeIds.add(normalized.nodeId);
      }
    }
    if (normalized.type === "add_node" && normalized.id !== undefined) {
      prospectiveNodeIds.add(normalized.id);
    }
  });

  return result;
}
