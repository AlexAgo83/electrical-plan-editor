import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { NetworkNode, NodeId, WireId } from "../../../core/entities";
import type {
  CanvasCalloutTextSize,
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  InteractionMode,
  NodePosition
} from "../../types/app-controller";

interface UseAppControllerCanvasStateSyncEffectsParams {
  activeNetworkId: string | null;
  nodes: NetworkNode[];
  setManualNodePositions: Dispatch<SetStateAction<Record<NodeId, NodePosition>>>;
  interactionMode: InteractionMode;
  setPendingNewNodePosition: (value: NodePosition | null) => void;
  setWireForcedRouteInput: (value: string) => void;
  selectedWireId: WireId | null;
  selectedWireRouteInputValue: string;
  canvasDefaultLabelSizeMode: CanvasLabelSizeMode;
  setNetworkLabelSizeMode: (value: CanvasLabelSizeMode) => void;
  canvasDefaultCalloutTextSize: CanvasCalloutTextSize;
  setNetworkCalloutTextSize: (value: CanvasCalloutTextSize) => void;
  canvasDefaultLabelRotationDegrees: CanvasLabelRotationDegrees;
  setNetworkLabelRotationDegrees: (value: CanvasLabelRotationDegrees) => void;
  canvasDefaultAutoSegmentLabelRotation: boolean;
  setNetworkAutoSegmentLabelRotation: (value: boolean) => void;
}

export function useAppControllerCanvasStateSyncEffects({
  activeNetworkId,
  nodes,
  setManualNodePositions,
  interactionMode,
  setPendingNewNodePosition,
  setWireForcedRouteInput,
  selectedWireId,
  selectedWireRouteInputValue,
  canvasDefaultLabelSizeMode,
  setNetworkLabelSizeMode,
  canvasDefaultCalloutTextSize,
  setNetworkCalloutTextSize,
  canvasDefaultLabelRotationDegrees,
  setNetworkLabelRotationDegrees,
  canvasDefaultAutoSegmentLabelRotation,
  setNetworkAutoSegmentLabelRotation
}: UseAppControllerCanvasStateSyncEffectsParams) {
  useEffect(() => {
    setManualNodePositions({} as Record<NodeId, NodePosition>);
  }, [activeNetworkId, setManualNodePositions]);

  useEffect(() => {
    const validNodeIds = new Set(nodes.map((node) => node.id));
    setManualNodePositions((previous) => {
      let changed = false;
      const next = {} as Record<NodeId, NodePosition>;
      for (const nodeId of Object.keys(previous) as NodeId[]) {
        const position = previous[nodeId];
        if (position !== undefined && validNodeIds.has(nodeId)) {
          next[nodeId] = position;
          continue;
        }

        changed = true;
      }

      return changed ? next : previous;
    });
  }, [nodes, setManualNodePositions]);

  useEffect(() => {
    if (interactionMode !== "addNode") {
      setPendingNewNodePosition(null);
    }
  }, [interactionMode, setPendingNewNodePosition]);

  useEffect(() => {
    setWireForcedRouteInput(selectedWireRouteInputValue);
  }, [setWireForcedRouteInput, selectedWireId, selectedWireRouteInputValue]);

  useEffect(() => {
    setNetworkLabelSizeMode(canvasDefaultLabelSizeMode);
  }, [canvasDefaultLabelSizeMode, setNetworkLabelSizeMode]);

  useEffect(() => {
    setNetworkCalloutTextSize(canvasDefaultCalloutTextSize);
  }, [canvasDefaultCalloutTextSize, setNetworkCalloutTextSize]);

  useEffect(() => {
    setNetworkLabelRotationDegrees(canvasDefaultLabelRotationDegrees);
  }, [canvasDefaultLabelRotationDegrees, setNetworkLabelRotationDegrees]);

  useEffect(() => {
    setNetworkAutoSegmentLabelRotation(canvasDefaultAutoSegmentLabelRotation);
  }, [canvasDefaultAutoSegmentLabelRotation, setNetworkAutoSegmentLabelRotation]);
}
