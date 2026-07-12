import type { CatalogItemId, NodeId, SegmentId, Wire, WireProtection } from "../../core/entities";
import { normalizeWireColorState } from "../../core/cableColors";
import { normalizeDirectionalSpliceEndpoint } from "../../core/directionalSplice";
import { normalizeWireEndpointReferenceName } from "../../core/wireReferences";
import { resolveWireSectionMm2 } from "../../core/wireSection";
import { normalizeWireCurrentA, normalizeWireMaterial } from "../../core/wireSizing";
import { FUNCTIONAL_FILTERS } from "../../core/functionalSchematic";
import type { AppAction } from "../actions";
import type { AppState } from "../types";
import {
  getEndpointOccupants,
  getWireEndpointOccupantRef,
  releaseEndpointOccupant,
  setEndpointOccupant,
  type EndpointOccupancyState
} from "./helpers/occupancy";
import { canWriteEndpointOccupancy, isEndpointOccupancyExclusive } from "./helpers/wireEndpointOccupancyGuards";
import {
  computeForcedRouteWithAnchors,
  computeShortestWireRoute,
  getEndpointKey,
  getEndpointValidationError,
  recomputeWireRouteAndDirectionalEndpoints,
  resolveDirectionalSpliceEndpointSide,
  resolveWireEndpointAnchor
} from "./helpers/wireTransitions";
import { buildWireRecomputeReport } from "./helpers/wireRecomputeReport";
import { bumpRevision, clearLastError, removeEntity, shouldClearSelection, upsertEntity, withError } from "./shared";

function hasDuplicateWireTechnicalId(state: AppState, wireId: string, technicalId: string): boolean {
  return state.wires.allIds.some((id) => {
    if (id === wireId) {
      return false;
    }

    const wire = state.wires.byId[id];
    if (wire === undefined) {
      return false;
    }

    return wire.technicalId === technicalId;
  });
}

function normalizeWireEndpointReference(value: string | undefined): string | undefined {
  const normalized = value?.trim() ?? "";
  if (normalized.length === 0) {
    return undefined;
  }
  return normalized.length > 120 ? normalized.slice(0, 120) : normalized;
}

function normalizeWireEndpointReferenceNameValue(value: string | undefined): string | undefined {
  return normalizeWireEndpointReferenceName(value);
}

function normalizeWireTwistGroupLabel(value: string | undefined): string | undefined {
  const normalized = value?.trim() ?? "";
  if (normalized.length === 0) {
    return undefined;
  }
  return normalized.length > 80 ? normalized.slice(0, 80) : normalized;
}

function normalizeWireFunctionalDomainTag(value: string | undefined): string | undefined {
  const normalized = value?.trim() ?? "";
  if (normalized.length === 0) {
    return undefined;
  }
  return (FUNCTIONAL_FILTERS as readonly string[]).includes(normalized) && normalized !== "all" ? normalized : undefined;
}

function normalizeWireProtection(
  state: AppState,
  protection: WireProtection | undefined
): { protection: WireProtection | undefined; error: string | null } {
  if (protection === undefined) {
    return { protection: undefined, error: null };
  }

  if (protection.kind !== "fuse") {
    return { protection: undefined, error: "Wire protection kind is unsupported." };
  }

  const normalizedCatalogItemId = protection.catalogItemId.trim();
  const catalogItemId =
    normalizedCatalogItemId.length > 0 ? (normalizedCatalogItemId as CatalogItemId) : undefined;
  if (catalogItemId === undefined) {
    return { protection: undefined, error: "Fuse wire must reference a catalog item." };
  }

  const catalogItem = state.catalogItems.byId[catalogItemId];
  if (catalogItem === undefined) {
    return { protection: undefined, error: "Fuse wire references a missing catalog item." };
  }

  if (catalogItem.manufacturerReference.trim().length === 0) {
    return { protection: undefined, error: "Fuse wire catalog item must have a manufacturer reference." };
  }

  return {
    protection: {
      kind: "fuse",
      catalogItemId
    },
    error: null
  };
}

export function handleWireActions(state: AppState, action: AppAction): AppState | null {
  switch (action.type) {
    case "wire/save": {
      const normalizedName = action.payload.name.trim();
      const normalizedTechnicalId = action.payload.technicalId.trim();
      const normalizedTwistGroupLabel = normalizeWireTwistGroupLabel(action.payload.twistGroupLabel);
      const normalizedFunctionalDomainTag = normalizeWireFunctionalDomainTag(action.payload.functionalDomainTag);
      const normalizedSectionMm2 = resolveWireSectionMm2(action.payload.sectionMm2);
      const normalizedCurrentA = normalizeWireCurrentA(action.payload.currentA);
      const normalizedMaterial = normalizeWireMaterial(action.payload.material);
      const normalizedColors = normalizeWireColorState(
        action.payload.primaryColorId,
        action.payload.secondaryColorId,
        action.payload.freeColorLabel,
        action.payload.colorMode
      );
      const endpointAConnectionReference = normalizeWireEndpointReference(action.payload.endpointAConnectionReference);
      const endpointAConnectionName = normalizeWireEndpointReferenceNameValue(action.payload.endpointAConnectionName);
      const endpointASealReference = normalizeWireEndpointReference(action.payload.endpointASealReference);
      const endpointASealName = normalizeWireEndpointReferenceNameValue(action.payload.endpointASealName);
      const endpointBConnectionReference = normalizeWireEndpointReference(action.payload.endpointBConnectionReference);
      const endpointBConnectionName = normalizeWireEndpointReferenceNameValue(action.payload.endpointBConnectionName);
      const endpointBSealReference = normalizeWireEndpointReference(action.payload.endpointBSealReference);
      const endpointBSealName = normalizeWireEndpointReferenceNameValue(action.payload.endpointBSealName);
      const normalizedProtectionResult = normalizeWireProtection(state, action.payload.protection);
      if (normalizedName.length === 0 || normalizedTechnicalId.length === 0) {
        return withError(state, "Wire name and technical ID are required.");
      }
      if (normalizedProtectionResult.error !== null) {
        return withError(state, normalizedProtectionResult.error);
      }

      if (hasDuplicateWireTechnicalId(state, action.payload.id, normalizedTechnicalId)) {
        return withError(state, `Wire technical ID '${normalizedTechnicalId}' is already used.`);
      }

      let endpointA = action.payload.endpointA;
      let endpointB = action.payload.endpointB;

      const endpointAError = getEndpointValidationError(state, endpointA);
      if (endpointAError !== null) {
        return withError(state, endpointAError);
      }

      const endpointBError = getEndpointValidationError(state, endpointB);
      if (endpointBError !== null) {
        return withError(state, endpointBError);
      }

      if (getEndpointKey(endpointA) === getEndpointKey(endpointB)) {
        return withError(state, "Wire endpoints must be different.");
      }

      const anchorAResult = resolveWireEndpointAnchor(state, endpointA);
      const anchorBResult = resolveWireEndpointAnchor(state, endpointB);
      if ("error" in anchorAResult) {
        return withError(state, anchorAResult.error);
      }
      if ("error" in anchorBResult) {
        return withError(state, anchorBResult.error);
      }
      const anchorA = anchorAResult.anchor;
      const anchorB = anchorBResult.anchor;

      const existingWire = state.wires.byId[action.payload.id];

      let routeSegmentIds: SegmentId[] = [];
      let routeEndpointDetailA: Wire["routeEndpointDetailA"];
      let routeEndpointDetailB: Wire["routeEndpointDetailB"];
      let lengthMm = 0;
      let isRouteLocked = false;
      let exitNodeIdHintA: NodeId | null = null;
      let exitNodeIdHintB: NodeId | null = null;

      const sameEndpointsAsExisting =
        existingWire !== undefined &&
        getEndpointKey(existingWire.endpointA) === getEndpointKey(endpointA) &&
        getEndpointKey(existingWire.endpointB) === getEndpointKey(endpointB);

      if (existingWire !== undefined && existingWire.isRouteLocked && sameEndpointsAsExisting) {
        const forced = computeForcedRouteWithAnchors(state, anchorA, anchorB, existingWire.routeSegmentIds);
        if (forced === null) {
          return withError(state, "Existing locked route is invalid for the current network.");
        }

        routeSegmentIds = existingWire.routeSegmentIds;
        routeEndpointDetailA = forced.detailA;
        routeEndpointDetailB = forced.detailB;
        lengthMm = forced.lengthMm;
        isRouteLocked = true;
      } else {
        const computedRoute = computeShortestWireRoute(state, anchorA, anchorB);
        if (computedRoute === null) {
          return withError(state, "No valid route was found between selected wire endpoints.");
        }

        routeSegmentIds = computedRoute.routeSegmentIds;
        routeEndpointDetailA = computedRoute.detailA;
        routeEndpointDetailB = computedRoute.detailB;
        lengthMm = computedRoute.lengthMm;
        exitNodeIdHintA = computedRoute.exitNodeIdHintA;
        exitNodeIdHintB = computedRoute.exitNodeIdHintB;
        isRouteLocked = false;
      }

      const endpointASide = resolveDirectionalSpliceEndpointSide(state, endpointA, routeSegmentIds, "A", exitNodeIdHintA);
      if (endpointASide !== null) {
        endpointA = normalizeDirectionalSpliceEndpoint(endpointA, endpointASide);
      }
      const endpointBSide = resolveDirectionalSpliceEndpointSide(state, endpointB, routeSegmentIds, "B", exitNodeIdHintB);
      if (endpointBSide !== null) {
        endpointB = normalizeDirectionalSpliceEndpoint(endpointB, endpointBSide);
      }

      let occupancyState: EndpointOccupancyState = {
        connectorCavityOccupancy: state.connectorCavityOccupancy,
        splicePortOccupancy: state.splicePortOccupancy
      };

      if (existingWire !== undefined) {
        if (!canWriteEndpointOccupancy(state, existingWire.endpointA) || !canWriteEndpointOccupancy(state, existingWire.endpointB)) {
          return state;
        }
        if (isEndpointOccupancyExclusive(state, existingWire.endpointA)) {
          occupancyState = releaseEndpointOccupant(
            occupancyState,
            existingWire.endpointA,
            getWireEndpointOccupantRef(existingWire.id, "A")
          );
        }
        if (isEndpointOccupancyExclusive(state, existingWire.endpointB)) {
          occupancyState = releaseEndpointOccupant(
            occupancyState,
            existingWire.endpointB,
            getWireEndpointOccupantRef(existingWire.id, "B")
          );
        }
      }

      if (!canWriteEndpointOccupancy(state, endpointA) || !canWriteEndpointOccupancy(state, endpointB)) {
        return state;
      }

      const endpointAOccupantRef = getWireEndpointOccupantRef(action.payload.id, "A");
      const endpointBOccupantRef = getWireEndpointOccupantRef(action.payload.id, "B");
      const ownOccupantRefs = new Set([endpointAOccupantRef, endpointBOccupantRef]);

      // Occupants of the slot that belong to OTHER wires. A shared connector way is
      // permitted only when the incoming endpoint opts in via allowSharedCavity.
      const foreignOccupants = (endpoint: typeof endpointA): string[] => {
        if (!isEndpointOccupancyExclusive(state, endpoint)) {
          return [];
        }
        return getEndpointOccupants(occupancyState, endpoint).filter((ref) => !ownOccupantRefs.has(ref));
      };
      const endpointAllowsSharing = (endpoint: typeof endpointA): boolean =>
        endpoint.kind === "connectorCavity" && endpoint.allowSharedCavity === true;

      if (foreignOccupants(endpointA).length > 0 && !endpointAllowsSharing(endpointA)) {
        return withError(state, "Wire endpoint A is already occupied.");
      }

      if (foreignOccupants(endpointB).length > 0 && !endpointAllowsSharing(endpointB)) {
        return withError(state, "Wire endpoint B is already occupied.");
      }

      if (isEndpointOccupancyExclusive(state, endpointA)) {
        occupancyState = setEndpointOccupant(occupancyState, endpointA, endpointAOccupantRef);
      }
      if (isEndpointOccupancyExclusive(state, endpointB)) {
        occupancyState = setEndpointOccupant(occupancyState, endpointB, endpointBOccupantRef);
      }

      return bumpRevision({
        ...clearLastError(state),
        connectorCavityOccupancy: occupancyState.connectorCavityOccupancy,
        splicePortOccupancy: occupancyState.splicePortOccupancy,
        wires: upsertEntity(state.wires, {
          id: action.payload.id,
          name: normalizedName,
          technicalId: normalizedTechnicalId,
          twistGroupLabel: normalizedTwistGroupLabel,
          functionalDomainTag: normalizedFunctionalDomainTag,
          sectionMm2: normalizedSectionMm2,
          currentA: normalizedCurrentA,
          material: normalizedMaterial,
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
          protection: normalizedProtectionResult.protection,
          endpointA,
          endpointB,
          routeSegmentIds,
          routeEndpointDetailA,
          routeEndpointDetailB,
          lengthMm,
          isRouteLocked
        })
      });
    }

    case "wire/lockRoute": {
      const wire = state.wires.byId[action.payload.id];
      if (wire === undefined) {
        return withError(state, "Cannot lock route for unknown wire.");
      }

      const anchorAResult = resolveWireEndpointAnchor(state, wire.endpointA);
      const anchorBResult = resolveWireEndpointAnchor(state, wire.endpointB);
      if ("error" in anchorAResult || "error" in anchorBResult) {
        return withError(state, "Cannot lock route: wire endpoints are not mapped to graph nodes.");
      }

      const forced = computeForcedRouteWithAnchors(
        state,
        anchorAResult.anchor,
        anchorBResult.anchor,
        action.payload.segmentIds
      );
      if (forced === null) {
        return withError(state, "Forced route is invalid for selected wire endpoints.");
      }

      return bumpRevision({
        ...clearLastError(state),
        wires: upsertEntity(state.wires, {
          ...wire,
          routeSegmentIds: [...action.payload.segmentIds],
          routeEndpointDetailA: forced.detailA,
          routeEndpointDetailB: forced.detailB,
          lengthMm: forced.lengthMm,
          isRouteLocked: true
        })
      });
    }

    case "wire/resetRoute": {
      const wire = state.wires.byId[action.payload.id];
      if (wire === undefined) {
        return withError(state, "Cannot reset route for unknown wire.");
      }
      const recomputed = recomputeWireRouteAndDirectionalEndpoints(state, {
        ...wire,
        isRouteLocked: false
      });
      if (!("wire" in recomputed)) {
        return withError(state, recomputed.error);
      }

      return bumpRevision({
        ...clearLastError(state),
        wires: upsertEntity(state.wires, recomputed.wire)
      });
    }

    case "wire/upsert": {
      const normalizedProtectionResult = normalizeWireProtection(state, action.payload.protection);
      if (normalizedProtectionResult.error !== null) {
        return withError(state, normalizedProtectionResult.error);
      }
      const normalizedPayload = {
        ...action.payload,
        name: action.payload.name.trim(),
        technicalId: action.payload.technicalId.trim(),
        twistGroupLabel: normalizeWireTwistGroupLabel(action.payload.twistGroupLabel),
        functionalDomainTag: normalizeWireFunctionalDomainTag(action.payload.functionalDomainTag),
        sectionMm2: resolveWireSectionMm2(action.payload.sectionMm2),
        currentA: normalizeWireCurrentA(action.payload.currentA),
        material: normalizeWireMaterial(action.payload.material),
        ...normalizeWireColorState(
          action.payload.primaryColorId,
          action.payload.secondaryColorId,
          action.payload.freeColorLabel,
          action.payload.colorMode
        ),
        endpointAConnectionReference: normalizeWireEndpointReference(action.payload.endpointAConnectionReference),
        endpointAConnectionName: normalizeWireEndpointReferenceNameValue(action.payload.endpointAConnectionName),
        endpointASealReference: normalizeWireEndpointReference(action.payload.endpointASealReference),
        endpointASealName: normalizeWireEndpointReferenceNameValue(action.payload.endpointASealName),
        endpointBConnectionReference: normalizeWireEndpointReference(action.payload.endpointBConnectionReference),
        endpointBConnectionName: normalizeWireEndpointReferenceNameValue(action.payload.endpointBConnectionName),
        endpointBSealReference: normalizeWireEndpointReference(action.payload.endpointBSealReference),
        endpointBSealName: normalizeWireEndpointReferenceNameValue(action.payload.endpointBSealName),
        protection: normalizedProtectionResult.protection
      };
      return bumpRevision({
        ...clearLastError(state),
        wires: upsertEntity(state.wires, normalizedPayload)
      });
    }

    case "wire/remove": {
      const wire = state.wires.byId[action.payload.id];
      if (wire === undefined) {
        return clearLastError(state);
      }

      let occupancyState: EndpointOccupancyState = {
        connectorCavityOccupancy: state.connectorCavityOccupancy,
        splicePortOccupancy: state.splicePortOccupancy
      };
      if (isEndpointOccupancyExclusive(state, wire.endpointA)) {
        occupancyState = releaseEndpointOccupant(occupancyState, wire.endpointA, getWireEndpointOccupantRef(wire.id, "A"));
      }
      if (isEndpointOccupancyExclusive(state, wire.endpointB)) {
        occupancyState = releaseEndpointOccupant(occupancyState, wire.endpointB, getWireEndpointOccupantRef(wire.id, "B"));
      }

      return bumpRevision({
        ...clearLastError(state),
        connectorCavityOccupancy: occupancyState.connectorCavityOccupancy,
        splicePortOccupancy: occupancyState.splicePortOccupancy,
        wires: removeEntity(state.wires, action.payload.id),
        ui: shouldClearSelection(state.ui.selected, "wire", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      });
    }

    case "wire/recomputeAll": {
      const result = buildWireRecomputeReport(state);
      if ("error" in result) {
        return withError(state, result.error);
      }

      return bumpRevision({
        ...clearLastError(state),
        wires: result.wires,
        ui: {
          ...state.ui,
          lastError: null,
          lastRecomputeReport: result.report
        }
      });
    }

    default:
      return null;
  }
}
