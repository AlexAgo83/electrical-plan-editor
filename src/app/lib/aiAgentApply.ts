import type { NodeId } from "../../core/entities";
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
