import type { ConnectorId, NodeId, SegmentId, SpliceId, WireId } from "../../core/entities";
import { appActions, appReducer, type AppState } from "../../store";
import type { AiAgentOperationValidationResult, AiAgentSupportedOperation } from "./aiAgentOperationContract";

export interface AiAgentApplyResult {
  nextState: AppState;
  appliedCount: number;
  skippedCount: number;
}

function buildNextAiNodeId(state: AppState): NodeId {
  let index = 1;
  while (state.nodes.byId[`AI-NODE-${String(index).padStart(3, "0")}` as NodeId] !== undefined) {
    index += 1;
  }
  return `AI-NODE-${String(index).padStart(3, "0")}` as NodeId;
}

function applyAcceptedOperation(state: AppState, operation: AiAgentSupportedOperation): AppState {
  if (operation.type === "add_node") {
    const nodeId = buildNextAiNodeId(state);
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
  if (operation.type === "move_entity") {
    if (operation.position === undefined) {
      return state;
    }
    const nodeId =
      operation.entityKind === "node"
        ? (operation.entityId as NodeId)
        : state.nodes.allIds.find((candidateNodeId) => {
            const node = state.nodes.byId[candidateNodeId];
            if (operation.entityKind === "connector") {
              return node?.kind === "connector" && node.connectorId === operation.entityId;
            }
            return node?.kind === "splice" && node.spliceId === operation.entityId;
          });
    return nodeId === undefined ? state : appReducer(state, appActions.setNodePosition(nodeId, operation.position));
  }
  if (operation.type === "place_entity_relative_to_entity") {
    if (operation.position === undefined) {
      return state;
    }
    const nodeId =
      operation.entityKind === "node"
        ? (operation.entityId as NodeId)
        : state.nodes.allIds.find((candidateNodeId) => {
            const node = state.nodes.byId[candidateNodeId];
            if (operation.entityKind === "connector") {
              return node?.kind === "connector" && node.connectorId === operation.entityId;
            }
            return node?.kind === "splice" && node.spliceId === operation.entityId;
          });
    return nodeId === undefined ? state : appReducer(state, appActions.setNodePosition(nodeId, operation.position));
  }
  if (operation.type === "update_entity") {
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
                typeof operation.fields.technicalId === "string" ? operation.fields.technicalId : connector.technicalId
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
              technicalId: typeof operation.fields.technicalId === "string" ? operation.fields.technicalId : splice.technicalId
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
          appActions.upsertWire({
            ...wire,
            name: typeof operation.fields.name === "string" ? operation.fields.name : wire.name,
            technicalId: typeof operation.fields.technicalId === "string" ? operation.fields.technicalId : wire.technicalId
          })
        );
  }
  return state;
}

export function applyAiAgentAcceptedOperations(
  state: AppState,
  validation: AiAgentOperationValidationResult
): AiAgentApplyResult {
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
