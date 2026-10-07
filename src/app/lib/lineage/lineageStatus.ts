import { translateCurrent as t } from "../i18n";
import type { LineageSessionSnapshot } from "./lineageSessionController";

function formatTime(iso: string | null): string {
  if (iso === null) {
    return "";
  }
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export interface LineageStatusDescription {
  label: string;
  tone: "neutral" | "success" | "warning" | "danger";
}

/** Distinguishes dirty, locally recovered, verified disk save, pending export and failures. */
export function describeLineageSaveStatus(snapshot: LineageSessionSnapshot): LineageStatusDescription {
  const { save, active, historical } = snapshot;
  if (active === null) {
    return { label: t("ui.workspaceLineageStatusNoNamedWorkspace"), tone: "neutral" };
  }
  if (historical !== null) {
    return { label: t("ui.workspaceLineageStatusReadOnly", { version: historical.label }), tone: "warning" };
  }
  if (save.conflict) {
    return { label: t("ui.workspaceLineageStatusConflict"), tone: "danger" };
  }
  if (save.error !== null) {
    return { label: t("ui.workspaceLineageStatusError", { message: save.error }), tone: "danger" };
  }
  if (save.saving) {
    return { label: t("ui.workspaceLineageStatusSaving"), tone: "neutral" };
  }
  if (save.dirty) {
    if (save.localRecovery === "recovered") {
      return { label: t("ui.workspaceLineageStatusRecovered"), tone: "warning" };
    }
    if (save.localRecovery === "failed") {
      return { label: t("ui.workspaceLineageStatusDirtyUnprotected"), tone: "danger" };
    }
    if (save.localRecovery === "cached") {
      return { label: t("ui.workspaceLineageStatusDirtyCached"), tone: "warning" };
    }
    return { label: t("ui.workspaceLineageStatusDirty"), tone: "warning" };
  }
  if (active.storage === "folder") {
    return save.durability === "disk-verified"
      ? { label: t("ui.workspaceLineageStatusDiskVerified", { time: formatTime(save.lastDurableSaveIso) }), tone: "success" }
      : { label: t("ui.workspaceLineageStatusNotOnDisk"), tone: "warning" };
  }
  if (save.pendingPortableExport) {
    return { label: t("ui.workspaceLineageStatusBrowserPendingExport", { time: formatTime(save.lastDurableSaveIso) }), tone: "warning" };
  }
  if (save.downloadInitiatedIso !== null) {
    return { label: t("ui.workspaceLineageStatusDownloadInitiated", { time: formatTime(save.downloadInitiatedIso) }), tone: "success" };
  }
  return { label: t("ui.workspaceLineageStatusBrowserStored", { time: formatTime(save.lastDurableSaveIso) }), tone: "success" };
}
