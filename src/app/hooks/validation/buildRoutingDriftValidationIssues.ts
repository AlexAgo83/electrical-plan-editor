import { translateCurrent as t, translateCurrentPlural as tp } from "../../lib/i18n";
import type { RoutingDriftPreview } from "../../../store";
import type { ValidationIssue } from "../../types/app-controller";

/**
 * Maps a routing drift preview to stable, localized Validation warnings. One
 * network-scope warning carries the affected-wire count and the Network > Recompute
 * routes path; one warning per affected wire carries its technical ID and changes.
 * A failed preview yields a single "check unavailable" warning, distinct from the
 * existing route errors, and never an all-clear. Issue IDs are stable so rechecks
 * replace findings instead of accumulating them.
 */
export function buildRoutingDriftValidationIssues(
  preview: RoutingDriftPreview | null,
  networkLabel: string
): ValidationIssue[] {
  if (preview === null || preview.status === "consistent") {
    return [];
  }

  const category = t("ui.routingConsistency");
  if (preview.status === "failed") {
    return [
      {
        id: `routing-drift-unavailable-${preview.networkId}`,
        severity: "warning",
        category,
        message: t("ui.routingDriftCheckUnavailable", { network: networkLabel, reason: preview.error }),
        subScreen: "wire",
        selectionKind: "network",
        selectionId: preview.networkId
      }
    ];
  }

  return [
    {
      id: `routing-drift-network-${preview.networkId}`,
      severity: "warning",
      category,
      message: tp("ui.routingDriftNetworkSummary", preview.entries.length, { network: networkLabel }),
      subScreen: "wire",
      selectionKind: "network",
      selectionId: preview.networkId
    },
    ...preview.entries.map<ValidationIssue>((entry) => ({
      id: `routing-drift-wire-${entry.wireId}`,
      severity: "warning",
      category,
      message: t("ui.routingDriftWireDetail", { detail: entry.message }),
      subScreen: "wire",
      selectionKind: "wire",
      selectionId: entry.wireId
    }))
  ];
}
