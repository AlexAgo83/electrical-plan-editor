import type { CatalogItemId, ConnectorId, NetworkId, NodeId, SegmentId, SpliceId, WireEndpoint, WireId } from "../../core/entities";
import { appActions, appReducer, type AppState } from "../../store";
import { assignScopedState, extractScopedState } from "../../store/networking";
import type { AiAgentOperationValidationResult, AiAgentSupportedOperation } from "./aiAgentOperationContract";

export interface AiAgentApplyResult {
  nextState: AppState;
  appliedCount: number;
  skippedCount: number;
}

export interface AiAgentImpactPreview {
  acceptedCount: number;
  rejectedCount: number;
  unsupportedCount: number;
  warningsCount: number;
  addCount: number;
  updateCount: number;
  moveCount: number;
  routeCount: number;
  deleteCount: number;
  byOperationType: Record<string, number>;
}

export interface AiAgentSessionSnapshot {
  id: string;
  createdAtIso: string;
  label?: string;
  state: AppState;
  impactPreview: AiAgentImpactPreview;
}

function classifyImpactOperation(operation: AiAgentSupportedOperation): keyof Pick<
  AiAgentImpactPreview,
  "addCount" | "updateCount" | "moveCount" | "routeCount" | "deleteCount"
> {
  if (
    operation.type === "add_connector" ||
    operation.type === "add_splice" ||
    operation.type === "add_node" ||
    operation.type === "add_segment" ||
    operation.type === "add_wire" ||
    operation.type === "create_catalog_item"
  ) {
    return "addCount";
  }
  if (operation.type === "move_entity" || operation.type === "place_entity_relative_to_entity" || operation.type === "batch_move_entities") {
    return "moveCount";
  }
  if (operation.type === "regenerate_route" || operation.type === "lock_wire_route") {
    return "routeCount";
  }
  if (operation.type === "delete_entity") {
    return "deleteCount";
  }
  return "updateCount";
}

export function buildAiAgentImpactPreview(validation: AiAgentOperationValidationResult): AiAgentImpactPreview {
  const preview: AiAgentImpactPreview = {
    acceptedCount: validation.accepted.length,
    rejectedCount: validation.rejected.length,
    unsupportedCount: validation.unsupported.length,
    warningsCount: validation.warnings.length,
    addCount: 0,
    updateCount: 0,
    moveCount: 0,
    routeCount: 0,
    deleteCount: 0,
    byOperationType: {}
  };

  for (const operation of validation.accepted) {
    preview[classifyImpactOperation(operation)] += 1;
    preview.byOperationType[operation.type] = (preview.byOperationType[operation.type] ?? 0) + 1;
  }

  return preview;
}

export function createAiAgentSessionSnapshot(
  state: AppState,
  validation: AiAgentOperationValidationResult,
  label?: string,
  now: Date = new Date()
): AiAgentSessionSnapshot {
  return {
    id: `ai-session-${now.toISOString()}`,
    createdAtIso: now.toISOString(),
    ...(label === undefined || label.trim().length === 0 ? {} : { label: label.trim() }),
    state: structuredClone(state),
    impactPreview: buildAiAgentImpactPreview(validation)
  };
}

export function rollbackAiAgentSession(snapshot: AiAgentSessionSnapshot): AppState {
  return structuredClone(snapshot.state);
}

function buildNextAiNodeId(state: AppState): NodeId {
  let index = 1;
  while (state.nodes.byId[`AI-NODE-${String(index).padStart(3, "0")}` as NodeId] !== undefined) {
    index += 1;
  }
  return `AI-NODE-${String(index).padStart(3, "0")}` as NodeId;
}

function buildNextAiConnectorId(state: AppState): ConnectorId {
  let index = 1;
  while (state.connectors.byId[`AI-CONN-${String(index).padStart(3, "0")}` as ConnectorId] !== undefined) {
    index += 1;
  }
  return `AI-CONN-${String(index).padStart(3, "0")}` as ConnectorId;
}

function buildNextAiSpliceId(state: AppState): SpliceId {
  let index = 1;
  while (state.splices.byId[`AI-SPLICE-${String(index).padStart(3, "0")}` as SpliceId] !== undefined) {
    index += 1;
  }
  return `AI-SPLICE-${String(index).padStart(3, "0")}` as SpliceId;
}

function buildNextAiWireId(state: AppState): WireId {
  let index = 1;
  while (state.wires.byId[`AI-WIRE-${String(index).padStart(3, "0")}` as WireId] !== undefined) {
    index += 1;
  }
  return `AI-WIRE-${String(index).padStart(3, "0")}` as WireId;
}

function buildNextAiSegmentId(state: AppState): SegmentId {
  let index = 1;
  while (state.segments.byId[`AI-SEG-${String(index).padStart(3, "0")}` as SegmentId] !== undefined) {
    index += 1;
  }
  return `AI-SEG-${String(index).padStart(3, "0")}` as SegmentId;
}

function buildNextAiCatalogItemId(state: AppState): CatalogItemId {
  let index = 1;
  while (state.catalogItems.byId[`AI-CAT-${String(index).padStart(3, "0")}` as CatalogItemId] !== undefined) {
    index += 1;
  }
  return `AI-CAT-${String(index).padStart(3, "0")}` as CatalogItemId;
}

function isWireEndpoint(value: unknown): value is WireEndpoint {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const endpoint = value as Partial<WireEndpoint>;
  if (endpoint.kind === "connectorCavity") {
    return typeof endpoint.connectorId === "string" && typeof endpoint.cavityIndex === "number";
  }
  if (endpoint.kind === "splicePort") {
    return typeof endpoint.spliceId === "string" && typeof endpoint.portIndex === "number";
  }
  return false;
}

function getNodeIdForMovableEntity(
  state: AppState,
  entityKind: "connector" | "splice" | "node",
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

function applyAcceptedOperation(state: AppState, operation: AiAgentSupportedOperation): AppState {
  if (operation.type === "create_catalog_item") {
    const catalogItemId =
      operation.id !== undefined && state.catalogItems.byId[operation.id] === undefined ? operation.id : buildNextAiCatalogItemId(state);
    return appReducer(
      state,
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: operation.manufacturerReference,
        connectionCount: operation.connectionCount,
        name: operation.name,
        unitPriceExclTax: operation.unitPriceExclTax,
        url: operation.url
      })
    );
  }
  if (operation.type === "add_connector") {
    const connectorId =
      operation.id !== undefined && state.connectors.byId[operation.id] === undefined ? operation.id : buildNextAiConnectorId(state);
    const nodeId =
      operation.nodeId !== undefined && state.nodes.byId[operation.nodeId] === undefined ? operation.nodeId : buildNextAiNodeId(state);
    const withConnector = appReducer(
      state,
      appActions.upsertConnector({
        id: connectorId,
        name: operation.name,
        technicalId: operation.technicalId,
        cavityCount: operation.cavityCount
      })
    );
    const withNode = appReducer(
      withConnector,
      appActions.upsertNode({
        id: nodeId,
        kind: "connector",
        connectorId
      })
    );
    return appReducer(withNode, appActions.setNodePosition(nodeId, operation.position));
  }
  if (operation.type === "add_splice") {
    const spliceId = operation.id !== undefined && state.splices.byId[operation.id] === undefined ? operation.id : buildNextAiSpliceId(state);
    const nodeId =
      operation.nodeId !== undefined && state.nodes.byId[operation.nodeId] === undefined ? operation.nodeId : buildNextAiNodeId(state);
    const withSplice = appReducer(
      state,
      appActions.upsertSplice({
        id: spliceId,
        name: operation.name,
        technicalId: operation.technicalId,
        portCount: operation.portCount
      })
    );
    const withNode = appReducer(
      withSplice,
      appActions.upsertNode({
        id: nodeId,
        kind: "splice",
        spliceId
      })
    );
    return appReducer(withNode, appActions.setNodePosition(nodeId, operation.position));
  }
  if (operation.type === "add_node") {
    const nodeId = operation.id !== undefined && state.nodes.byId[operation.id] === undefined ? operation.id : buildNextAiNodeId(state);
    const withNode = appReducer(
      state,
      appActions.upsertNode({
        id: nodeId,
        kind: "intermediate",
        label: operation.label
      })
    );
    return appReducer(withNode, appActions.setNodePosition(nodeId, operation.position));
  }
  if (operation.type === "add_wire") {
    return appReducer(
      state,
      appActions.saveWire({
        id: buildNextAiWireId(state),
        name: operation.name,
        technicalId: operation.technicalId,
        endpointA: operation.endpointA,
        endpointB: operation.endpointB,
        sectionMm2: operation.sectionMm2
      })
    );
  }
  if (operation.type === "add_segment") {
    return appReducer(
      state,
      appActions.upsertSegment({
        id: buildNextAiSegmentId(state),
        nodeA: operation.nodeA,
        nodeB: operation.nodeB,
        lengthMm: operation.lengthMm
      })
    );
  }
  if (operation.type === "move_entity") {
    if (operation.position === undefined) {
      return state;
    }
    const nodeId = getNodeIdForMovableEntity(state, operation.entityKind, operation.entityId);
    return nodeId === undefined ? state : appReducer(state, appActions.setNodePosition(nodeId, operation.position));
  }
  if (operation.type === "batch_move_entities") {
    const positions: Partial<Record<NodeId, { x: number; y: number }>> = {};
    for (const move of operation.moves) {
      if (move.position === undefined) {
        continue;
      }
      const nodeId = getNodeIdForMovableEntity(state, move.entityKind, move.entityId);
      if (nodeId !== undefined) {
        positions[nodeId] = move.position;
      }
    }
    return Object.keys(positions).length === 0
      ? state
      : appReducer(state, appActions.setNodePositions(positions as Record<NodeId, { x: number; y: number }>));
  }
  if (operation.type === "place_entity_relative_to_entity") {
    if (operation.position === undefined) {
      return state;
    }
    const nodeId = getNodeIdForMovableEntity(state, operation.entityKind, operation.entityId);
    return nodeId === undefined ? state : appReducer(state, appActions.setNodePosition(nodeId, operation.position));
  }
  if (operation.type === "update_entity") {
    if (operation.entityKind === "catalog") {
      const catalogItem = state.catalogItems.byId[operation.entityId as CatalogItemId];
      return catalogItem === undefined
        ? state
        : appReducer(
            state,
            appActions.upsertCatalogItem({
              ...catalogItem,
              manufacturerReference:
                typeof operation.fields.manufacturerReference === "string"
                  ? operation.fields.manufacturerReference
                  : catalogItem.manufacturerReference,
              connectionCount:
                typeof operation.fields.connectionCount === "number" ? operation.fields.connectionCount : catalogItem.connectionCount,
              name: typeof operation.fields.name === "string" ? operation.fields.name : catalogItem.name,
              unitPriceExclTax:
                typeof operation.fields.unitPriceExclTax === "number" ? operation.fields.unitPriceExclTax : catalogItem.unitPriceExclTax,
              url:
                typeof operation.fields.url === "string" || operation.fields.url === undefined ? operation.fields.url : catalogItem.url,
              additionalAccessories: Array.isArray(operation.fields.additionalAccessories)
                ? (operation.fields.additionalAccessories as typeof catalogItem.additionalAccessories)
                : catalogItem.additionalAccessories,
              connectorDefaults:
                typeof operation.fields.connectorDefaults === "object" && operation.fields.connectorDefaults !== null
                  ? (operation.fields.connectorDefaults)
                  : catalogItem.connectorDefaults,
              connectorLayout:
                typeof operation.fields.connectorLayout === "object" && operation.fields.connectorLayout !== null
                  ? (operation.fields.connectorLayout as typeof catalogItem.connectorLayout)
                  : catalogItem.connectorLayout
            })
          );
    }
    if (operation.entityKind === "connector") {
      const connector = state.connectors.byId[operation.entityId as ConnectorId];
      return connector === undefined
        ? state
        : appReducer(
            state,
            appActions.upsertConnector({
              ...connector,
              name: typeof operation.fields.name === "string" ? operation.fields.name : connector.name,
              technicalId:
                typeof operation.fields.technicalId === "string" ? operation.fields.technicalId : connector.technicalId,
              cavityCount: typeof operation.fields.cavityCount === "number" ? operation.fields.cavityCount : connector.cavityCount,
              manufacturerReference:
                typeof operation.fields.manufacturerReference === "string" || operation.fields.manufacturerReference === undefined
                  ? operation.fields.manufacturerReference
                  : connector.manufacturerReference,
              catalogItemId:
                typeof operation.fields.catalogItemId === "string" || operation.fields.catalogItemId === undefined
                  ? (operation.fields.catalogItemId as CatalogItemId | undefined)
                  : connector.catalogItemId,
              applyCatalogPlugs:
                typeof operation.fields.applyCatalogPlugs === "boolean" ? operation.fields.applyCatalogPlugs : connector.applyCatalogPlugs,
              applyCatalogSeals:
                typeof operation.fields.applyCatalogSeals === "boolean" ? operation.fields.applyCatalogSeals : connector.applyCatalogSeals,
              terminalOverrides:
                typeof operation.fields.terminalOverrides === "object" && operation.fields.terminalOverrides !== null
                  ? (operation.fields.terminalOverrides as typeof connector.terminalOverrides)
                  : connector.terminalOverrides
            })
          );
    }
    if (operation.entityKind === "splice") {
      const splice = state.splices.byId[operation.entityId as SpliceId];
      return splice === undefined
        ? state
        : appReducer(
            state,
            appActions.upsertSplice({
              ...splice,
              name: typeof operation.fields.name === "string" ? operation.fields.name : splice.name,
              technicalId: typeof operation.fields.technicalId === "string" ? operation.fields.technicalId : splice.technicalId,
              portCount: typeof operation.fields.portCount === "number" ? operation.fields.portCount : splice.portCount,
              manufacturerReference:
                typeof operation.fields.manufacturerReference === "string" || operation.fields.manufacturerReference === undefined
                  ? operation.fields.manufacturerReference
                  : splice.manufacturerReference,
              catalogItemId:
                typeof operation.fields.catalogItemId === "string" || operation.fields.catalogItemId === undefined
                  ? (operation.fields.catalogItemId as CatalogItemId | undefined)
                  : splice.catalogItemId
            })
          );
    }
    if (operation.entityKind === "node") {
      const node = state.nodes.byId[operation.entityId as NodeId];
      return node?.kind !== "intermediate" || typeof operation.fields.label !== "string"
        ? state
        : appReducer(
            state,
            appActions.upsertNode({
              ...node,
              label: operation.fields.label
            })
          );
    }
    if (operation.entityKind === "segment") {
      const segment = state.segments.byId[operation.entityId as SegmentId];
      return segment === undefined
        ? state
        : appReducer(
            state,
            appActions.upsertSegment({
              ...segment,
              lengthMm: typeof operation.fields.lengthMm === "number" ? operation.fields.lengthMm : segment.lengthMm,
              subNetworkTag:
                typeof operation.fields.subNetworkTag === "string" || operation.fields.subNetworkTag === undefined
                  ? operation.fields.subNetworkTag
                  : segment.subNetworkTag
            })
          );
    }
    const wire = state.wires.byId[operation.entityId as WireId];
    return wire === undefined
      ? state
      : appReducer(
          state,
          appActions.saveWire({
            id: wire.id,
            name: typeof operation.fields.name === "string" ? operation.fields.name : wire.name,
            technicalId: typeof operation.fields.technicalId === "string" ? operation.fields.technicalId : wire.technicalId,
            twistGroupLabel:
              typeof operation.fields.twistGroupLabel === "string" || operation.fields.twistGroupLabel === undefined
                ? operation.fields.twistGroupLabel
                : wire.twistGroupLabel,
            functionalDomainTag:
              typeof operation.fields.functionalDomainTag === "string" || operation.fields.functionalDomainTag === undefined
                ? operation.fields.functionalDomainTag
                : wire.functionalDomainTag,
            sectionMm2: typeof operation.fields.sectionMm2 === "number" ? operation.fields.sectionMm2 : wire.sectionMm2,
            currentA:
              typeof operation.fields.currentA === "number" || operation.fields.currentA === undefined
                ? operation.fields.currentA
                : wire.currentA,
            material:
              operation.fields.material === "copper" || operation.fields.material === "aluminum"
                ? operation.fields.material
                : wire.material,
            colorMode:
              operation.fields.colorMode === "none" || operation.fields.colorMode === "catalog" || operation.fields.colorMode === "free"
                ? operation.fields.colorMode
                : wire.colorMode,
            primaryColorId:
              typeof operation.fields.primaryColorId === "string" || operation.fields.primaryColorId === null
                ? operation.fields.primaryColorId
                : wire.primaryColorId,
            secondaryColorId:
              typeof operation.fields.secondaryColorId === "string" || operation.fields.secondaryColorId === null
                ? operation.fields.secondaryColorId
                : wire.secondaryColorId,
            freeColorLabel:
              typeof operation.fields.freeColorLabel === "string" || operation.fields.freeColorLabel === null
                ? operation.fields.freeColorLabel
                : wire.freeColorLabel,
            endpointA: isWireEndpoint(operation.fields.endpointA) ? operation.fields.endpointA : wire.endpointA,
            endpointB: isWireEndpoint(operation.fields.endpointB) ? operation.fields.endpointB : wire.endpointB,
            endpointAConnectionReference: wire.endpointAConnectionReference,
            endpointAConnectionName: wire.endpointAConnectionName,
            endpointASealReference: wire.endpointASealReference,
            endpointASealName: wire.endpointASealName,
            endpointBConnectionReference: wire.endpointBConnectionReference,
            endpointBConnectionName: wire.endpointBConnectionName,
            endpointBSealReference: wire.endpointBSealReference,
            endpointBSealName: wire.endpointBSealName,
            protection: wire.protection
          })
        );
  }
  if (operation.type === "delete_entity") {
    if (operation.entityKind === "catalog") {
      return appReducer(state, appActions.removeCatalogItem(operation.entityId as CatalogItemId));
    }
    if (operation.entityKind === "connector") {
      return appReducer(
        state,
        operation.mode === "cascade"
          ? appActions.removeConnectorCascade(operation.entityId as ConnectorId)
          : appActions.removeConnector(operation.entityId as ConnectorId)
      );
    }
    if (operation.entityKind === "splice") {
      return appReducer(
        state,
        operation.mode === "cascade"
          ? appActions.removeSpliceCascade(operation.entityId as SpliceId)
          : appActions.removeSplice(operation.entityId as SpliceId)
      );
    }
    if (operation.entityKind === "node") {
      return appReducer(state, appActions.removeNode(operation.entityId as NodeId));
    }
    if (operation.entityKind === "segment") {
      return appReducer(state, appActions.removeSegment(operation.entityId as SegmentId));
    }
    return appReducer(state, appActions.removeWire(operation.entityId as WireId));
  }
  if (operation.type === "regenerate_route") {
    return operation.wireIds.reduce((nextState, wireId) => appReducer(nextState, appActions.resetWireRoute(wireId)), state);
  }
  if (operation.type === "lock_wire_route") {
    return appReducer(state, appActions.lockWireRoute(operation.wireId, operation.segmentIds));
  }
  if (operation.type === "assign_catalog_item") {
    const catalogItemId = operation.catalogItemId as CatalogItemId;
    if (operation.entityKind === "connector") {
      const connector = state.connectors.byId[operation.entityId as ConnectorId];
      return connector === undefined ? state : appReducer(state, appActions.upsertConnector({ ...connector, catalogItemId }));
    }
    if (operation.entityKind === "splice") {
      const splice = state.splices.byId[operation.entityId as SpliceId];
      return splice === undefined ? state : appReducer(state, appActions.upsertSplice({ ...splice, catalogItemId }));
    }
    const wire = state.wires.byId[operation.entityId as WireId];
    return wire === undefined
      ? state
      : appReducer(
          state,
          appActions.saveWire({
            ...wire,
            protection: { kind: "fuse", catalogItemId }
          })
        );
  }
  if (operation.type === "update_catalog_connector_layout") {
    const catalogItem = state.catalogItems.byId[operation.catalogItemId as CatalogItemId];
    return catalogItem === undefined
      ? state
      : appReducer(
          state,
          appActions.upsertCatalogItem({
            ...catalogItem,
            connectorLayout: operation.connectorLayout
          })
        );
  }
  if (operation.type === "set_connector_terminal_material") {
    const connector = state.connectors.byId[operation.connectorId as ConnectorId];
    return connector === undefined
      ? state
      : appReducer(
          state,
          appActions.upsertConnector({
            ...connector,
            terminalOverrides: {
              ...(connector.terminalOverrides ?? {}),
              [operation.cavityIndex]: operation.material
            }
          })
        );
  }
  return state;
}

export function applyAiAgentAcceptedOperations(
  state: AppState,
  validation: AiAgentOperationValidationResult
): AiAgentApplyResult {
  if (validation.accepted.some((operation) => operation.networkId !== undefined)) {
    let nextState = state;
    let appliedCount = 0;
    const operationsByNetworkId = new Map<NetworkId, AiAgentSupportedOperation[]>();
    const activeNetworkOperations: AiAgentSupportedOperation[] = [];
    for (const operation of validation.accepted) {
      if (operation.networkId === undefined) {
        activeNetworkOperations.push(operation);
        continue;
      }
      operationsByNetworkId.set(operation.networkId, [...(operationsByNetworkId.get(operation.networkId) ?? []), operation]);
    }

    for (const operation of activeNetworkOperations) {
      const operationNextState = applyAcceptedOperation(nextState, operation);
      if (operationNextState !== nextState) {
        nextState = operationNextState;
        appliedCount += 1;
      }
    }

    for (const [networkId, operations] of operationsByNetworkId) {
      const scoped = nextState.networkStates[networkId];
      if (scoped === undefined) {
        continue;
      }
      let scopedWorkingState = assignScopedState({ ...nextState, activeNetworkId: networkId }, scoped);
      let scopedAppliedCount = 0;
      for (const operation of operations) {
        const operationNextState = applyAcceptedOperation(scopedWorkingState, operation);
        if (operationNextState !== scopedWorkingState) {
          scopedWorkingState = operationNextState;
          scopedAppliedCount += 1;
        }
      }
      if (scopedAppliedCount === 0) {
        continue;
      }
      const updatedScoped = scopedWorkingState.networkStates[networkId] ?? extractScopedState(scopedWorkingState);
      nextState =
        state.activeNetworkId === networkId
          ? assignScopedState(
              {
                ...scopedWorkingState,
                networkStates: {
                  ...scopedWorkingState.networkStates,
                  [networkId]: updatedScoped
                }
              },
              updatedScoped
            )
          : {
              ...nextState,
              networkStates: {
                ...nextState.networkStates,
                [networkId]: updatedScoped
              }
            };
      appliedCount += scopedAppliedCount;
    }

    return {
      nextState,
      appliedCount,
      skippedCount: validation.accepted.length - appliedCount
    };
  }

  let nextState = state;
  let appliedCount = 0;

  for (const operation of validation.accepted) {
    const operationNextState = applyAcceptedOperation(nextState, operation);
    if (operationNextState !== nextState) {
      nextState = operationNextState;
      appliedCount += 1;
    }
  }

  return {
    nextState,
    appliedCount,
    skippedCount: validation.accepted.length - appliedCount
  };
}
