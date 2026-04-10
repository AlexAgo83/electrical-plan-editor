import { useCallback, useEffect, useRef, type FormEvent } from "react";
import type {
  CatalogItemId,
  ConnectorId,
  WireMaterial,
  SegmentId,
  SpliceId,
  Wire,
  WireEndpoint,
  WireId
} from "../../core/entities";
import {
  getNormalizedWireColorMode,
  MAX_FREE_WIRE_COLOR_LABEL_LENGTH,
  normalizeFreeWireColorLabel,
  normalizeWireColorState
} from "../../core/cableColors";
import type { AppStore } from "../../store";
import { appActions } from "../../store";
import { DEFAULT_WIRE_SECTION_MM2 } from "../../core/wireSection";
import { buildRoutingGraphIndex } from "../../core/graph";
import { findShortestRoute } from "../../core/pathfinding";
import { computeRecommendedWireSectionMm2, normalizeWireCurrentA, resolveWireMaterial } from "../../core/wireSizing";
import { createEntityId, focusSelectedTableRowInPanel, toPositiveInteger } from "../lib/app-utils-shared";
import { suggestNextWireTechnicalId } from "../lib/technical-id-suggestions";
import type { ChoiceDialogRequest, ConfirmDialogRequest } from "../types/confirm-dialog";
import {
  findNextAvailableConnectorWay,
  findNextAvailableSplicePort,
  getConnectorWayOccupant,
  getSplicePortOccupant
} from "../lib/wire-endpoint-slot-helpers";
import { findNodeIdForEndpoint } from "../../store/reducer/helpers/wireTransitions";
import { buildWireEndpointReferenceNameLookup, normalizeWireEndpointReferenceName } from "../../core/wireReferences";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

interface UseWireHandlersParams {
  store: AppStore;
  dispatchAction: DispatchAction;
  confirmAction: (request: ConfirmDialogRequest) => Promise<boolean>;
  choiceAction: (request: ChoiceDialogRequest) => Promise<string | null>;
  wireFormMode: "idle" | "create" | "edit";
  setWireFormMode: (mode: "idle" | "create" | "edit") => void;
  wireEditAfterCreate: boolean;
  setWireEditAfterCreate: (value: boolean) => void;
  editingWireId: WireId | null;
  setEditingWireId: (id: WireId | null) => void;
  wireName: string;
  setWireName: (value: string) => void;
  wireTechnicalId: string;
  setWireTechnicalId: (value: string) => void;
  wireSectionMm2: string;
  setWireSectionMm2: (value: string) => void;
  wireCurrentA: string;
  setWireCurrentA: (value: string) => void;
  wireMaterial: WireMaterial;
  setWireMaterial: (value: WireMaterial) => void;
  wireColorMode: "none" | "catalog" | "free";
  setWireColorMode: (value: "none" | "catalog" | "free") => void;
  wirePrimaryColorId: string;
  setWirePrimaryColorId: (value: string) => void;
  wireSecondaryColorId: string;
  setWireSecondaryColorId: (value: string) => void;
  wireFreeColorLabel: string;
  setWireFreeColorLabel: (value: string) => void;
  wireFuseEnabled: boolean;
  setWireFuseEnabled: (value: boolean) => void;
  wireFuseCatalogItemId: string;
  setWireFuseCatalogItemId: (value: string) => void;
  wireEndpointAConnectionReference: string;
  setWireEndpointAConnectionReference: (value: string) => void;
  wireEndpointAConnectionName: string;
  setWireEndpointAConnectionName: (value: string) => void;
  wireEndpointASealReference: string;
  setWireEndpointASealReference: (value: string) => void;
  wireEndpointASealName: string;
  setWireEndpointASealName: (value: string) => void;
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
  wireEndpointBConnectionReference: string;
  setWireEndpointBConnectionReference: (value: string) => void;
  wireEndpointBConnectionName: string;
  setWireEndpointBConnectionName: (value: string) => void;
  wireEndpointBSealReference: string;
  setWireEndpointBSealReference: (value: string) => void;
  wireEndpointBSealName: string;
  setWireEndpointBSealName: (value: string) => void;
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
  defaultWireSectionMm2: number;
}

export interface WireEndpointSlotHint {
  tone: "error" | "help";
  message: string;
}

export function useWireHandlers({
  store,
  dispatchAction,
  confirmAction,
  choiceAction,
  wireFormMode,
  setWireFormMode,
  wireEditAfterCreate: _wireEditAfterCreate,
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
}: UseWireHandlersParams) {
  void _wireEditAfterCreate;
  const effectiveDefaultWireSectionMm2 =
    Number.isFinite(defaultWireSectionMm2) && defaultWireSectionMm2 > 0 ? defaultWireSectionMm2 : DEFAULT_WIRE_SECTION_MM2;
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

  const normalizeWireEndpointReferenceInput = (value: string): string | undefined => {
    const normalized = value.trim();
    if (normalized.length === 0) {
      return undefined;
    }

    return normalized;
  };

  const resolveWireEndpointReferenceName = (
    reference: string | undefined,
    inputName: string,
    kind: "connection" | "seal",
    lookup: ReturnType<typeof buildWireEndpointReferenceNameLookup>
  ): string | undefined => {
    const normalizedInputName = normalizeWireEndpointReferenceName(inputName);
    if (normalizedInputName !== undefined) {
      return normalizedInputName;
    }

    const normalizedReference = normalizeWireEndpointReferenceInput(reference ?? "");
    if (normalizedReference === undefined) {
      return undefined;
    }

    return kind === "connection" ? lookup.connection.get(normalizedReference) : lookup.seal.get(normalizedReference);
  };

  const normalizeWireEndpointReferenceNames = (nextName: string | readonly string[] | undefined): string[] => {
    const values = Array.isArray(nextName) ? nextName : [nextName];
    const normalizedNames: string[] = [];
    for (const value of values) {
      const normalized = normalizeWireEndpointReferenceName(value);
      if (normalized === undefined || normalizedNames.includes(normalized)) {
        continue;
      }
      normalizedNames.push(normalized);
    }
    return normalizedNames;
  };

  const syncWireEndpointReferenceName = (
    kind: "connection" | "seal",
    reference: string | undefined,
    nextName: string | readonly string[] | undefined,
    options?: {
      excludeWireId?: WireId;
      onResolvedName?: (resolvedName: string | undefined) => void;
    }
  ): boolean | Promise<boolean> => {
    const normalizedReference = normalizeWireEndpointReferenceInput(reference ?? "");
    if (normalizedReference === undefined) {
      return true;
    }

    const normalizedNextNames = normalizeWireEndpointReferenceNames(nextName);
    const wiresSnapshot = store.getState().wires;
    const matchingWires = wiresSnapshot.allIds
      .map((wireId) => wiresSnapshot.byId[wireId])
      .filter((wire): wire is Wire => wire !== undefined)
      .filter((wire) => options?.excludeWireId !== wire.id)
      .filter((wire) => {
        const endpoints =
          kind === "connection"
            ? [wire.endpointAConnectionReference, wire.endpointBConnectionReference]
            : [wire.endpointASealReference, wire.endpointBSealReference];
        return endpoints.some((endpointReference) => normalizeWireEndpointReferenceInput(endpointReference ?? "") === normalizedReference);
      });

    const existingNames = new Set<string>();
    for (const wire of matchingWires) {
      const wireNames =
        kind === "connection"
          ? [normalizeWireEndpointReferenceName(wire.endpointAConnectionName), normalizeWireEndpointReferenceName(wire.endpointBConnectionName)]
          : [normalizeWireEndpointReferenceName(wire.endpointASealName), normalizeWireEndpointReferenceName(wire.endpointBSealName)];
      for (const wireName of wireNames) {
        if (wireName !== undefined) {
          existingNames.add(wireName);
        }
      }
    }

    const applyResolvedName = (resolvedName: string | undefined): void => {
      options?.onResolvedName?.(resolvedName);

      if (matchingWires.length === 0) {
        return;
      }

      for (const wire of matchingWires) {
        const nextWire = {
          ...wire,
          ...(kind === "connection"
            ? {
                endpointAConnectionName: resolvedName,
                endpointBConnectionName: resolvedName
              }
            : {
                endpointASealName: resolvedName,
                endpointBSealName: resolvedName
              })
        };
        dispatchAction(appActions.saveWire(nextWire), { trackHistory: false });
      }
    };

    if (normalizedNextNames.length === 0) {
      applyResolvedName(undefined);
      return true;
    }

    const candidateNames = [...normalizedNextNames];
    for (const wireName of existingNames) {
      if (!candidateNames.includes(wireName)) {
        candidateNames.push(wireName);
      }
    }

    if (candidateNames.length === 1) {
      applyResolvedName(candidateNames[0]);
      return true;
    }

    const visibleChoiceNames = candidateNames.slice(0, 3);
    const details =
      candidateNames.length > visibleChoiceNames.length
        ? `Showing ${visibleChoiceNames.length} overwrite proposals out of ${candidateNames.length} detected names.`
        : `Detected names: ${candidateNames.join(", ")}.`;

    return choiceAction({
      title: `Choose ${kind} name`,
      message: `Reference '${normalizedReference}' has ${candidateNames.length} conflicting name${candidateNames.length > 1 ? "s" : ""}. Choose the one to keep.`,
      details,
      discardLabel: "Discard",
      options: visibleChoiceNames.map((name) => ({
        id: name,
        label: name
      })),
      closeOnBackdrop: true
    }).then((choiceId) => {
      if (choiceId === null) {
        return false;
      }

      const selectedName = visibleChoiceNames.find((name) => name === choiceId);
      if (selectedName === undefined) {
        return false;
      }

      applyResolvedName(selectedName);
      return true;
    });
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
      const nextFree = findNextAvailableSplicePort(snapshot, splice.id, splice, excluded);
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
    const nextFree = findNextAvailableSplicePort(snapshot, splice.id, splice, excluded);
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
        const nextFree = findNextAvailableSplicePort(snapshot, splice.id, splice, excluded);
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
      const nextFree = findNextAvailableSplicePort(snapshot, splice.id, splice, excluded);
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

  const buildWireEndpointPreview = useCallback(
    (side: "A" | "B"): WireEndpoint | null => {
      if (side === "A") {
        if (wireEndpointAKind === "connectorCavity") {
          if (wireEndpointAConnectorId.length === 0) {
            return null;
          }

          const cavityIndex = toPositiveInteger(wireEndpointACavityIndex);
          if (cavityIndex <= 0) {
            return null;
          }

          return {
            kind: "connectorCavity",
            connectorId: wireEndpointAConnectorId as ConnectorId,
            cavityIndex
          };
        }

        if (wireEndpointASpliceId.length === 0) {
          return null;
        }

        const portIndex = toPositiveInteger(wireEndpointAPortIndex);
        if (portIndex <= 0) {
          return null;
        }

        return {
          kind: "splicePort",
          spliceId: wireEndpointASpliceId as SpliceId,
          portIndex
        };
      }

      if (wireEndpointBKind === "connectorCavity") {
        if (wireEndpointBConnectorId.length === 0) {
          return null;
        }

        const cavityIndex = toPositiveInteger(wireEndpointBCavityIndex);
        if (cavityIndex <= 0) {
          return null;
        }

        return {
          kind: "connectorCavity",
          connectorId: wireEndpointBConnectorId as ConnectorId,
          cavityIndex
        };
      }

      if (wireEndpointBSpliceId.length === 0) {
        return null;
      }

      const portIndex = toPositiveInteger(wireEndpointBPortIndex);
      if (portIndex <= 0) {
        return null;
      }

      return {
        kind: "splicePort",
        spliceId: wireEndpointBSpliceId as SpliceId,
        portIndex
      };
    },
    [
      wireEndpointAKind,
      wireEndpointAConnectorId,
      wireEndpointACavityIndex,
      wireEndpointASpliceId,
      wireEndpointAPortIndex,
      wireEndpointBKind,
      wireEndpointBConnectorId,
      wireEndpointBCavityIndex,
      wireEndpointBSpliceId,
      wireEndpointBPortIndex
    ]
  );

  const draftEndpointA = buildWireEndpointPreview("A");
  const draftEndpointB = buildWireEndpointPreview("B");
  const recommendedWireSectionMm2 = (() => {
    const normalizedCurrentA = normalizeWireCurrentA(Number(wireCurrentA.replace(",", ".").trim()));
    if (normalizedCurrentA === undefined || draftEndpointA === null || draftEndpointB === null) {
      return null;
    }

    const snapshot = store.getState();
    if (snapshot.activeNetworkId === null) {
      return null;
    }
    const voltageV = snapshot.networks.byId[snapshot.activeNetworkId]?.voltageV;
    if (voltageV === undefined) {
      return null;
    }

    const startNodeId = findNodeIdForEndpoint(snapshot, draftEndpointA);
    const endNodeId = findNodeIdForEndpoint(snapshot, draftEndpointB);
    if (startNodeId === undefined || endNodeId === undefined) {
      return null;
    }

    const graph = buildRoutingGraphIndex(
      snapshot.nodes.allIds
        .map((nodeId) => snapshot.nodes.byId[nodeId])
        .filter((node): node is NonNullable<typeof node> => node !== undefined),
      snapshot.segments.allIds
        .map((segmentId) => snapshot.segments.byId[segmentId])
        .filter((segment): segment is NonNullable<typeof segment> => segment !== undefined)
    );
    const route = findShortestRoute(graph, startNodeId, endNodeId);
    if (route === null) {
      return null;
    }

    return computeRecommendedWireSectionMm2({
      currentA: normalizedCurrentA,
      material: wireMaterial,
      voltageV,
      lengthMm: route.totalLengthMm
    });
  })();

  function resetWireForm(): void {
    const state = store.getState();
    endpointAIndexTouchedByUserRef.current = false;
    endpointBIndexTouchedByUserRef.current = false;
    lastEndpointAContextRef.current = "";
    lastEndpointBContextRef.current = "";
    setWireFormMode("create");
    setWireEditAfterCreate(false);
    setEditingWireId(null);
    setWireName("");
    setWireTechnicalId(suggestNextWireTechnicalId(Object.values(state.wires.byId).map((wire) => wire.technicalId)));
    setWireSectionMm2(String(effectiveDefaultWireSectionMm2));
    setWireCurrentA("");
    setWireMaterial("copper");
    setWireColorMode("none");
    setWirePrimaryColorId("");
    setWireSecondaryColorId("");
    setWireFreeColorLabel("");
    setWireFuseEnabled(false);
    setWireFuseCatalogItemId("");
    setWireEndpointAConnectionReference("");
    setWireEndpointAConnectionName("");
    setWireEndpointASealReference("");
    setWireEndpointASealName("");
    setWireEndpointAKind("connectorCavity");
    setWireEndpointAConnectorId("");
    setWireEndpointACavityIndex("1");
    setWireEndpointASpliceId("");
    setWireEndpointAPortIndex("1");
    setWireEndpointBConnectionReference("");
    setWireEndpointBConnectionName("");
    setWireEndpointBSealReference("");
    setWireEndpointBSealName("");
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
    setWireEditAfterCreate(false);
    setEditingWireId(null);
    setWireName("");
    setWireTechnicalId("");
    setWireSectionMm2(String(effectiveDefaultWireSectionMm2));
    setWireCurrentA("");
    setWireMaterial("copper");
    setWireColorMode("none");
    setWirePrimaryColorId("");
    setWireSecondaryColorId("");
    setWireFreeColorLabel("");
    setWireFuseEnabled(false);
    setWireFuseCatalogItemId("");
    setWireEndpointAConnectionReference("");
    setWireEndpointASealReference("");
    setWireEndpointAKind("connectorCavity");
    setWireEndpointAConnectorId("");
    setWireEndpointACavityIndex("1");
    setWireEndpointASpliceId("");
    setWireEndpointAPortIndex("1");
    setWireEndpointBConnectionReference("");
    setWireEndpointBSealReference("");
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

  function handleSwapWireEndpoints(): void {
    if (wireFormMode !== "edit") {
      return;
    }

    const nextEndpointAConnectionReference = wireEndpointBConnectionReference;
    const nextEndpointASealReference = wireEndpointBSealReference;
    const nextEndpointAKind = wireEndpointBKind;
    const nextEndpointAConnectorId = wireEndpointBConnectorId;
    const nextEndpointACavityIndex = wireEndpointBCavityIndex;
    const nextEndpointASpliceId = wireEndpointBSpliceId;
    const nextEndpointAPortIndex = wireEndpointBPortIndex;

    setWireEndpointAConnectionReference(nextEndpointAConnectionReference);
    setWireEndpointAConnectionName(wireEndpointBConnectionName);
    setWireEndpointASealReference(nextEndpointASealReference);
    setWireEndpointASealName(wireEndpointBSealName);
    setWireEndpointAKind(nextEndpointAKind);
    setWireEndpointAConnectorId(nextEndpointAConnectorId);
    setWireEndpointACavityIndex(nextEndpointACavityIndex);
    setWireEndpointASpliceId(nextEndpointASpliceId);
    setWireEndpointAPortIndex(nextEndpointAPortIndex);

    setWireEndpointBConnectionReference(wireEndpointAConnectionReference);
    setWireEndpointBConnectionName(wireEndpointAConnectionName);
    setWireEndpointBSealReference(wireEndpointASealReference);
    setWireEndpointBSealName(wireEndpointASealName);
    setWireEndpointBKind(wireEndpointAKind);
    setWireEndpointBConnectorId(wireEndpointAConnectorId);
    setWireEndpointBCavityIndex(wireEndpointACavityIndex);
    setWireEndpointBSpliceId(wireEndpointASpliceId);
    setWireEndpointBPortIndex(wireEndpointAPortIndex);
    setWireFormError(null);
  }

  function startWireEdit(wire: Wire, fromCreate = false): void {
    endpointAIndexTouchedByUserRef.current = false;
    endpointBIndexTouchedByUserRef.current = false;
    setWireFormMode("edit");
    setWireEditAfterCreate(fromCreate);
    setEditingWireId(wire.id);
    setWireName(wire.name);
    setWireTechnicalId(wire.technicalId);
    setWireSectionMm2(String(wire.sectionMm2));
    setWireCurrentA(wire.currentA === undefined ? "" : String(wire.currentA));
    setWireMaterial(resolveWireMaterial(wire.material));
    const normalizedWireColorMode = getNormalizedWireColorMode(wire);
    const normalizedFreeColorLabel = normalizeFreeWireColorLabel(wire.freeColorLabel);
    if (normalizedWireColorMode === "free") {
      setWireColorMode("free");
      setWirePrimaryColorId("");
      setWireSecondaryColorId("");
      setWireFreeColorLabel(normalizedFreeColorLabel ?? "");
    } else if (normalizedWireColorMode === "catalog" && (wire.primaryColorId ?? "").length > 0) {
      setWireColorMode("catalog");
      setWirePrimaryColorId(wire.primaryColorId ?? "");
      setWireSecondaryColorId(wire.secondaryColorId ?? "");
      setWireFreeColorLabel("");
    } else {
      setWireColorMode("none");
      setWirePrimaryColorId("");
      setWireSecondaryColorId("");
      setWireFreeColorLabel("");
    }
    setWireEndpointAConnectionReference(wire.endpointAConnectionReference ?? "");
    setWireEndpointAConnectionName(wire.endpointAConnectionName ?? "");
    setWireEndpointASealReference(wire.endpointASealReference ?? "");
    setWireEndpointASealName(wire.endpointASealName ?? "");
    setWireEndpointBConnectionReference(wire.endpointBConnectionReference ?? "");
    setWireEndpointBConnectionName(wire.endpointBConnectionName ?? "");
    setWireEndpointBSealReference(wire.endpointBSealReference ?? "");
    setWireEndpointBSealName(wire.endpointBSealName ?? "");
    if (wire.protection?.kind === "fuse") {
      setWireFuseEnabled(true);
      setWireFuseCatalogItemId(wire.protection.catalogItemId);
    } else {
      setWireFuseEnabled(false);
      setWireFuseCatalogItemId("");
    }
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

  function buildWireProtection():
    | {
        kind: "fuse";
        catalogItemId: CatalogItemId;
      }
    | undefined
    | null {
    if (!wireFuseEnabled) {
      return undefined;
    }

    const normalizedCatalogItemId = wireFuseCatalogItemId.trim();
    if (normalizedCatalogItemId.length === 0) {
      setWireFormError("Fuse catalog item is required.");
      return null;
    }

    const catalogItem = store.getState().catalogItems.byId[normalizedCatalogItemId as CatalogItemId];
    if (catalogItem === undefined) {
      setWireFormError("Selected fuse catalog item no longer exists.");
      return null;
    }

    if (catalogItem.manufacturerReference.trim().length === 0) {
      setWireFormError("Selected fuse catalog item is missing a manufacturer reference.");
      return null;
    }

    return {
      kind: "fuse",
      catalogItemId: normalizedCatalogItemId as CatalogItemId
    };
  }

  function handleWireSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (typeof event.currentTarget.reportValidity === "function" && !event.currentTarget.reportValidity()) {
      setWireFormError(null);
      return;
    }

    const normalizedName = wireName.trim();
    const normalizedTechnicalId = wireTechnicalId.trim();
    if (normalizedName.length === 0 || normalizedTechnicalId.length === 0) {
      setWireFormError("Wire name and technical ID are required.");
      return;
    }
    const normalizedSectionInput = wireSectionMm2.replace(",", ".").trim();
    const parsedSectionMm2 = Number(normalizedSectionInput);
    if (!Number.isFinite(parsedSectionMm2) || parsedSectionMm2 <= 0) {
      setWireFormError("Wire section must be a positive value in mm².");
      return;
    }
    const normalizedCurrentInput = wireCurrentA.replace(",", ".").trim();
    const parsedCurrentA = normalizedCurrentInput.length === 0 ? undefined : Number(normalizedCurrentInput);
    const normalizedCurrentA =
      normalizedCurrentInput.length === 0 ? undefined : normalizeWireCurrentA(parsedCurrentA);
    if (normalizedCurrentInput.length > 0 && normalizedCurrentA === undefined) {
      setWireFormError("Wire current must be a positive value in A.");
      return;
    }
    let normalizedColors = normalizeWireColorState(null, null, null);
    if (wireColorMode === "catalog") {
      normalizedColors = normalizeWireColorState(wirePrimaryColorId, wireSecondaryColorId, null, "catalog");
    } else if (wireColorMode === "free") {
      const trimmedFreeColorLabel = wireFreeColorLabel.trim();
      if (trimmedFreeColorLabel.length > MAX_FREE_WIRE_COLOR_LABEL_LENGTH) {
        setWireFormError(`Free color label must be ${MAX_FREE_WIRE_COLOR_LABEL_LENGTH} characters or fewer.`);
        return;
      }
      normalizedColors = normalizeWireColorState(null, null, wireFreeColorLabel, "free");
    } else {
      normalizedColors = normalizeWireColorState(null, null, null, "none");
    }
    const endpointAConnectionReference = normalizeWireEndpointReferenceInput(wireEndpointAConnectionReference);
    const endpointASealReference = normalizeWireEndpointReferenceInput(wireEndpointASealReference);
    const endpointBConnectionReference = normalizeWireEndpointReferenceInput(wireEndpointBConnectionReference);
    const endpointBSealReference = normalizeWireEndpointReferenceInput(wireEndpointBSealReference);
    const referenceNameLookup = buildWireEndpointReferenceNameLookup(
      store.getState().wires.allIds
        .map((wireId) => store.getState().wires.byId[wireId])
        .filter((wire): wire is Wire => wire !== undefined)
    );
    let endpointAConnectionName = resolveWireEndpointReferenceName(
      endpointAConnectionReference,
      wireEndpointAConnectionName,
      "connection",
      referenceNameLookup
    );
    let endpointASealName = resolveWireEndpointReferenceName(endpointASealReference, wireEndpointASealName, "seal", referenceNameLookup);
    let endpointBConnectionName = resolveWireEndpointReferenceName(
      endpointBConnectionReference,
      wireEndpointBConnectionName,
      "connection",
      referenceNameLookup
    );
    let endpointBSealName = resolveWireEndpointReferenceName(endpointBSealReference, wireEndpointBSealName, "seal", referenceNameLookup);
    if (
      (endpointAConnectionReference?.length ?? 0) > 120 ||
      (endpointASealReference?.length ?? 0) > 120 ||
      (endpointBConnectionReference?.length ?? 0) > 120 ||
      (endpointBSealReference?.length ?? 0) > 120
    ) {
      setWireFormError("Wire endpoint references must be 120 characters or fewer.");
      return;
    }

    const endpointA = buildWireEndpoint("A");
    const endpointB = buildWireEndpoint("B");
    if (endpointA === null || endpointB === null) {
      return;
    }

    const protection = buildWireProtection();
    if (protection === null) {
      return;
    }

    setWireFormError(null);

    const endpointReferenceGroups = new Map<
      string,
      {
        kind: "connection" | "seal";
        reference: string;
        nextNames: string[];
        resolvedNameCallbacks: Array<(resolvedName: string | undefined) => void>;
      }
    >();
    const registerReferenceGroup = (
      kind: "connection" | "seal",
      reference: string | undefined,
      nextName: string | undefined,
      onResolvedName: (resolvedName: string | undefined) => void
    ): void => {
      const normalizedReference = normalizeWireEndpointReferenceInput(reference ?? "");
      if (normalizedReference === undefined) {
        return;
      }

      const groupKey = `${kind}:${normalizedReference}`;
      const existingGroup = endpointReferenceGroups.get(groupKey);
      const group =
        existingGroup ??
        (() => {
          const created = {
            kind,
            reference: normalizedReference,
            nextNames: [] as string[],
            resolvedNameCallbacks: [] as Array<(resolvedName: string | undefined) => void>
          };
          endpointReferenceGroups.set(groupKey, created);
          return created;
        })();
      const normalizedNextName = normalizeWireEndpointReferenceName(nextName);
      if (normalizedNextName !== undefined && !group.nextNames.includes(normalizedNextName)) {
        group.nextNames.push(normalizedNextName);
      }
      group.resolvedNameCallbacks.push(onResolvedName);
    };

    registerReferenceGroup("connection", endpointAConnectionReference, endpointAConnectionName, (resolvedName) => {
      endpointAConnectionName = resolvedName;
    });
    registerReferenceGroup("seal", endpointASealReference, endpointASealName, (resolvedName) => {
      endpointASealName = resolvedName;
    });
    registerReferenceGroup("connection", endpointBConnectionReference, endpointBConnectionName, (resolvedName) => {
      endpointBConnectionName = resolvedName;
    });
    registerReferenceGroup("seal", endpointBSealReference, endpointBSealName, (resolvedName) => {
      endpointBSealName = resolvedName;
    });

    const wasCreateMode = wireFormMode === "create";
    const wireId = wireFormMode === "edit" && editingWireId !== null ? editingWireId : (createEntityId("wire") as WireId);
    const excludeWireId = wireFormMode === "edit" ? wireId : undefined;
    const syncResults = [...endpointReferenceGroups.values()].map((group) =>
      syncWireEndpointReferenceName(group.kind, group.reference, group.nextNames, {
        excludeWireId,
        onResolvedName: (resolvedName) => {
          for (const callback of group.resolvedNameCallbacks) {
            callback(resolvedName);
          }
        }
      })
    );

    const saveCurrentWire = (): void => {
      dispatchAction(
        appActions.saveWire({
          id: wireId,
          name: normalizedName,
          technicalId: normalizedTechnicalId,
          sectionMm2: parsedSectionMm2,
          currentA: normalizedCurrentA,
          material: resolveWireMaterial(wireMaterial),
          colorMode: normalizedColors.colorMode,
          primaryColorId: normalizedColors.primaryColorId,
          secondaryColorId: normalizedColors.secondaryColorId,
          freeColorLabel: normalizedColors.freeColorLabel,
          endpointAConnectionReference,
          endpointAConnectionName,
          endpointASealReference,
          endpointASealName,
          endpointBConnectionReference,
          endpointBConnectionName,
          endpointBSealReference,
          endpointBSealName,
          protection,
          endpointA,
          endpointB
        })
      );

      const nextState = store.getState();
      const savedWire = nextState.wires.byId[wireId];
      if (savedWire !== undefined) {
        if (wasCreateMode) {
          startWireEdit(savedWire, true);
          return;
        }
        startWireEdit(savedWire);
        focusSelectedTableRowInPanel('[data-onboarding-panel="modeling-wires"]');
      }
    };

    if (syncResults.every((result) => typeof result === "boolean")) {
      if (syncResults.some((result) => result === false)) {
        return;
      }
      saveCurrentWire();
      return;
    }

    void (async () => {
      const resolvedResults = await Promise.all(syncResults.map((result) => Promise.resolve(result)));
      if (resolvedResults.some((result) => result === false)) {
        return;
      }
      saveCurrentWire();
    })();
  }

  function handleWireDelete(wireId: WireId): void {
    const wire = store.getState().wires.byId[wireId];
    if (wire === undefined) {
      return;
    }

    const wireIdentity =
      wire.name.trim().length === 0 ? `'${wire.technicalId}'` : `'${wire.name}' (${wire.technicalId})`;
    void (async () => {
      const shouldDelete = await confirmAction({
        title: "Delete wire",
        message: `Delete wire ${wireIdentity}?`,
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        intent: "danger",
        confirmOnEnter: true
      });
      if (!shouldDelete) {
        return;
      }

      dispatchAction(appActions.removeWire(wireId));
      if (editingWireId === wireId) {
        clearWireForm();
      }
    })();
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

  function handleApplyRecommendedWireSection(): void {
    if (recommendedWireSectionMm2 === null) {
      return;
    }

    setWireSectionMm2(String(recommendedWireSectionMm2));
    setWireFormError(null);
  }

  return {
    resetWireForm,
    clearWireForm,
    cancelWireEdit,
    startWireEdit,
    setWireColorModeAndResetIncompatibleValues: (value: "none" | "catalog" | "free") => {
      setWireColorMode(value);
      if (value === "none") {
        setWirePrimaryColorId("");
        setWireSecondaryColorId("");
        setWireFreeColorLabel("");
        return;
      }
      if (value === "catalog") {
        setWireFreeColorLabel("");
        return;
      }
      setWirePrimaryColorId("");
      setWireSecondaryColorId("");
    },
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
    recommendedWireSectionMm2,
    handleApplyRecommendedWireSection,
    syncWireEndpointReferenceName,
    handleWireSubmit,
    handleSwapWireEndpoints,
    handleWireDelete,
    handleLockWireRoute,
    handleResetWireRoute
  };
}
