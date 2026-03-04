import type { Dispatch, SetStateAction } from "react";
import type { EntityFormsStateModel } from "../useEntityFormsState";
import { useAppControllerModelingHandlersOrchestrator } from "./useAppControllerModelingHandlersOrchestrator";

type ModelingHandlersParams = Parameters<typeof useAppControllerModelingHandlersOrchestrator>[0];

interface UseAppControllerModelingHandlersAssemblyParams {
  store: ModelingHandlersParams["store"];
  state: ModelingHandlersParams["state"];
  dispatchAction: ModelingHandlersParams["dispatchAction"];
  confirmAction: ModelingHandlersParams["confirmAction"];
  formsState: EntityFormsStateModel;
  pendingNewNodePosition: ModelingHandlersParams["pendingNewNodePosition"];
  setPendingNewNodePosition: ModelingHandlersParams["setPendingNewNodePosition"];
  setRoutePreviewStartNodeId: Dispatch<SetStateAction<string>>;
  setRoutePreviewEndNodeId: Dispatch<SetStateAction<string>>;
  selectedConnectorId: ModelingHandlersParams["selectedConnectorId"];
  selectedSpliceId: ModelingHandlersParams["selectedSpliceId"];
  selectedWire: ModelingHandlersParams["selectedWire"];
  defaultWireSectionMm2: ModelingHandlersParams["defaultWireSectionMm2"];
  defaultAutoCreateLinkedNodes: ModelingHandlersParams["defaultAutoCreateLinkedNodes"];
}

export function useAppControllerModelingHandlersAssembly({
  store,
  state,
  dispatchAction,
  confirmAction,
  formsState,
  pendingNewNodePosition,
  setPendingNewNodePosition,
  setRoutePreviewStartNodeId,
  setRoutePreviewEndNodeId,
  selectedConnectorId,
  selectedSpliceId,
  selectedWire,
  defaultWireSectionMm2,
  defaultAutoCreateLinkedNodes
}: UseAppControllerModelingHandlersAssemblyParams) {
  return useAppControllerModelingHandlersOrchestrator({
    store,
    state,
    dispatchAction,
    confirmAction,
    connectorFormMode: formsState.connectorFormMode,
    setConnectorFormMode: formsState.setConnectorFormMode,
    editingConnectorId: formsState.editingConnectorId,
    setEditingConnectorId: formsState.setEditingConnectorId,
    connectorName: formsState.connectorName,
    setConnectorName: formsState.setConnectorName,
    connectorTechnicalId: formsState.connectorTechnicalId,
    setConnectorTechnicalId: formsState.setConnectorTechnicalId,
    connectorCatalogItemId: formsState.connectorCatalogItemId,
    setConnectorCatalogItemId: formsState.setConnectorCatalogItemId,
    connectorManufacturerReference: formsState.connectorManufacturerReference,
    setConnectorManufacturerReference: formsState.setConnectorManufacturerReference,
    connectorAutoCreateLinkedNode: formsState.connectorAutoCreateLinkedNode,
    setConnectorAutoCreateLinkedNode: formsState.setConnectorAutoCreateLinkedNode,
    cavityCount: formsState.cavityCount,
    setCavityCount: formsState.setCavityCount,
    setConnectorFormError: formsState.setConnectorFormError,
    cavityIndexInput: formsState.cavityIndexInput,
    connectorOccupantRefInput: formsState.connectorOccupantRefInput,
    spliceFormMode: formsState.spliceFormMode,
    setSpliceFormMode: formsState.setSpliceFormMode,
    editingSpliceId: formsState.editingSpliceId,
    setEditingSpliceId: formsState.setEditingSpliceId,
    spliceName: formsState.spliceName,
    setSpliceName: formsState.setSpliceName,
    spliceTechnicalId: formsState.spliceTechnicalId,
    setSpliceTechnicalId: formsState.setSpliceTechnicalId,
    spliceCatalogItemId: formsState.spliceCatalogItemId,
    setSpliceCatalogItemId: formsState.setSpliceCatalogItemId,
    splicePortMode: formsState.splicePortMode,
    setSplicePortMode: formsState.setSplicePortMode,
    spliceManufacturerReference: formsState.spliceManufacturerReference,
    setSpliceManufacturerReference: formsState.setSpliceManufacturerReference,
    spliceAutoCreateLinkedNode: formsState.spliceAutoCreateLinkedNode,
    setSpliceAutoCreateLinkedNode: formsState.setSpliceAutoCreateLinkedNode,
    portCount: formsState.portCount,
    setPortCount: formsState.setPortCount,
    setSpliceFormInfo: formsState.setSpliceFormInfo,
    setSpliceFormError: formsState.setSpliceFormError,
    portIndexInput: formsState.portIndexInput,
    spliceOccupantRefInput: formsState.spliceOccupantRefInput,
    nodeFormMode: formsState.nodeFormMode,
    setNodeFormMode: formsState.setNodeFormMode,
    editingNodeId: formsState.editingNodeId,
    setEditingNodeId: formsState.setEditingNodeId,
    nodeIdInput: formsState.nodeIdInput,
    setNodeIdInput: formsState.setNodeIdInput,
    nodeKind: formsState.nodeKind,
    setNodeKind: formsState.setNodeKind,
    nodeConnectorId: formsState.nodeConnectorId,
    setNodeConnectorId: formsState.setNodeConnectorId,
    nodeSpliceId: formsState.nodeSpliceId,
    setNodeSpliceId: formsState.setNodeSpliceId,
    nodeLabel: formsState.nodeLabel,
    setNodeLabel: formsState.setNodeLabel,
    setNodeFormError: formsState.setNodeFormError,
    pendingNewNodePosition,
    setPendingNewNodePosition,
    onNodeIdRenamed: (fromId, toId) => {
      setRoutePreviewStartNodeId((current) => (current === fromId ? toId : current));
      setRoutePreviewEndNodeId((current) => (current === fromId ? toId : current));
    },
    segmentFormMode: formsState.segmentFormMode,
    setSegmentFormMode: formsState.setSegmentFormMode,
    editingSegmentId: formsState.editingSegmentId,
    setEditingSegmentId: formsState.setEditingSegmentId,
    segmentIdInput: formsState.segmentIdInput,
    setSegmentIdInput: formsState.setSegmentIdInput,
    segmentNodeA: formsState.segmentNodeA,
    setSegmentNodeA: formsState.setSegmentNodeA,
    segmentNodeB: formsState.segmentNodeB,
    setSegmentNodeB: formsState.setSegmentNodeB,
    segmentLengthMm: formsState.segmentLengthMm,
    setSegmentLengthMm: formsState.setSegmentLengthMm,
    segmentSubNetworkTag: formsState.segmentSubNetworkTag,
    setSegmentSubNetworkTag: formsState.setSegmentSubNetworkTag,
    setSegmentFormError: formsState.setSegmentFormError,
    wireFormMode: formsState.wireFormMode,
    setWireFormMode: formsState.setWireFormMode,
    editingWireId: formsState.editingWireId,
    setEditingWireId: formsState.setEditingWireId,
    wireName: formsState.wireName,
    setWireName: formsState.setWireName,
    wireTechnicalId: formsState.wireTechnicalId,
    setWireTechnicalId: formsState.setWireTechnicalId,
    wireSectionMm2: formsState.wireSectionMm2,
    setWireSectionMm2: formsState.setWireSectionMm2,
    wireColorMode: formsState.wireColorMode,
    setWireColorMode: formsState.setWireColorMode,
    wirePrimaryColorId: formsState.wirePrimaryColorId,
    setWirePrimaryColorId: formsState.setWirePrimaryColorId,
    wireSecondaryColorId: formsState.wireSecondaryColorId,
    setWireSecondaryColorId: formsState.setWireSecondaryColorId,
    wireFreeColorLabel: formsState.wireFreeColorLabel,
    setWireFreeColorLabel: formsState.setWireFreeColorLabel,
    wireFuseEnabled: formsState.wireFuseEnabled,
    setWireFuseEnabled: formsState.setWireFuseEnabled,
    wireFuseCatalogItemId: formsState.wireFuseCatalogItemId,
    setWireFuseCatalogItemId: formsState.setWireFuseCatalogItemId,
    wireEndpointAConnectionReference: formsState.wireEndpointAConnectionReference,
    setWireEndpointAConnectionReference: formsState.setWireEndpointAConnectionReference,
    wireEndpointASealReference: formsState.wireEndpointASealReference,
    setWireEndpointASealReference: formsState.setWireEndpointASealReference,
    wireEndpointAKind: formsState.wireEndpointAKind,
    setWireEndpointAKind: formsState.setWireEndpointAKind,
    wireEndpointAConnectorId: formsState.wireEndpointAConnectorId,
    setWireEndpointAConnectorId: formsState.setWireEndpointAConnectorId,
    wireEndpointACavityIndex: formsState.wireEndpointACavityIndex,
    setWireEndpointACavityIndex: formsState.setWireEndpointACavityIndex,
    wireEndpointASpliceId: formsState.wireEndpointASpliceId,
    setWireEndpointASpliceId: formsState.setWireEndpointASpliceId,
    wireEndpointAPortIndex: formsState.wireEndpointAPortIndex,
    setWireEndpointAPortIndex: formsState.setWireEndpointAPortIndex,
    wireEndpointBConnectionReference: formsState.wireEndpointBConnectionReference,
    setWireEndpointBConnectionReference: formsState.setWireEndpointBConnectionReference,
    wireEndpointBSealReference: formsState.wireEndpointBSealReference,
    setWireEndpointBSealReference: formsState.setWireEndpointBSealReference,
    wireEndpointBKind: formsState.wireEndpointBKind,
    setWireEndpointBKind: formsState.setWireEndpointBKind,
    wireEndpointBConnectorId: formsState.wireEndpointBConnectorId,
    setWireEndpointBConnectorId: formsState.setWireEndpointBConnectorId,
    wireEndpointBCavityIndex: formsState.wireEndpointBCavityIndex,
    setWireEndpointBCavityIndex: formsState.setWireEndpointBCavityIndex,
    wireEndpointBSpliceId: formsState.wireEndpointBSpliceId,
    setWireEndpointBSpliceId: formsState.setWireEndpointBSpliceId,
    wireEndpointBPortIndex: formsState.wireEndpointBPortIndex,
    setWireEndpointBPortIndex: formsState.setWireEndpointBPortIndex,
    wireForcedRouteInput: formsState.wireForcedRouteInput,
    setWireForcedRouteInput: formsState.setWireForcedRouteInput,
    setWireFormError: formsState.setWireFormError,
    selectedConnectorId,
    selectedSpliceId,
    selectedWire,
    defaultWireSectionMm2,
    defaultAutoCreateLinkedNodes
  });
}

export type AppControllerModelingHandlersAssemblyModel =
  ReturnType<typeof useAppControllerModelingHandlersAssembly>;
