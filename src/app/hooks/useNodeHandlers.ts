import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { ConnectorId, NetworkNode, NodeId, SpliceId } from "../../core/entities";
import type { AppStore } from "../../store";
import { appActions } from "../../store";
import type { NodePosition } from "../types/app-controller";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

interface UseNodeHandlersParams {
  store: AppStore;
  state: ReturnType<AppStore["getState"]>;
  dispatchAction: DispatchAction;
  nodeFormMode: "create" | "edit";
  setNodeFormMode: (mode: "create" | "edit") => void;
  editingNodeId: NodeId | null;
  setEditingNodeId: (id: NodeId | null) => void;
  nodeIdInput: string;
  setNodeIdInput: (value: string) => void;
  nodeKind: NetworkNode["kind"];
  setNodeKind: (kind: NetworkNode["kind"]) => void;
  nodeConnectorId: string;
  setNodeConnectorId: (value: string) => void;
  nodeSpliceId: string;
  setNodeSpliceId: (value: string) => void;
  nodeLabel: string;
  setNodeLabel: (value: string) => void;
  setNodeFormError: (value: string | null) => void;
  pendingNewNodePosition: NodePosition | null;
  setPendingNewNodePosition: (position: NodePosition | null) => void;
  setManualNodePositions: Dispatch<SetStateAction<Record<NodeId, NodePosition>>>;
}

export function useNodeHandlers({
  store,
  state,
  dispatchAction,
  nodeFormMode,
  setNodeFormMode,
  editingNodeId,
  setEditingNodeId,
  nodeIdInput,
  setNodeIdInput,
  nodeKind,
  setNodeKind,
  nodeConnectorId,
  setNodeConnectorId,
  nodeSpliceId,
  setNodeSpliceId,
  nodeLabel,
  setNodeLabel,
  setNodeFormError,
  pendingNewNodePosition,
  setPendingNewNodePosition,
  setManualNodePositions
}: UseNodeHandlersParams) {
  function resetNodeForm(): void {
    setNodeFormMode("create");
    setEditingNodeId(null);
    setNodeIdInput("");
    setNodeKind("intermediate");
    setNodeConnectorId("");
    setNodeSpliceId("");
    setNodeLabel("");
    setNodeFormError(null);
    setPendingNewNodePosition(null);
  }

  function startNodeEdit(node: NetworkNode): void {
    setNodeFormMode("edit");
    setEditingNodeId(node.id);
    setNodeIdInput(node.id);
    setNodeKind(node.kind);
    setNodeLabel(node.kind === "intermediate" ? node.label : "");
    setNodeConnectorId(node.kind === "connector" ? node.connectorId : "");
    setNodeSpliceId(node.kind === "splice" ? node.spliceId : "");
    dispatchAction(appActions.select({ kind: "node", id: node.id }));
  }

  function handleNodeSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const normalizedNodeId = nodeIdInput.trim();
    const nodeId = (nodeFormMode === "edit" && editingNodeId !== null ? editingNodeId : normalizedNodeId) as NodeId;

    if (nodeFormMode === "create") {
      if (normalizedNodeId.length === 0) {
        setNodeFormError("Node ID is required.");
        return;
      }

      if (state.nodes.byId[nodeId] !== undefined) {
        setNodeFormError(`Node ID '${normalizedNodeId}' already exists.`);
        return;
      }
    }

    if (nodeKind === "intermediate") {
      const trimmedLabel = nodeLabel.trim();
      if (trimmedLabel.length === 0) {
        setNodeFormError("Intermediate node label is required.");
        return;
      }

      setNodeFormError(null);
      dispatchAction(appActions.upsertNode({ id: nodeId, kind: "intermediate", label: trimmedLabel }));
    }

    if (nodeKind === "connector") {
      if (nodeConnectorId.length === 0) {
        setNodeFormError("Select a connector to create a connector node.");
        return;
      }

      setNodeFormError(null);
      dispatchAction(
        appActions.upsertNode({
          id: nodeId,
          kind: "connector",
          connectorId: nodeConnectorId as ConnectorId
        })
      );
    }

    if (nodeKind === "splice") {
      if (nodeSpliceId.length === 0) {
        setNodeFormError("Select a splice to create a splice node.");
        return;
      }

      setNodeFormError(null);
      dispatchAction(
        appActions.upsertNode({
          id: nodeId,
          kind: "splice",
          spliceId: nodeSpliceId as SpliceId
        })
      );
    }

    const nextState = store.getState();
    if (nextState.nodes.byId[nodeId] !== undefined) {
      if (pendingNewNodePosition !== null) {
        setManualNodePositions((previous) => ({
          ...previous,
          [nodeId]: pendingNewNodePosition
        }));
      }
      dispatchAction(appActions.select({ kind: "node", id: nodeId }));
      resetNodeForm();
    }
  }

  function handleNodeDelete(nodeId: NodeId): void {
    dispatchAction(appActions.removeNode(nodeId));

    if (editingNodeId === nodeId) {
      resetNodeForm();
    }
  }

  return {
    resetNodeForm,
    startNodeEdit,
    handleNodeSubmit,
    handleNodeDelete
  };
}
