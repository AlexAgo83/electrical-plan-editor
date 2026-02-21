import { useEffect, useMemo, useState } from "react";
import type {
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
} from "../../core/entities";
import type { AppStore } from "../../store";
import {
  isOrderedRouteValid,
  normalizeSearch,
  parseWireOccupantRef,
  resolveEndpointNodeId,
  toConnectorOccupancyKey,
  toSpliceOccupancyKey
} from "../lib/app-utils";
import type { ValidationIssue, ValidationSeverityFilter } from "../types/app-controller";

type AppState = ReturnType<AppStore["getState"]>;

interface UseValidationModelParams {
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
  isValidationScreen: boolean;
}

interface UseValidationModelResult {
  validationCategoryFilter: string;
  setValidationCategoryFilter: (next: string) => void;
  validationSeverityFilter: ValidationSeverityFilter;
  setValidationSeverityFilter: (next: ValidationSeverityFilter) => void;
  validationSearchQuery: string;
  setValidationSearchQuery: (next: string) => void;
  validationIssueCursor: number;
  validationIssues: ValidationIssue[];
  orderedValidationIssues: ValidationIssue[];
  validationCategories: string[];
  validationIssuesForCategoryCounts: ValidationIssue[];
  validationIssuesForSeverityCounts: ValidationIssue[];
  validationCategoryCountByName: Map<string, number>;
  validationSeverityCountByLevel: Record<Exclude<ValidationSeverityFilter, "all">, number>;
  visibleValidationIssues: ValidationIssue[];
  validationErrorCount: number;
  validationWarningCount: number;
  groupedValidationIssues: Array<[string, ValidationIssue[]]>;
  clearValidationFilters: () => void;
  findValidationIssueIndex: (issueId: string) => number;
  getValidationIssueByCursor: () => ValidationIssue | null;
  getFocusedValidationIssueByCursor: () => ValidationIssue | null;
  setValidationIssueCursorFromIssue: (issue: ValidationIssue) => void;
}

export function useValidationModel({
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
  isValidationScreen
}: UseValidationModelParams): UseValidationModelResult {
  const [validationCategoryFilter, setValidationCategoryFilter] = useState<string>("all");
  const [validationSeverityFilter, setValidationSeverityFilter] = useState<ValidationSeverityFilter>("all");
  const [validationSearchQuery, setValidationSearchQuery] = useState("");
  const [validationIssueCursor, setValidationIssueCursor] = useState(-1);
  const normalizedValidationSearch = normalizeSearch(validationSearchQuery);

  const validationIssues = useMemo<ValidationIssue[]>(() => {
    const issues: ValidationIssue[] = [];

    const expectedConnectorOccupancy = new Map<string, string>();
    const expectedSpliceOccupancy = new Map<string, string>();

    function registerExpectedWireOccupancy(endpoint: WireEndpoint, occupantRef: string): void {
      if (endpoint.kind === "connectorCavity") {
        const key = toConnectorOccupancyKey(endpoint.connectorId, endpoint.cavityIndex);
        const existing = expectedConnectorOccupancy.get(key);
        if (existing !== undefined && existing !== occupantRef) {
          issues.push({
            id: `occupancy-duplicate-connector-${key}`,
            severity: "error",
            category: "Occupancy conflict",
            message: `Connector cavity ${endpoint.connectorId}/C${endpoint.cavityIndex} has multiple wire assignments.`,
            subScreen: "connector",
            selectionKind: "connector",
            selectionId: endpoint.connectorId
          });
        }
        expectedConnectorOccupancy.set(key, occupantRef);
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

      if (!Number.isFinite(segment.lengthMm) || segment.lengthMm <= 0) {
        issues.push({
          id: `segment-invalid-length-${segment.id}`,
          severity: "error",
          category: "Incomplete required fields",
          message: `Segment '${segment.id}' must have a strictly positive length.`,
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
          message: `Connector '${connector.id}' is missing required fields or has invalid cavity count.`,
          subScreen: "connector",
          selectionKind: "connector",
          selectionId: connector.id
        });
      }
    }

    for (const splice of splices) {
      if (splice.name.trim().length === 0 || splice.technicalId.trim().length === 0 || splice.portCount < 1) {
        issues.push({
          id: `splice-required-fields-${splice.id}`,
          severity: "error",
          category: "Incomplete required fields",
          message: `Splice '${splice.id}' is missing required fields or has invalid port count.`,
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
            message: `Connector '${typedConnectorId}' cavity C${cavityIndex} is occupied by '${occupantRef}' without linked wire endpoint.`,
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
            message: `Connector '${typedConnectorId}' cavity C${cavityIndex} occupancy mismatch ('${occupantRef}' vs expected '${expectedRef}').`,
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
            message: `Connector '${typedConnectorId}' cavity C${cavityIndex} references unknown wire '${parsed.wireId}'.`,
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
        message: `Connector '${connectorId}' cavity C${cavityIndex} should be occupied by '${expectedRef}' but current occupancy is '${actualRef ?? "none"}'.`,
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

    return issues;
  }, [
    connectorMap,
    connectorNodeByConnectorId,
    connectors,
    nodes,
    segmentMap,
    segments,
    spliceMap,
    spliceNodeBySpliceId,
    splices,
    state.connectorCavityOccupancy,
    state.nodes.byId,
    state.segments.byId,
    state.splicePortOccupancy,
    state.wires.byId,
    wires
  ]);

  const orderedValidationIssues = useMemo(
    () =>
      [...validationIssues].sort((left, right) => {
        const leftSeverityRank = left.severity === "error" ? 0 : 1;
        const rightSeverityRank = right.severity === "error" ? 0 : 1;
        if (leftSeverityRank !== rightSeverityRank) {
          return leftSeverityRank - rightSeverityRank;
        }

        const categoryComparison = left.category.localeCompare(right.category);
        if (categoryComparison !== 0) {
          return categoryComparison;
        }

        const subScreenComparison = left.subScreen.localeCompare(right.subScreen);
        if (subScreenComparison !== 0) {
          return subScreenComparison;
        }

        const selectionComparison = left.selectionId.localeCompare(right.selectionId);
        if (selectionComparison !== 0) {
          return selectionComparison;
        }

        return left.id.localeCompare(right.id);
      }),
    [validationIssues]
  );
  const validationCategories = useMemo(
    () => [...new Set(orderedValidationIssues.map((issue) => issue.category))].sort((left, right) => left.localeCompare(right)),
    [orderedValidationIssues]
  );
  const validationIssuesForCategoryCounts = useMemo(
    () =>
      orderedValidationIssues.filter((issue) => {
        if (validationSeverityFilter !== "all" && issue.severity !== validationSeverityFilter) {
          return false;
        }

        if (normalizedValidationSearch.length > 0) {
          const searchable = `${issue.category} ${issue.message} ${issue.subScreen} ${issue.selectionId}`;
          if (!searchable.toLocaleLowerCase().includes(normalizedValidationSearch)) {
            return false;
          }
        }

        return true;
      }),
    [normalizedValidationSearch, orderedValidationIssues, validationSeverityFilter]
  );
  const validationIssuesForSeverityCounts = useMemo(
    () =>
      orderedValidationIssues.filter((issue) => {
        if (validationCategoryFilter !== "all" && issue.category !== validationCategoryFilter) {
          return false;
        }

        if (normalizedValidationSearch.length > 0) {
          const searchable = `${issue.category} ${issue.message} ${issue.subScreen} ${issue.selectionId}`;
          if (!searchable.toLocaleLowerCase().includes(normalizedValidationSearch)) {
            return false;
          }
        }

        return true;
      }),
    [normalizedValidationSearch, orderedValidationIssues, validationCategoryFilter]
  );
  const validationCategoryCountByName = useMemo(() => {
    const counts = new Map<string, number>();
    for (const issue of validationIssuesForCategoryCounts) {
      counts.set(issue.category, (counts.get(issue.category) ?? 0) + 1);
    }
    return counts;
  }, [validationIssuesForCategoryCounts]);
  const validationSeverityCountByLevel = useMemo(() => {
    const counts: Record<Exclude<ValidationSeverityFilter, "all">, number> = {
      error: 0,
      warning: 0
    };
    for (const issue of validationIssuesForSeverityCounts) {
      if (issue.severity === "error") {
        counts.error += 1;
        continue;
      }
      counts.warning += 1;
    }
    return counts;
  }, [validationIssuesForSeverityCounts]);
  const visibleValidationIssues = useMemo(
    () =>
      orderedValidationIssues.filter((issue) => {
        if (validationCategoryFilter !== "all" && issue.category !== validationCategoryFilter) {
          return false;
        }

        if (validationSeverityFilter !== "all" && issue.severity !== validationSeverityFilter) {
          return false;
        }

        if (normalizedValidationSearch.length > 0) {
          const searchable = `${issue.category} ${issue.message} ${issue.subScreen} ${issue.selectionId}`;
          if (!searchable.toLocaleLowerCase().includes(normalizedValidationSearch)) {
            return false;
          }
        }

        return true;
      }),
    [normalizedValidationSearch, orderedValidationIssues, validationCategoryFilter, validationSeverityFilter]
  );
  const validationErrorCount = useMemo(
    () => validationIssues.filter((issue) => issue.severity === "error").length,
    [validationIssues]
  );
  const validationWarningCount = useMemo(
    () => validationIssues.filter((issue) => issue.severity === "warning").length,
    [validationIssues]
  );
  const groupedValidationIssues = useMemo(() => {
    const grouped = new Map<string, ValidationIssue[]>();
    for (const issue of visibleValidationIssues) {
      const existing = grouped.get(issue.category);
      if (existing === undefined) {
        grouped.set(issue.category, [issue]);
        continue;
      }

      existing.push(issue);
    }

    return [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right));
  }, [visibleValidationIssues]);

  useEffect(() => {
    if (validationCategoryFilter === "all") {
      return;
    }

    if (validationCategories.includes(validationCategoryFilter)) {
      return;
    }

    setValidationCategoryFilter("all");
  }, [validationCategories, validationCategoryFilter]);

  useEffect(() => {
    if (orderedValidationIssues.length === 0) {
      setValidationIssueCursor(-1);
      return;
    }

    if (validationIssueCursor >= orderedValidationIssues.length) {
      setValidationIssueCursor(0);
    }
  }, [orderedValidationIssues, validationIssueCursor]);

  useEffect(() => {
    if (!isValidationScreen) {
      return;
    }

    if (visibleValidationIssues.length === 0) {
      if (validationIssueCursor !== -1) {
        setValidationIssueCursor(-1);
      }
      return;
    }

    const focusedIssue =
      validationIssueCursor >= 0 && validationIssueCursor < orderedValidationIssues.length
        ? orderedValidationIssues[validationIssueCursor] ?? null
        : null;
    if (focusedIssue !== null && visibleValidationIssues.some((issue) => issue.id === focusedIssue.id)) {
      return;
    }

    const firstVisibleIssue = visibleValidationIssues[0];
    if (firstVisibleIssue === undefined) {
      return;
    }

    const firstVisibleIndex = orderedValidationIssues.findIndex((issue) => issue.id === firstVisibleIssue.id);
    if (firstVisibleIndex >= 0 && firstVisibleIndex !== validationIssueCursor) {
      setValidationIssueCursor(firstVisibleIndex);
    }
  }, [isValidationScreen, orderedValidationIssues, validationIssueCursor, visibleValidationIssues]);

  function clearValidationFilters(): void {
    setValidationSearchQuery("");
    setValidationCategoryFilter("all");
    setValidationSeverityFilter("all");
  }

  function findValidationIssueIndex(issueId: string): number {
    return orderedValidationIssues.findIndex((candidate) => candidate.id === issueId);
  }

  function getValidationIssueByCursor(): ValidationIssue | null {
    if (orderedValidationIssues.length === 0) {
      return null;
    }

    if (validationIssueCursor < 0 || validationIssueCursor >= orderedValidationIssues.length) {
      return orderedValidationIssues[0] ?? null;
    }

    return orderedValidationIssues[validationIssueCursor] ?? null;
  }

  function getFocusedValidationIssueByCursor(): ValidationIssue | null {
    if (validationIssueCursor < 0 || validationIssueCursor >= orderedValidationIssues.length) {
      return null;
    }

    return orderedValidationIssues[validationIssueCursor] ?? null;
  }

  function setValidationIssueCursorFromIssue(issue: ValidationIssue): void {
    const issueIndex = findValidationIssueIndex(issue.id);
    if (issueIndex >= 0) {
      setValidationIssueCursor(issueIndex);
    }
  }

  return {
    validationCategoryFilter,
    setValidationCategoryFilter,
    validationSeverityFilter,
    setValidationSeverityFilter,
    validationSearchQuery,
    setValidationSearchQuery,
    validationIssueCursor,
    validationIssues,
    orderedValidationIssues,
    validationCategories,
    validationIssuesForCategoryCounts,
    validationIssuesForSeverityCounts,
    validationCategoryCountByName,
    validationSeverityCountByLevel,
    visibleValidationIssues,
    validationErrorCount,
    validationWarningCount,
    groupedValidationIssues,
    clearValidationFilters,
    findValidationIssueIndex,
    getValidationIssueByCursor,
    getFocusedValidationIssueByCursor,
    setValidationIssueCursorFromIssue
  };
}
