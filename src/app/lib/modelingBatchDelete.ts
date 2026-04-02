import { appActions, appReducer, type AppState } from "../../store";
import {
  analyzeConnectorDeleteImpact,
  analyzeNodeDeleteImpact,
  analyzeSegmentDeleteImpact,
  analyzeSpliceDeleteImpact,
  type DeleteDependencySummaryCategory
} from "../../store/deleteImpact";
import type { AppAction } from "../../store/actions";
import type {
  ConnectorId,
  NodeId,
  SegmentId,
  SpliceId,
  WireId
} from "../../core/entities";

export type ModelingBatchSelectionScope = "connector" | "splice" | "node" | "segment" | "wire";
export type ModelingBatchSelectionId = ConnectorId | SpliceId | NodeId | SegmentId | WireId;
export type ModelingBatchDeleteOutcome = "direct" | "cascade" | "blocked";

export interface ModelingBatchDeleteAssessment {
  id: ModelingBatchSelectionId;
  label: string;
  outcome: ModelingBatchDeleteOutcome;
  categories: DeleteDependencySummaryCategory[];
  note?: string;
}

export interface ModelingBatchDeletePreflight {
  scope: ModelingBatchSelectionScope;
  selectedCount: number;
  directCount: number;
  cascadeCount: number;
  blockedCount: number;
  canDelete: boolean;
  assessments: ModelingBatchDeleteAssessment[];
  summaryCategories: DeleteDependencySummaryCategory[];
  summaryNote?: string;
  confirmationTitle: string;
  confirmationMessage: string;
  confirmationVariant: "standard" | "deleteCascade";
  confirmLabel: string;
  blockedTitle: string;
  blockedMessage: string;
  nextState: AppState | null;
}

function normalizeLabel(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function preferLabel(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const normalized = normalizeLabel(value);
    if (normalized !== null) {
      return normalized;
    }
  }
  return null;
}

function pluralize(scope: ModelingBatchSelectionScope, count: number): string {
  const plural = count === 1 ? "" : "s";
  switch (scope) {
    case "connector":
      return `connector${plural}`;
    case "splice":
      return `splice${plural}`;
    case "node":
      return `node${plural}`;
    case "segment":
      return `segment${plural}`;
    case "wire":
      return `wire${plural}`;
  }
}

function formatConnectorLabel(state: AppState, connectorId: ConnectorId): string {
  const connector = state.connectors.byId[connectorId];
  return preferLabel(connector?.technicalId, connector?.name, connectorId) ?? connectorId;
}

function formatSpliceLabel(state: AppState, spliceId: SpliceId): string {
  const splice = state.splices.byId[spliceId];
  return preferLabel(splice?.technicalId, splice?.name, spliceId) ?? spliceId;
}

function formatNodeLabel(state: AppState, nodeId: NodeId): string {
  const node = state.nodes.byId[nodeId];
  if (node === undefined) {
    return nodeId;
  }
  if (node.kind === "intermediate") {
    return preferLabel(node.id, node.label) ?? node.id;
  }
  return node.id;
}

function formatSegmentLabel(state: AppState, segmentId: SegmentId): string {
  const segment = state.segments.byId[segmentId];
  return preferLabel(segment?.id, segmentId) ?? segmentId;
}

function formatWireLabel(state: AppState, wireId: WireId): string {
  const wire = state.wires.byId[wireId];
  return preferLabel(wire?.technicalId, wire?.name, wireId) ?? wireId;
}

function buildSummaryCategory(
  key: string,
  label: string,
  references: string[]
): DeleteDependencySummaryCategory | null {
  if (references.length === 0) {
    return null;
  }
  const normalized = [...new Set(references)].sort((left, right) =>
    left.localeCompare(right, undefined, { sensitivity: "base" })
  );
  return {
    key,
    label,
    count: normalized.length,
    references: normalized.slice(0, 3)
  };
}

function mergeImpactCategories(
  keyPrefix: string,
  categories: DeleteDependencySummaryCategory[]
): DeleteDependencySummaryCategory[] {
  const merged = new Map<string, { label: string; references: string[] }>();
  for (const category of categories) {
    const current = merged.get(category.key);
    if (current === undefined) {
      merged.set(category.key, {
        label: category.label,
        references: [...category.references]
      });
      continue;
    }
    current.references.push(...category.references);
  }
  return [...merged.entries()].map(([key, value]) => ({
    key: `${keyPrefix}-${key}`,
    label: value.label,
    count: [...new Set(value.references)].length,
    references: [...new Set(value.references)]
      .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }))
      .slice(0, 3)
  }));
}

function summarizeAssessments(
  scope: ModelingBatchSelectionScope,
  assessments: ModelingBatchDeleteAssessment[]
): { summaryCategories: DeleteDependencySummaryCategory[]; summaryNote?: string } {
  const directRefs = assessments.filter((item) => item.outcome === "direct").map((item) => item.label);
  const cascadeRefs = assessments.filter((item) => item.outcome === "cascade").map((item) => item.label);
  const blockedRefs = assessments.filter((item) => item.outcome === "blocked").map((item) => item.label);
  const summaryCategories = [
    buildSummaryCategory("directSelections", "Direct delete", directRefs),
    buildSummaryCategory("cascadeSelections", "Cascade delete", cascadeRefs),
    buildSummaryCategory("blockedSelections", "Blocked", blockedRefs),
    ...mergeImpactCategories(
      "cascadeDependencies",
      assessments.flatMap((item) => (item.outcome === "cascade" ? item.categories : []))
    ),
    ...mergeImpactCategories(
      "blockedDependencies",
      assessments.flatMap((item) => (item.outcome === "blocked" ? item.categories : []))
    )
  ].filter((category): category is DeleteDependencySummaryCategory => category !== null);

  if (blockedRefs.length > 0) {
    return {
      summaryCategories,
      summaryNote: `Batch delete stops if any selected ${pluralize(scope, blockedRefs.length)} are blocked. Remove blocked dependencies or narrow the selection.`
    };
  }

  if (cascadeRefs.length > 0) {
    return {
      summaryCategories,
      summaryNote: `Deleting this selection also removes linked local nodes for the ${pluralize(scope, cascadeRefs.length)} that require cascade delete.`
    };
  }

  return { summaryCategories };
}

function buildNextState(state: AppState, actions: AppAction[]): AppState {
  return actions.reduce(appReducer, state);
}

export function analyzeModelingBatchDelete(
  state: AppState,
  scope: ModelingBatchSelectionScope,
  ids: readonly ModelingBatchSelectionId[]
): ModelingBatchDeletePreflight {
  const assessments: ModelingBatchDeleteAssessment[] = [];
  const deleteActions: AppAction[] = [];

  for (const rawId of ids) {
    if (scope === "connector") {
      const id = rawId as ConnectorId;
      const impact = analyzeConnectorDeleteImpact(state, id);
      assessments.push({
        id,
        label: formatConnectorLabel(state, id),
        outcome: impact.kind,
        categories: impact.kind === "direct" ? [] : impact.categories,
        note: impact.kind === "direct" ? undefined : impact.note
      });
      if (impact.kind === "direct") {
        deleteActions.push(appActions.removeConnector(id));
      } else if (impact.kind === "cascade") {
        deleteActions.push(appActions.removeConnectorCascade(id));
      }
      continue;
    }

    if (scope === "splice") {
      const id = rawId as SpliceId;
      const impact = analyzeSpliceDeleteImpact(state, id);
      assessments.push({
        id,
        label: formatSpliceLabel(state, id),
        outcome: impact.kind,
        categories: impact.kind === "direct" ? [] : impact.categories,
        note: impact.kind === "direct" ? undefined : impact.note
      });
      if (impact.kind === "direct") {
        deleteActions.push(appActions.removeSplice(id));
      } else if (impact.kind === "cascade") {
        deleteActions.push(appActions.removeSpliceCascade(id));
      }
      continue;
    }

    if (scope === "node") {
      const id = rawId as NodeId;
      const impact = analyzeNodeDeleteImpact(state, id);
      assessments.push({
        id,
        label: formatNodeLabel(state, id),
        outcome: impact.kind,
        categories: impact.kind === "direct" ? [] : impact.categories,
        note: impact.kind === "direct" ? undefined : impact.note
      });
      if (impact.kind === "direct") {
        deleteActions.push(appActions.removeNode(id));
      }
      continue;
    }

    if (scope === "segment") {
      const id = rawId as SegmentId;
      const impact = analyzeSegmentDeleteImpact(state, id);
      assessments.push({
        id,
        label: formatSegmentLabel(state, id),
        outcome: impact.kind,
        categories: impact.kind === "direct" ? [] : impact.categories,
        note: impact.kind === "direct" ? undefined : impact.note
      });
      if (impact.kind === "direct") {
        deleteActions.push(appActions.removeSegment(id));
      }
      continue;
    }

    const id = rawId as WireId;
    assessments.push({
      id,
      label: formatWireLabel(state, id),
      outcome: "direct",
      categories: []
    });
    deleteActions.push(appActions.removeWire(id));
  }

  const directCount = assessments.filter((item) => item.outcome === "direct").length;
  const cascadeCount = assessments.filter((item) => item.outcome === "cascade").length;
  const blockedCount = assessments.filter((item) => item.outcome === "blocked").length;
  const { summaryCategories, summaryNote } = summarizeAssessments(scope, assessments);
  const selectedCount = assessments.length;
  const entityLabel = pluralize(scope, selectedCount);
  const safeDeleteVariant = cascadeCount > 0 ? "deleteCascade" : "standard";

  return {
    scope,
    selectedCount,
    directCount,
    cascadeCount,
    blockedCount,
    canDelete: selectedCount > 0 && blockedCount === 0,
    assessments,
    summaryCategories,
    summaryNote,
    confirmationTitle: cascadeCount > 0 ? `Batch delete ${entityLabel}` : `Delete selected ${entityLabel}`,
    confirmationMessage:
      cascadeCount > 0
        ? `Delete ${selectedCount} selected ${entityLabel}? ${cascadeCount} ${cascadeCount === 1 ? "entry requires" : "entries require"} cascade delete.`
        : `Delete ${selectedCount} selected ${entityLabel}?`,
    confirmationVariant: safeDeleteVariant,
    confirmLabel: "Delete selected",
    blockedTitle: `Batch delete blocked`,
    blockedMessage: `Some selected ${entityLabel} cannot be deleted yet. Batch delete will not remove a partial selection in this mode.`,
    nextState: selectedCount > 0 && blockedCount === 0 ? buildNextState(state, deleteActions) : null
  };
}
