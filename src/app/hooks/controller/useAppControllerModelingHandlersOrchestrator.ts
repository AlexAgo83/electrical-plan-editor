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
  connectorFormMode: Parameters<typeof useConnectorHandlers>[0]["connectorFormMode"];
  setConnectorFormMode: Parameters<typeof useConnectorHandlers>[0]["setConnectorFormMode"];
  editingConnectorId: Parameters<typeof useConnectorHandlers>[0]["editingConnectorId"];
  setEditingConnectorId: Parameters<typeof useConnectorHandlers>[0]["setEditingConnectorId"];
  connectorName: Parameters<typeof useConnectorHandlers>[0]["connectorName"];
  setConnectorName: Parameters<typeof useConnectorHandlers>[0]["setConnectorName"];
  connectorTechnicalId: Parameters<typeof useConnectorHandlers>[0]["connectorTechnicalId"];
  setConnectorTechnicalId: Parameters<typeof useConnectorHandlers>[0]["setConnectorTechnicalId"];
  cavityCount: Parameters<typeof useConnectorHandlers>[0]["cavityCount"];
  setCavityCount: Parameters<typeof useConnectorHandlers>[0]["setCavityCount"];
  setConnectorFormError: Parameters<typeof useConnectorHandlers>[0]["setConnectorFormError"];
  cavityIndexInput: Parameters<typeof useConnectorHandlers>[0]["cavityIndexInput"];
  connectorOccupantRefInput: Parameters<typeof useConnectorHandlers>[0]["connectorOccupantRefInput"];
  spliceFormMode: Parameters<typeof useSpliceHandlers>[0]["spliceFormMode"];
  setSpliceFormMode: Parameters<typeof useSpliceHandlers>[0]["setSpliceFormMode"];
  editingSpliceId: Parameters<typeof useSpliceHandlers>[0]["editingSpliceId"];
  setEditingSpliceId: Parameters<typeof useSpliceHandlers>[0]["setEditingSpliceId"];
  spliceName: Parameters<typeof useSpliceHandlers>[0]["spliceName"];
  setSpliceName: Parameters<typeof useSpliceHandlers>[0]["setSpliceName"];
  spliceTechnicalId: Parameters<typeof useSpliceHandlers>[0]["spliceTechnicalId"];
  setSpliceTechnicalId: Parameters<typeof useSpliceHandlers>[0]["setSpliceTechnicalId"];
  portCount: Parameters<typeof useSpliceHandlers>[0]["portCount"];
  setPortCount: Parameters<typeof useSpliceHandlers>[0]["setPortCount"];
  setSpliceFormError: Parameters<typeof useSpliceHandlers>[0]["setSpliceFormError"];
  portIndexInput: Parameters<typeof useSpliceHandlers>[0]["portIndexInput"];
  spliceOccupantRefInput: Parameters<typeof useSpliceHandlers>[0]["spliceOccupantRefInput"];
  nodeFormMode: Parameters<typeof useNodeHandlers>[0]["nodeFormMode"];
  setNodeFormMode: Parameters<typeof useNodeHandlers>[0]["setNodeFormMode"];
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
  editingWireId: Parameters<typeof useWireHandlers>[0]["editingWireId"];
  setEditingWireId: Parameters<typeof useWireHandlers>[0]["setEditingWireId"];
  wireName: Parameters<typeof useWireHandlers>[0]["wireName"];
  setWireName: Parameters<typeof useWireHandlers>[0]["setWireName"];
  wireTechnicalId: Parameters<typeof useWireHandlers>[0]["wireTechnicalId"];
  setWireTechnicalId: Parameters<typeof useWireHandlers>[0]["setWireTechnicalId"];
  wireSectionMm2: Parameters<typeof useWireHandlers>[0]["wireSectionMm2"];
  setWireSectionMm2: Parameters<typeof useWireHandlers>[0]["setWireSectionMm2"];
  wirePrimaryColorId: Parameters<typeof useWireHandlers>[0]["wirePrimaryColorId"];
  setWirePrimaryColorId: Parameters<typeof useWireHandlers>[0]["setWirePrimaryColorId"];
  wireSecondaryColorId: Parameters<typeof useWireHandlers>[0]["wireSecondaryColorId"];
  setWireSecondaryColorId: Parameters<typeof useWireHandlers>[0]["setWireSecondaryColorId"];
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
}

export function useAppControllerModelingHandlersOrchestrator({
  store,
  state,
  dispatchAction,
  connectorFormMode,
  setConnectorFormMode,
  editingConnectorId,
  setEditingConnectorId,
  connectorName,
  setConnectorName,
  connectorTechnicalId,
  setConnectorTechnicalId,
  cavityCount,
  setCavityCount,
  setConnectorFormError,
  cavityIndexInput,
  connectorOccupantRefInput,
  spliceFormMode,
  setSpliceFormMode,
  editingSpliceId,
  setEditingSpliceId,
  spliceName,
  setSpliceName,
  spliceTechnicalId,
  setSpliceTechnicalId,
  portCount,
  setPortCount,
  setSpliceFormError,
  portIndexInput,
  spliceOccupantRefInput,
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
  onNodeIdRenamed,
  segmentFormMode,
  setSegmentFormMode,
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
  editingWireId,
  setEditingWireId,
  wireName,
  setWireName,
  wireTechnicalId,
  setWireTechnicalId,
  wireSectionMm2,
  setWireSectionMm2,
  wirePrimaryColorId,
  setWirePrimaryColorId,
  wireSecondaryColorId,
  setWireSecondaryColorId,
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
  defaultWireSectionMm2
}: UseAppControllerModelingHandlersOrchestratorParams) {
  const connector = useConnectorHandlers({
    store,
    dispatchAction,
    connectorFormMode,
    setConnectorFormMode,
    editingConnectorId,
    setEditingConnectorId,
    connectorName,
    setConnectorName,
    connectorTechnicalId,
    setConnectorTechnicalId,
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
    spliceFormMode,
    setSpliceFormMode,
    editingSpliceId,
    setEditingSpliceId,
    spliceName,
    setSpliceName,
    spliceTechnicalId,
    setSpliceTechnicalId,
    portCount,
    setPortCount,
    setSpliceFormError,
    selectedSpliceId,
    portIndexInput,
    spliceOccupantRefInput
  });

  const node = useNodeHandlers({
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
    onNodeIdRenamed
  });

  const segment = useSegmentHandlers({
    store,
    state,
    dispatchAction,
    segmentFormMode,
    setSegmentFormMode,
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
    wireFormMode,
    setWireFormMode,
    editingWireId,
    setEditingWireId,
    wireName,
    setWireName,
    wireTechnicalId,
    setWireTechnicalId,
    wireSectionMm2,
    setWireSectionMm2,
    wirePrimaryColorId,
    setWirePrimaryColorId,
    wireSecondaryColorId,
    setWireSecondaryColorId,
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
