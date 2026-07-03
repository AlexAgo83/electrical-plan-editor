import type {
  CatalogItem,
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire,
  WireEndpoint
} from "../../../core/entities";
import { resolveConnectorPlugMaterials } from "../../../core/connectorCatalogMaterials";
import { portIndexToSpliceSide } from "../../../core/directionalSplice";
import {
  findRearBackshellHelperNodeId,
  getEffectiveRearBackshellConfig,
  isRearBackshellLinkSegment
} from "../../../core/rearBackshell";
import { isSplicePortIndexValid, resolveSplicePortMode } from "../../../core/splicePortMode";
import type { AppStore } from "../../../store";
import { isValidCatalogUrlInput, normalizeManufacturerReferenceKey } from "../../../store";
import {
  isOrderedRouteValid,
  parseWireOccupantRef,
  resolveEndpointNodeId,
  toConnectorOccupancyKey,
  toSpliceOccupancyKey
} from "../../lib/app-utils-networking";
import type { ValidationIssue } from "../../types/app-controller";
import { appendElectricalDimensioningIssues } from "./appendElectricalDimensioningIssues";

type AppState = ReturnType<AppStore["getState"]>;

interface BuildValidationIssuesParams {
  state: AppState;
  connectors: Connector[];
  splices: Splice[];
  nodes: NetworkNode[];
  segments: Segment[];
  wires: Wire[];
  connectorMap: Map<ConnectorId, Connector>;
  spliceMap: Map<SpliceId, Splice>;
  segmentMap: Map<SegmentId, Segment>;
  connectorNodeByConnectorId: Map<ConnectorId, NodeId>;
  spliceNodeBySpliceId: Map<SpliceId, NodeId>;
  spliceSectionImbalanceRatioPercent: number;
}

export function buildValidationIssues({
  state,
  connectors,
  splices,
  nodes,
  segments,
  wires,
  connectorMap,
  spliceMap,
  segmentMap,
  connectorNodeByConnectorId,
  spliceNodeBySpliceId,
  spliceSectionImbalanceRatioPercent
}: BuildValidationIssuesParams): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const catalogIntegrityCategory = "Catalog integrity";

  const expectedConnectorOccupancy = new Map<string, string>();
  const expectedSpliceOccupancy = new Map<string, string>();

  const catalogItems: CatalogItem[] = state.catalogItems.allIds
    .map((catalogItemId) => state.catalogItems.byId[catalogItemId])
    .filter((item): item is CatalogItem => item !== undefined);

  const duplicateCatalogItemsByReference = new Map<string, { label: string; items: CatalogItem[] }>();
  for (const item of catalogItems) {
    const normalizedRefLabel = item.manufacturerReference.trim();
    const normalizedRefKey = normalizeManufacturerReferenceKey(item.manufacturerReference);
    if (normalizedRefKey === undefined) {
      issues.push({
        id: `catalog-empty-manufacturer-reference-${item.id}`,
        severity: "error",
        category: catalogIntegrityCategory,
        message: `Catalog item '${item.id}' is missing manufacturer reference.`,
        subScreen: "catalog",
        selectionKind: "catalog",
        selectionId: item.id
      });
    } else {
      const duplicateBucket = duplicateCatalogItemsByReference.get(normalizedRefKey);
      if (duplicateBucket === undefined) {
        duplicateCatalogItemsByReference.set(normalizedRefKey, {
          label: normalizedRefLabel,
          items: [item]
        });
      } else {
        duplicateBucket.items.push(item);
      }
    }

    if (!Number.isInteger(item.connectionCount) || item.connectionCount < 1) {
      issues.push({
        id: `catalog-invalid-connection-count-${item.id}`,
        severity: "error",
        category: catalogIntegrityCategory,
        message: `Catalog item '${item.manufacturerReference || item.id}' has invalid connection count '${String(item.connectionCount)}'.`,
        subScreen: "catalog",
        selectionKind: "catalog",
        selectionId: item.id
      });
    }

    if (item.url !== undefined && !isValidCatalogUrlInput(item.url)) {
      issues.push({
        id: `catalog-invalid-url-${item.id}`,
        severity: "error",
        category: catalogIntegrityCategory,
        message: `Catalog item '${item.manufacturerReference || item.id}' has an invalid URL.`,
        subScreen: "catalog",
        selectionKind: "catalog",
        selectionId: item.id
      });
    }
  }
  const shouldValidateMissingCatalogLinks = catalogItems.length > 0;

  for (const { label, items: duplicateItems } of duplicateCatalogItemsByReference.values()) {
    if (duplicateItems.length < 2) {
      continue;
    }
    const sortedDuplicateItems = [...duplicateItems].sort((left, right) => left.id.localeCompare(right.id));
    for (const item of sortedDuplicateItems) {
      issues.push({
        id: `catalog-duplicate-manufacturer-reference-${label}-${item.id}`,
        severity: "error",
        category: catalogIntegrityCategory,
        message: `Catalog manufacturer reference '${label}' is duplicated.`,
        subScreen: "catalog",
        selectionKind: "catalog",
        selectionId: item.id
      });
    }
  }

  function registerExpectedWireOccupancy(endpoint: WireEndpoint, occupantRef: string): void {
    if (endpoint.kind === "connectorCavity") {
      const key = toConnectorOccupancyKey(endpoint.connectorId, endpoint.cavityIndex);
      const existing = expectedConnectorOccupancy.get(key);
      if (existing !== undefined && existing !== occupantRef) {
        issues.push({
          id: `occupancy-duplicate-connector-${key}`,
          severity: "error",
          category: "Occupancy conflict",
          message: `Connector way ${endpoint.connectorId}/C${endpoint.cavityIndex} has multiple wire assignments.`,
          subScreen: "connector",
          selectionKind: "connector",
          selectionId: endpoint.connectorId
        });
      }
      expectedConnectorOccupancy.set(key, occupantRef);
      return;
    }

    const splice = spliceMap.get(endpoint.spliceId);
    if (splice !== undefined && resolveSplicePortMode(splice) === "directional") {
      return;
    }

    const key = toSpliceOccupancyKey(endpoint.spliceId, endpoint.portIndex);
    const existing = expectedSpliceOccupancy.get(key);
    if (existing !== undefined && existing !== occupantRef) {
      issues.push({
        id: `occupancy-duplicate-splice-${key}`,
        severity: "error",
        category: "Occupancy conflict",
        message: `Splice port ${endpoint.spliceId}/P${endpoint.portIndex} has multiple wire assignments.`,
        subScreen: "splice",
        selectionKind: "splice",
        selectionId: endpoint.spliceId
      });
    }
    expectedSpliceOccupancy.set(key, occupantRef);
  }

  const directionalSpliceSections = new Map<SpliceId, { L: number; R: number }>();

  for (const node of nodes) {
    if (node.kind === "connector" && connectorMap.get(node.connectorId) === undefined) {
      issues.push({
        id: `node-missing-connector-${node.id}`,
        severity: "error",
        category: "Missing reference",
        message: `Node '${node.id}' references missing connector '${node.connectorId}'.`,
        subScreen: "node",
        selectionKind: "node",
        selectionId: node.id
      });
    }

    if (node.kind === "splice" && spliceMap.get(node.spliceId) === undefined) {
      issues.push({
        id: `node-missing-splice-${node.id}`,
        severity: "error",
        category: "Missing reference",
        message: `Node '${node.id}' references missing splice '${node.spliceId}'.`,
        subScreen: "node",
        selectionKind: "node",
        selectionId: node.id
      });
    }

    if (node.kind === "connectorBackshellHelper" && connectorMap.get(node.connectorId) === undefined) {
      issues.push({
        id: `node-missing-backshell-connector-${node.id}`,
        severity: "error",
        category: "Missing reference",
        message: `Backshell helper node '${node.id}' references missing connector '${node.connectorId}'.`,
        subScreen: "node",
        selectionKind: "node",
        selectionId: node.id
      });
    }

    if (node.kind === "intermediate" && node.label.trim().length === 0) {
      issues.push({
        id: `node-missing-label-${node.id}`,
        severity: "error",
        category: "Incomplete required fields",
        message: `Intermediate node '${node.id}' is missing its label.`,
        subScreen: "node",
        selectionKind: "node",
        selectionId: node.id
      });
    }
  }

  for (const segment of segments) {
    if (state.nodes.byId[segment.nodeA] === undefined || state.nodes.byId[segment.nodeB] === undefined) {
      issues.push({
        id: `segment-missing-node-${segment.id}`,
        severity: "error",
        category: "Missing reference",
        message: `Segment '${segment.id}' has an endpoint that is no longer available.`,
        subScreen: "segment",
        selectionKind: "segment",
        selectionId: segment.id
      });
    }

    if (!Number.isFinite(segment.lengthMm) || segment.lengthMm < 1) {
      issues.push({
        id: `segment-invalid-length-${segment.id}`,
        severity: "error",
        category: "Incomplete required fields",
        message: `Segment '${segment.id}' must have a length >= 1 mm.`,
        subScreen: "segment",
        selectionKind: "segment",
        selectionId: segment.id
      });
    }
  }

  for (const connector of connectors) {
    if (connector.name.trim().length === 0 || connector.technicalId.trim().length === 0 || connector.cavityCount < 1) {
      issues.push({
        id: `connector-required-fields-${connector.id}`,
        severity: "error",
        category: "Incomplete required fields",
        message: `Connector '${connector.id}' is missing required fields or has invalid way count.`,
        subScreen: "connector",
        selectionKind: "connector",
        selectionId: connector.id
      });
    }

    const connectorCatalogItemId = connector.catalogItemId;
    const linkedCatalogItem = connectorCatalogItemId === undefined ? undefined : state.catalogItems.byId[connectorCatalogItemId];
    const effectiveRearBackshell = getEffectiveRearBackshellConfig(connector, linkedCatalogItem);
    if (connectorCatalogItemId === undefined) {
      if (!shouldValidateMissingCatalogLinks) {
        // continue to backshell topology validation below
      } else {
        issues.push({
          id: `connector-missing-catalog-link-${connector.id}`,
          severity: "error",
          category: catalogIntegrityCategory,
          message: `Connector '${connector.technicalId}' is missing a catalog selection (catalogItemId).`,
          subScreen: "connector",
          selectionKind: "connector",
          selectionId: connector.id
        });
      }
    } else {
      if (linkedCatalogItem === undefined) {
        issues.push({
          id: `connector-broken-catalog-link-${connector.id}`,
          severity: "error",
          category: catalogIntegrityCategory,
          message: `Connector '${connector.technicalId}' references missing catalog item '${connectorCatalogItemId}'.`,
          subScreen: "connector",
          selectionKind: "connector",
          selectionId: connector.id
        });
      } else if (linkedCatalogItem.connectionCount !== connector.cavityCount) {
        issues.push({
          id: `connector-catalog-capacity-mismatch-${connector.id}`,
          severity: "error",
          category: catalogIntegrityCategory,
          message: `Connector '${connector.technicalId}' way count (${connector.cavityCount}) does not match catalog '${linkedCatalogItem.manufacturerReference}' connection count (${linkedCatalogItem.connectionCount}).`,
          subScreen: "connector",
          selectionKind: "connector",
          selectionId: connector.id
        });
      }
      const plugResolution = resolveConnectorPlugMaterials(
        connector,
        linkedCatalogItem,
        wires,
        state.connectorCavityOccupancy
      );
      for (const warning of plugResolution.warnings) {
        issues.push({
          id: `connector-catalog-material-${warning.code.toLowerCase()}-${connector.id}`,
          severity: "warning",
          category: catalogIntegrityCategory,
          message: warning.message,
          subScreen: "connector",
          selectionKind: "connector",
          selectionId: connector.id
        });
      }
    }

    if (effectiveRearBackshell !== undefined) {
      const connectorNodeId = connectorNodeByConnectorId.get(connector.id) ?? null;
      const helperNodeId = findRearBackshellHelperNodeId(state.nodes.byId, connector.id) ?? null;
      if (connectorNodeId === null || helperNodeId === null) {
        issues.push({
          id: `connector-backshell-topology-missing-${connector.id}`,
          severity: "error",
          category: "Topology integrity",
          message: `Connector '${connector.technicalId}' requires a backshell helper topology but it is incomplete.`,
          subScreen: "connector",
          selectionKind: "connector",
          selectionId: connector.id
        });
      } else {
        const linkSegment = segments.find((segment) => isRearBackshellLinkSegment(segment, connectorNodeId, helperNodeId));
        if (linkSegment === undefined) {
          issues.push({
            id: `connector-backshell-link-missing-${connector.id}`,
            severity: "error",
            category: "Topology integrity",
            message: `Connector '${connector.technicalId}' is missing its backshell link segment.`,
            subScreen: "connector",
            selectionKind: "connector",
            selectionId: connector.id
          });
        }

        for (const segment of segments) {
          if (segment.nodeA !== connectorNodeId && segment.nodeB !== connectorNodeId) {
            continue;
          }
          if (linkSegment !== undefined && segment.id === linkSegment.id) {
            continue;
          }
          issues.push({
            id: `connector-backshell-direct-segment-${connector.id}-${segment.id}`,
            severity: "error",
            category: "Topology integrity",
            message: `Connector '${connector.technicalId}' has segment '${segment.id}' attached directly to the connector node instead of the backshell helper node.`,
            subScreen: "connector",
            selectionKind: "connector",
            selectionId: connector.id
          });
        }
      }
    }
  }

  for (const splice of splices) {
    const splicePortMode = resolveSplicePortMode(splice);
    const hasInvalidBoundedPortCount =
      splicePortMode === "bounded" && (!Number.isInteger(splice.portCount) || splice.portCount < 1);
    if (splice.name.trim().length === 0 || splice.technicalId.trim().length === 0 || hasInvalidBoundedPortCount) {
      issues.push({
        id: `splice-required-fields-${splice.id}`,
        severity: "error",
        category: "Incomplete required fields",
        message: `Splice '${splice.id}' is missing required fields or has invalid bounded port count.`,
        subScreen: "splice",
        selectionKind: "splice",
        selectionId: splice.id
      });
    }

    const spliceCatalogItemId = splice.catalogItemId;
    if (spliceCatalogItemId !== undefined) {
      const linkedCatalogItem = state.catalogItems.byId[spliceCatalogItemId];
      if (linkedCatalogItem === undefined) {
        issues.push({
          id: `splice-broken-catalog-link-${splice.id}`,
          severity: "error",
          category: catalogIntegrityCategory,
          message: `Splice '${splice.technicalId}' references missing catalog item '${spliceCatalogItemId}'.`,
          subScreen: "splice",
          selectionKind: "splice",
          selectionId: splice.id
        });
      } else if (splicePortMode === "unbounded") {
        issues.push({
          id: `splice-unbounded-catalog-link-${splice.id}`,
          severity: "error",
          category: catalogIntegrityCategory,
          message: `Splice '${splice.technicalId}' cannot be unbounded while linked to catalog '${linkedCatalogItem.manufacturerReference}'.`,
          subScreen: "splice",
          selectionKind: "splice",
          selectionId: splice.id
        });
      } else if (splicePortMode !== "directional" && linkedCatalogItem.connectionCount !== splice.portCount) {
        issues.push({
          id: `splice-catalog-capacity-mismatch-${splice.id}`,
          severity: "error",
          category: catalogIntegrityCategory,
          message: `Splice '${splice.technicalId}' port count (${splice.portCount}) does not match catalog '${linkedCatalogItem.manufacturerReference}' connection count (${linkedCatalogItem.connectionCount}).`,
          subScreen: "splice",
          selectionKind: "splice",
          selectionId: splice.id
        });
      }
    }

    const placement = splice.placement;
    const hasLegacySpliceNode = nodes.some((node) => node.kind === "splice" && node.spliceId === splice.id);
    if (placement !== undefined) {
      const hostSegment = segmentMap.get(placement.segmentId);
      if (!Number.isFinite(placement.offsetMm) || placement.offsetMm < 0) {
        issues.push({
          id: `splice-placement-invalid-offset-${splice.id}`,
          severity: "error",
          category: "Splice placement validity",
          message: `Splice '${splice.technicalId}' placement offset is invalid.`,
          subScreen: "splice",
          selectionKind: "splice",
          selectionId: splice.id
        });
      } else if (hostSegment === undefined) {
        issues.push({
          id: `splice-placement-missing-segment-${splice.id}`,
          severity: "error",
          category: "Splice placement validity",
          message: `Splice '${splice.technicalId}' is placed on missing segment '${placement.segmentId}'.`,
          subScreen: "splice",
          selectionKind: "splice",
          selectionId: splice.id
        });
      } else if (hostSegment.role === "rearBackshellLink") {
        issues.push({
          id: `splice-placement-backshell-segment-${splice.id}`,
          severity: "error",
          category: "Splice placement validity",
          message: `Splice '${splice.technicalId}' cannot be placed on rear backshell link segment '${hostSegment.id}'.`,
          subScreen: "splice",
          selectionKind: "splice",
          selectionId: splice.id
        });
      } else if (placement.fromNodeId !== hostSegment.nodeA && placement.fromNodeId !== hostSegment.nodeB) {
        issues.push({
          id: `splice-placement-invalid-from-node-${splice.id}`,
          severity: "error",
          category: "Splice placement validity",
          message: `Splice '${splice.technicalId}' placement reference node '${placement.fromNodeId}' is not an endpoint of segment '${hostSegment.id}'.`,
          subScreen: "splice",
          selectionKind: "splice",
          selectionId: splice.id
        });
      } else if (placement.offsetMm > hostSegment.lengthMm) {
        issues.push({
          id: `splice-placement-offset-out-of-range-${splice.id}`,
          severity: "error",
          category: "Splice placement validity",
          message: `Splice '${splice.technicalId}' placement offset (${placement.offsetMm} mm) exceeds segment '${hostSegment.id}' length (${hostSegment.lengthMm} mm).`,
          subScreen: "splice",
          selectionKind: "splice",
          selectionId: splice.id
        });
      }
    } else if (!hasLegacySpliceNode) {
      const isConnected = wires.some(
        (wire) =>
          (wire.endpointA.kind === "splicePort" && wire.endpointA.spliceId === splice.id) ||
          (wire.endpointB.kind === "splicePort" && wire.endpointB.spliceId === splice.id)
      );
      issues.push({
        id: `splice-unplaced-${splice.id}`,
        severity: isConnected ? "error" : "warning",
        category: "Splice placement validity",
        message: isConnected
          ? `Splice '${splice.technicalId}' has connected wires but no segment placement.`
          : `Splice '${splice.technicalId}' is not placed on a segment yet; it stays hidden and cannot be wired.`,
        subScreen: "splice",
        selectionKind: "splice",
        selectionId: splice.id
      });
    }
  }

  for (const wire of wires) {
    if (wire.endpointA.kind === "connectorCavity" && connectorMap.get(wire.endpointA.connectorId) === undefined) {
      issues.push({
        id: `wire-missing-connector-a-${wire.id}`,
        severity: "error",
        category: "Missing reference",
        message: `Wire '${wire.technicalId}' endpoint A references missing connector '${wire.endpointA.connectorId}'.`,
        subScreen: "wire",
        selectionKind: "wire",
        selectionId: wire.id
      });
    }
    if (wire.endpointA.kind === "splicePort" && spliceMap.get(wire.endpointA.spliceId) === undefined) {
      issues.push({
        id: `wire-missing-splice-a-${wire.id}`,
        severity: "error",
        category: "Missing reference",
        message: `Wire '${wire.technicalId}' endpoint A references missing splice '${wire.endpointA.spliceId}'.`,
        subScreen: "wire",
        selectionKind: "wire",
        selectionId: wire.id
      });
    }
    if (wire.endpointB.kind === "connectorCavity" && connectorMap.get(wire.endpointB.connectorId) === undefined) {
      issues.push({
        id: `wire-missing-connector-b-${wire.id}`,
        severity: "error",
        category: "Missing reference",
        message: `Wire '${wire.technicalId}' endpoint B references missing connector '${wire.endpointB.connectorId}'.`,
        subScreen: "wire",
        selectionKind: "wire",
        selectionId: wire.id
      });
    }
    if (wire.endpointB.kind === "splicePort" && spliceMap.get(wire.endpointB.spliceId) === undefined) {
      issues.push({
        id: `wire-missing-splice-b-${wire.id}`,
        severity: "error",
        category: "Missing reference",
        message: `Wire '${wire.technicalId}' endpoint B references missing splice '${wire.endpointB.spliceId}'.`,
        subScreen: "wire",
        selectionKind: "wire",
        selectionId: wire.id
      });
    }

    if (wire.name.trim().length === 0 || wire.technicalId.trim().length === 0) {
      issues.push({
        id: `wire-required-fields-${wire.id}`,
        severity: "error",
        category: "Incomplete required fields",
        message: `Wire '${wire.id}' is missing required name or technical ID.`,
        subScreen: "wire",
        selectionKind: "wire",
        selectionId: wire.id
      });
    }

    registerExpectedWireOccupancy(wire.endpointA, `wire:${wire.id}:A`);
    registerExpectedWireOccupancy(wire.endpointB, `wire:${wire.id}:B`);

    if (wire.endpointA.kind === "connectorCavity") {
      const connector = connectorMap.get(wire.endpointA.connectorId);
      if (connector !== undefined && (wire.endpointA.cavityIndex < 1 || wire.endpointA.cavityIndex > connector.cavityCount)) {
        issues.push({
          id: `wire-endpoint-a-connector-out-of-range-${wire.id}`,
          severity: "error",
          category: "Incomplete required fields",
          message: `Wire '${wire.technicalId}' endpoint A connector way index is out of range.`,
          subScreen: "wire",
          selectionKind: "wire",
          selectionId: wire.id
        });
      }
    } else {
      const splice = spliceMap.get(wire.endpointA.spliceId);
      if (splice !== undefined && !isSplicePortIndexValid(splice, wire.endpointA.portIndex)) {
        issues.push({
          id: `wire-endpoint-a-splice-out-of-range-${wire.id}`,
          severity: "error",
          category: "Incomplete required fields",
          message: `Wire '${wire.technicalId}' endpoint A splice port index is out of range.`,
          subScreen: "wire",
          selectionKind: "wire",
          selectionId: wire.id
        });
      }
    }
    if (wire.endpointB.kind === "connectorCavity") {
      const connector = connectorMap.get(wire.endpointB.connectorId);
      if (connector !== undefined && (wire.endpointB.cavityIndex < 1 || wire.endpointB.cavityIndex > connector.cavityCount)) {
        issues.push({
          id: `wire-endpoint-b-connector-out-of-range-${wire.id}`,
          severity: "error",
          category: "Incomplete required fields",
          message: `Wire '${wire.technicalId}' endpoint B connector way index is out of range.`,
          subScreen: "wire",
          selectionKind: "wire",
          selectionId: wire.id
        });
      }
    } else {
      const splice = spliceMap.get(wire.endpointB.spliceId);
      if (splice !== undefined && !isSplicePortIndexValid(splice, wire.endpointB.portIndex)) {
        issues.push({
          id: `wire-endpoint-b-splice-out-of-range-${wire.id}`,
          severity: "error",
          category: "Incomplete required fields",
          message: `Wire '${wire.technicalId}' endpoint B splice port index is out of range.`,
          subScreen: "wire",
          selectionKind: "wire",
          selectionId: wire.id
        });
      }
    }

    if (wire.routeSegmentIds.length === 0) {
      issues.push({
        id: `wire-empty-route-${wire.id}`,
        severity: wire.isRouteLocked ? "error" : "warning",
        category: "Route lock validity",
        message: wire.isRouteLocked
          ? `Wire '${wire.technicalId}' is route-locked but has no segment in its forced route.`
          : `Wire '${wire.technicalId}' currently has an empty auto-route.`,
        subScreen: "wire",
        selectionKind: "wire",
        selectionId: wire.id
      });
    }

    const missingRouteSegmentIds = wire.routeSegmentIds.filter((segmentId) => state.segments.byId[segmentId] === undefined);
    if (missingRouteSegmentIds.length > 0) {
      issues.push({
        id: `wire-missing-route-segment-${wire.id}`,
        severity: "error",
        category: "Route lock validity",
        message: `Wire '${wire.technicalId}' route references missing segments: ${missingRouteSegmentIds.join(", ")}.`,
        subScreen: "wire",
        selectionKind: "wire",
        selectionId: wire.id
      });
    } else if (wire.routeSegmentIds.length > 0 && wire.isRouteLocked) {
      const startNodeId = resolveEndpointNodeId(wire.endpointA, connectorNodeByConnectorId, spliceNodeBySpliceId);
      const endNodeId = resolveEndpointNodeId(wire.endpointB, connectorNodeByConnectorId, spliceNodeBySpliceId);
      if (startNodeId === null || endNodeId === null) {
        issues.push({
          id: `wire-locked-route-missing-endpoint-node-${wire.id}`,
          severity: "error",
          category: "Route lock validity",
          message: `Wire '${wire.technicalId}' is route-locked but at least one endpoint node is missing.`,
          subScreen: "wire",
          selectionKind: "wire",
          selectionId: wire.id
        });
      } else if (!isOrderedRouteValid(wire.routeSegmentIds, startNodeId, endNodeId, segmentMap)) {
        issues.push({
          id: `wire-locked-route-invalid-chain-${wire.id}`,
          severity: "error",
          category: "Route lock validity",
          message: `Wire '${wire.technicalId}' has an invalid forced route chain between its endpoints.`,
          subScreen: "wire",
          selectionKind: "wire",
          selectionId: wire.id
        });
      }
    }

    const registerDirectionalSection = (endpoint: WireEndpoint): void => {
      if (endpoint.kind !== "splicePort") {
        return;
      }
      const splice = spliceMap.get(endpoint.spliceId);
      if (splice === undefined || resolveSplicePortMode(splice) !== "directional") {
        return;
      }
      const side = endpoint.spliceSideOverride ?? portIndexToSpliceSide(endpoint.portIndex);
      const current = directionalSpliceSections.get(endpoint.spliceId) ?? { L: 0, R: 0 };
      current[side] += wire.sectionMm2;
      directionalSpliceSections.set(endpoint.spliceId, current);
    };

    registerDirectionalSection(wire.endpointA);
    registerDirectionalSection(wire.endpointB);
  }

  const imbalanceThreshold =
    Number.isFinite(spliceSectionImbalanceRatioPercent) && spliceSectionImbalanceRatioPercent >= 100
      ? spliceSectionImbalanceRatioPercent
      : 300;
  for (const [spliceId, sections] of directionalSpliceSections) {
    if (sections.L <= 0 || sections.R <= 0) {
      continue;
    }
    const ratioPercent = (Math.max(sections.L, sections.R) / Math.min(sections.L, sections.R)) * 100;
    if (ratioPercent <= imbalanceThreshold) {
      continue;
    }
    const splice = spliceMap.get(spliceId);
    issues.push({
      id: `splice-directional-section-imbalance-${spliceId}`,
      severity: "warning",
      category: "Directional splice balance",
      message: `Directional splice '${splice?.technicalId ?? spliceId}' has unbalanced total sections: L=${sections.L.toFixed(2)} mm2, R=${sections.R.toFixed(2)} mm2 (${Math.round(ratioPercent)}% > ${imbalanceThreshold}%).`,
      subScreen: "splice",
      selectionKind: "splice",
      selectionId: spliceId
    });
  }

  for (const [connectorId, occupancyByCavity] of Object.entries(state.connectorCavityOccupancy)) {
    const typedConnectorId = connectorId as ConnectorId;
    for (const [cavityIndexRaw, occupantRef] of Object.entries(occupancyByCavity)) {
      if (occupantRef.trim().length === 0) {
        continue;
      }

      const cavityIndex = Number(cavityIndexRaw);
      const key = toConnectorOccupancyKey(typedConnectorId, cavityIndex);
      const expectedRef = expectedConnectorOccupancy.get(key);
      if (expectedRef === undefined) {
        issues.push({
          id: `connector-manual-occupancy-${typedConnectorId}-${cavityIndex}`,
          severity: "warning",
          category: "Occupancy conflict",
          message: `Connector '${typedConnectorId}' way C${cavityIndex} is occupied by '${occupantRef}' without linked wire endpoint.`,
          subScreen: "connector",
          selectionKind: "connector",
          selectionId: typedConnectorId
        });
        continue;
      }

      if (expectedRef !== occupantRef) {
        issues.push({
          id: `connector-occupancy-mismatch-${typedConnectorId}-${cavityIndex}`,
          severity: "error",
          category: "Occupancy conflict",
          message: `Connector '${typedConnectorId}' way C${cavityIndex} occupancy mismatch ('${occupantRef}' vs expected '${expectedRef}').`,
          subScreen: "connector",
          selectionKind: "connector",
          selectionId: typedConnectorId
        });
      }

      const parsed = parseWireOccupantRef(occupantRef);
      if (parsed !== null && state.wires.byId[parsed.wireId] === undefined) {
        issues.push({
          id: `connector-occupancy-missing-wire-${typedConnectorId}-${cavityIndex}`,
          severity: "error",
          category: "Occupancy conflict",
          message: `Connector '${typedConnectorId}' way C${cavityIndex} references unknown wire '${parsed.wireId}'.`,
          subScreen: "connector",
          selectionKind: "connector",
          selectionId: typedConnectorId
        });
      }
    }
  }

  for (const [spliceId, occupancyByPort] of Object.entries(state.splicePortOccupancy)) {
    const typedSpliceId = spliceId as SpliceId;
    for (const [portIndexRaw, occupantRef] of Object.entries(occupancyByPort)) {
      if (occupantRef.trim().length === 0) {
        continue;
      }

      const portIndex = Number(portIndexRaw);
      const key = toSpliceOccupancyKey(typedSpliceId, portIndex);
      const expectedRef = expectedSpliceOccupancy.get(key);
      if (expectedRef === undefined) {
        issues.push({
          id: `splice-manual-occupancy-${typedSpliceId}-${portIndex}`,
          severity: "warning",
          category: "Occupancy conflict",
          message: `Splice '${typedSpliceId}' port P${portIndex} is occupied by '${occupantRef}' without linked wire endpoint.`,
          subScreen: "splice",
          selectionKind: "splice",
          selectionId: typedSpliceId
        });
        continue;
      }

      if (expectedRef !== occupantRef) {
        issues.push({
          id: `splice-occupancy-mismatch-${typedSpliceId}-${portIndex}`,
          severity: "error",
          category: "Occupancy conflict",
          message: `Splice '${typedSpliceId}' port P${portIndex} occupancy mismatch ('${occupantRef}' vs expected '${expectedRef}').`,
          subScreen: "splice",
          selectionKind: "splice",
          selectionId: typedSpliceId
        });
      }

      const parsed = parseWireOccupantRef(occupantRef);
      if (parsed !== null && state.wires.byId[parsed.wireId] === undefined) {
        issues.push({
          id: `splice-occupancy-missing-wire-${typedSpliceId}-${portIndex}`,
          severity: "error",
          category: "Occupancy conflict",
          message: `Splice '${typedSpliceId}' port P${portIndex} references unknown wire '${parsed.wireId}'.`,
          subScreen: "splice",
          selectionKind: "splice",
          selectionId: typedSpliceId
        });
      }
    }
  }

  for (const [expectedKey, expectedRef] of expectedConnectorOccupancy) {
    const [connectorIdRaw, cavityIndexRaw] = expectedKey.split(":");
    const connectorId = connectorIdRaw as ConnectorId;
    const cavityIndex = Number(cavityIndexRaw);
    const actualRef = state.connectorCavityOccupancy[connectorId]?.[cavityIndex];
    if (actualRef === expectedRef) {
      continue;
    }

    issues.push({
      id: `connector-expected-occupancy-missing-${connectorId}-${cavityIndex}`,
      severity: "error",
      category: "Occupancy conflict",
      message: `Connector '${connectorId}' way C${cavityIndex} should be occupied by '${expectedRef}' but current occupancy is '${actualRef ?? "none"}'.`,
      subScreen: "connector",
      selectionKind: "connector",
      selectionId: connectorId
    });
  }

  for (const [expectedKey, expectedRef] of expectedSpliceOccupancy) {
    const [spliceIdRaw, portIndexRaw] = expectedKey.split(":");
    const spliceId = spliceIdRaw as SpliceId;
    const portIndex = Number(portIndexRaw);
    const actualRef = state.splicePortOccupancy[spliceId]?.[portIndex];
    if (actualRef === expectedRef) {
      continue;
    }

    issues.push({
      id: `splice-expected-occupancy-missing-${spliceId}-${portIndex}`,
      severity: "error",
      category: "Occupancy conflict",
      message: `Splice '${spliceId}' port P${portIndex} should be occupied by '${expectedRef}' but current occupancy is '${actualRef ?? "none"}'.`,
      subScreen: "splice",
      selectionKind: "splice",
      selectionId: spliceId
    });
  }

  const activeNetworkId = state.activeNetworkId;
  const activeNetwork = activeNetworkId !== null ? state.networks.byId[activeNetworkId] ?? null : null;
  appendElectricalDimensioningIssues(issues, {
    connectors,
    splices,
    wires,
    catalogItems,
    network: activeNetwork
  });

  return issues;
}
