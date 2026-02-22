import { useMemo } from "react";
import type { ConnectorId, NodeId, SegmentId, SpliceId, WireId } from "../../core/entities";
import {
  selectConnectorById,
  selectConnectorCavityStatuses,
  selectNodeById,
  selectSegmentById,
  selectSelection,
  selectSpliceById,
  selectSplicePortStatuses,
  selectWireById,
  type AppState
} from "../../store";
import type { SubScreenId } from "../types/app-controller";

interface UseAppControllerSelectionEntitiesParams {
  state: AppState;
}

export function useAppControllerSelectionEntities({ state }: UseAppControllerSelectionEntitiesParams) {
  const selected = selectSelection(state);
  const selectedConnectorId = selected?.kind === "connector" ? (selected.id as ConnectorId) : null;
  const selectedSpliceId = selected?.kind === "splice" ? (selected.id as SpliceId) : null;
  const selectedNodeId = selected?.kind === "node" ? (selected.id as NodeId) : null;
  const selectedSegmentId = selected?.kind === "segment" ? (selected.id as SegmentId) : null;
  const selectedWireId = selected?.kind === "wire" ? (selected.id as WireId) : null;

  const selectedConnector =
    selectedConnectorId === null ? null : (selectConnectorById(state, selectedConnectorId) ?? null);
  const selectedSplice = selectedSpliceId === null ? null : (selectSpliceById(state, selectedSpliceId) ?? null);
  const selectedNode = selectedNodeId === null ? null : (selectNodeById(state, selectedNodeId) ?? null);
  const selectedSegment = selectedSegmentId === null ? null : (selectSegmentById(state, selectedSegmentId) ?? null);
  const selectedWire = selectedWireId === null ? null : (selectWireById(state, selectedWireId) ?? null);
  const selectedWireRouteInputValue = selectedWire === null ? "" : selectedWire.routeSegmentIds.join(", ");
  const selectedSubScreen = selected?.kind === undefined ? null : (selected.kind as SubScreenId);

  const connectorCavityStatuses = useMemo(() => {
    if (selectedConnectorId === null) {
      return [];
    }

    return selectConnectorCavityStatuses(state, selectedConnectorId);
  }, [state, selectedConnectorId]);

  const splicePortStatuses = useMemo(() => {
    if (selectedSpliceId === null) {
      return [];
    }

    return selectSplicePortStatuses(state, selectedSpliceId);
  }, [state, selectedSpliceId]);

  const selectedConnectorOccupiedCount =
    selectedConnector === null ? 0 : connectorCavityStatuses.filter((slot) => slot.isOccupied).length;
  const selectedSpliceOccupiedCount =
    selectedSplice === null ? 0 : splicePortStatuses.filter((slot) => slot.isOccupied).length;

  return {
    selected,
    selectedConnectorId,
    selectedSpliceId,
    selectedNodeId,
    selectedSegmentId,
    selectedWireId,
    selectedConnector,
    selectedSplice,
    selectedNode,
    selectedSegment,
    selectedWire,
    selectedWireRouteInputValue,
    selectedSubScreen,
    connectorCavityStatuses,
    splicePortStatuses,
    selectedConnectorOccupiedCount,
    selectedSpliceOccupiedCount
  };
}
