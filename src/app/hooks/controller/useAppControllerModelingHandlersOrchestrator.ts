import type { AppStore } from "../../../store";
import { useConnectorHandlers } from "../useConnectorHandlers";
import { useNodeHandlers } from "../useNodeHandlers";
import { useSegmentHandlers } from "../useSegmentHandlers";
import { useSpliceHandlers } from "../useSpliceHandlers";
import { useWireHandlers } from "../useWireHandlers";

type DispatchAction = Parameters<typeof useConnectorHandlers>[0]["dispatchAction"];
type SelectedWire = Parameters<typeof useWireHandlers>[0]["selectedWire"];
type StateSnapshot = Parameters<typeof useNodeHandlers>[0]["state"];

interface UseAppControllerModelingHandlersOrchestratorParams {
  store: AppStore;
  state: StateSnapshot;
  dispatchAction: DispatchAction;
  confirmAction: Parameters<typeof useConnectorHandlers>[0]["confirmAction"];
  choiceAction: Parameters<typeof useWireHandlers>[0]["choiceAction"];
  connectorFormMode: Parameters<typeof useConnectorHandlers>[0]["connectorFormMode"];
  setConnectorFormMode: Parameters<typeof useConnectorHandlers>[0]["setConnectorFormMode"];
  connectorEditAfterCreate: Parameters<typeof useConnectorHandlers>[0]["connectorEditAfterCreate"];
  setConnectorEditAfterCreate: Parameters<typeof useConnectorHandlers>[0]["setConnectorEditAfterCreate"];
  editingConnectorId: Parameters<typeof useConnectorHandlers>[0]["editingConnectorId"];
  setEditingConnectorId: Parameters<typeof useConnectorHandlers>[0]["setEditingConnectorId"];
  connectorName: Parameters<typeof useConnectorHandlers>[0]["connectorName"];
  setConnectorName: Parameters<typeof useConnectorHandlers>[0]["setConnectorName"];
  connectorTechnicalId: Parameters<typeof useConnectorHandlers>[0]["connectorTechnicalId"];
  setConnectorTechnicalId: Parameters<typeof useConnectorHandlers>[0]["setConnectorTechnicalId"];
  connectorCatalogItemId: Parameters<typeof useConnectorHandlers>[0]["connectorCatalogItemId"];
  setConnectorCatalogItemId: Parameters<typeof useConnectorHandlers>[0]["setConnectorCatalogItemId"];
  connectorManufacturerReference: Parameters<typeof useConnectorHandlers>[0]["connectorManufacturerReference"];
  setConnectorManufacturerReference: Parameters<typeof useConnectorHandlers>[0]["setConnectorManufacturerReference"];
  connectorAutoCreateLinkedNode: Parameters<typeof useConnectorHandlers>[0]["connectorAutoCreateLinkedNode"];
  setConnectorAutoCreateLinkedNode: Parameters<typeof useConnectorHandlers>[0]["setConnectorAutoCreateLinkedNode"];
  cavityCount: Parameters<typeof useConnectorHandlers>[0]["cavityCount"];
  setCavityCount: Parameters<typeof useConnectorHandlers>[0]["setCavityCount"];
  setConnectorFormError: Parameters<typeof useConnectorHandlers>[0]["setConnectorFormError"];
  cavityIndexInput: Parameters<typeof useConnectorHandlers>[0]["cavityIndexInput"];
  connectorOccupantRefInput: Parameters<typeof useConnectorHandlers>[0]["connectorOccupantRefInput"];
  spliceFormMode: Parameters<typeof useSpliceHandlers>[0]["spliceFormMode"];
  setSpliceFormMode: Parameters<typeof useSpliceHandlers>[0]["setSpliceFormMode"];
  spliceEditAfterCreate: Parameters<typeof useSpliceHandlers>[0]["spliceEditAfterCreate"];
  setSpliceEditAfterCreate: Parameters<typeof useSpliceHandlers>[0]["setSpliceEditAfterCreate"];
  editingSpliceId: Parameters<typeof useSpliceHandlers>[0]["editingSpliceId"];
  setEditingSpliceId: Parameters<typeof useSpliceHandlers>[0]["setEditingSpliceId"];
  spliceName: Parameters<typeof useSpliceHandlers>[0]["spliceName"];
  setSpliceName: Parameters<typeof useSpliceHandlers>[0]["setSpliceName"];
  spliceTechnicalId: Parameters<typeof useSpliceHandlers>[0]["spliceTechnicalId"];
  setSpliceTechnicalId: Parameters<typeof useSpliceHandlers>[0]["setSpliceTechnicalId"];
  spliceCatalogItemId: Parameters<typeof useSpliceHandlers>[0]["spliceCatalogItemId"];
  setSpliceCatalogItemId: Parameters<typeof useSpliceHandlers>[0]["setSpliceCatalogItemId"];
  splicePortMode: Parameters<typeof useSpliceHandlers>[0]["splicePortMode"];
  setSplicePortMode: Parameters<typeof useSpliceHandlers>[0]["setSplicePortMode"];
  spliceManufacturerReference: Parameters<typeof useSpliceHandlers>[0]["spliceManufacturerReference"];
  setSpliceManufacturerReference: Parameters<typeof useSpliceHandlers>[0]["setSpliceManufacturerReference"];
  spliceAutoCreateLinkedNode: Parameters<typeof useSpliceHandlers>[0]["spliceAutoCreateLinkedNode"];
  setSpliceAutoCreateLinkedNode: Parameters<typeof useSpliceHandlers>[0]["setSpliceAutoCreateLinkedNode"];
  portCount: Parameters<typeof useSpliceHandlers>[0]["portCount"];
  setPortCount: Parameters<typeof useSpliceHandlers>[0]["setPortCount"];
  setSpliceFormInfo: Parameters<typeof useSpliceHandlers>[0]["setSpliceFormInfo"];
  setSpliceFormError: Parameters<typeof useSpliceHandlers>[0]["setSpliceFormError"];
  portIndexInput: Parameters<typeof useSpliceHandlers>[0]["portIndexInput"];
  spliceOccupantRefInput: Parameters<typeof useSpliceHandlers>[0]["spliceOccupantRefInput"];
  nodeFormMode: Parameters<typeof useNodeHandlers>[0]["nodeFormMode"];
  setNodeFormMode: Parameters<typeof useNodeHandlers>[0]["setNodeFormMode"];
  nodeEditAfterCreate: Parameters<typeof useNodeHandlers>[0]["nodeEditAfterCreate"];
  setNodeEditAfterCreate: Parameters<typeof useNodeHandlers>[0]["setNodeEditAfterCreate"];
  editingNodeId: Parameters<typeof useNodeHandlers>[0]["editingNodeId"];
  setEditingNodeId: Parameters<typeof useNodeHandlers>[0]["setEditingNodeId"];
  nodeIdInput: Parameters<typeof useNodeHandlers>[0]["nodeIdInput"];
  setNodeIdInput: Parameters<typeof useNodeHandlers>[0]["setNodeIdInput"];
  nodeKind: Parameters<typeof useNodeHandlers>[0]["nodeKind"];
  setNodeKind: Parameters<typeof useNodeHandlers>[0]["setNodeKind"];
  nodeConnectorId: Parameters<typeof useNodeHandlers>[0]["nodeConnectorId"];
  setNodeConnectorId: Parameters<typeof useNodeHandlers>[0]["setNodeConnectorId"];
  nodeSpliceId: Parameters<typeof useNodeHandlers>[0]["nodeSpliceId"];
  setNodeSpliceId: Parameters<typeof useNodeHandlers>[0]["setNodeSpliceId"];
  nodeLabel: Parameters<typeof useNodeHandlers>[0]["nodeLabel"];
  setNodeLabel: Parameters<typeof useNodeHandlers>[0]["setNodeLabel"];
  setNodeFormError: Parameters<typeof useNodeHandlers>[0]["setNodeFormError"];
  pendingNewNodePosition: Parameters<typeof useNodeHandlers>[0]["pendingNewNodePosition"];
  setPendingNewNodePosition: Parameters<typeof useNodeHandlers>[0]["setPendingNewNodePosition"];
  onNodeIdRenamed?: Parameters<typeof useNodeHandlers>[0]["onNodeIdRenamed"];
  segmentFormMode: Parameters<typeof useSegmentHandlers>[0]["segmentFormMode"];
  setSegmentFormMode: Parameters<typeof useSegmentHandlers>[0]["setSegmentFormMode"];
  segmentEditAfterCreate: Parameters<typeof useSegmentHandlers>[0]["segmentEditAfterCreate"];
  setSegmentEditAfterCreate: Parameters<typeof useSegmentHandlers>[0]["setSegmentEditAfterCreate"];
  editingSegmentId: Parameters<typeof useSegmentHandlers>[0]["editingSegmentId"];
  setEditingSegmentId: Parameters<typeof useSegmentHandlers>[0]["setEditingSegmentId"];
  segmentIdInput: Parameters<typeof useSegmentHandlers>[0]["segmentIdInput"];
  setSegmentIdInput: Parameters<typeof useSegmentHandlers>[0]["setSegmentIdInput"];
  segmentNodeA: Parameters<typeof useSegmentHandlers>[0]["segmentNodeA"];
  setSegmentNodeA: Parameters<typeof useSegmentHandlers>[0]["setSegmentNodeA"];
  segmentNodeB: Parameters<typeof useSegmentHandlers>[0]["segmentNodeB"];
  setSegmentNodeB: Parameters<typeof useSegmentHandlers>[0]["setSegmentNodeB"];
  segmentLengthMm: Parameters<typeof useSegmentHandlers>[0]["segmentLengthMm"];
  setSegmentLengthMm: Parameters<typeof useSegmentHandlers>[0]["setSegmentLengthMm"];
  segmentSubNetworkTag: Parameters<typeof useSegmentHandlers>[0]["segmentSubNetworkTag"];
  setSegmentSubNetworkTag: Parameters<typeof useSegmentHandlers>[0]["setSegmentSubNetworkTag"];
  setSegmentFormError: Parameters<typeof useSegmentHandlers>[0]["setSegmentFormError"];
  wireFormMode: Parameters<typeof useWireHandlers>[0]["wireFormMode"];
  setWireFormMode: Parameters<typeof useWireHandlers>[0]["setWireFormMode"];
  wireEditAfterCreate: Parameters<typeof useWireHandlers>[0]["wireEditAfterCreate"];
  setWireEditAfterCreate: Parameters<typeof useWireHandlers>[0]["setWireEditAfterCreate"];
  editingWireId: Parameters<typeof useWireHandlers>[0]["editingWireId"];
  setEditingWireId: Parameters<typeof useWireHandlers>[0]["setEditingWireId"];
  wireName: Parameters<typeof useWireHandlers>[0]["wireName"];
  setWireName: Parameters<typeof useWireHandlers>[0]["setWireName"];
  wireTechnicalId: Parameters<typeof useWireHandlers>[0]["wireTechnicalId"];
  setWireTechnicalId: Parameters<typeof useWireHandlers>[0]["setWireTechnicalId"];
  wireSectionMm2: Parameters<typeof useWireHandlers>[0]["wireSectionMm2"];
  setWireSectionMm2: Parameters<typeof useWireHandlers>[0]["setWireSectionMm2"];
  wireCurrentA: Parameters<typeof useWireHandlers>[0]["wireCurrentA"];
  setWireCurrentA: Parameters<typeof useWireHandlers>[0]["setWireCurrentA"];
  wireMaterial: Parameters<typeof useWireHandlers>[0]["wireMaterial"];
  setWireMaterial: Parameters<typeof useWireHandlers>[0]["setWireMaterial"];
  wireColorMode: Parameters<typeof useWireHandlers>[0]["wireColorMode"];
  setWireColorMode: Parameters<typeof useWireHandlers>[0]["setWireColorMode"];
  wirePrimaryColorId: Parameters<typeof useWireHandlers>[0]["wirePrimaryColorId"];
  setWirePrimaryColorId: Parameters<typeof useWireHandlers>[0]["setWirePrimaryColorId"];
  wireSecondaryColorId: Parameters<typeof useWireHandlers>[0]["wireSecondaryColorId"];
  setWireSecondaryColorId: Parameters<typeof useWireHandlers>[0]["setWireSecondaryColorId"];
  wireFreeColorLabel: Parameters<typeof useWireHandlers>[0]["wireFreeColorLabel"];
  setWireFreeColorLabel: Parameters<typeof useWireHandlers>[0]["setWireFreeColorLabel"];
  wireFuseEnabled: Parameters<typeof useWireHandlers>[0]["wireFuseEnabled"];
  setWireFuseEnabled: Parameters<typeof useWireHandlers>[0]["setWireFuseEnabled"];
  wireFuseCatalogItemId: Parameters<typeof useWireHandlers>[0]["wireFuseCatalogItemId"];
  setWireFuseCatalogItemId: Parameters<typeof useWireHandlers>[0]["setWireFuseCatalogItemId"];
  wireEndpointAConnectionReference: Parameters<typeof useWireHandlers>[0]["wireEndpointAConnectionReference"];
  setWireEndpointAConnectionReference: Parameters<typeof useWireHandlers>[0]["setWireEndpointAConnectionReference"];
  wireEndpointAConnectionName: Parameters<typeof useWireHandlers>[0]["wireEndpointAConnectionName"];
  setWireEndpointAConnectionName: Parameters<typeof useWireHandlers>[0]["setWireEndpointAConnectionName"];
  wireEndpointASealReference: Parameters<typeof useWireHandlers>[0]["wireEndpointASealReference"];
  setWireEndpointASealReference: Parameters<typeof useWireHandlers>[0]["setWireEndpointASealReference"];
  wireEndpointASealName: Parameters<typeof useWireHandlers>[0]["wireEndpointASealName"];
  setWireEndpointASealName: Parameters<typeof useWireHandlers>[0]["setWireEndpointASealName"];
  wireEndpointAKind: Parameters<typeof useWireHandlers>[0]["wireEndpointAKind"];
  setWireEndpointAKind: Parameters<typeof useWireHandlers>[0]["setWireEndpointAKind"];
  wireEndpointAConnectorId: Parameters<typeof useWireHandlers>[0]["wireEndpointAConnectorId"];
  setWireEndpointAConnectorId: Parameters<typeof useWireHandlers>[0]["setWireEndpointAConnectorId"];
  wireEndpointACavityIndex: Parameters<typeof useWireHandlers>[0]["wireEndpointACavityIndex"];
  setWireEndpointACavityIndex: Parameters<typeof useWireHandlers>[0]["setWireEndpointACavityIndex"];
  wireEndpointASpliceId: Parameters<typeof useWireHandlers>[0]["wireEndpointASpliceId"];
  setWireEndpointASpliceId: Parameters<typeof useWireHandlers>[0]["setWireEndpointASpliceId"];
  wireEndpointAPortIndex: Parameters<typeof useWireHandlers>[0]["wireEndpointAPortIndex"];
  setWireEndpointAPortIndex: Parameters<typeof useWireHandlers>[0]["setWireEndpointAPortIndex"];
  wireEndpointBConnectionReference: Parameters<typeof useWireHandlers>[0]["wireEndpointBConnectionReference"];
  setWireEndpointBConnectionReference: Parameters<typeof useWireHandlers>[0]["setWireEndpointBConnectionReference"];
  wireEndpointBConnectionName: Parameters<typeof useWireHandlers>[0]["wireEndpointBConnectionName"];
  setWireEndpointBConnectionName: Parameters<typeof useWireHandlers>[0]["setWireEndpointBConnectionName"];
  wireEndpointBSealReference: Parameters<typeof useWireHandlers>[0]["wireEndpointBSealReference"];
  setWireEndpointBSealReference: Parameters<typeof useWireHandlers>[0]["setWireEndpointBSealReference"];
  wireEndpointBSealName: Parameters<typeof useWireHandlers>[0]["wireEndpointBSealName"];
  setWireEndpointBSealName: Parameters<typeof useWireHandlers>[0]["setWireEndpointBSealName"];
  wireEndpointBKind: Parameters<typeof useWireHandlers>[0]["wireEndpointBKind"];
  setWireEndpointBKind: Parameters<typeof useWireHandlers>[0]["setWireEndpointBKind"];
  wireEndpointBConnectorId: Parameters<typeof useWireHandlers>[0]["wireEndpointBConnectorId"];
  setWireEndpointBConnectorId: Parameters<typeof useWireHandlers>[0]["setWireEndpointBConnectorId"];
  wireEndpointBCavityIndex: Parameters<typeof useWireHandlers>[0]["wireEndpointBCavityIndex"];
  setWireEndpointBCavityIndex: Parameters<typeof useWireHandlers>[0]["setWireEndpointBCavityIndex"];
  wireEndpointBSpliceId: Parameters<typeof useWireHandlers>[0]["wireEndpointBSpliceId"];
  setWireEndpointBSpliceId: Parameters<typeof useWireHandlers>[0]["setWireEndpointBSpliceId"];
  wireEndpointBPortIndex: Parameters<typeof useWireHandlers>[0]["wireEndpointBPortIndex"];
  setWireEndpointBPortIndex: Parameters<typeof useWireHandlers>[0]["setWireEndpointBPortIndex"];
  wireForcedRouteInput: Parameters<typeof useWireHandlers>[0]["wireForcedRouteInput"];
  setWireForcedRouteInput: Parameters<typeof useWireHandlers>[0]["setWireForcedRouteInput"];
  setWireFormError: Parameters<typeof useWireHandlers>[0]["setWireFormError"];
  selectedConnectorId: Parameters<typeof useConnectorHandlers>[0]["selectedConnectorId"];
  selectedSpliceId: Parameters<typeof useSpliceHandlers>[0]["selectedSpliceId"];
  selectedWire: SelectedWire;
  defaultWireSectionMm2: Parameters<typeof useWireHandlers>[0]["defaultWireSectionMm2"];
  defaultAutoCreateLinkedNodes: boolean;
}

export function useAppControllerModelingHandlersOrchestrator({
  store,
  state,
  dispatchAction,
  confirmAction,
  choiceAction,
  connectorFormMode,
  setConnectorFormMode,
  connectorEditAfterCreate,
  setConnectorEditAfterCreate,
  editingConnectorId,
  setEditingConnectorId,
  connectorName,
  setConnectorName,
  connectorTechnicalId,
  setConnectorTechnicalId,
  connectorCatalogItemId,
  setConnectorCatalogItemId,
  connectorManufacturerReference,
  setConnectorManufacturerReference,
  connectorAutoCreateLinkedNode,
  setConnectorAutoCreateLinkedNode,
  cavityCount,
  setCavityCount,
  setConnectorFormError,
  cavityIndexInput,
  connectorOccupantRefInput,
  spliceFormMode,
  setSpliceFormMode,
  spliceEditAfterCreate,
  setSpliceEditAfterCreate,
  editingSpliceId,
  setEditingSpliceId,
  spliceName,
  setSpliceName,
  spliceTechnicalId,
  setSpliceTechnicalId,
  spliceCatalogItemId,
  setSpliceCatalogItemId,
  splicePortMode,
  setSplicePortMode,
  spliceManufacturerReference,
  setSpliceManufacturerReference,
  spliceAutoCreateLinkedNode,
  setSpliceAutoCreateLinkedNode,
  portCount,
  setPortCount,
  setSpliceFormInfo,
  setSpliceFormError,
  portIndexInput,
  spliceOccupantRefInput,
  nodeFormMode,
  setNodeFormMode,
  nodeEditAfterCreate,
  setNodeEditAfterCreate,
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
  onNodeIdRenamed,
  segmentFormMode,
  setSegmentFormMode,
  segmentEditAfterCreate,
  setSegmentEditAfterCreate,
  editingSegmentId,
  setEditingSegmentId,
  segmentIdInput,
  setSegmentIdInput,
  segmentNodeA,
  setSegmentNodeA,
  segmentNodeB,
  setSegmentNodeB,
  segmentLengthMm,
  setSegmentLengthMm,
  segmentSubNetworkTag,
  setSegmentSubNetworkTag,
  setSegmentFormError,
  wireFormMode,
  setWireFormMode,
  wireEditAfterCreate,
  setWireEditAfterCreate,
  editingWireId,
  setEditingWireId,
  wireName,
  setWireName,
  wireTechnicalId,
  setWireTechnicalId,
  wireSectionMm2,
  setWireSectionMm2,
  wireCurrentA,
  setWireCurrentA,
  wireMaterial,
  setWireMaterial,
  wireColorMode,
  setWireColorMode,
  wirePrimaryColorId,
  setWirePrimaryColorId,
  wireSecondaryColorId,
  setWireSecondaryColorId,
  wireFreeColorLabel,
  setWireFreeColorLabel,
  wireFuseEnabled,
  setWireFuseEnabled,
  wireFuseCatalogItemId,
  setWireFuseCatalogItemId,
  wireEndpointAConnectionReference,
  setWireEndpointAConnectionReference,
  wireEndpointAConnectionName,
  setWireEndpointAConnectionName,
  wireEndpointASealReference,
  setWireEndpointASealReference,
  wireEndpointASealName,
  setWireEndpointASealName,
  wireEndpointAKind,
  setWireEndpointAKind,
  wireEndpointAConnectorId,
  setWireEndpointAConnectorId,
  wireEndpointACavityIndex,
  setWireEndpointACavityIndex,
  wireEndpointASpliceId,
  setWireEndpointASpliceId,
  wireEndpointAPortIndex,
  setWireEndpointAPortIndex,
  wireEndpointBConnectionReference,
  setWireEndpointBConnectionReference,
  wireEndpointBConnectionName,
  setWireEndpointBConnectionName,
  wireEndpointBSealReference,
  setWireEndpointBSealReference,
  wireEndpointBSealName,
  setWireEndpointBSealName,
  wireEndpointBKind,
  setWireEndpointBKind,
  wireEndpointBConnectorId,
  setWireEndpointBConnectorId,
  wireEndpointBCavityIndex,
  setWireEndpointBCavityIndex,
  wireEndpointBSpliceId,
  setWireEndpointBSpliceId,
  wireEndpointBPortIndex,
  setWireEndpointBPortIndex,
  wireForcedRouteInput,
  setWireForcedRouteInput,
  setWireFormError,
  selectedConnectorId,
  selectedSpliceId,
  selectedWire,
  defaultWireSectionMm2,
  defaultAutoCreateLinkedNodes
}: UseAppControllerModelingHandlersOrchestratorParams) {
  const connector = useConnectorHandlers({
    store,
    dispatchAction,
    confirmAction,
    connectorFormMode,
    setConnectorFormMode,
    connectorEditAfterCreate,
    setConnectorEditAfterCreate,
    editingConnectorId,
    setEditingConnectorId,
    connectorName,
    setConnectorName,
    connectorTechnicalId,
    setConnectorTechnicalId,
    connectorCatalogItemId,
    setConnectorCatalogItemId,
    connectorManufacturerReference,
    setConnectorManufacturerReference,
    connectorAutoCreateLinkedNode,
    setConnectorAutoCreateLinkedNode,
    defaultAutoCreateLinkedNodes,
    cavityCount,
    setCavityCount,
    setConnectorFormError,
    selectedConnectorId,
    cavityIndexInput,
    connectorOccupantRefInput
  });

  const splice = useSpliceHandlers({
    store,
    dispatchAction,
    confirmAction,
    spliceFormMode,
    setSpliceFormMode,
    spliceEditAfterCreate,
    setSpliceEditAfterCreate,
    editingSpliceId,
    setEditingSpliceId,
    spliceName,
    setSpliceName,
    spliceTechnicalId,
    setSpliceTechnicalId,
    spliceCatalogItemId,
    setSpliceCatalogItemId,
    splicePortMode,
    setSplicePortMode,
    spliceManufacturerReference,
    setSpliceManufacturerReference,
    spliceAutoCreateLinkedNode,
    setSpliceAutoCreateLinkedNode,
    defaultAutoCreateLinkedNodes,
    portCount,
    setPortCount,
    setSpliceFormInfo,
    setSpliceFormError,
    selectedSpliceId,
    portIndexInput,
    spliceOccupantRefInput
  });

  const node = useNodeHandlers({
    store,
    state,
    dispatchAction,
    confirmAction,
    nodeFormMode,
    setNodeFormMode,
    nodeEditAfterCreate,
    setNodeEditAfterCreate,
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
    onNodeIdRenamed
  });

  const segment = useSegmentHandlers({
    store,
    state,
    dispatchAction,
    confirmAction,
    segmentFormMode,
    setSegmentFormMode,
    segmentEditAfterCreate,
    setSegmentEditAfterCreate,
    editingSegmentId,
    setEditingSegmentId,
    segmentIdInput,
    setSegmentIdInput,
    segmentNodeA,
    setSegmentNodeA,
    segmentNodeB,
    setSegmentNodeB,
    segmentLengthMm,
    setSegmentLengthMm,
    segmentSubNetworkTag,
    setSegmentSubNetworkTag,
    setSegmentFormError
  });

  const wire = useWireHandlers({
    store,
    dispatchAction,
    confirmAction,
    choiceAction,
    wireFormMode,
    setWireFormMode,
    wireEditAfterCreate,
    setWireEditAfterCreate,
    editingWireId,
    setEditingWireId,
    wireName,
    setWireName,
    wireTechnicalId,
    setWireTechnicalId,
    wireSectionMm2,
    setWireSectionMm2,
    wireCurrentA,
    setWireCurrentA,
    wireMaterial,
    setWireMaterial,
    wireColorMode,
    setWireColorMode,
    wirePrimaryColorId,
    setWirePrimaryColorId,
    wireSecondaryColorId,
    setWireSecondaryColorId,
    wireFreeColorLabel,
    setWireFreeColorLabel,
    wireFuseEnabled,
    setWireFuseEnabled,
    wireFuseCatalogItemId,
    setWireFuseCatalogItemId,
    wireEndpointAConnectionReference,
    setWireEndpointAConnectionReference,
    wireEndpointAConnectionName,
    setWireEndpointAConnectionName,
    wireEndpointASealReference,
    setWireEndpointASealReference,
    wireEndpointASealName,
    setWireEndpointASealName,
    wireEndpointAKind,
    setWireEndpointAKind,
    wireEndpointAConnectorId,
    setWireEndpointAConnectorId,
    wireEndpointACavityIndex,
    setWireEndpointACavityIndex,
    wireEndpointASpliceId,
    setWireEndpointASpliceId,
    wireEndpointAPortIndex,
    setWireEndpointAPortIndex,
    wireEndpointBConnectionReference,
    setWireEndpointBConnectionReference,
    wireEndpointBConnectionName,
    setWireEndpointBConnectionName,
    wireEndpointBSealReference,
    setWireEndpointBSealReference,
    wireEndpointBSealName,
    setWireEndpointBSealName,
    wireEndpointBKind,
    setWireEndpointBKind,
    wireEndpointBConnectorId,
    setWireEndpointBConnectorId,
    wireEndpointBCavityIndex,
    setWireEndpointBCavityIndex,
    wireEndpointBSpliceId,
    setWireEndpointBSpliceId,
    wireEndpointBPortIndex,
    setWireEndpointBPortIndex,
    wireForcedRouteInput,
    setWireForcedRouteInput,
    setWireFormError,
    selectedWire,
    defaultWireSectionMm2
  });

  return {
    connector,
    splice,
    node,
    segment,
    wire
  };
}

export type AppControllerModelingHandlersOrchestrator = ReturnType<typeof useAppControllerModelingHandlersOrchestrator>;
