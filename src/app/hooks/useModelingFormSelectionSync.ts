import { useCallback, useEffect } from "react";
import type { ConnectorId, NodeId, SegmentId, SpliceId, WireId } from "../../core/entities";
import type { SubScreenId } from "../types/app-controller";

type EntityFormMode = "idle" | "create" | "edit";

interface UseModelingFormSelectionSyncParams {
  activeSubScreen: SubScreenId;
  connectorFormMode: EntityFormMode;
  spliceFormMode: EntityFormMode;
  nodeFormMode: EntityFormMode;
  segmentFormMode: EntityFormMode;
  wireFormMode: EntityFormMode;
  selectedConnectorId: ConnectorId | null;
  selectedSpliceId: SpliceId | null;
  selectedNodeId: NodeId | null;
  selectedSegmentId: SegmentId | null;
  selectedWireId: WireId | null;
  clearConnectorForm: () => void;
  clearSpliceForm: () => void;
  clearNodeForm: () => void;
  clearSegmentForm: () => void;
  clearWireForm: () => void;
}

export function useModelingFormSelectionSync({
  activeSubScreen,
  connectorFormMode,
  spliceFormMode,
  nodeFormMode,
  segmentFormMode,
  wireFormMode,
  selectedConnectorId,
  selectedSpliceId,
  selectedNodeId,
  selectedSegmentId,
  selectedWireId,
  clearConnectorForm,
  clearSpliceForm,
  clearNodeForm,
  clearSegmentForm,
  clearWireForm
}: UseModelingFormSelectionSyncParams) {
  const clearAllModelingForms = useCallback(() => {
    clearConnectorForm();
    clearSpliceForm();
    clearNodeForm();
    clearSegmentForm();
    clearWireForm();
  }, [clearConnectorForm, clearNodeForm, clearSegmentForm, clearSpliceForm, clearWireForm]);

  useEffect(() => {
    if (activeSubScreen !== "connector" && connectorFormMode !== "idle") {
      clearConnectorForm();
    } else if (connectorFormMode === "edit" && selectedConnectorId === null) {
      clearConnectorForm();
    }

    if (activeSubScreen !== "splice" && spliceFormMode !== "idle") {
      clearSpliceForm();
    } else if (spliceFormMode === "edit" && selectedSpliceId === null) {
      clearSpliceForm();
    }

    if (activeSubScreen !== "node" && nodeFormMode !== "idle") {
      clearNodeForm();
    } else if (nodeFormMode === "edit" && selectedNodeId === null) {
      clearNodeForm();
    }

    if (activeSubScreen !== "segment" && segmentFormMode !== "idle") {
      clearSegmentForm();
    } else if (segmentFormMode === "edit" && selectedSegmentId === null) {
      clearSegmentForm();
    }

    if (activeSubScreen !== "wire" && wireFormMode !== "idle") {
      clearWireForm();
    } else if (wireFormMode === "edit" && selectedWireId === null) {
      clearWireForm();
    }
  }, [
    activeSubScreen,
    clearConnectorForm,
    clearNodeForm,
    clearSegmentForm,
    clearSpliceForm,
    clearWireForm,
    connectorFormMode,
    nodeFormMode,
    segmentFormMode,
    selectedConnectorId,
    selectedNodeId,
    selectedSegmentId,
    selectedSpliceId,
    selectedWireId,
    spliceFormMode,
    wireFormMode
  ]);

  return {
    clearAllModelingForms
  };
}
