import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { Connector, NetworkNode, NodeId, Segment, Splice } from "../../core/entities";
import type { AppStore } from "../../store";
import type { InteractionMode, NodePosition, SubScreenId } from "./app-controller";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

export interface UseCanvasInteractionHandlersParams {
  state: ReturnType<AppStore["getState"]>;
  nodes: NetworkNode[];
  nodesCount: number;
  interactionMode: InteractionMode;
  isModelingScreen: boolean;
  isModelingAnalysisFocused: boolean;
  activeSubScreen: SubScreenId;
  setActiveScreen: (screen: "home" | "networkScope" | "harnessAssembly" | "modeling" | "analysis" | "statistics" | "validation" | "settings") => void;
  setActiveSubScreen: (screen: SubScreenId) => void;
  setNodeFormMode: (mode: "create" | "edit") => void;
  setEditingNodeId: (id: NodeId | null) => void;
  setNodeKind: (kind: NetworkNode["kind"]) => void;
  setNodeIdInput: (value: string) => void;
  setNodeConnectorId: (value: string) => void;
  setNodeSpliceId: (value: string) => void;
  setNodeLabel: (value: string) => void;
  setNodeFormError: (value: string | null) => void;
  setPendingNewNodePosition: (value: NodePosition | null) => void;
  networkViewWidth: number;
  networkViewHeight: number;
  networkNodePositions: Record<NodeId, NodePosition>;
  snapNodesToGrid: boolean;
  lockEntityMovement: boolean;
  networkOffset: NodePosition;
  networkScale: number;
  networkRenderScale: number;
  setNetworkScale: Dispatch<SetStateAction<number>>;
  setNetworkOffset: Dispatch<SetStateAction<NodePosition>>;
  draggingNodeId: NodeId | null;
  setDraggingNodeId: (value: NodeId | null) => void;
  manualNodePositions: Record<NodeId, NodePosition>;
  setManualNodePositions: Dispatch<SetStateAction<Record<NodeId, NodePosition>>>;
  setIsPanningNetwork: (value: boolean) => void;
  panStartRef: MutableRefObject<
    | {
        clientX: number;
        clientY: number;
        offsetX: number;
        offsetY: number;
      }
    | null
  >;
  dispatchAction: DispatchAction;
  persistNodePositions: (positions: Record<NodeId, NodePosition>) => void;
  resetNetworkViewToConfiguredScale: () => void;
  startConnectorEdit: (connector: Connector) => void;
  startSpliceEdit: (splice: Splice) => void;
  startNodeEdit: (node: NetworkNode) => void;
  startSegmentEdit: (segment: Segment) => void;
  onExternalSelectionInteraction?: () => void;
}

export interface DraggingNodeGroupState {
  anchorNodeId: NodeId;
  anchorStartPosition: NodePosition;
  nodeIds: NodeId[];
  originPositions: Record<NodeId, NodePosition>;
  layoutFreezePositions: Record<NodeId, NodePosition> | null;
  startClientX: number;
  startClientY: number;
  hasStartedDrag: boolean;
}
