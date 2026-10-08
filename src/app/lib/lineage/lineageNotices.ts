import { translateCurrent as t } from "../i18n";
import type { LineageSessionSnapshot } from "./lineageSessionController";

export type LineageNoticeKind = "divergence" | "folder-permission" | "orphans" | "missing-files" | "recovered" | "library-not-durable" | "preserved-legacy";

export interface LineageNotice {
  kind: LineageNoticeKind;
  tone: "neutral" | "warning" | "danger";
  message: string;
  /** DOM id of the matching action (or message) in Settings > Workspace storage. */
  settingsTargetId: string;
}

export function lineageNoticeTargetId(kind: LineageNoticeKind): string {
  return `workspace-storage-notice-${kind}`;
}

/** Recovery states shown in Settings > Workspace storage, each with its action or focus target. */
export function describeLineageNotices(snapshot: LineageSessionSnapshot): LineageNotice[] {
  const notices: LineageNotice[] = [];
  const push = (kind: LineageNoticeKind, tone: LineageNotice["tone"], message: string): void => {
    notices.push({ kind, tone, message, settingsTargetId: lineageNoticeTargetId(kind) });
  };
  const active = snapshot.active;
  const issues = active?.issues ?? [];
  const orphanCount = issues.filter((issue) => issue.kind === "orphan-version" || issue.kind === "orphan-handoff").length;
  const missingCount = issues.filter((issue) => issue.kind === "version-missing" || issue.kind === "handoff-record-missing").length;
  if (!snapshot.libraryDurable) {
    push("library-not-durable", "danger", t("ui.workspaceLineageLibraryNotDurable"));
  }
  if ((active?.manifest?.divergentHeads.length ?? 0) > 0) {
    push("divergence", "warning", t("ui.workspaceLineageDivergenceBanner"));
  }
  if (active?.storage === "folder" && active.manifest === null) {
    push("folder-permission", "warning", t("ui.workspaceLineageFolderPermissionRequired"));
  }
  if (orphanCount > 0) {
    push("orphans", "warning", t("ui.workspaceLineageOrphansBanner", { count: orphanCount }));
  }
  if (missingCount > 0) {
    push("missing-files", "danger", t("ui.workspaceLineageMissingFilesBanner", { count: missingCount }));
  }
  if (issues.some((issue) => issue.kind === "working-recovered-from-previous" || issue.kind === "working-recovered-from-version" || issue.kind === "manifest-reconstructed")) {
    push("recovered", "warning", t("ui.workspaceLineageRecoveredBanner"));
  }
  if (snapshot.preservedLegacySnapshot) {
    // A recovery copy kept for the user, not a fault: neutral, shown in Transfer and recovery.
    push("preserved-legacy", "neutral", t("ui.workspaceLineagePreservedLegacy"));
  }
  return notices;
}
