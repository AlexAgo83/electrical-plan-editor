import { useCallback, useEffect, useRef, type FormEvent } from "react";
import type {
  ConnectorId,
  WireMaterial,
  SegmentId,
  SpliceId,
  Wire,
  WireEndpoint,
  WireId
} from "../../core/entities";
import { portIndexToSpliceSide, type DirectionalSpliceSide } from "../../core/directionalSplice";
import {
  getNormalizedWireColorMode,
  normalizeWireColorState
} from "../../core/cableColors";
import type { AppStore } from "../../store";
import { appActions } from "../../store";
import { DEFAULT_WIRE_SECTION_MM2 } from "../../core/wireSection";
import { normalizeWireCurrentA, resolveWireMaterial } from "../../core/wireSizing";
import { createEntityId, focusSelectedTableRowInPanel, toPositiveInteger } from "../lib/app-utils-shared";
import { suggestNextWireTechnicalId } from "../lib/technical-id-suggestions";
import type { ChoiceDialogRequest, ConfirmDialogRequest } from "../types/confirm-dialog";
import { buildWireEndpointReferenceNameLookup, normalizeWireEndpointReferenceName } from "../../core/wireReferences";
import {
  buildWireEndpointDraft,
  computeWireEndpointSlotHint,
  findNextAvailableEndpointIndex,
  type WireEndpointSlotHint
} from "../hooks/wireEndpointFormHelpers";
import { computeDraftWireSectionRecommendation } from "../hooks/wireSizingRecommendation";
import { buildWireProtectionFromForm } from "../hooks/wireProtectionForm";
import {
  createWireEndpointReferenceNameSync,
  normalizeWireEndpointReferenceInput,
  resolveWireEndpointReferenceName,
  type WireEndpointReferenceSyncPlan
} from "../hooks/wireEndpointReferenceSync";

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
  wireTwistGroupLabel: string;
  setWireTwistGroupLabel: (value: string) => void;
  wireFunctionalDomainTag: string;
  setWireFunctionalDomainTag: (value: string) => void;
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
  wireEndpointASpliceSideOverride: DirectionalSpliceSide | "auto";
  setWireEndpointASpliceSideOverride: (value: DirectionalSpliceSide | "auto") => void;
  wireEndpointASpliceSideLocked: boolean;
  setWireEndpointASpliceSideLocked: (value: boolean) => void;
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
  wireEndpointBSpliceSideOverride: DirectionalSpliceSide | "auto";
  setWireEndpointBSpliceSideOverride: (value: DirectionalSpliceSide | "auto") => void;
  wireEndpointBSpliceSideLocked: boolean;
  setWireEndpointBSpliceSideLocked: (value: boolean) => void;
  wireForcedRouteInput: string;
  setWireForcedRouteInput: (value: string) => void;
  setWireFormError: (value: string | null) => void;
  selectedWire: Wire | null;
  defaultWireSectionMm2: number;
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
  wireTwistGroupLabel,
  setWireTwistGroupLabel,
  wireFunctionalDomainTag,
  setWireFunctionalDomainTag,
  wireSectionMm2,
  setWireSectionMm2,
  wireCurrentA,
  setWireCurrentA,
  wireMaterial,
  setWireMaterial,
  setWireColorMode,
  wirePrimaryColorId,
  setWirePrimaryColorId,
  wireSecondaryColorId,
  setWireSecondaryColorId,
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
  wireEndpointASpliceSideOverride,
  setWireEndpointASpliceSideOverride,
  wireEndpointASpliceSideLocked,
  setWireEndpointASpliceSideLocked,
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
  wireEndpointBSpliceSideOverride,
  setWireEndpointBSpliceSideOverride,
  wireEndpointBSpliceSideLocked,
  setWireEndpointBSpliceSideLocked,
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

  const getWireEndpointDraftInput = useCallback(
    (side: "A" | "B") =>
      side === "A"
        ? {
            kind: wireEndpointAKind,
            connectorId: wireEndpointAConnectorId,
            cavityIndex: wireEndpointACavityIndex,
            spliceId: wireEndpointASpliceId,
            portIndex: wireEndpointAPortIndex
          }
        : {
            kind: wireEndpointBKind,
            connectorId: wireEndpointBConnectorId,
            cavityIndex: wireEndpointBCavityIndex,
            spliceId: wireEndpointBSpliceId,
            portIndex: wireEndpointBPortIndex
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

  const syncWireEndpointReferenceName = createWireEndpointReferenceNameSync({ store, dispatchAction, choiceAction });

  const computeEndpointSlotHint = (side: "A" | "B"): WireEndpointSlotHint | null => {
    return computeWireEndpointSlotHint(store.getState(), buildExcludedOccupantRefs(), getWireEndpointDraftInput(side));
  };

  const prefillNextAvailableEndpointIndex = useCallback(
    (side: "A" | "B"): void => {
      if (wireFormMode !== "create") {
        return;
      }

      const snapshot = store.getState();
      const excluded = new Set<string>();

      if (side === "A") {
        if (endpointAIndexTouchedByUserRef.current) {
          return;
        }
        const nextFree = findNextAvailableEndpointIndex(snapshot, excluded, getWireEndpointDraftInput("A"));
        const currentIndex = wireEndpointAKind === "connectorCavity" ? wireEndpointACavityIndex : wireEndpointAPortIndex;
        if (nextFree !== null && String(nextFree) !== currentIndex) {
          if (wireEndpointAKind === "connectorCavity") {
            setWireEndpointACavityIndex(String(nextFree));
          } else {
            setWireEndpointAPortIndex(String(nextFree));
          }
        }
        return;
      }

      if (endpointBIndexTouchedByUserRef.current) {
        return;
      }
      const nextFree = findNextAvailableEndpointIndex(snapshot, excluded, getWireEndpointDraftInput("B"));
      const currentIndex = wireEndpointBKind === "connectorCavity" ? wireEndpointBCavityIndex : wireEndpointBPortIndex;
      if (nextFree !== null && String(nextFree) !== currentIndex) {
        if (wireEndpointBKind === "connectorCavity") {
          setWireEndpointBCavityIndex(String(nextFree));
        } else {
          setWireEndpointBPortIndex(String(nextFree));
        }
      }
    },
    [
      store,
      wireFormMode,
      wireEndpointAKind,
      wireEndpointACavityIndex,
      wireEndpointAPortIndex,
      wireEndpointBKind,
      wireEndpointBCavityIndex,
      wireEndpointBPortIndex,
      setWireEndpointACavityIndex,
      setWireEndpointAPortIndex,
      setWireEndpointBCavityIndex,
      setWireEndpointBPortIndex,
      getWireEndpointDraftInput
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
      return buildWireEndpointDraft(getWireEndpointDraftInput(side));
    },
    [getWireEndpointDraftInput]
  );

  const draftEndpointA = buildWireEndpointPreview("A");
  const draftEndpointB = buildWireEndpointPreview("B");
  const recommendedWireSectionMm2 = computeDraftWireSectionRecommendation({
    snapshot: store.getState(),
    currentInput: wireCurrentA,
    material: wireMaterial,
    endpointA: draftEndpointA,
    endpointB: draftEndpointB
  });

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
    setWireTwistGroupLabel("");
    setWireFunctionalDomainTag("");
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
    setWireEndpointASpliceSideOverride("auto");
    setWireEndpointASpliceSideLocked(false);
    setWireEndpointBConnectionReference("");
    setWireEndpointBConnectionName("");
    setWireEndpointBSealReference("");
    setWireEndpointBSealName("");
    setWireEndpointBKind("splicePort");
    setWireEndpointBConnectorId("");
    setWireEndpointBCavityIndex("1");
    setWireEndpointBSpliceId("");
    setWireEndpointBPortIndex("1");
    setWireEndpointBSpliceSideOverride("auto");
    setWireEndpointBSpliceSideLocked(false);
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
    setWireTwistGroupLabel("");
    setWireFunctionalDomainTag("");
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
    setWireEndpointASpliceSideOverride("auto");
    setWireEndpointASpliceSideLocked(false);
    setWireEndpointBConnectionReference("");
    setWireEndpointBSealReference("");
    setWireEndpointBKind("splicePort");
    setWireEndpointBConnectorId("");
    setWireEndpointBCavityIndex("1");
    setWireEndpointBSpliceId("");
    setWireEndpointBPortIndex("1");
    setWireEndpointBSpliceSideOverride("auto");
    setWireEndpointBSpliceSideLocked(false);
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
    const nextEndpointASpliceSideOverride = wireEndpointBSpliceSideOverride;
    const nextEndpointASpliceSideLocked = wireEndpointBSpliceSideLocked;

    setWireEndpointAConnectionReference(nextEndpointAConnectionReference);
    setWireEndpointAConnectionName(wireEndpointBConnectionName);
    setWireEndpointASealReference(nextEndpointASealReference);
    setWireEndpointASealName(wireEndpointBSealName);
    setWireEndpointAKind(nextEndpointAKind);
    setWireEndpointAConnectorId(nextEndpointAConnectorId);
    setWireEndpointACavityIndex(nextEndpointACavityIndex);
    setWireEndpointASpliceId(nextEndpointASpliceId);
    setWireEndpointAPortIndex(nextEndpointAPortIndex);
    setWireEndpointASpliceSideOverride(nextEndpointASpliceSideOverride);
    setWireEndpointASpliceSideLocked(nextEndpointASpliceSideLocked);

    setWireEndpointBConnectionReference(wireEndpointAConnectionReference);
    setWireEndpointBConnectionName(wireEndpointAConnectionName);
    setWireEndpointBSealReference(wireEndpointASealReference);
    setWireEndpointBSealName(wireEndpointASealName);
    setWireEndpointBKind(wireEndpointAKind);
    setWireEndpointBConnectorId(wireEndpointAConnectorId);
    setWireEndpointBCavityIndex(wireEndpointACavityIndex);
    setWireEndpointBSpliceId(wireEndpointASpliceId);
    setWireEndpointBPortIndex(wireEndpointAPortIndex);
    setWireEndpointBSpliceSideOverride(wireEndpointASpliceSideOverride);
    setWireEndpointBSpliceSideLocked(wireEndpointASpliceSideLocked);
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
    setWireTwistGroupLabel(wire.twistGroupLabel ?? "");
    setWireFunctionalDomainTag(wire.functionalDomainTag ?? "");
    setWireSectionMm2(String(wire.sectionMm2));
    setWireCurrentA(wire.currentA === undefined ? "" : String(wire.currentA));
    setWireMaterial(resolveWireMaterial(wire.material));
    const normalizedWireColorMode = getNormalizedWireColorMode(wire);
    if (normalizedWireColorMode === "catalog" && (wire.primaryColorId ?? "").length > 0) {
      setWireColorMode("catalog");
      setWirePrimaryColorId(wire.primaryColorId ?? "");
      setWireSecondaryColorId(wire.secondaryColorId ?? "");
    } else {
      setWireColorMode("none");
      setWirePrimaryColorId("");
      setWireSecondaryColorId("");
    }
    setWireFreeColorLabel("");
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
      setWireEndpointASpliceSideOverride("auto");
      setWireEndpointASpliceSideLocked(false);
    } else {
      setWireEndpointASpliceId(wire.endpointA.spliceId);
      setWireEndpointAPortIndex(String(wire.endpointA.portIndex));
      setWireEndpointASpliceSideOverride(wire.endpointA.spliceSideOverride ?? portIndexToSpliceSide(wire.endpointA.portIndex));
      setWireEndpointASpliceSideLocked(wire.endpointA.spliceSideLocked === true);
      setWireEndpointAConnectorId("");
      setWireEndpointACavityIndex("1");
    }

    setWireEndpointBKind(wire.endpointB.kind);
    if (wire.endpointB.kind === "connectorCavity") {
      setWireEndpointBConnectorId(wire.endpointB.connectorId);
      setWireEndpointBCavityIndex(String(wire.endpointB.cavityIndex));
      setWireEndpointBSpliceId("");
      setWireEndpointBPortIndex("1");
      setWireEndpointBSpliceSideOverride("auto");
      setWireEndpointBSpliceSideLocked(false);
    } else {
      setWireEndpointBSpliceId(wire.endpointB.spliceId);
      setWireEndpointBPortIndex(String(wire.endpointB.portIndex));
      setWireEndpointBSpliceSideOverride(wire.endpointB.spliceSideOverride ?? portIndexToSpliceSide(wire.endpointB.portIndex));
      setWireEndpointBSpliceSideLocked(wire.endpointB.spliceSideLocked === true);
      setWireEndpointBConnectorId("");
      setWireEndpointBCavityIndex("1");
    }

    setWireForcedRouteInput(wire.routeSegmentIds.join(", "));
    dispatchAction(appActions.select({ kind: "wire", id: wire.id }));
  }

  function buildWireEndpoint(side: "A" | "B"): WireEndpoint | null {
    const input = getWireEndpointDraftInput(side);
    const endpoint =
      buildWireEndpointDraft(input) ??
      (input.kind === "connectorCavity" && input.connectorId.length > 0
        ? {
            kind: "connectorCavity" as const,
            connectorId: input.connectorId as ConnectorId,
            cavityIndex: toPositiveInteger(input.cavityIndex)
          }
        : input.kind === "splicePort" && input.spliceId.length > 0
          ? {
              kind: "splicePort" as const,
              spliceId: input.spliceId as SpliceId,
              portIndex: toPositiveInteger(input.portIndex)
            }
          : null);
    if (endpoint === null) {
      setWireFormError(`Endpoint ${side} ${input.kind === "connectorCavity" ? "connector" : "splice"} is required.`);
      return null;
    }
    if (endpoint.kind === "connectorCavity") {
      return endpoint;
    }
    const spliceSideOverride = side === "A" ? wireEndpointASpliceSideOverride : wireEndpointBSpliceSideOverride;
    const spliceSideLocked = side === "A" ? wireEndpointASpliceSideLocked : wireEndpointBSpliceSideLocked;
    return {
      ...endpoint,
      spliceSideOverride: spliceSideOverride === "auto" ? undefined : spliceSideOverride,
      spliceSideLocked
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
    const normalizedColors = normalizeWireColorState(wirePrimaryColorId, wireSecondaryColorId, null);
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

    const protection = buildWireProtectionFromForm(store, wireFuseEnabled, wireFuseCatalogItemId, setWireFormError);
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
    const isPromiseLikeSyncResult = (
      value: boolean | WireEndpointReferenceSyncPlan | Promise<WireEndpointReferenceSyncPlan | false>
    ): value is Promise<WireEndpointReferenceSyncPlan | false> => {
      return typeof value === "object" && value !== null && "then" in value;
    };

    const saveCurrentWire = (): void => {
      dispatchAction(
        appActions.saveWire({
          id: wireId,
          name: normalizedName,
          technicalId: normalizedTechnicalId,
          twistGroupLabel: wireTwistGroupLabel,
          functionalDomainTag: wireFunctionalDomainTag,
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

    if (syncResults.every((result) => !isPromiseLikeSyncResult(result))) {
      if (syncResults.some((result) => result === false)) {
        return;
      }

      for (const result of syncResults) {
        if (!isPromiseLikeSyncResult(result) && result !== false && result !== true) {
          result.apply();
        }
      }
      saveCurrentWire();
      return;
    }

    void (async () => {
      const resolvedResults: Array<boolean | WireEndpointReferenceSyncPlan> = await Promise.all(
        syncResults.map(async (result): Promise<boolean | WireEndpointReferenceSyncPlan> => await result)
      );
      if (resolvedResults.some((result) => result === false)) {
        return;
      }

      for (const result of resolvedResults) {
        if (!isPromiseLikeSyncResult(result) && result !== false && result !== true) {
          result.apply();
        }
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
