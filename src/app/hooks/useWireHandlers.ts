import { useCallback, useEffect, useRef, type FormEvent } from "react";
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
import { suggestNextWireTechnicalId } from "../lib/technical-id-suggestions";
import {
  findNextAvailableConnectorWay,
  findNextAvailableSplicePort,
  getConnectorWayOccupant,
  getSplicePortOccupant
} from "../lib/wire-endpoint-slot-helpers";

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

export interface WireEndpointSlotHint {
  tone: "error" | "help";
  message: string;
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
  const endpointAIndexTouchedByUserRef = useRef(false);
  const endpointBIndexTouchedByUserRef = useRef(false);
  const lastEndpointAContextRef = useRef<string>("");
  const lastEndpointBContextRef = useRef<string>("");

  const buildExcludedOccupantRefs = (): ReadonlySet<string> => {
    if (editingWireId === null) {
      return new Set<string>();
    }

    return new Set<string>([`wire:${editingWireId}:A`, `wire:${editingWireId}:B`]);
  };

  const computeEndpointSlotHint = (side: "A" | "B"): WireEndpointSlotHint | null => {
    const snapshot = store.getState();
    const excluded = buildExcludedOccupantRefs();

    if (side === "A") {
      if (wireEndpointAKind === "connectorCavity") {
        if (wireEndpointAConnectorId.length === 0) {
          return null;
        }
        const connector = snapshot.connectors.byId[wireEndpointAConnectorId as ConnectorId];
        if (connector === undefined) {
          return null;
        }
        const cavityIndex = toPositiveInteger(wireEndpointACavityIndex);
        if (cavityIndex <= 0) {
          return null;
        }
        const occupant = getConnectorWayOccupant(snapshot, connector.id, cavityIndex);
        if (occupant === undefined || excluded.has(occupant)) {
          return null;
        }
        const nextFree = findNextAvailableConnectorWay(snapshot, connector.id, connector.cavityCount, excluded);
        if (nextFree === null) {
          return { tone: "error", message: "Way is already occupied. No available ways on selected connector." };
        }
        if (nextFree === cavityIndex) {
          return null;
        }
        return { tone: "error", message: `Way ${cavityIndex} is already occupied. Suggested: way ${nextFree}.` };
      }

      if (wireEndpointASpliceId.length === 0) {
        return null;
      }
      const splice = snapshot.splices.byId[wireEndpointASpliceId as SpliceId];
      if (splice === undefined) {
        return null;
      }
      const portIndex = toPositiveInteger(wireEndpointAPortIndex);
      if (portIndex <= 0) {
        return null;
      }
      const occupant = getSplicePortOccupant(snapshot, splice.id, portIndex);
      if (occupant === undefined || excluded.has(occupant)) {
        return null;
      }
      const nextFree = findNextAvailableSplicePort(snapshot, splice.id, splice.portCount, excluded);
      if (nextFree === null) {
        return { tone: "error", message: "Port is already occupied. No available ports on selected splice." };
      }
      if (nextFree === portIndex) {
        return null;
      }
      return { tone: "error", message: `Port ${portIndex} is already occupied. Suggested: port ${nextFree}.` };
    }

    if (wireEndpointBKind === "connectorCavity") {
      if (wireEndpointBConnectorId.length === 0) {
        return null;
      }
      const connector = snapshot.connectors.byId[wireEndpointBConnectorId as ConnectorId];
      if (connector === undefined) {
        return null;
      }
      const cavityIndex = toPositiveInteger(wireEndpointBCavityIndex);
      if (cavityIndex <= 0) {
        return null;
      }
      const occupant = getConnectorWayOccupant(snapshot, connector.id, cavityIndex);
      if (occupant === undefined || excluded.has(occupant)) {
        return null;
      }
      const nextFree = findNextAvailableConnectorWay(snapshot, connector.id, connector.cavityCount, excluded);
      if (nextFree === null) {
        return { tone: "error", message: "Way is already occupied. No available ways on selected connector." };
      }
      if (nextFree === cavityIndex) {
        return null;
      }
      return { tone: "error", message: `Way ${cavityIndex} is already occupied. Suggested: way ${nextFree}.` };
    }

    if (wireEndpointBSpliceId.length === 0) {
      return null;
    }
    const splice = snapshot.splices.byId[wireEndpointBSpliceId as SpliceId];
    if (splice === undefined) {
      return null;
    }
    const portIndex = toPositiveInteger(wireEndpointBPortIndex);
    if (portIndex <= 0) {
      return null;
    }
    const occupant = getSplicePortOccupant(snapshot, splice.id, portIndex);
    if (occupant === undefined || excluded.has(occupant)) {
      return null;
    }
    const nextFree = findNextAvailableSplicePort(snapshot, splice.id, splice.portCount, excluded);
    if (nextFree === null) {
      return { tone: "error", message: "Port is already occupied. No available ports on selected splice." };
    }
    if (nextFree === portIndex) {
      return null;
    }
    return { tone: "error", message: `Port ${portIndex} is already occupied. Suggested: port ${nextFree}.` };
  };

  const prefillNextAvailableEndpointIndex = useCallback(
    (side: "A" | "B"): void => {
      if (wireFormMode !== "create") {
        return;
      }

      const snapshot = store.getState();
      const excluded = new Set<string>();

      if (side === "A") {
        if (wireEndpointAKind === "connectorCavity") {
          if (wireEndpointAConnectorId.length === 0 || endpointAIndexTouchedByUserRef.current) {
            return;
          }
          const connector = snapshot.connectors.byId[wireEndpointAConnectorId as ConnectorId];
          if (connector === undefined) {
            return;
          }
          const nextFree = findNextAvailableConnectorWay(snapshot, connector.id, connector.cavityCount, excluded);
          if (nextFree !== null && String(nextFree) !== wireEndpointACavityIndex) {
            setWireEndpointACavityIndex(String(nextFree));
          }
          return;
        }
        if (wireEndpointASpliceId.length === 0 || endpointAIndexTouchedByUserRef.current) {
          return;
        }
        const splice = snapshot.splices.byId[wireEndpointASpliceId as SpliceId];
        if (splice === undefined) {
          return;
        }
        const nextFree = findNextAvailableSplicePort(snapshot, splice.id, splice.portCount, excluded);
        if (nextFree !== null && String(nextFree) !== wireEndpointAPortIndex) {
          setWireEndpointAPortIndex(String(nextFree));
        }
        return;
      }

      if (wireEndpointBKind === "connectorCavity") {
        if (wireEndpointBConnectorId.length === 0 || endpointBIndexTouchedByUserRef.current) {
          return;
        }
        const connector = snapshot.connectors.byId[wireEndpointBConnectorId as ConnectorId];
        if (connector === undefined) {
          return;
        }
        const nextFree = findNextAvailableConnectorWay(snapshot, connector.id, connector.cavityCount, excluded);
        if (nextFree !== null && String(nextFree) !== wireEndpointBCavityIndex) {
          setWireEndpointBCavityIndex(String(nextFree));
        }
        return;
      }
      if (wireEndpointBSpliceId.length === 0 || endpointBIndexTouchedByUserRef.current) {
        return;
      }
      const splice = snapshot.splices.byId[wireEndpointBSpliceId as SpliceId];
      if (splice === undefined) {
        return;
      }
      const nextFree = findNextAvailableSplicePort(snapshot, splice.id, splice.portCount, excluded);
      if (nextFree !== null && String(nextFree) !== wireEndpointBPortIndex) {
        setWireEndpointBPortIndex(String(nextFree));
      }
    },
    [
      store,
      wireFormMode,
      wireEndpointAKind,
      wireEndpointAConnectorId,
      wireEndpointACavityIndex,
      wireEndpointASpliceId,
      wireEndpointAPortIndex,
      wireEndpointBKind,
      wireEndpointBConnectorId,
      wireEndpointBCavityIndex,
      wireEndpointBSpliceId,
      wireEndpointBPortIndex,
      setWireEndpointACavityIndex,
      setWireEndpointAPortIndex,
      setWireEndpointBCavityIndex,
      setWireEndpointBPortIndex
    ]
  );

  const endpointAContextKey =
    wireEndpointAKind === "connectorCavity"
      ? `connector:${wireEndpointAConnectorId}`
      : `splice:${wireEndpointASpliceId}`;
  const endpointBContextKey =
    wireEndpointBKind === "connectorCavity"
      ? `connector:${wireEndpointBConnectorId}`
      : `splice:${wireEndpointBSpliceId}`;

  useEffect(() => {
    if (lastEndpointAContextRef.current !== endpointAContextKey) {
      endpointAIndexTouchedByUserRef.current = false;
      lastEndpointAContextRef.current = endpointAContextKey;
    }
    prefillNextAvailableEndpointIndex("A");
  }, [endpointAContextKey, wireFormMode, wireEndpointAKind, wireEndpointACavityIndex, wireEndpointAPortIndex, prefillNextAvailableEndpointIndex]);

  useEffect(() => {
    if (lastEndpointBContextRef.current !== endpointBContextKey) {
      endpointBIndexTouchedByUserRef.current = false;
      lastEndpointBContextRef.current = endpointBContextKey;
    }
    prefillNextAvailableEndpointIndex("B");
  }, [endpointBContextKey, wireFormMode, wireEndpointBKind, wireEndpointBCavityIndex, wireEndpointBPortIndex, prefillNextAvailableEndpointIndex]);

  function resetWireForm(): void {
    const state = store.getState();
    endpointAIndexTouchedByUserRef.current = false;
    endpointBIndexTouchedByUserRef.current = false;
    lastEndpointAContextRef.current = "";
    lastEndpointBContextRef.current = "";
    setWireFormMode("create");
    setEditingWireId(null);
    setWireName("");
    setWireTechnicalId(suggestNextWireTechnicalId(Object.values(state.wires.byId).map((wire) => wire.technicalId)));
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
    endpointAIndexTouchedByUserRef.current = false;
    endpointBIndexTouchedByUserRef.current = false;
    lastEndpointAContextRef.current = "";
    lastEndpointBContextRef.current = "";
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
    endpointAIndexTouchedByUserRef.current = false;
    endpointBIndexTouchedByUserRef.current = false;
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
    setWireEndpointACavityIndex: (value: string) => {
      endpointAIndexTouchedByUserRef.current = true;
      setWireEndpointACavityIndex(value);
    },
    setWireEndpointAPortIndex: (value: string) => {
      endpointAIndexTouchedByUserRef.current = true;
      setWireEndpointAPortIndex(value);
    },
    setWireEndpointBCavityIndex: (value: string) => {
      endpointBIndexTouchedByUserRef.current = true;
      setWireEndpointBCavityIndex(value);
    },
    setWireEndpointBPortIndex: (value: string) => {
      endpointBIndexTouchedByUserRef.current = true;
      setWireEndpointBPortIndex(value);
    },
    wireEndpointASlotHint: computeEndpointSlotHint("A"),
    wireEndpointBSlotHint: computeEndpointSlotHint("B"),
    handleWireSubmit,
    handleWireDelete,
    handleLockWireRoute,
    handleResetWireRoute
  };
}
