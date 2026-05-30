import type { AppState } from "../../store/types";
import type { NodeId, WireId } from "../../core/entities";
import {
  validateAiAgentOperations,
  type AiAgentOperationPermissions,
  type AiAgentOperationValidationResult,
  type AiAgentScope
} from "./aiAgentOperationContract";

export interface AiAgentProposalDraft {
  summary: string;
  validation: AiAgentOperationValidationResult;
}

interface PrepareAiAgentProposalDraftParams {
  state: AppState;
  scope: AiAgentScope;
  instruction: string;
  permissions: AiAgentOperationPermissions;
}

function buildFirstAcceptedOperation(state: AppState, scope: AiAgentScope, permissions: AiAgentOperationPermissions): unknown {
  const selection = state.ui.selected;
  if (
    scope === "currentSelection" &&
    selection !== null &&
    permissions.move &&
    (selection.kind === "connector" || selection.kind === "splice" || selection.kind === "node")
  ) {
    return {
      type: "move_entity",
      entityKind: selection.kind,
      entityId: selection.id,
      position: { x: 40, y: 40 }
    };
  }
  if (permissions.add) {
    return {
      type: "add_node",
      label: "AI proposed routing node",
      position: { x: 80, y: 80 }
    };
  }
  if (permissions.route && state.wires.allIds.length > 0) {
    return {
      type: "regenerate_route",
      wireIds: [state.wires.allIds[0] as WireId]
    };
  }
  if (permissions.move && state.nodes.allIds.length > 0) {
    return {
      type: "move_entity",
      entityKind: "node",
      entityId: state.nodes.allIds[0] as NodeId,
      position: { x: 40, y: 40 }
    };
  }
  return {
    type: "delete_entity",
    entityKind: "wire",
    entityId: state.wires.allIds[0] ?? "unknown"
  };
}

export function prepareAiAgentProposalDraft({
  state,
  scope,
  instruction,
  permissions
}: PrepareAiAgentProposalDraftParams): AiAgentProposalDraft {
  const payload = {
    schemaVersion: 1,
    operations: [
      buildFirstAcceptedOperation(state, scope, permissions),
      {
        type: "assign_endpoint",
        note: "Preview unsupported operation separation."
      }
    ]
  };
  const validation = validateAiAgentOperations({
    state,
    payload,
    scope,
    selection: state.ui.selected,
    permissions
  });
  return {
    summary: `Local draft generated from ${instruction.trim().length} instruction characters.`,
    validation
  };
}
