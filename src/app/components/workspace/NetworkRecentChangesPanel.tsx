import { translateCurrent as t } from "../../lib/i18n";
import type { ReactElement } from "react";
import type { UndoHistoryEntry, UndoHistoryTargetKind } from "../../types/app-controller";

interface NetworkRecentChangesListProps {
  entries: UndoHistoryEntry[];
  onOpenEntryTarget?: (entry: UndoHistoryEntry) => void;
}

type RecentChangeTone = "create" | "update" | "delete" | "route" | "occupancy" | "workspace";

function getTargetKindLabel(kind: UndoHistoryTargetKind): string {
  switch (kind) {
    case "network":
      return "Network";
    case "catalog":
      return t("ui.catalog");
    case "connector":
      return t("ui.connector");
    case "splice":
      return t("ui.splice");
    case "node":
      return t("ui.node");
    case "segment":
      return t("ui.segment");
    case "wire":
      return t("ui.wire");
    case "layout":
      return "Layout";
    case "workspace":
      return t("ui.workspace");
  }
}

function getRecentChangeActionLabel(actionType: string): string {
  if (actionType === "history/replaceState") {
    return "Replace";
  }

  const action = actionType.split("/")[1] ?? actionType;
  switch (action) {
    case "create":
      return t("ui.create");
    case "select":
      return "Activate";
    case "setSummaryViewState":
      return "View";
    case "rename":
      return "Rename";
    case "update":
    case "upsert":
    case "save":
      return t("ui.save");
    case "duplicate":
      return "Duplicate";
    case "delete":
    case "remove":
    case "removeCascade":
      return t("ui.delete");
    case "importMany":
      return "Import";
    case "occupyCavity":
      return "Occupy cavity";
    case "releaseCavity":
      return "Release cavity";
    case "occupyPort":
      return "Occupy port";
    case "releasePort":
      return "Release port";
    case "convertToDirectional":
      return "Convert";
    case "rerouteConnectedWires":
      return "Reroute";
    case "lockRoute":
      return "Lock route";
    case "resetRoute":
      return "Reset route";
    case "setNodePosition":
    case "setNodePositions":
      return "Move";
    default:
      return action.replace(/([a-z])([A-Z])/g, "$1 $2");
  }
}

function getRecentChangeTone(actionType: string): RecentChangeTone {
  if (actionType.includes("/remove") || actionType.includes("/delete")) {
    return "delete";
  }
  if (actionType.includes("/create") || actionType.includes("/duplicate") || actionType.includes("/import")) {
    return "create";
  }
  if (actionType.includes("Route") || actionType.includes("reroute")) {
    return "route";
  }
  if (actionType.includes("Cavity") || actionType.includes("Port")) {
    return "occupancy";
  }
  if (actionType.startsWith("history/") || actionType.startsWith("network/setSummaryViewState") || actionType.startsWith("layout/")) {
    return "workspace";
  }
  return "update";
}

function getRecentChangeTimeLabel(timestampIso: string): string {
  return new Date(timestampIso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

function canOpenRecentChangeTarget(entry: UndoHistoryEntry): boolean {
  if (entry.navigationScreen === undefined) {
    return false;
  }
  if (entry.navigationScreen === "networkScope" || entry.navigationScreen === "harnessAssembly") {
    return true;
  }
  return entry.navigationSubScreen !== undefined && entry.navigationSelectionKind !== undefined && entry.navigationSelectionId !== undefined;
}

export function NetworkRecentChangesList({ entries, onOpenEntryTarget }: NetworkRecentChangesListProps): ReactElement | null {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="network-recent-changes-list-shell home-network-recent-changes" aria-label={t("ui.recentChangesForActiveNetwork")}>
      <ul className="network-recent-changes-list" aria-label={t("ui.recentChangesList")}>
        {entries.map((entry) => {
          const tone = getRecentChangeTone(entry.actionType);
          const actionLabel = getRecentChangeActionLabel(entry.actionType);
          const targetKindLabel = getTargetKindLabel(entry.targetKind);
          const targetReference = entry.targetId ?? targetKindLabel;
          const canOpenTarget = onOpenEntryTarget !== undefined && canOpenRecentChangeTarget(entry);
          return (
            <li key={entry.sequence} className={`network-recent-changes-item is-${tone}`}>
              <span className={`network-recent-changes-icon is-${entry.targetKind}`} aria-hidden="true" />
              <div className="network-recent-changes-main">
                <span className="network-recent-changes-label">{entry.label}</span>
                <span className="network-recent-changes-meta">
                  <span className="network-recent-changes-kind">{targetKindLabel}</span>
                  <span className={`network-recent-changes-action is-${tone}`}>{actionLabel}</span>
                  {entry.detailLabel !== undefined ? (
                    <span className="network-recent-changes-detail" title={entry.detailLabel}>
                      {entry.detailLabel}
                    </span>
                  ) : null}
                  <span className="network-recent-changes-target" title={targetReference}>
                    {targetReference}
                  </span>
                </span>
              </div>
              <time dateTime={entry.timestampIso} className="network-recent-changes-time">
                {getRecentChangeTimeLabel(entry.timestampIso)}
              </time>
              {canOpenTarget ? (
                <button
                  type="button"
                  className="network-recent-changes-open-button"
                  aria-label={`Open changed object: ${entry.label}`}
                  title="Open changed object"
                  onClick={() => onOpenEntryTarget(entry)}
                >
                  <span className="network-recent-changes-open-icon" aria-hidden="true" />
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
