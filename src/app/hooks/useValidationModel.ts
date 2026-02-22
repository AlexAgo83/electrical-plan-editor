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
  Wire
} from "../../core/entities";
import type { AppStore } from "../../store";
import { normalizeSearch } from "../lib/app-utils-shared";
import { buildValidationIssues } from "./validation/buildValidationIssues";
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

  const validationIssues = useMemo<ValidationIssue[]>(
    () =>
      buildValidationIssues({
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
        spliceNodeBySpliceId
      }),
    [
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
      spliceNodeBySpliceId
    ]
  );

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
