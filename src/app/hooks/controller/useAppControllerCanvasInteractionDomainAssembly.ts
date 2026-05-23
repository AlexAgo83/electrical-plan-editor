import type { NodeId } from "../../../core/entities";
import { appActions } from "../../../store";
import type { NodePosition } from "../../types/app-controller";
import type { EntityFormsStateModel } from "../useEntityFormsState";
import type { CanvasStateModel } from "../useCanvasState";
import { useAppControllerCanvasInteractionHandlersAssembly } from "./useAppControllerHeavyHookAssemblers";
import type { useAppControllerModelingHandlersAssembly } from "./useAppControllerModelingHandlersAssembly";

type CanvasInteractionAssemblyParams = Parameters<typeof useAppControllerCanvasInteractionHandlersAssembly>[0];
type ModelingHandlersModel = ReturnType<typeof useAppControllerModelingHandlersAssembly>;

type ScreenId = "home" | "networkScope" | "harnessAssembly" | "modeling" | "analysis" | "validation" | "settings";

interface UseAppControllerCanvasInteractionDomainAssemblyParams {
  core: {
    state: CanvasInteractionAssemblyParams["core"]["state"];
    nodesCount: number;
    interactionMode: CanvasInteractionAssemblyParams["core"]["interactionMode"];
    isModelingScreen: boolean;
    isModelingAnalysisFocused: boolean;
    activeSubScreen: CanvasInteractionAssemblyParams["core"]["activeSubScreen"];
    setActiveScreen: (screen: ScreenId) => void;
    setActiveSubScreen: CanvasInteractionAssemblyParams["core"]["setActiveSubScreen"];
  };
  formsState: EntityFormsStateModel;
  viewport: {
    effectiveNetworkViewWidth: number;
    effectiveNetworkViewHeight: number;
    networkNodePositions: Record<NodeId, NodePosition>;
    snapNodesToGrid: boolean;
    lockEntityMovement: boolean;
    networkOffset: NodePosition;
    networkScale: number;
    networkRenderScale: number;
    setNetworkScale: CanvasInteractionAssemblyParams["viewport"]["setNetworkScale"];
    setNetworkOffset: CanvasInteractionAssemblyParams["viewport"]["setNetworkOffset"];
    draggingNodeId: NodeId | null;
    setDraggingNodeId: CanvasInteractionAssemblyParams["viewport"]["setDraggingNodeId"];
    manualNodePositions: Record<NodeId, NodePosition>;
    setManualNodePositions: CanvasInteractionAssemblyParams["viewport"]["setManualNodePositions"];
    setIsPanningNetwork: CanvasInteractionAssemblyParams["viewport"]["setIsPanningNetwork"];
    panStartRef: CanvasInteractionAssemblyParams["viewport"]["panStartRef"];
  };
  actions: {
    dispatchAction: CanvasInteractionAssemblyParams["actions"]["dispatchAction"];
    resetNetworkViewToConfiguredScale: CanvasInteractionAssemblyParams["actions"]["resetNetworkViewToConfiguredScale"];
    markDetailPanelsSelectionSourceAsExternal: () => void;
  };
  modelingHandlers: Pick<ModelingHandlersModel, "connector" | "splice" | "node" | "segment">;
  setPendingNewNodePosition: CanvasStateModel["setPendingNewNodePosition"];
}

export function useAppControllerCanvasInteractionDomainAssembly({
  core,
  formsState,
  viewport,
  actions,
  modelingHandlers,
  setPendingNewNodePosition
}: UseAppControllerCanvasInteractionDomainAssemblyParams) {
  return useAppControllerCanvasInteractionHandlersAssembly({
    core: {
      state: core.state,
      nodesCount: core.nodesCount,
      interactionMode: core.interactionMode,
      isModelingScreen: core.isModelingScreen,
      isModelingAnalysisFocused: core.isModelingAnalysisFocused,
      activeSubScreen: core.activeSubScreen,
      setActiveScreen: core.setActiveScreen,
      setActiveSubScreen: core.setActiveSubScreen
    },
    nodeForm: {
      setNodeFormMode: formsState.setNodeFormMode,
      setEditingNodeId: formsState.setEditingNodeId,
      setNodeKind: formsState.setNodeKind,
      setNodeIdInput: formsState.setNodeIdInput,
      setNodeConnectorId: formsState.setNodeConnectorId,
      setNodeSpliceId: formsState.setNodeSpliceId,
      setNodeLabel: formsState.setNodeLabel,
      setNodeFormError: formsState.setNodeFormError,
      setPendingNewNodePosition
    },
    viewport: {
      networkViewWidth: viewport.effectiveNetworkViewWidth,
      networkViewHeight: viewport.effectiveNetworkViewHeight,
      networkNodePositions: viewport.networkNodePositions,
      snapNodesToGrid: viewport.snapNodesToGrid,
      lockEntityMovement: viewport.lockEntityMovement,
      networkOffset: viewport.networkOffset,
      networkScale: viewport.networkScale,
      networkRenderScale: viewport.networkRenderScale,
      setNetworkScale: viewport.setNetworkScale,
      setNetworkOffset: viewport.setNetworkOffset,
      draggingNodeId: viewport.draggingNodeId,
      setDraggingNodeId: viewport.setDraggingNodeId,
      manualNodePositions: viewport.manualNodePositions,
      setManualNodePositions: viewport.setManualNodePositions,
      setIsPanningNetwork: viewport.setIsPanningNetwork,
      panStartRef: viewport.panStartRef
    },
    actions: {
      dispatchAction: actions.dispatchAction,
      persistNodePosition: (nodeId, position) =>
        actions.dispatchAction(appActions.setNodePosition(nodeId, position), { trackHistory: false }),
      persistNodePositions: (positions) =>
        actions.dispatchAction(appActions.setNodePositions(positions), { trackHistory: false }),
      resetNetworkViewToConfiguredScale: actions.resetNetworkViewToConfiguredScale,
      startConnectorEdit: modelingHandlers.connector.startConnectorEdit,
      startSpliceEdit: modelingHandlers.splice.startSpliceEdit,
      startNodeEdit: modelingHandlers.node.startNodeEdit,
      startSegmentEdit: modelingHandlers.segment.startSegmentEdit,
      onExternalSelectionInteraction: actions.markDetailPanelsSelectionSourceAsExternal
    }
  });
}

export type AppControllerCanvasInteractionDomainAssemblyModel =
  ReturnType<typeof useAppControllerCanvasInteractionDomainAssembly>;
