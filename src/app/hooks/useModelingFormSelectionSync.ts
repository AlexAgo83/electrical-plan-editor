import { useCallback, useEffect } from "react";
import type { CatalogItemId, ConnectorId, NodeId, SegmentId, SpliceId, WireId } from "../../core/entities";
import type { SubScreenId } from "../types/app-controller";

type EntityFormMode = "idle" | "create" | "edit";

interface UseModelingFormSelectionSyncParams {
  activeSubScreen: SubScreenId;
  catalogFormMode: EntityFormMode;
  connectorFormMode: EntityFormMode;
  spliceFormMode: EntityFormMode;
  nodeFormMode: EntityFormMode;
  segmentFormMode: EntityFormMode;
  wireFormMode: EntityFormMode;
  selectedCatalogItemId: CatalogItemId | null;
  selectedConnectorId: ConnectorId | null;
  selectedSpliceId: SpliceId | null;
  selectedNodeId: NodeId | null;
  selectedSegmentId: SegmentId | null;
  selectedWireId: WireId | null;
  clearCatalogForm: () => void;
  clearConnectorForm: () => void;
  clearSpliceForm: () => void;
  clearNodeForm: () => void;
  clearSegmentForm: () => void;
  clearWireForm: () => void;
}

export function useModelingFormSelectionSync({
  activeSubScreen,
  catalogFormMode,
  connectorFormMode,
  spliceFormMode,
  nodeFormMode,
  segmentFormMode,
  wireFormMode,
  selectedCatalogItemId,
  selectedConnectorId,
  selectedSpliceId,
  selectedNodeId,
  selectedSegmentId,
  selectedWireId,
  clearCatalogForm,
  clearConnectorForm,
  clearSpliceForm,
  clearNodeForm,
  clearSegmentForm,
  clearWireForm
}: UseModelingFormSelectionSyncParams) {
  const clearAllModelingForms = useCallback(() => {
    clearCatalogForm();
    clearConnectorForm();
    clearSpliceForm();
    clearNodeForm();
    clearSegmentForm();
    clearWireForm();
  }, [clearCatalogForm, clearConnectorForm, clearNodeForm, clearSegmentForm, clearSpliceForm, clearWireForm]);

  useEffect(() => {
    if (activeSubScreen !== "catalog" && catalogFormMode !== "idle") {
      clearCatalogForm();
    } else if (catalogFormMode === "edit" && selectedCatalogItemId === null) {
      clearCatalogForm();
    }

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
    catalogFormMode,
    clearCatalogForm,
    clearConnectorForm,
    clearNodeForm,
    clearSegmentForm,
    clearSpliceForm,
    clearWireForm,
    connectorFormMode,
    nodeFormMode,
    segmentFormMode,
    selectedCatalogItemId,
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
