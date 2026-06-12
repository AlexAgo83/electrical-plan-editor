import type { AppState, LayoutNodePosition, SelectionState } from "../../store/types";
import type {
  CatalogItemId,
  ConnectorId,
  ConnectorLayout,
  ConnectorTerminalMaterial,
  HarnessAssemblyId,
  NetworkId,
  NodeId,
  SegmentId,
  SpliceId,
  WireEndpoint,
  WireId
} from "../../core/entities";
import { normalizeConnectorLayout } from "../../core/connectorLayout";
import { computeRecommendedWireSectionMm2 } from "../../core/wireSizing";
import {
  analyzeCatalogDeleteImpact,
  analyzeConnectorDeleteImpact,
  analyzeNodeDeleteImpact,
  analyzeSegmentDeleteImpact,
  analyzeSpliceDeleteImpact
} from "../../store/deleteImpact";
import { computeForcedRouteWithAnchors, resolveWireEndpointAnchor } from "../../store/reducer/helpers/wireTransitions";
import { assignScopedState } from "../../store/networking";
import { createNodePositionMap } from "./layout/generation";

export const AI_AGENT_OPERATION_SCHEMA_VERSION = 1;

export type AiAgentScope = "activeNetwork" | "currentSelection" | "selectedHarness" | "allNetworks";

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
  & { networkId?: NetworkId }
  & (
    | AiAgentAddConnectorOperation
    | AiAgentAddSpliceOperation
    | AiAgentAddNodeOperation
    | AiAgentAddSegmentOperation
    | AiAgentAddWireOperation
    | AiAgentMoveEntityOperation
    | AiAgentBatchMoveEntitiesOperation
    | AiAgentPlaceEntityRelativeToEntityOperation
    | AiAgentUpdateEntityOperation
    | AiAgentRegenerateRouteOperation
    | AiAgentDeleteEntityOperation
    | AiAgentCreateCatalogItemOperation
    | AiAgentUpdateCatalogConnectorLayoutOperation
    | AiAgentAssignCatalogItemOperation
    | AiAgentSetConnectorTerminalMaterialOperation
    | AiAgentLockWireRouteOperation
    | AiAgentClarificationRequiredOperation
  );

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

export interface AiAgentBatchMoveEntityEntry {
  entityKind: "connector" | "splice" | "node";
  entityId: string;
  position?: LayoutNodePosition;
  relativeMove?: {
    dx: number;
    dy: number;
  };
}

export interface AiAgentBatchMoveEntitiesOperation {
  type: "batch_move_entities";
  moves: AiAgentBatchMoveEntityEntry[];
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
  entityKind: "catalog" | "connector" | "splice" | "node" | "segment" | "wire";
  entityId: string;
  mode?: "direct" | "cascade";
}

export interface AiAgentRegenerateRouteOperation {
  type: "regenerate_route";
  wireIds: WireId[];
}

export interface AiAgentLockWireRouteOperation {
  type: "lock_wire_route";
  wireId: WireId;
  segmentIds: SegmentId[];
}

export interface AiAgentCreateCatalogItemOperation {
  type: "create_catalog_item";
  id?: CatalogItemId;
  manufacturerReference: string;
  name?: string;
  connectionCount: number;
  unitPriceExclTax?: number;
  url?: string;
}

export interface AiAgentUpdateCatalogConnectorLayoutOperation {
  type: "update_catalog_connector_layout";
  catalogItemId: string;
  connectorLayout: ConnectorLayout;
}

export interface AiAgentAssignCatalogItemOperation {
  type: "assign_catalog_item";
  entityKind: "connector" | "splice" | "wireProtection";
  entityId: string;
  catalogItemId: string;
}

export interface AiAgentSetConnectorTerminalMaterialOperation {
  type: "set_connector_terminal_material";
  connectorId: string;
  cavityIndex: number;
  material: ConnectorTerminalMaterial;
}

export interface AiAgentClarificationRequiredOperation {
  type: "clarification_required";
  question: string;
  reasons: string[];
}

interface ValidateAiAgentOperationsParams {
  state: AppState;
  payload: unknown;
  scope: AiAgentScope;
  selection: SelectionState | null;
  permissions: AiAgentOperationPermissions;
  instruction?: string;
  selectedHarnessAssemblyId?: HarnessAssemblyId | null;
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

function readOptionalNonNegativeNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

function readTerminalMaterial(value: unknown): ConnectorTerminalMaterial | null {
  if (!isRecord(value)) {
    return null;
  }
  const material: ConnectorTerminalMaterial = {};
  const terminalReference = readOptionalString(value.terminalReference);
  const terminalName = readOptionalString(value.terminalName);
  const sealReference = readOptionalString(value.sealReference);
  const sealName = readOptionalString(value.sealName);
  if (terminalReference !== undefined && terminalReference.length > 0) {
    material.terminalReference = terminalReference;
  }
  if (terminalName !== undefined && terminalName.length > 0) {
    material.terminalName = terminalName;
  }
  if (sealReference !== undefined && sealReference.length > 0) {
    material.sealReference = sealReference;
  }
  if (sealName !== undefined && sealName.length > 0) {
    material.sealName = sealName;
  }
  return Object.keys(material).length > 0 ? material : null;
}

function normalizeEntityReference(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function normalizeTechnicalId(value: string): string {
  return value.trim().toLowerCase();
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
  const nestedMove = isRecord(operation.relativeMove) ? operation.relativeMove : null;
  const nestedDx = nestedMove !== null && typeof nestedMove.dx === "number" && Number.isFinite(nestedMove.dx) ? nestedMove.dx : null;
  const nestedDy = nestedMove !== null && typeof nestedMove.dy === "number" && Number.isFinite(nestedMove.dy) ? nestedMove.dy : null;
  if (nestedDx !== null || nestedDy !== null) {
    return {
      dx: nestedDx ?? 0,
      dy: nestedDy ?? 0
    };
  }

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

function parseBatchMoveEntries(value: unknown): AiAgentBatchMoveEntityEntry[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const moves: AiAgentBatchMoveEntityEntry[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) {
      return null;
    }
    const entityKind = readString(entry.entityKind);
    const entityId = readString(entry.entityId);
    const position = readPosition(entry.position);
    const relativeMove = readRelativeMove(entry);
    if (
      (entityKind !== "connector" && entityKind !== "splice" && entityKind !== "node") ||
      entityId === null ||
      (position === null && relativeMove === null)
    ) {
      return null;
    }
    moves.push({
      entityKind,
      entityId,
      ...(position === null ? {} : { position }),
      ...(relativeMove === null ? {} : { relativeMove })
    });
  }
  return moves;
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
  if (type === "clarification_required") {
    const question = readString(operation.question);
    const reasons = readStringArray(operation.reasons);
    return question !== null
      ? { type, question, reasons: reasons ?? [] }
      : reject(operationIndex, type, "Clarification requests require a user-facing question.");
  }
  if (type === "delete_entity") {
    const entityKind = readString(operation.entityKind);
    const entityId = readString(operation.entityId);
    const mode = operation.mode === "cascade" ? "cascade" : "direct";
    return (entityKind === "catalog" ||
      entityKind === "connector" ||
      entityKind === "splice" ||
      entityKind === "node" ||
      entityKind === "segment" ||
      entityKind === "wire") &&
      entityId !== null
      ? { type, entityKind, entityId, mode }
      : reject(operationIndex, type, "Delete operation requires a supported entityKind and entityId.");
  }

  if (type === "create_catalog_item") {
    const id = readString(operation.id);
    const manufacturerReference = readString(operation.manufacturerReference);
    const name = readOptionalString(operation.name);
    const connectionCount = readPositiveNumber(operation.connectionCount);
    const unitPriceExclTax = readOptionalNonNegativeNumber(operation.unitPriceExclTax);
    const url = readOptionalString(operation.url);
    return manufacturerReference !== null && connectionCount !== null
      ? {
          type,
          ...(id === null ? {} : { id: id as CatalogItemId }),
          manufacturerReference,
          ...(name === undefined || name.length === 0 ? {} : { name }),
          connectionCount,
          ...(unitPriceExclTax === undefined ? {} : { unitPriceExclTax }),
          ...(url === undefined || url.length === 0 ? {} : { url })
        }
      : reject(operationIndex, type, "Catalog item creation requires manufacturerReference and connectionCount.");
  }

  if (type === "update_catalog_connector_layout") {
    const catalogItemId = readString(operation.catalogItemId);
    const connectionCount = readPositiveNumber(operation.connectionCount);
    const normalizedLayout =
      catalogItemId === null || connectionCount === null
        ? undefined
        : normalizeConnectorLayout(operation.connectorLayout as Partial<ConnectorLayout> | undefined, connectionCount);
    return catalogItemId !== null && normalizedLayout !== undefined
      ? {
          type,
          catalogItemId,
          connectorLayout: normalizedLayout
        }
      : reject(operationIndex, type, "Catalog connector layout update requires catalogItemId, connectionCount, and connectorLayout.");
  }

  if (type === "assign_catalog_item") {
    const entityKind = readString(operation.entityKind);
    const entityId = readString(operation.entityId);
    const catalogItemId = readString(operation.catalogItemId);
    return (entityKind === "connector" || entityKind === "splice" || entityKind === "wireProtection") &&
      entityId !== null &&
      catalogItemId !== null
      ? { type, entityKind, entityId, catalogItemId }
      : reject(operationIndex, type, "Catalog assignment requires entityKind, entityId, and catalogItemId.");
  }

  if (type === "set_connector_terminal_material") {
    const connectorId = readString(operation.connectorId);
    const cavityIndex = readPositiveNumber(operation.cavityIndex);
    const material = readTerminalMaterial(operation.material);
    return connectorId !== null && cavityIndex !== null && material !== null
      ? { type, connectorId, cavityIndex, material }
      : reject(operationIndex, type, "Connector terminal material requires connectorId, cavityIndex, and material.");
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

  if (type === "batch_move_entities") {
    const moves = parseBatchMoveEntries(operation.moves);
    return moves !== null
      ? { type, moves }
      : reject(operationIndex, type, "Batch move operation requires one or more valid moves.");
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

  if (type === "lock_wire_route") {
    const wireId = readString(operation.wireId);
    const segmentIds = readStringArray(operation.segmentIds);
    return wireId !== null && segmentIds !== null && segmentIds.length > 0
      ? { type, wireId: wireId as WireId, segmentIds: segmentIds as SegmentId[] }
      : reject(operationIndex, type, "Wire route lock requires wireId and segmentIds.");
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
  if (operation.type === "batch_move_entities") {
    return {
      ...operation,
      moves: operation.moves.map((move) => {
        const entityId = resolveEntityId(state, move.entityKind, move.entityId);
        const normalizedMove = {
          ...move,
          entityId
        };
        if (move.position !== undefined || move.relativeMove === undefined) {
          return normalizedMove;
        }
        const currentPosition = getEntityPosition(state, move.entityKind, entityId);
        return currentPosition === null
          ? normalizedMove
          : {
              ...normalizedMove,
              position: {
                x: currentPosition.x + move.relativeMove.dx,
                y: currentPosition.y + move.relativeMove.dy
              }
            };
      })
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
  if (operation.type === "assign_catalog_item") {
    return {
      ...operation,
      entityId: operation.entityKind === "wireProtection" ? resolveEntityId(state, "wire", operation.entityId) : resolveEntityId(state, operation.entityKind, operation.entityId),
      catalogItemId: resolveEntityId(state, "catalog", operation.catalogItemId)
    };
  }
  if (operation.type === "update_catalog_connector_layout") {
    return {
      ...operation,
      catalogItemId: resolveEntityId(state, "catalog", operation.catalogItemId)
    };
  }
  if (operation.type === "set_connector_terminal_material") {
    return {
      ...operation,
      connectorId: resolveEntityId(state, "connector", operation.connectorId)
    };
  }
  if (operation.type === "lock_wire_route") {
    return {
      ...operation,
      wireId: resolveEntityId(state, "wire", operation.wireId) as WireId
    };
  }
  return operation;
}

function addProspectiveReferences(target: Map<string, string>, id: string, references: string[]): void {
  for (const reference of references) {
    if (reference.trim().length === 0) {
      continue;
    }
    target.set(normalizeEntityReference(reference), id);
  }
}

function resolveProspectiveReference(references: Map<string, string>, value: string): string {
  return references.get(normalizeEntityReference(value)) ?? value;
}

function resolveProspectiveEndpointReferences(
  endpoint: WireEndpoint,
  prospectiveConnectorReferences: Map<string, string>,
  prospectiveSpliceReferences: Map<string, string>
): WireEndpoint {
  if (endpoint.kind === "connectorCavity") {
    return {
      ...endpoint,
      connectorId: resolveProspectiveReference(prospectiveConnectorReferences, endpoint.connectorId) as ConnectorId
    };
  }
  return {
    ...endpoint,
    spliceId: resolveProspectiveReference(prospectiveSpliceReferences, endpoint.spliceId) as SpliceId
  };
}

function resolveProspectiveOperationReferences(
  operation: AiAgentSupportedOperation,
  prospectiveConnectorReferences: Map<string, string>,
  prospectiveSpliceReferences: Map<string, string>,
  prospectiveNodeReferences: Map<string, string>
): AiAgentSupportedOperation {
  if (operation.type === "add_segment") {
    return {
      ...operation,
      nodeA: resolveProspectiveReference(prospectiveNodeReferences, operation.nodeA) as NodeId,
      nodeB: resolveProspectiveReference(prospectiveNodeReferences, operation.nodeB) as NodeId
    };
  }
  if (operation.type === "add_wire") {
    return {
      ...operation,
      endpointA: resolveProspectiveEndpointReferences(operation.endpointA, prospectiveConnectorReferences, prospectiveSpliceReferences),
      endpointB: resolveProspectiveEndpointReferences(operation.endpointB, prospectiveConnectorReferences, prospectiveSpliceReferences)
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
  if (operation.type === "create_catalog_item") {
    return "add";
  }
  if (
    operation.type === "assign_catalog_item" ||
    operation.type === "update_catalog_connector_layout" ||
    operation.type === "set_connector_terminal_material"
  ) {
    return "update";
  }
  if (operation.type === "clarification_required") {
    return "update";
  }
  if (operation.type === "move_entity" || operation.type === "batch_move_entities") {
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
  prospectiveSplices: Map<string, number>,
  prospectiveCatalogItems: Set<string>
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
  if (operation.type === "create_catalog_item") {
    return (
      (operation.id === undefined || state.catalogItems.byId[operation.id] === undefined) &&
      !state.catalogItems.allIds.some(
        (catalogItemId) =>
          normalizeTechnicalId(state.catalogItems.byId[catalogItemId]?.manufacturerReference ?? "") ===
          normalizeTechnicalId(operation.manufacturerReference)
      )
    );
  }
  if (operation.type === "assign_catalog_item") {
    const catalogItem = state.catalogItems.byId[operation.catalogItemId as CatalogItemId];
    if (catalogItem === undefined && !prospectiveCatalogItems.has(operation.catalogItemId)) {
      return false;
    }
    if (operation.entityKind === "connector") {
      return state.connectors.byId[operation.entityId as ConnectorId] !== undefined;
    }
    if (operation.entityKind === "splice") {
      return state.splices.byId[operation.entityId as SpliceId] !== undefined;
    }
    return state.wires.byId[operation.entityId as WireId] !== undefined;
  }
  if (operation.type === "update_catalog_connector_layout") {
    return state.catalogItems.byId[operation.catalogItemId as CatalogItemId] !== undefined;
  }
  if (operation.type === "set_connector_terminal_material") {
    const connector = state.connectors.byId[operation.connectorId as ConnectorId];
    return (
      connector !== undefined &&
      Number.isInteger(operation.cavityIndex) &&
      operation.cavityIndex >= 1 &&
      operation.cavityIndex <= connector.cavityCount
    );
  }
  if (operation.type === "regenerate_route") {
    return operation.wireIds.every((wireId) => state.wires.byId[wireId] !== undefined);
  }
  if (operation.type === "lock_wire_route") {
    return (
      state.wires.byId[operation.wireId] !== undefined &&
      operation.segmentIds.every((segmentId) => state.segments.byId[segmentId] !== undefined)
    );
  }
  if (operation.type === "batch_move_entities") {
    return operation.moves.every((move) => {
      if (move.entityKind === "connector") {
        return state.connectors.byId[move.entityId as ConnectorId] !== undefined;
      }
      if (move.entityKind === "splice") {
        return state.splices.byId[move.entityId as SpliceId] !== undefined;
      }
      return state.nodes.byId[move.entityId as NodeId] !== undefined;
    });
  }
  if (operation.type === "clarification_required") {
    return true;
  }
  if (operation.type === "delete_entity") {
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

function prospectiveWireEndpointConflictMessage(operation: AiAgentSupportedOperation, prospectiveWireEndpointKeys: Set<string>): string | null {
  if (operation.type === "add_wire") {
    const endpointAKey = wireEndpointKey(operation.endpointA);
    const endpointBKey = wireEndpointKey(operation.endpointB);
    if (endpointAKey === endpointBKey) {
      return "Wire endpoints must be different.";
    }
    return prospectiveWireEndpointKeys.has(endpointAKey) || prospectiveWireEndpointKeys.has(endpointBKey)
      ? "Wire endpoint is already used by another accepted AI operation."
      : null;
  }
  if (operation.type !== "update_entity" || operation.entityKind !== "wire") {
    return null;
  }
  const endpointA = operation.fields.endpointA as WireEndpoint | undefined;
  const endpointB = operation.fields.endpointB as WireEndpoint | undefined;
  if (endpointA === undefined && endpointB === undefined) {
    return null;
  }
  const endpointKeys = [endpointA, endpointB].filter((endpoint): endpoint is WireEndpoint => endpoint !== undefined).map(wireEndpointKey);
  return endpointKeys.some((endpointKey) => prospectiveWireEndpointKeys.has(endpointKey))
    ? "Wire endpoint is already used by another accepted AI operation."
    : null;
}

function existingTechnicalIdConflictMessage(state: AppState, operation: AiAgentSupportedOperation): string | null {
  if (operation.type === "add_connector") {
    return state.connectors.allIds.some(
      (connectorId) => normalizeTechnicalId(state.connectors.byId[connectorId]?.technicalId ?? "") === normalizeTechnicalId(operation.technicalId)
    )
      ? "Connector technical ID already exists."
      : null;
  }
  if (operation.type === "add_splice") {
    return state.splices.allIds.some(
      (spliceId) => normalizeTechnicalId(state.splices.byId[spliceId]?.technicalId ?? "") === normalizeTechnicalId(operation.technicalId)
    )
      ? "Splice technical ID already exists."
      : null;
  }
  if (operation.type === "add_wire") {
    return state.wires.allIds.some(
      (wireId) => normalizeTechnicalId(state.wires.byId[wireId]?.technicalId ?? "") === normalizeTechnicalId(operation.technicalId)
    )
      ? "Wire technical ID already exists."
      : null;
  }
  if (operation.type !== "update_entity" || typeof operation.fields.technicalId !== "string") {
    return null;
  }
  const technicalId = normalizeTechnicalId(operation.fields.technicalId);
  if (operation.entityKind === "connector") {
    return state.connectors.allIds.some(
      (connectorId) =>
        connectorId !== operation.entityId &&
        normalizeTechnicalId(state.connectors.byId[connectorId]?.technicalId ?? "") === technicalId
    )
      ? "Connector technical ID already exists."
      : null;
  }
  if (operation.entityKind === "splice") {
    return state.splices.allIds.some(
      (spliceId) => spliceId !== operation.entityId && normalizeTechnicalId(state.splices.byId[spliceId]?.technicalId ?? "") === technicalId
    )
      ? "Splice technical ID already exists."
      : null;
  }
  if (operation.entityKind === "wire") {
    return state.wires.allIds.some(
      (wireId) => wireId !== operation.entityId && normalizeTechnicalId(state.wires.byId[wireId]?.technicalId ?? "") === technicalId
    )
      ? "Wire technical ID already exists."
      : null;
  }
  return null;
}

function prospectiveTechnicalIdConflictMessage(
  operation: AiAgentSupportedOperation,
  prospectiveConnectorTechnicalIds: Set<string>,
  prospectiveSpliceTechnicalIds: Set<string>,
  prospectiveWireTechnicalIds: Set<string>
): string | null {
  if (operation.type === "add_connector") {
    return prospectiveConnectorTechnicalIds.has(normalizeTechnicalId(operation.technicalId))
      ? "Connector technical ID is duplicated in this AI proposal."
      : null;
  }
  if (operation.type === "add_splice") {
    return prospectiveSpliceTechnicalIds.has(normalizeTechnicalId(operation.technicalId))
      ? "Splice technical ID is duplicated in this AI proposal."
      : null;
  }
  if (operation.type === "add_wire") {
    return prospectiveWireTechnicalIds.has(normalizeTechnicalId(operation.technicalId))
      ? "Wire technical ID is duplicated in this AI proposal."
      : null;
  }
  if (operation.type !== "update_entity" || typeof operation.fields.technicalId !== "string") {
    return null;
  }
  if (operation.entityKind === "connector") {
    return prospectiveConnectorTechnicalIds.has(normalizeTechnicalId(operation.fields.technicalId))
      ? "Connector technical ID is duplicated in this AI proposal."
      : null;
  }
  if (operation.entityKind === "splice") {
    return prospectiveSpliceTechnicalIds.has(normalizeTechnicalId(operation.fields.technicalId))
      ? "Splice technical ID is duplicated in this AI proposal."
      : null;
  }
  if (operation.entityKind === "wire") {
    return prospectiveWireTechnicalIds.has(normalizeTechnicalId(operation.fields.technicalId))
      ? "Wire technical ID is duplicated in this AI proposal."
      : null;
  }
  return null;
}

function deleteImpactMessage(state: AppState, operation: AiAgentDeleteEntityOperation): string | null {
  if (operation.entityKind === "wire") {
    return null;
  }
  if (operation.entityKind === "catalog") {
    const impact = analyzeCatalogDeleteImpact(state, operation.entityId as CatalogItemId);
    return impact.kind === "direct" ? null : impact.message;
  }
  if (operation.entityKind === "connector") {
    const impact = analyzeConnectorDeleteImpact(state, operation.entityId as ConnectorId);
    if (impact.kind === "direct") {
      return null;
    }
    if (impact.kind === "cascade" && operation.mode === "cascade") {
      return null;
    }
    return impact.message;
  }
  if (operation.entityKind === "splice") {
    const impact = analyzeSpliceDeleteImpact(state, operation.entityId as SpliceId);
    if (impact.kind === "direct") {
      return null;
    }
    if (impact.kind === "cascade" && operation.mode === "cascade") {
      return null;
    }
    return impact.message;
  }
  if (operation.entityKind === "node") {
    const impact = analyzeNodeDeleteImpact(state, operation.entityId as NodeId);
    return impact.kind === "direct" ? null : impact.message;
  }
  const impact = analyzeSegmentDeleteImpact(state, operation.entityId as SegmentId);
  return impact.kind === "direct" ? null : impact.message;
}

function routeLockValidationMessage(state: AppState, operation: AiAgentLockWireRouteOperation): string | null {
  const wire = state.wires.byId[operation.wireId];
  if (wire === undefined) {
    return null;
  }
  const anchorA = resolveWireEndpointAnchor(state, wire.endpointA);
  const anchorB = resolveWireEndpointAnchor(state, wire.endpointB);
  if ("error" in anchorA || "error" in anchorB) {
    return "Route lock requires endpoints that can be resolved to canvas nodes.";
  }
  return computeForcedRouteWithAnchors(state, anchorA.anchor, anchorB.anchor, operation.segmentIds) === null
    ? "Route lock segments must form a continuous path between the wire endpoints."
    : null;
}

function wireSizingValidationMessage(state: AppState, operation: AiAgentSupportedOperation): string | null {
  if (operation.type !== "update_entity" || operation.entityKind !== "wire") {
    return null;
  }
  const wire = state.wires.byId[operation.entityId as WireId];
  if (wire === undefined) {
    return null;
  }
  const networkVoltageV = state.activeNetworkId === null ? undefined : state.networks.byId[state.activeNetworkId]?.voltageV;
  const nextSectionMm2 =
    typeof operation.fields.sectionMm2 === "number" && Number.isFinite(operation.fields.sectionMm2)
      ? operation.fields.sectionMm2
      : wire.sectionMm2;
  const nextCurrentA =
    typeof operation.fields.currentA === "number" && Number.isFinite(operation.fields.currentA)
      ? operation.fields.currentA
      : wire.currentA;
  const nextMaterial =
    operation.fields.material === "copper" || operation.fields.material === "aluminum"
      ? (operation.fields.material)
      : wire.material;
  const recommendedSectionMm2 = computeRecommendedWireSectionMm2({
    currentA: nextCurrentA,
    material: nextMaterial,
    voltageV: networkVoltageV,
    lengthMm: wire.lengthMm
  });

  return recommendedSectionMm2 !== null && nextSectionMm2 < recommendedSectionMm2
    ? `Wire section ${nextSectionMm2} mm2 is below recommended ${recommendedSectionMm2} mm2 for the requested current.`
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
  if (operation.type === "batch_move_entities") {
    return operation.moves.every((move) => move.entityKind === selection.kind && move.entityId === selection.id);
  }
  if (operation.type === "regenerate_route") {
    return selection.kind === "wire" && operation.wireIds.includes(selection.id as WireId);
  }
  if (operation.type === "delete_entity") {
    return operation.entityKind === selection.kind && operation.entityId === selection.id;
  }
  if (operation.type === "assign_catalog_item") {
    if (operation.entityKind === "wireProtection") {
      return selection.kind === "wire" && operation.entityId === selection.id;
    }
    return selection.kind === operation.entityKind && operation.entityId === selection.id;
  }
  if (operation.type === "update_catalog_connector_layout") {
    return selection.kind === "catalog" && operation.catalogItemId === selection.id;
  }
  if (operation.type === "set_connector_terminal_material") {
    return selection.kind === "connector" && operation.connectorId === selection.id;
  }
  if (operation.type === "lock_wire_route") {
    return selection.kind === "wire" && operation.wireId === selection.id;
  }
  return true;
}

function buildNetworkScopedAppState(state: AppState, networkId: NetworkId): AppState | null {
  const scoped = state.networkStates[networkId];
  return scoped === undefined ? null : assignScopedState({ ...state, activeNetworkId: networkId }, scoped);
}

function networkIdsForAiScope(
  state: AppState,
  scope: AiAgentScope,
  selectedHarnessAssemblyId: HarnessAssemblyId | null | undefined
): NetworkId[] {
  if (scope === "activeNetwork" || scope === "currentSelection") {
    return state.activeNetworkId === null ? [] : [state.activeNetworkId];
  }
  if (scope === "selectedHarness") {
    const selectedHarness =
      selectedHarnessAssemblyId === null || selectedHarnessAssemblyId === undefined
        ? null
        : state.harnessAssemblies.byId[selectedHarnessAssemblyId] ?? null;
    const fallbackHarnessId = state.harnessAssemblies.allIds[0];
    const harness = selectedHarness ?? (fallbackHarnessId === undefined ? null : state.harnessAssemblies.byId[fallbackHarnessId] ?? null);
    return harness === null ? [] : harness.members.map((member) => member.networkId);
  }
  return [...state.networks.allIds];
}

function operationReferencesEntityInScopedState(
  state: AppState,
  rawOperation: Record<string, unknown>
): boolean {
  const type = readString(rawOperation.type);
  const entityKind = readString(rawOperation.entityKind);
  const entityId = readString(rawOperation.entityId);
  const containsConnector = (value: unknown): boolean => typeof value === "string" && state.connectors.byId[value as ConnectorId] !== undefined;
  const containsSplice = (value: unknown): boolean => typeof value === "string" && state.splices.byId[value as SpliceId] !== undefined;
  const containsNode = (value: unknown): boolean => typeof value === "string" && state.nodes.byId[value as NodeId] !== undefined;
  const containsSegment = (value: unknown): boolean => typeof value === "string" && state.segments.byId[value as SegmentId] !== undefined;
  const containsWire = (value: unknown): boolean => typeof value === "string" && state.wires.byId[value as WireId] !== undefined;
  const containsCatalog = (value: unknown): boolean => typeof value === "string" && state.catalogItems.byId[value as CatalogItemId] !== undefined;
  const containsEndpoint = (value: unknown): boolean => {
    if (!isRecord(value)) {
      return false;
    }
    if (value.kind === "connectorCavity") {
      return containsConnector(value.connectorId);
    }
    if (value.kind === "splicePort") {
      return containsSplice(value.spliceId);
    }
    return false;
  };

  if (type === "add_segment") {
    return containsNode(rawOperation.nodeA) && containsNode(rawOperation.nodeB);
  }
  if (type === "add_wire") {
    return containsEndpoint(rawOperation.endpointA) && containsEndpoint(rawOperation.endpointB);
  }
  if (type === "regenerate_route") {
    return Array.isArray(rawOperation.wireIds) && rawOperation.wireIds.every(containsWire);
  }
  if (type === "lock_wire_route") {
    return containsWire(rawOperation.wireId) && Array.isArray(rawOperation.segmentIds) && rawOperation.segmentIds.every(containsSegment);
  }
  if (type === "update_catalog_connector_layout") {
    return containsCatalog(rawOperation.catalogItemId);
  }
  if (type === "set_connector_terminal_material") {
    return containsConnector(rawOperation.connectorId);
  }
  if (type === "assign_catalog_item") {
    const entityExistsForKind =
      entityKind === "connector"
        ? containsConnector(entityId)
        : entityKind === "splice"
          ? containsSplice(entityId)
          : entityKind === "wireProtection"
            ? containsWire(entityId)
            : false;
    return entityExistsForKind && containsCatalog(rawOperation.catalogItemId);
  }
  if (type === "batch_move_entities" && Array.isArray(rawOperation.moves)) {
    return rawOperation.moves.every((move) => {
      if (!isRecord(move)) {
        return false;
      }
      const moveKind = readString(move.entityKind);
      return moveKind === "connector"
        ? containsConnector(move.entityId)
        : moveKind === "splice"
          ? containsSplice(move.entityId)
          : moveKind === "node" && containsNode(move.entityId);
    });
  }
  if (type === "place_entity_relative_to_entity") {
    const referenceKind = readString(rawOperation.referenceEntityKind);
    const entityMatches =
      entityKind === "connector"
        ? containsConnector(entityId)
        : entityKind === "splice"
          ? containsSplice(entityId)
          : entityKind === "node" && containsNode(entityId);
    const referenceMatches =
      referenceKind === "connector"
        ? containsConnector(rawOperation.referenceEntityId)
        : referenceKind === "splice"
          ? containsSplice(rawOperation.referenceEntityId)
          : referenceKind === "node" && containsNode(rawOperation.referenceEntityId);
    return entityMatches && referenceMatches;
  }
  if (type === "move_entity" || type === "update_entity" || type === "delete_entity") {
    if (entityKind === "catalog") {
      return containsCatalog(entityId);
    }
    if (entityKind === "connector") {
      return containsConnector(entityId);
    }
    if (entityKind === "splice") {
      return containsSplice(entityId);
    }
    if (entityKind === "node") {
      return containsNode(entityId);
    }
    if (entityKind === "segment") {
      return containsSegment(entityId);
    }
    return entityKind === "wire" && containsWire(entityId);
  }
  return false;
}

function resolveOperationNetworkId(
  state: AppState,
  operation: unknown,
  scope: AiAgentScope,
  selectedHarnessAssemblyId: HarnessAssemblyId | null | undefined
): NetworkId | AiAgentOperationValidationIssue {
  if (!isRecord(operation)) {
    return reject(-1, "unknown", "Operation must be an object.");
  }
  const operationType = readString(operation.type) ?? "unknown";
  const scopedNetworkIds = networkIdsForAiScope(state, scope, selectedHarnessAssemblyId);
  const declaredNetworkId = readString(operation.networkId);
  if (declaredNetworkId !== null) {
    return scopedNetworkIds.includes(declaredNetworkId as NetworkId) && state.networkStates[declaredNetworkId as NetworkId] !== undefined
      ? (declaredNetworkId as NetworkId)
      : reject(-1, operationType, "Operation networkId is outside the selected AI scope.");
  }
  if (scope === "activeNetwork" || scope === "currentSelection") {
    return state.activeNetworkId ?? reject(-1, operationType, "No active network is available.");
  }

  const matchingNetworkIds = scopedNetworkIds.filter((networkId) => {
    const scopedState = buildNetworkScopedAppState(state, networkId);
    return scopedState !== null && operationReferencesEntityInScopedState(scopedState, operation);
  });
  if (matchingNetworkIds.length === 1) {
    return matchingNetworkIds[0] as NetworkId;
  }
  return reject(
    -1,
    operationType,
    matchingNetworkIds.length === 0
      ? "Multi-network AI operations must include networkId when no existing scoped entity identifies the target network."
      : "Multi-network AI operation references are ambiguous; include networkId."
  );
}

function withOperationNetworkId(operation: unknown, networkId: NetworkId): unknown {
  return isRecord(operation) ? { ...operation, networkId } : operation;
}

function validateAiAgentOperationsForState({
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
  const prospectiveCatalogItems = new Set<string>();
  const prospectiveConnectorReferences = new Map<string, string>();
  const prospectiveSpliceReferences = new Map<string, string>();
  const prospectiveCatalogReferences = new Map<string, string>();
  const prospectiveNodeReferences = new Map<string, string>();
  const prospectiveWireEndpointKeys = new Set<string>();
  const prospectiveConnectorTechnicalIds = new Set<string>();
  const prospectiveSpliceTechnicalIds = new Set<string>();
  const prospectiveWireTechnicalIds = new Set<string>();

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

    const normalized = resolveProspectiveOperationReferences(
      normalizeOperationEntityReferences(state, parsed),
      prospectiveConnectorReferences,
      prospectiveSpliceReferences,
      prospectiveNodeReferences
    );
    const prospectiveNormalized =
      normalized.type === "assign_catalog_item"
        ? {
            ...normalized,
            catalogItemId: resolveProspectiveReference(prospectiveCatalogReferences, normalized.catalogItemId)
          }
        : normalized;
    const permission = permissionForOperation(normalized);
    if (prospectiveNormalized.type === "clarification_required") {
      result.rejected.push(
        reject(
          operationIndex,
          prospectiveNormalized.type,
          `Clarification required: ${prospectiveNormalized.question}${
            prospectiveNormalized.reasons.length === 0 ? "" : ` (${prospectiveNormalized.reasons.join("; ")})`
          }`
        )
      );
      return;
    }
    if (!permissions[permission]) {
      result.rejected.push(reject(operationIndex, prospectiveNormalized.type, `${permission} permission is disabled.`));
      return;
    }
    if (
      !entityExists(
        state,
        prospectiveNormalized,
        prospectiveNodeIds,
        prospectiveConnectors,
        prospectiveSplices,
        prospectiveCatalogItems
      )
    ) {
      result.rejected.push(reject(operationIndex, prospectiveNormalized.type, "Operation references unknown modeling entities."));
      return;
    }
    const existingTechnicalIdMessage = existingTechnicalIdConflictMessage(state, prospectiveNormalized);
    if (existingTechnicalIdMessage !== null) {
      result.rejected.push(reject(operationIndex, prospectiveNormalized.type, existingTechnicalIdMessage));
      return;
    }
    const prospectiveTechnicalIdMessage = prospectiveTechnicalIdConflictMessage(
      prospectiveNormalized,
      prospectiveConnectorTechnicalIds,
      prospectiveSpliceTechnicalIds,
      prospectiveWireTechnicalIds
    );
    if (prospectiveTechnicalIdMessage !== null) {
      result.rejected.push(reject(operationIndex, prospectiveNormalized.type, prospectiveTechnicalIdMessage));
      return;
    }
    if (prospectiveNormalized.type === "delete_entity") {
      const impactMessage = deleteImpactMessage(state, prospectiveNormalized);
      if (impactMessage !== null) {
        result.rejected.push(reject(operationIndex, prospectiveNormalized.type, impactMessage));
        return;
      }
    }
    if (prospectiveNormalized.type === "lock_wire_route") {
      const routeMessage = routeLockValidationMessage(state, prospectiveNormalized);
      if (routeMessage !== null) {
        result.rejected.push(reject(operationIndex, prospectiveNormalized.type, routeMessage));
        return;
      }
    }
    const wireSizingMessage = wireSizingValidationMessage(state, prospectiveNormalized);
    if (wireSizingMessage !== null) {
      result.rejected.push(reject(operationIndex, prospectiveNormalized.type, wireSizingMessage));
      return;
    }
    if (prospectiveNormalized.type === "assign_catalog_item" && !prospectiveCatalogItems.has(prospectiveNormalized.catalogItemId) && state.catalogItems.byId[prospectiveNormalized.catalogItemId as CatalogItemId] === undefined) {
      result.rejected.push(reject(operationIndex, prospectiveNormalized.type, "Operation references unknown modeling entities."));
      return;
    }
    if (
      prospectiveNormalized.type === "place_entity_relative_to_entity" &&
      !entityReferenceExists(state, prospectiveNormalized.referenceEntityKind, prospectiveNormalized.referenceEntityId)
    ) {
      result.rejected.push(reject(operationIndex, prospectiveNormalized.type, "Relative placement references an unknown anchor entity."));
      return;
    }
    if (
      (prospectiveNormalized.type === "move_entity" || prospectiveNormalized.type === "place_entity_relative_to_entity") &&
      prospectiveNormalized.position === undefined
    ) {
      result.rejected.push(reject(operationIndex, prospectiveNormalized.type, "Move operation could not resolve a canvas position."));
      return;
    }
    if (
      prospectiveNormalized.type === "batch_move_entities" &&
      prospectiveNormalized.moves.some((move) => move.position === undefined)
    ) {
      result.rejected.push(reject(operationIndex, prospectiveNormalized.type, "Batch move operation could not resolve every canvas position."));
      return;
    }
    const endpointConflictMessage = wireEndpointConflictMessage(state, prospectiveNormalized);
    if (endpointConflictMessage !== null) {
      result.rejected.push(reject(operationIndex, prospectiveNormalized.type, endpointConflictMessage));
      return;
    }
    const prospectiveEndpointConflictMessage = prospectiveWireEndpointConflictMessage(prospectiveNormalized, prospectiveWireEndpointKeys);
    if (prospectiveEndpointConflictMessage !== null) {
      result.rejected.push(reject(operationIndex, prospectiveNormalized.type, prospectiveEndpointConflictMessage));
      return;
    }
    if (scope === "currentSelection" && !isWithinSelectionScope(prospectiveNormalized, selection)) {
      result.rejected.push(reject(operationIndex, prospectiveNormalized.type, "Operation is outside the current selection scope."));
      return;
    }

    const operationNetworkId = isRecord(operation) ? readString(operation.networkId) : null;
    result.accepted.push(
      operationNetworkId === null
        ? prospectiveNormalized
        : {
            ...prospectiveNormalized,
            networkId: operationNetworkId as NetworkId
          }
    );
    if (prospectiveNormalized.type === "create_catalog_item") {
      const catalogItemId = prospectiveNormalized.id ?? (`AI-CAT-${String(prospectiveCatalogItems.size + 1).padStart(3, "0")}` as CatalogItemId);
      prospectiveCatalogItems.add(catalogItemId);
      addProspectiveReferences(prospectiveCatalogReferences, catalogItemId, [
        catalogItemId,
        prospectiveNormalized.manufacturerReference,
        prospectiveNormalized.name ?? ""
      ]);
    }
    if (prospectiveNormalized.type === "add_connector" && prospectiveNormalized.id !== undefined) {
      prospectiveConnectors.set(prospectiveNormalized.id, prospectiveNormalized.cavityCount);
      prospectiveConnectorTechnicalIds.add(normalizeTechnicalId(prospectiveNormalized.technicalId));
      addProspectiveReferences(prospectiveConnectorReferences, prospectiveNormalized.id, [prospectiveNormalized.id, prospectiveNormalized.technicalId, prospectiveNormalized.name]);
      if (prospectiveNormalized.nodeId !== undefined) {
        prospectiveNodeIds.add(prospectiveNormalized.nodeId);
        addProspectiveReferences(prospectiveNodeReferences, prospectiveNormalized.nodeId, [prospectiveNormalized.nodeId, prospectiveNormalized.technicalId, prospectiveNormalized.name]);
      }
    }
    if (prospectiveNormalized.type === "add_splice" && prospectiveNormalized.id !== undefined) {
      prospectiveSplices.set(prospectiveNormalized.id, prospectiveNormalized.portCount);
      prospectiveSpliceTechnicalIds.add(normalizeTechnicalId(prospectiveNormalized.technicalId));
      addProspectiveReferences(prospectiveSpliceReferences, prospectiveNormalized.id, [prospectiveNormalized.id, prospectiveNormalized.technicalId, prospectiveNormalized.name]);
      if (prospectiveNormalized.nodeId !== undefined) {
        prospectiveNodeIds.add(prospectiveNormalized.nodeId);
        addProspectiveReferences(prospectiveNodeReferences, prospectiveNormalized.nodeId, [prospectiveNormalized.nodeId, prospectiveNormalized.technicalId, prospectiveNormalized.name]);
      }
    }
    if (prospectiveNormalized.type === "add_node" && prospectiveNormalized.id !== undefined) {
      prospectiveNodeIds.add(prospectiveNormalized.id);
      addProspectiveReferences(prospectiveNodeReferences, prospectiveNormalized.id, [prospectiveNormalized.id, prospectiveNormalized.label]);
    }
    if (prospectiveNormalized.type === "add_wire") {
      prospectiveWireTechnicalIds.add(normalizeTechnicalId(prospectiveNormalized.technicalId));
      prospectiveWireEndpointKeys.add(wireEndpointKey(prospectiveNormalized.endpointA));
      prospectiveWireEndpointKeys.add(wireEndpointKey(prospectiveNormalized.endpointB));
    }
    if (prospectiveNormalized.type === "update_entity" && typeof prospectiveNormalized.fields.technicalId === "string") {
      if (prospectiveNormalized.entityKind === "connector") {
        prospectiveConnectorTechnicalIds.add(normalizeTechnicalId(prospectiveNormalized.fields.technicalId));
      }
      if (prospectiveNormalized.entityKind === "splice") {
        prospectiveSpliceTechnicalIds.add(normalizeTechnicalId(prospectiveNormalized.fields.technicalId));
      }
      if (prospectiveNormalized.entityKind === "wire") {
        prospectiveWireTechnicalIds.add(normalizeTechnicalId(prospectiveNormalized.fields.technicalId));
      }
    }
    if (prospectiveNormalized.type === "update_entity" && prospectiveNormalized.entityKind === "wire") {
      const endpointA = prospectiveNormalized.fields.endpointA as WireEndpoint | undefined;
      const endpointB = prospectiveNormalized.fields.endpointB as WireEndpoint | undefined;
      if (endpointA !== undefined) {
        prospectiveWireEndpointKeys.add(wireEndpointKey(endpointA));
      }
      if (endpointB !== undefined) {
        prospectiveWireEndpointKeys.add(wireEndpointKey(endpointB));
      }
    }
  });

  return result;
}

export function validateAiAgentOperations(params: ValidateAiAgentOperationsParams): AiAgentOperationValidationResult {
  if (params.scope === "activeNetwork" || params.scope === "currentSelection") {
    return validateAiAgentOperationsForState(params);
  }

  const envelope = parseEnvelope(params.payload);
  if ("status" in envelope) {
    return {
      accepted: [],
      rejected: [envelope],
      unsupported: [],
      warnings: []
    };
  }

  const groupedOperations = new Map<NetworkId, unknown[]>();
  const rejected: AiAgentOperationValidationIssue[] = [];
  envelope.operations.forEach((operation, operationIndex) => {
    const targetNetworkId = resolveOperationNetworkId(params.state, operation, params.scope, params.selectedHarnessAssemblyId);
    if (typeof targetNetworkId === "object") {
      rejected.push({ ...targetNetworkId, operationIndex });
      return;
    }
    groupedOperations.set(targetNetworkId, [...(groupedOperations.get(targetNetworkId) ?? []), withOperationNetworkId(operation, targetNetworkId)]);
  });

  const result: AiAgentOperationValidationResult = {
    accepted: [],
    rejected,
    unsupported: [],
    warnings: []
  };
  for (const [networkId, operations] of groupedOperations) {
    const scopedState = buildNetworkScopedAppState(params.state, networkId);
    if (scopedState === null) {
      result.rejected.push(reject(-1, "network", `Network '${networkId}' is not available.`));
      continue;
    }
    const scopedResult = validateAiAgentOperationsForState({
      ...params,
      state: scopedState,
      payload: {
        schemaVersion: AI_AGENT_OPERATION_SCHEMA_VERSION,
        operations
      }
    });
    result.accepted.push(...scopedResult.accepted);
    result.rejected.push(...scopedResult.rejected);
    result.unsupported.push(...scopedResult.unsupported);
    result.warnings.push(...scopedResult.warnings);
  }
  return result;
}
