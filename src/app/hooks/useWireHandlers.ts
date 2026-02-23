import type { FormEvent } from "react";
import type {
  ConnectorId,
  SegmentId,
  SpliceId,
  Wire,
  WireEndpoint,
  WireId
} from "../../core/entities";
import type { AppStore } from "../../store";
import { appActions } from "../../store";
import { createEntityId, toPositiveInteger } from "../lib/app-utils-shared";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

interface UseWireHandlersParams {
  store: AppStore;
  dispatchAction: DispatchAction;
  wireFormMode: "idle" | "create" | "edit";
  setWireFormMode: (mode: "idle" | "create" | "edit") => void;
  editingWireId: WireId | null;
  setEditingWireId: (id: WireId | null) => void;
  wireName: string;
  setWireName: (value: string) => void;
  wireTechnicalId: string;
  setWireTechnicalId: (value: string) => void;
  wireEndpointAKind: WireEndpoint["kind"];
  setWireEndpointAKind: (value: WireEndpoint["kind"]) => void;
  wireEndpointAConnectorId: string;
  setWireEndpointAConnectorId: (value: string) => void;
  wireEndpointACavityIndex: string;
  setWireEndpointACavityIndex: (value: string) => void;
  wireEndpointASpliceId: string;
  setWireEndpointASpliceId: (value: string) => void;
  wireEndpointAPortIndex: string;
  setWireEndpointAPortIndex: (value: string) => void;
  wireEndpointBKind: WireEndpoint["kind"];
  setWireEndpointBKind: (value: WireEndpoint["kind"]) => void;
  wireEndpointBConnectorId: string;
  setWireEndpointBConnectorId: (value: string) => void;
  wireEndpointBCavityIndex: string;
  setWireEndpointBCavityIndex: (value: string) => void;
  wireEndpointBSpliceId: string;
  setWireEndpointBSpliceId: (value: string) => void;
  wireEndpointBPortIndex: string;
  setWireEndpointBPortIndex: (value: string) => void;
  wireForcedRouteInput: string;
  setWireForcedRouteInput: (value: string) => void;
  setWireFormError: (value: string | null) => void;
  selectedWire: Wire | null;
}

export function useWireHandlers({
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
  selectedWire
}: UseWireHandlersParams) {
  function resetWireForm(): void {
    setWireFormMode("create");
    setEditingWireId(null);
    setWireName("");
    setWireTechnicalId("");
    setWireEndpointAKind("connectorCavity");
    setWireEndpointAConnectorId("");
    setWireEndpointACavityIndex("1");
    setWireEndpointASpliceId("");
    setWireEndpointAPortIndex("1");
    setWireEndpointBKind("splicePort");
    setWireEndpointBConnectorId("");
    setWireEndpointBCavityIndex("1");
    setWireEndpointBSpliceId("");
    setWireEndpointBPortIndex("1");
    setWireForcedRouteInput("");
    setWireFormError(null);
  }

  function clearWireForm(): void {
    setWireFormMode("idle");
    setEditingWireId(null);
    setWireName("");
    setWireTechnicalId("");
    setWireEndpointAKind("connectorCavity");
    setWireEndpointAConnectorId("");
    setWireEndpointACavityIndex("1");
    setWireEndpointASpliceId("");
    setWireEndpointAPortIndex("1");
    setWireEndpointBKind("splicePort");
    setWireEndpointBConnectorId("");
    setWireEndpointBCavityIndex("1");
    setWireEndpointBSpliceId("");
    setWireEndpointBPortIndex("1");
    setWireForcedRouteInput("");
    setWireFormError(null);
  }

  function cancelWireEdit(): void {
    clearWireForm();
    dispatchAction(appActions.clearSelection(), { trackHistory: false });
  }

  function startWireEdit(wire: Wire): void {
    setWireFormMode("edit");
    setEditingWireId(wire.id);
    setWireName(wire.name);
    setWireTechnicalId(wire.technicalId);
    setWireEndpointAKind(wire.endpointA.kind);
    if (wire.endpointA.kind === "connectorCavity") {
      setWireEndpointAConnectorId(wire.endpointA.connectorId);
      setWireEndpointACavityIndex(String(wire.endpointA.cavityIndex));
      setWireEndpointASpliceId("");
      setWireEndpointAPortIndex("1");
    } else {
      setWireEndpointASpliceId(wire.endpointA.spliceId);
      setWireEndpointAPortIndex(String(wire.endpointA.portIndex));
      setWireEndpointAConnectorId("");
      setWireEndpointACavityIndex("1");
    }

    setWireEndpointBKind(wire.endpointB.kind);
    if (wire.endpointB.kind === "connectorCavity") {
      setWireEndpointBConnectorId(wire.endpointB.connectorId);
      setWireEndpointBCavityIndex(String(wire.endpointB.cavityIndex));
      setWireEndpointBSpliceId("");
      setWireEndpointBPortIndex("1");
    } else {
      setWireEndpointBSpliceId(wire.endpointB.spliceId);
      setWireEndpointBPortIndex(String(wire.endpointB.portIndex));
      setWireEndpointBConnectorId("");
      setWireEndpointBCavityIndex("1");
    }

    setWireForcedRouteInput(wire.routeSegmentIds.join(", "));
    dispatchAction(appActions.select({ kind: "wire", id: wire.id }));
  }

  function buildWireEndpoint(side: "A" | "B"): WireEndpoint | null {
    if (side === "A") {
      if (wireEndpointAKind === "connectorCavity") {
        if (wireEndpointAConnectorId.length === 0) {
          setWireFormError("Endpoint A connector is required.");
          return null;
        }

        return {
          kind: "connectorCavity",
          connectorId: wireEndpointAConnectorId as ConnectorId,
          cavityIndex: toPositiveInteger(wireEndpointACavityIndex)
        };
      }

      if (wireEndpointASpliceId.length === 0) {
        setWireFormError("Endpoint A splice is required.");
        return null;
      }

      return {
        kind: "splicePort",
        spliceId: wireEndpointASpliceId as SpliceId,
        portIndex: toPositiveInteger(wireEndpointAPortIndex)
      };
    }

    if (wireEndpointBKind === "connectorCavity") {
      if (wireEndpointBConnectorId.length === 0) {
        setWireFormError("Endpoint B connector is required.");
        return null;
      }

      return {
        kind: "connectorCavity",
        connectorId: wireEndpointBConnectorId as ConnectorId,
        cavityIndex: toPositiveInteger(wireEndpointBCavityIndex)
      };
    }

    if (wireEndpointBSpliceId.length === 0) {
      setWireFormError("Endpoint B splice is required.");
      return null;
    }

    return {
      kind: "splicePort",
      spliceId: wireEndpointBSpliceId as SpliceId,
      portIndex: toPositiveInteger(wireEndpointBPortIndex)
    };
  }

  function handleWireSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const normalizedName = wireName.trim();
    const normalizedTechnicalId = wireTechnicalId.trim();
    if (normalizedName.length === 0 || normalizedTechnicalId.length === 0) {
      setWireFormError("Wire name and technical ID are required.");
      return;
    }

    const endpointA = buildWireEndpoint("A");
    const endpointB = buildWireEndpoint("B");
    if (endpointA === null || endpointB === null) {
      return;
    }

    setWireFormError(null);

    const wasCreateMode = wireFormMode === "create";
    const wireId = wireFormMode === "edit" && editingWireId !== null ? editingWireId : (createEntityId("wire") as WireId);
    dispatchAction(
      appActions.saveWire({
        id: wireId,
        name: normalizedName,
        technicalId: normalizedTechnicalId,
        endpointA,
        endpointB
      })
    );

    const nextState = store.getState();
    const savedWire = nextState.wires.byId[wireId];
    if (savedWire !== undefined) {
      if (wasCreateMode) {
        startWireEdit(savedWire);
        return;
      }
      dispatchAction(appActions.select({ kind: "wire", id: wireId }));
      resetWireForm();
      setWireForcedRouteInput(savedWire.routeSegmentIds.join(", "));
    }
  }

  function handleWireDelete(wireId: WireId): void {
    dispatchAction(appActions.removeWire(wireId));
    if (editingWireId === wireId) {
      clearWireForm();
    }
  }

  function handleLockWireRoute(): void {
    if (selectedWire === null) {
      return;
    }

    const forcedSegmentIds = wireForcedRouteInput
      .split(",")
      .map((token) => token.trim())
      .filter((token) => token.length > 0) as SegmentId[];

    if (forcedSegmentIds.length === 0) {
      setWireFormError("Provide at least one segment ID to lock a forced route.");
      return;
    }

    setWireFormError(null);
    dispatchAction(appActions.lockWireRoute(selectedWire.id, forcedSegmentIds));
  }

  function handleResetWireRoute(): void {
    if (selectedWire === null) {
      return;
    }

    setWireFormError(null);
    dispatchAction(appActions.resetWireRoute(selectedWire.id));
    const nextState = store.getState();
    const updatedWire = nextState.wires.byId[selectedWire.id];
    if (updatedWire !== undefined) {
      setWireForcedRouteInput(updatedWire.routeSegmentIds.join(", "));
    }
  }

  return {
    resetWireForm,
    clearWireForm,
    cancelWireEdit,
    startWireEdit,
    handleWireSubmit,
    handleWireDelete,
    handleLockWireRoute,
    handleResetWireRoute
  };
}
